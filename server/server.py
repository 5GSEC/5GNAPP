from http.server import BaseHTTPRequestHandler, HTTPServer
from flask import Flask # pip install flask
from flask import request
from flask_cors import CORS # pip install flask-cors
from flask import Response # NEW
import subprocess
import sqlite3
import json
import csv
import re
import os

app = Flask(__name__)
CORS(app) # for remote access

# deprecated
@app.route('/fetchUserData', methods=['GET'])
def fetch_user_data():
    ''' Fetch user data from the database '''
    bs_db = sqlite3.connect('db/main.db')
    cursor = bs_db.cursor()
    cursor.execute("SELECT nr_cell_id as id, report_period FROM bs")
    bs_rows = cursor.fetchall()
    data = {}
    for bs in bs_rows:
        cursor.execute(f"select rnti, max(timestamp) from ue where nr_cell_id={bs[0]} group by rnti")
        ue_data = {}
        for ue in cursor.fetchall():
            ue_data[f"{bs[0]}-{ue[0]}"] = {"level": "normal", "timestamp": ue[1], "Event Name": "None"}
        # get the event data
        cursor.execute("select * from event")
        
        for ev in cursor.fetchall():
            if f"{ev[2]}-{ev[4]}" in ue_data:
                ue_data[f"{ev[2]}-{ev[4]}"] = {"level": ev[5], "timestamp": ev[3], "Event Name": ev[1]}
        
        data[bs[0]] = {
            "report-period": bs[1],
            "stations": ue_data
        }


    bs_db.close()
    print(data)
    return data


def execute_command(command):
    ''' Execute a shell command and return the output '''
    # print(command)
    # result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    # if result.returncode != 0:
    #     raise Exception(f"Command failed with error: {result.stderr}")
    # return result.stdout.decode("utf-8", errors="replace")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
        return result.stdout.strip()
    except Exception as e:
        return None, str(e), -1  # Return -1 as exit code for exceptions


@app.route('/fetchServiceStatus', methods=['GET'])
def fetch_service_status():
    ''' Fetch the status of the SE-RAN services '''
    services = {}
    command = "kubectl get pods -A | awk {'print $2\";\"$3\";\"$4\";\"$5\";\"$6'}"
    output = execute_command(command)
    lines = output.split("\n")

    pod_names = ["ricplt-e2mgr", "mobiflow-auditor", "mobiexpert-xapp", "mobiwatch-xapp"]
    display_names = ["E2 Manager", "MobiFlow Auditor xApp", "MobieXpert xApp", "MobiWatch xApp"]
    for pod in pod_names:
        pod_index = pod_names.index(pod)
        display_name = display_names[pod_index]
        services[display_name] = ""

    for line in lines:
        for pod in pod_names:
            if pod in line:
                pod_index = pod_names.index(pod)
                display_name = display_names[pod_index]
                services[display_name] = line.replace("(", "") # tmp soluton to solve getting (4d20h ago) as the age
                break

    # MobiFlow Agent
    program_name = "loader"
    command = f"pgrep -x {program_name}" # need to makes sure pgrep is available
    output = execute_command(command)
    if output:
        services["MobiFlow Agent"] = " ; ;Running; ;" # TODO get the age of the process
    else:
        services["MobiFlow Agent"] = ""
    
    print(json.dumps(services, indent=4))
    return services



@app.route('/buildXapp', methods=['POST'])
def build_xapp():
    """
    step 1: get xapp_name
    step 2: go into xApp dir (if it doesn't exist, create it)
    step 3: git clone the xApp repo
    step 4: run Docker registry
    step 5: cd [xapp_name] and then ./build.sh
    step 6: check if build is successful
    """
    original_cwd = os.getcwd()
    logs = []  # We'll accumulate logs here

    try:
        data = request.get_json()
        if not data or 'xapp_name' not in data:
            return {"error": "xapp_name is required in the request body", "logs": logs}, 400

        xapp_name = data['xapp_name']


        xapp_names = {
            "MobieXpert xApp": "MobieXpert",
            "MobiWatch xApp" : "MobiWatch",
            "MobiFlow Auditor xApp": "mobiflow-auditor",
        }
        if xapp_name in xapp_names:
            xapp_name = xapp_names[xapp_name]
            logs.append(f"[buildXapp] Using {xapp_name} repo for {data['xapp_name']}")
        else:
            logs.append(f"[buildXapp] Using {xapp_name} repo for {data['xapp_name']}")
            return {"error": "Invalid xapp_name"}, 400


        logs.append(f"[buildXapp] Start building xApp: {xapp_name}")



        # Step 1: create xApp folder if it doesn't exist
        xapp_root = os.path.join(os.getcwd(), "xApp")
        if not os.path.exists(xapp_root):
            try:
                os.makedirs(xapp_root)
                logs.append(f"Created directory: {xapp_root}")
            except FileExistsError:
                # If the folder is already there, just continue
                logs.append(f"Directory {xapp_root} already exists.")

        os.chdir(xapp_root)
        logs.append(f"Changed directory to: {os.getcwd()}")


        # Step 2: clone the repo    
        # If the xapp_name folder doesn't exist, clone it.
        if not os.path.exists(xapp_name):
            
            git_url = f"https://github.com/5GSEC/{xapp_name}.git"
            clone_output = execute_command(f"git clone {git_url}")
            logs.append(f"git clone output: {clone_output}")

            # Check if xApp folder is there
            if not os.path.exists(xapp_name):
                logs.append(f"Failed to clone {git_url}")
                return {"error": f"Failed to clone {git_url}", "logs": logs}, 500

            os.chdir(xapp_name)
            logs.append(f"Now in xApp folder (newly cloned): {os.getcwd()}")

        else:
            # If folder already exists, just cd in and do a checkout + pull
            logs.append(f"{xapp_name} folder already exists. Will attempt to update it.")
            os.chdir(xapp_name)
            logs.append(f"Now in existing xApp folder: {os.getcwd()}")
            # We won't remove; we'll checkout branch & pull


        # Step 3: Optionally checkout a branch depending on xapp_name
        # You can customize this dict with more xApp->branch mappings
        branch_map = {
            "mobiflow-auditor": "v1.0.0",
            "MobiWatch": "main",
            "MobieXpert": "v1.0.0"
            # add more if needed
        }
        branch_to_checkout = branch_map.get(xapp_name)
        if branch_to_checkout:
            checkout_output = execute_command(f"git checkout {branch_to_checkout}")
            logs.append(f"Checked out branch '{branch_to_checkout}': {checkout_output}")
            # Then pull the latest changes
            pull_output = execute_command("git pull")
            logs.append(f"Pulled latest code: {pull_output}")
        else:
            logs.append(f"No custom branch specified for {xapp_name}.")

        # Step 4: check Docker registry
        registry_check = execute_command("docker ps | grep registry")
        logs.append(f"registry_check: {registry_check}")

        if not registry_check:
            start_registry_output = execute_command("docker run -d -p 5000:5000 --restart=always --name registry registry:2")
            logs.append(f"Started docker registry: {start_registry_output}")
        else:
            logs.append("Docker registry is already running.")

        # Step 5: run build.sh
        # os.chdir(xapp_name) # This is already done above

        logs.append(f"Now in xApp folder: {os.getcwd()}")
        
        if not os.path.exists("build.sh"):
            logs.append(f"No build.sh found in {xapp_name}")
            return {"error": f"No build.sh found in {xapp_name} directory", "logs": logs}, 500

        execute_command("chmod +x build.sh")
        build_output = execute_command("./build.sh")
        logs.append(f"build.sh output:\n{build_output}")

        # Step 6: check if build is successful
        logs.append("Build finished successfully.")
        return {"message": "Build finished", "logs": logs}, 200

    except Exception as e:
        # Return any error and the logs collected so far
        return {"error": str(e), "logs": logs}, 500
    finally:
        # Always switch back to the original directory
        os.chdir(original_cwd)


@app.route('/deployXapp', methods=['POST'])
def deploy_xapp():
    original_cwd = os.getcwd()  # Remember our original directory
    logs = []  # We'll collect log messages in this list

    try:

        # 0) Make sure non-root user can use kubectl
        # kube_config_cmd = (
        #     "sudo swap off -a && "
        #     "sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && "
        #     "sudo chmod +r $HOME/.kube/config"
        # )
        # kube_config_output = execute_command(kube_config_cmd)
        # logs.append(f"Kubernetes config setup: {kube_config_output or 'done'}")


        helm_check = execute_command("docker ps | grep chartmuseum")
        logs.append(f"helm_check output: {helm_check}")

        # Make sure CHART_REPO_URL is set in Python's process environment (for logging/debugging)
        os.environ["CHART_REPO_URL"] = "http://0.0.0.0:8090"
        logs.append(f"CHART_REPO_URL set to {os.environ['CHART_REPO_URL']}")

        chartmuseum_cmd = (
                "docker run --rm -u 0 -d "
                "-p 8090:8080 "
                "-e DEBUG=1 "
                "-e STORAGE=local "
                "-e STORAGE_LOCAL_ROOTDIR=/charts "
                "-v $(pwd)/charts:/charts "
                "chartmuseum/chartmuseum:latest"
        )
        chartmuseum_output = execute_command(chartmuseum_cmd)
        logs.append(f"ChartMuseum started: {chartmuseum_output}")

        # Set environment variable in this Python process only
        os.environ["CHART_REPO_URL"] = "http://0.0.0.0:8090"
        logs.append(f"CHART_REPO_URL set to {os.environ['CHART_REPO_URL']}")

        # 2) Parse request data
        data = request.get_json()
        if not data or 'xapp_name' not in data:
            return {
                "error": "xapp_name is required in the request body",
                "logs": logs
            }, 400

        xapp_name = data['xapp_name']


        xapp_names = {
            "MobieXpert xApp": "MobieXpert",
            "MobiWatch xApp" : "MobiWatch",
            "MobiFlow Auditor xApp": "mobiflow-auditor",
        }
        if xapp_name in xapp_names:
            xapp_name = xapp_names[xapp_name]
            logs.append(f"[buildXapp] Using {xapp_name} repo for {data['xapp_name']}")
        else:
            logs.append(f"[buildXapp] Using {xapp_name} repo for {data['xapp_name']}")
            return {"error": "Invalid xapp_name"}, 400

        # 3) Verify xApp folder
        xapp_root = os.path.join(os.getcwd(), "xApp")
        xapp_dir = os.path.join(xapp_root, xapp_name)
        if not os.path.exists(xapp_dir):
            return {
                "error": f"xApp folder '{xapp_dir}' does not exist. Please build first.",
                "logs": logs
            }, 400

        # Change directory to xApp
        os.chdir(xapp_dir)

        # 4) Onboard step
        init_dir = os.path.join(xapp_dir, "init")
        if os.path.exists(init_dir):
            onboard_cmd = (
                # "sudo -E env CHART_REPO_URL=http://0.0.0.0:8090 "
                "CHART_REPO_URL=http://0.0.0.0:8090 dms_cli onboard --config_file_path=config-file.json --shcema_file_path=schema.json"
            )
            os.chdir(init_dir)
            onboard_output = execute_command(onboard_cmd)
            logs.append(f"Onboard output: {onboard_output}")
            os.chdir(xapp_dir)
        else:
            logs.append("No 'init' folder found. Skipping onboard step.")

        # 5) Deploy step
        deploy_script = os.path.join(xapp_dir, "deploy.sh")
        if not os.path.exists(deploy_script):
            return {
                "error": f"No deploy.sh found in '{xapp_dir}'",
                "logs": logs
            }, 500

        execute_command("chmod +x deploy.sh")
        deploy_output = execute_command("./deploy.sh")
        logs.append(f"deploy.sh output: {deploy_output}")

        # 6) Check if the xApp is deployed
        check_output = execute_command(f"kubectl get pods -A | grep {xapp_name}")
        if not check_output:
            msg = f"xApp '{xapp_name}' deployed, but no running pod found via 'kubectl get pods'."
            logs.append(msg)
            return {
                "message": msg,
                "logs": logs
            }, 200
        else:
            msg = f"xApp '{xapp_name}' deployment success: {check_output}"
            logs.append(msg)
            return {
                "message": msg,
                "logs": logs
            }, 200

    except Exception as e:
        # If an error occurs, return the error along with any logs we've collected
        return {"error": str(e), "logs": logs}, 500
    finally:
        # Always return to the original directory
        os.chdir(original_cwd)


@app.route('/unDeployXapp', methods=['POST'])
def unDeploy_xapp():

    original_cwd = os.getcwd()
    """
    step 1: find xapp_name corresponding directory
    step 2: check if xapp is deployed (kubectl get pods -A | grep)
    step 3: run ./undeploy.sh
    step 4: check undeployment is successful or not
    """
    try:
        data = request.get_json()
        if not data or 'xapp_name' not in data:
            return {"error": "xapp_name is required in the request body"}, 400

        xapp_name = data['xapp_name']
        xapp_names = {
            "MobieXpert xApp": "MobieXpert",
            "MobiWatch xApp" : "MobiWatch",
            "MobiFlow Auditor xApp": "mobiflow-auditor",
        }
        if xapp_name in xapp_names:
            xapp_name = xapp_names[xapp_name]
        else:
            return {"error": "Invalid xapp_name"}, 400


        print(f"[unDeployXapp] unDeploy xApp: {xapp_name}")

        # step 1
        xapp_root = os.path.join(os.getcwd(), "xApp")
        xapp_dir = os.path.join(xapp_root, xapp_name)
        if not os.path.exists(xapp_dir):
            return {"error": f"xApp folder {xapp_dir} does not exist."}, 400

        # step 2: check if xapp is deployed
        check_output = execute_command(f"kubectl get pods -A | grep {xapp_name}")
        if not check_output:
            print(f"No running pods found for {xapp_name}. Possibly already undeployed.")
            # we can continue to undeploy.sh，but we can also return a message
            # return {"message": f"No running pods for {xapp_name}. Maybe it's already undeployed."}, 200

        # step 3: ./undeploy.sh
        os.chdir(xapp_dir)
        undeploy_script = os.path.join(xapp_dir, "undeploy.sh")
        if not os.path.exists(undeploy_script):
            return {"error": f"No undeploy.sh found in {xapp_dir}"}, 500

        execute_command("chmod +x undeploy.sh")
        undeploy_output = execute_command("./undeploy.sh")
        print(undeploy_output)

        # step 4: check undeployment is successful or not
        check_output2 = execute_command(f"kubectl get pods -A | grep {xapp_name}")
        if check_output2:
            msg = f"Attempted to undeploy {xapp_name}, but pods may still be present: {check_output2}"
            print(msg)
            return {"message": msg}, 200
        else:
            msg = f"xApp {xapp_name} is successfully undeployed."
            print(msg)
            return {"message": msg}, 200

    except Exception as e:
        return {"error": str(e)}, 500
    finally:
        os.chdir(original_cwd)

@app.route('/fetchSdlData', methods=['GET'])
def fetch_sdl_data():
    ''' Fetch network data from SDL '''
    # get namespaces from SDL
    get_ns_command = 'kubectl exec -it statefulset-ricplt-dbaas-server-0 -n ricplt -- sdlcli get namespaces'
    ns_output = execute_command(get_ns_command)


    # Parse namespaces (split by newlines)
    namespaces = [ns.strip() for ns in ns_output.split("\n") if ns.strip()]
    # print(namespaces)


    # Iterate over the desired namespaces to get all keys
    ns_target = ["ue_mobiflow", "bs_mobiflow", "mobiexpert-event", "mobiwatch-event"]
    key_len_by_namespace = {}


    for namespace in ns_target:
        if namespace in namespaces:
            get_key_command = f'kubectl exec -it statefulset-ricplt-dbaas-server-0 -n ricplt -- sdlcli get keys {namespace}'
            keys_output = execute_command(get_key_command)


            # Parse keys (split by newlines)
            keys = [key.strip() for key in keys_output.split("\n") if key.strip()]


            # Store the keys by namespace
            key_len_by_namespace[namespace] = len(keys)
        else:
            print(f"Namespace '{namespace}' not found in the available namespaces.")
            key_len_by_namespace[namespace] = -1


    max_batch_get_value = 20  # max number of keys to fetch in a single batch
    get_val_command = lambda ns, key: f'kubectl exec -it statefulset-ricplt-dbaas-server-0 -n ricplt -- sdlcli get {ns} {key}'  # template get value command
    network = {}


    # get all BS mobiflow
    bs_mobiflow_key = ns_target[1]
    bs_meta = "DataType,Index,Timestamp,Version,Generator,nr_cell_id,mcc,mnc,tac,report_period".split(",")
    for i in range(0, key_len_by_namespace[bs_mobiflow_key], max_batch_get_value):
        # Create a batch of keys
        batch_keys = [str(j) for j in range(i, min(i + max_batch_get_value, key_len_by_namespace[bs_mobiflow_key]))]

        # Create the command for the batch
        command = get_val_command(bs_mobiflow_key, " ".join(batch_keys))
        value = execute_command(command)

        # Process each value in the batch
        values = {}
        for line in [val.strip() for val in value.split("\n") if val.strip()]:
            k = int(line.split(":")[0])
            v = line.split(":")[1][2:]  # remove osc sdl prefix
            values[k] = v
        values = dict(sorted(values.items())) # sort values based on Index

        for val in values.values():
            bs_mf_item = val.split(";")
            nr_cell_id = bs_mf_item[bs_meta.index("nr_cell_id")]
            timestamp = bs_mf_item[bs_meta.index("Timestamp")]
            mcc = bs_mf_item[bs_meta.index("mcc")]
            mnc = bs_mf_item[bs_meta.index("mnc")]
            tac = bs_mf_item[bs_meta.index("tac")]
            report_period = bs_mf_item[bs_meta.index("report_period")]
            network[nr_cell_id] = {
                "mcc": mcc,
                "mnc": mnc,
                "tac": tac,
                "report_period": report_period,
                "timestamp": timestamp,
                "ue": {}
            }


    # get all UE mobiflow
    ue_mobiflow_key = ns_target[0]
    ue_meta = "DataType,Index,Version,Generator,Timestamp,nr_cell_id,gnb_cu_ue_f1ap_id,gnb_du_ue_f1ap_id,rnti,s_tmsi,rrc_cipher_alg,rrc_integrity_alg,nas_cipher_alg,nas_integrity_alg,rrc_msg,nas_msg,rrc_state,nas_state,rrc_sec_state,reserved_field_1,reserved_field_2,reserved_field_3".split(",")
    for i in range(0, key_len_by_namespace[ue_mobiflow_key], max_batch_get_value):
        # Create a batch of keys
        batch_keys = [str(j) for j in range(i, min(i + max_batch_get_value, key_len_by_namespace[ue_mobiflow_key]))]

        # Create the command for the batch
        command = get_val_command(ue_mobiflow_key, " ".join(batch_keys))
        value = execute_command(command)

        # Process each value in the batch
        values = {}
        for line in [val.strip() for val in value.split("\n") if val.strip()]:
            k = int(line.split(":")[0])
            v = line.split(":")[1][2:]  # remove prefix
            values[k] = v
        values = dict(sorted(values.items())) # sort values based on Index

        for val in values.values():
            ue_mf_item = val.split(";")
            ue_id = ue_mf_item[ue_meta.index("gnb_du_ue_f1ap_id")]
            nr_cell_id = ue_mf_item[ue_meta.index("nr_cell_id")]
            if nr_cell_id in network:
                if ue_id not in network[nr_cell_id]["ue"]:
                    # add UE
                    network[nr_cell_id]["ue"][ue_id] = {
                        "gnb_cu_ue_f1ap_id": ue_mf_item[ue_meta.index("gnb_cu_ue_f1ap_id")],
                        "rnti": ue_mf_item[ue_meta.index("rnti")],
                        "s_tmsi": ue_mf_item[ue_meta.index("s_tmsi")],
                        "rrc_cipher_alg": ue_mf_item[ue_meta.index("rrc_cipher_alg")],
                        "rrc_integrity_alg": ue_mf_item[ue_meta.index("rrc_integrity_alg")],
                        "nas_cipher_alg": ue_mf_item[ue_meta.index("nas_cipher_alg")],
                        "nas_integrity_alg": ue_mf_item[ue_meta.index("nas_integrity_alg")],
                        "timestamp": ue_mf_item[ue_meta.index('Timestamp')],
                        "mobiflow": [{
                            "msg_id": int(ue_mf_item[ue_meta.index("Index")]),
                            "abnormal": {
                                "value": False,
                                "source": "None"
                            },
                            "rrc_msg": ue_mf_item[ue_meta.index("rrc_msg")],
                            "nas_msg": ue_mf_item[ue_meta.index("nas_msg")],
                            "rrc_state": ue_mf_item[ue_meta.index("rrc_state")],
                            "nas_state": ue_mf_item[ue_meta.index("nas_state")],
                            "rrc_sec_state": ue_mf_item[ue_meta.index("rrc_sec_state")],
                            "reserved_field_1": ue_mf_item[ue_meta.index("reserved_field_1")],
                            "reserved_field_2": ue_mf_item[ue_meta.index("reserved_field_2")],
                            "reserved_field_3": ue_mf_item[ue_meta.index("reserved_field_3")],
                            "timestamp": ue_mf_item[ue_meta.index('Timestamp')],
                        }],
                        "event": {}
                    }
                else:
                    # update UE
                    network[nr_cell_id]["ue"][ue_id]["gnb_cu_ue_f1ap_id"] = ue_mf_item[ue_meta.index("gnb_cu_ue_f1ap_id")]
                    network[nr_cell_id]["ue"][ue_id]["rnti"] = ue_mf_item[ue_meta.index("rnti")]
                    network[nr_cell_id]["ue"][ue_id]["s_tmsi"] = ue_mf_item[ue_meta.index("s_tmsi")]
                    network[nr_cell_id]["ue"][ue_id]["rrc_cipher_alg"] = ue_mf_item[ue_meta.index("rrc_cipher_alg")]
                    network[nr_cell_id]["ue"][ue_id]["rrc_integrity_alg"] = ue_mf_item[ue_meta.index("rrc_integrity_alg")]
                    network[nr_cell_id]["ue"][ue_id]["nas_cipher_alg"] = ue_mf_item[ue_meta.index("nas_cipher_alg")]
                    network[nr_cell_id]["ue"][ue_id]["nas_integrity_alg"] = ue_mf_item[ue_meta.index("nas_integrity_alg")]
                    network[nr_cell_id]["ue"][ue_id]["Timestamp"] = ue_mf_item[ue_meta.index("Timestamp")]
                    network[nr_cell_id]["ue"][ue_id]["mobiflow"].append({
                        "msg_id": int(ue_mf_item[ue_meta.index("Index")]),
                        "abnormal": {
                            "value": False,
                            "source": "None"
                        },
                        "rrc_msg": ue_mf_item[ue_meta.index("rrc_msg")],
                        "nas_msg": ue_mf_item[ue_meta.index("nas_msg")],
                        "rrc_state": ue_mf_item[ue_meta.index("rrc_state")],
                        "nas_state": ue_mf_item[ue_meta.index("nas_state")],
                        "rrc_sec_state": ue_mf_item[ue_meta.index("rrc_sec_state")],
                        "reserved_field_1": ue_mf_item[ue_meta.index("reserved_field_1")],
                        "reserved_field_2": ue_mf_item[ue_meta.index("reserved_field_2")],
                        "reserved_field_3": ue_mf_item[ue_meta.index("reserved_field_3")],
                        "timestamp": ue_mf_item[ue_meta.index('Timestamp')],
                    })
            else:
                print("nr_cell_id not found")


    # get all mobiexpert-event
    event_key = ns_target[2]
    event_meta = "Event ID,Event Name,Affected base station ID,Time,Affected UE ID,Description,Level".split(",")
    for i in range(1, key_len_by_namespace[event_key] + 1, max_batch_get_value):  # event index starts from 1
        # Create a batch of keys
        batch_keys = [str(j) for j in range(i, min(i + max_batch_get_value, key_len_by_namespace[event_key] + 1))]

        # Create the command for the batch
        command = get_val_command(event_key, " ".join(batch_keys))
        value = execute_command(command)

        # Process each value in the batch
        values = [val.strip() for val in value.split("\n") if val.strip()]

        for val in values:
            val = ''.join([c for c in val if 32 <= ord(c) <= 126])[2:]  # Remove non-ASCII characters
            event_item = val.split(";")
            nr_cell_id = event_item[event_meta.index("Affected base station ID")]
            event_id = event_item[event_meta.index("Event ID")]
            ue_id = event_item[event_meta.index("Affected UE ID")]
            if nr_cell_id in network:
                if ue_id in network[nr_cell_id]["ue"]:
                    # add event
                    network[nr_cell_id]["ue"][ue_id]["event"][event_id] = {
                        "Event Name": event_item[event_meta.index("Event Name")],
                        "Timestamp": event_item[event_meta.index("Time")],
                        "Affected base station ID": nr_cell_id,
                        "Affected UE ID": ue_id,
                        "Level": event_item[event_meta.index("Level")],
                        "Description": event_item[event_meta.index("Description")]
                    }
                else:
                    print(f"gnb_du_ue_f1ap_id {ue_id} not found")
            else:
                print(f"nr_cell_id {nr_cell_id} not found")
    
    # get all mobiwatch-event
    event_key = ns_target[3]
    for i in range(1, key_len_by_namespace[event_key] + 1, max_batch_get_value):  # event index starts from 1
        # Create a batch of keys
        batch_keys = [str(j) for j in range(i, min(i + max_batch_get_value, key_len_by_namespace[event_key] + 1))]

        # Create the command for the batch
        command = get_val_command(event_key, " ".join(batch_keys))
        value = execute_command(command)
        
        # Process each value in the batch
        values = [val.strip() for val in value.split("\n") if val.strip()]

        for val in values:
            val = val.split(":")[1][2:]  # remove osc sdl prefix
            event_item = val.split(";")
            model_name = event_item[0]
            if model_name == "autoencoder_v2":
                abnormal_mf_index = event_item[1:]
                # convert each item to int
                abnormal_mf_index = [int(i) for i in abnormal_mf_index]
                # traverse the mobiflow records to flag the abnormal ones
                for nr_cell_id in network:
                    for ue_id in network[nr_cell_id]["ue"]:
                        for m in network[nr_cell_id]["ue"][ue_id]["mobiflow"]:
                            if int(m["msg_id"]) in abnormal_mf_index:
                                m["abnormal"]["value"] = True
                                m["abnormal"]["source"] = model_name
                                # print("abnormal mobiflow identified")
                                # print(m)
                                break
            elif model_name == "lstm_v2":
                abnormal_mf_sequence = event_item[1:]
                # traverse the mobiflow records to flag the abnormal sequences


    # print(json.dumps(network, indent=4))
    return network

# deprecated
@app.route('/fetchCsvData', methods=['GET'])
def fetch_csv_data():

    # fetch csv data

    # Path to your CSV file

    csv_data_path = ['../src/db/5G-Sample-Data - BS.csv', '../src/db/5G-Sample-Data - UE.csv', '../src/db/5G-Sample-Data - Event.csv']

    network = {}

    # get all BS mobiflow
    
    with open(csv_data_path[0], mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            nr_cell_id = row['nr_cell_id']
            timestamp = row['Timestamp']
            mcc = row['mcc']
            mnc = row['mnc']
            tac = row['tac']
            report_period = row['report_period']
            network[nr_cell_id] = {
                "mcc": mcc,
                "mnc": mnc,
                "tac": tac,
                "report_period": report_period,
                "timestamp": timestamp,
                "ue": {}
            }

    # Read the UE CSV file
    with open(csv_data_path[1], mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            nr_cell_id = row['nr_cell_id']
            ue_id = row['gnb_du_ue_f1ap_id']
            if nr_cell_id in network:
                if ue_id not in network[nr_cell_id]["ue"]:
                    # added UE
                    network[nr_cell_id]["ue"][ue_id] = {
                        "gnb_cu_ue_f1ap_id": row['gnb_cu_ue_f1ap_id'],
                        "rnti": row['rnti'],
                        "s_tmsi": row['s_tmsi'],
                        "rrc_cipher_alg": row['rrc_cipher_alg'],
                        "rrc_integrity_alg": row['rrc_integrity_alg'],
                        "nas_cipher_alg": row['nas_cipher_alg'],
                        "nas_integrity_alg": row['nas_integrity_alg'],
                        "timestamp": row['Timestamp'],
                        "mobiflow": [{
                            "rrc_msg": row['rrc_msg'],
                            "nas_msg": row['nas_msg'],
                            "rrc_state": row['rrc_state'],
                            "nas_state": row['nas_state'],
                            "rrc_sec_state": row['rrc_sec_state'],
                            "reserved_field_1": row['reserved_field_1'],
                            "reserved_field_2": row['reserved_field_2'],
                            "reserved_field_3": row['reserved_field_3'],
                            "timestamp": row['Timestamp']
                        }],
                        "event": {}
                    }
                else:
                    # update UE
                    network[nr_cell_id]["ue"][ue_id]["gnb_cu_ue_f1ap_id"] = row['gnb_cu_ue_f1ap_id']
                    network[nr_cell_id]["ue"][ue_id]["rnti"] = row['rnti']
                    network[nr_cell_id]["ue"][ue_id]["s_tmsi"] = row['s_tmsi']
                    network[nr_cell_id]["ue"][ue_id]["rrc_cipher_alg"] = row['rrc_cipher_alg']
                    network[nr_cell_id]["ue"][ue_id]["rrc_integrity_alg"] = row['rrc_integrity_alg']
                    network[nr_cell_id]["ue"][ue_id]["nas_cipher_alg"] = row['nas_cipher_alg']
                    network[nr_cell_id]["ue"][ue_id]["nas_integrity_alg"] = row['nas_integrity_alg']
                    network[nr_cell_id]["ue"][ue_id]["timestamp"] = row['Timestamp']
                    network[nr_cell_id]["ue"][ue_id]["mobiflow"].append({
                        "timestamp": row['Timestamp'],
                        "rrc_msg": row['rrc_msg'],
                        "nas_msg": row['nas_msg'],
                        "rrc_state": row['rrc_state'],
                        "nas_state": row['nas_state'],
                        "rrc_sec_state": row['rrc_sec_state'],
                        "reserved_field_1": row['reserved_field_1'],
                        "reserved_field_2": row['reserved_field_2'],
                        "reserved_field_3": row['reserved_field_3']
                    })
            else:
                print(f"nr_cell_id {nr_cell_id} not found")

    # Read the Event CSV file
    with open(csv_data_path[2], mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            nr_cell_id = row['Affected base station ID']
            event_id = row['Event ID']
            ue_id = row['Affected UE ID']
            if nr_cell_id in network:
                if ue_id in network[nr_cell_id]["ue"]:
                    if "event" not in network[nr_cell_id]["ue"][ue_id]:
                        network[nr_cell_id]["ue"][ue_id]["event"] = {}
                    network[nr_cell_id]["ue"][ue_id]["event"][event_id] = {
                        "Event Name": row['Event Name'],
                        "Timestamp": row['Timestamp'],
                        "Affected base station ID": nr_cell_id,
                        "Affected UE ID": ue_id,
                        "Level": row['Level'],
                        "Description": row['Description']
                    }
                else:
                    print(f"gnb_du_ue_f1ap_id {ue_id} not found")
            else:
                print(f"nr_cell_id {nr_cell_id} not found")


    print(json.dumps(network, indent=4))
    return network

FILE_PATH = os.path.join(
    os.getcwd(),                       # Get the current working directory
    "xApp", "MobieXpert", "src", "pbest", "expert", "rules.pbest" # Path to the rules file
)

# NEW: Define the route for fetching rules
@app.route("/api/mobieexpert/rules", methods=["GET"])
def get_rules():
    try:
        with open(FILE_PATH, "r", encoding="utf-8") as f:
            data = f.read()
        return Response(data, mimetype="text/plain")
    except FileNotFoundError:
        return {"error": f"{FILE_PATH} not found", "hint": "Have you built MobieXpert?"}, 404
    except Exception as e:
        return {"error": str(e)}, 500

#NEW: Define the route for updating rules
@app.route("/api/mobieexpert/rules", methods=["PUT"])
def put_rules():
    try:
        new_text = request.get_data(as_text=True)
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            f.write(new_text)
        #return 204 for successful 
        return ("", 204)
    except Exception as e:
        return {"error": str(e)}, 500
    


#NEW: fake chat summary endpoint
@app.route('/chat/summary', methods=['GET'])
def get_chat_summary():
    """
    Fake chat summary endpoint.
    Returns a simple summary of base-station count and UE count.
    """
    # Static fake data
    summary = {
        "base_station_count": 5,
        "ue_count": 12
    }
    return summary, 200



if __name__ == "__main__":
    # run()
    app.run(host="0.0.0.0", port=8080)
