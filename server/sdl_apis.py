import subprocess
import os
import json
from utils import *
from langchain.tools import tool

# gloabal mappings
xapp_names = {
    "MobieXpert xApp": "MobieXpert",
    "MobiWatch xApp" : "MobiWatch",
    "MobiFlow Auditor xApp": "mobiflow-auditor",
}

branch_map = {
    "mobiflow-auditor": "v1.0.0",
    "MobiWatch": "main",
    "MobieXpert": "v1.0.0"
    # add more if needed
}

sdl_namespaces = ["ue_mobiflow", "bs_mobiflow", "mobiexpert-event", "mobiwatch-event"]
pod_names = ["ricplt-e2mgr", "mobiflow-auditor", "mobiexpert-xapp", "mobiwatch-xapp"]
display_names = ["E2 Manager", "MobiFlow Auditor xApp", "MobieXpert xApp", "MobiWatch xApp"]


def fetch_service_status_osc() -> dict:
    ''' 
        Fetch the status of the network control-plane services, including xApps deployed at OSC near-RT RIC.
        An empty string will return if the specified service is inactive.
        Returns:
            dict: A dictionary containing the status of each service
    '''
    services = {}
    command = "kubectl get pods -A | awk {'print $2\";\"$3\";\"$4\";\"$5\";\"$6'}"
    output = execute_command(command)
    lines = output.split("\n")

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
    
    # print(json.dumps(services, indent=4))
    return services

@tool
def fetch_service_status_tool() -> dict:
    ''' 
    Fetch the status of the network control-plane services, including xApps deployed at OSC near-RT RIC.
        An empty string will return if the specified service is inactive.
    Returns:
        dict: A dictionary containing the status of each service. Each service's state is represented as a string in the format "pod_name;pod_status;pod_restart_count;pod_age".
    '''
    return fetch_service_status_osc()

def fetch_sdl_data_osc() -> dict:
    ''' 
    Fetch network data from SDL
        Returns:
            dict: A dictionary containing the network data
    '''
    # get namespaces from SDL
    get_ns_command = 'kubectl exec -it statefulset-ricplt-dbaas-server-0 -n ricplt -- sdlcli get namespaces'
    ns_output = execute_command(get_ns_command)

    # Parse namespaces (split by newlines)
    namespaces = [ns.strip() for ns in ns_output.split("\n") if ns.strip()]
    # print(namespaces)

    # Iterate over the desired namespaces to get all keys
    ns_target = sdl_namespaces
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

    # print(json.dumps(network, indent=4))
    return network

@tool
def fetch_sdl_data_osc_tool() -> dict:
    ''' 
    Fetch network data from SDL, including the MobiFlow data reflecting the UE and base station status and activities.
        Returns:
            dict: A dictionary containing the network data
    '''
    return fetch_sdl_data_osc()

def fetch_sdl_event_data_osc() -> dict:
    ''' 
    Fetch network event data generated by MobieXpert and MobiWatch from SDL
    Returns:
        dict: A dictionary containing the network event data.
    '''
    # get namespaces from SDL
    get_ns_command = 'kubectl exec -it statefulset-ricplt-dbaas-server-0 -n ricplt -- sdlcli get namespaces'
    ns_output = execute_command(get_ns_command)

    # Parse namespaces (split by newlines)
    namespaces = [ns.strip() for ns in ns_output.split("\n") if ns.strip()]

    # Iterate over the desired namespaces to get all keys
    ns_target = ["mobiexpert-event", "mobiwatch-event"]
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

    # variable to hold sdl event data
    max_batch_get_value = 20  # max number of keys to fetch in a single batch
    get_val_command = lambda ns, key: f'kubectl exec -it statefulset-ricplt-dbaas-server-0 -n ricplt -- sdlcli get {ns} {key}'  # template get value command
    event = {}
    
    # get all mobiexpert-event
    event_key = ns_target[0]
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
            
            # create and insert attack event
            event[len(event)+1] = {
                "id": len(event)+1,
                "source": "MobieXpert",
                "name": event_item[event_meta.index("Event Name")],
                "cellID": event_item[event_meta.index("Affected base station ID")],
                "ueID": event_item[event_meta.index("Affected UE ID")],
                "timestamp": event_item[event_meta.index("Time")],
                "severity": event_item[event_meta.index("Level")],
                "description": event_item[event_meta.index("Description")],
            }

    # get all mobiwatch-event
    event_key = ns_target[1]
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
            model_name = event_item[0]
            if model_name == "autoencoder_v2":
                # f"{model_name};{event['event_name']};{event['nr_cell_id']};{event['ue_id']};{event['timestamp']};{index_str};{event_desc}"
                event[len(event)+1] = {
                    "id": len(event)+1,
                    "source": f"MobiWatch_{model_name}",
                    "name": event_item[1],
                    "cellID": event_item[2],
                    "ueID": event_item[3],
                    "timestamp": event_item[4],
                    "severity": "Medium",
                    "mobiflow_index": event_item[5],
                    "description": event_item[6],
                }

            elif model_name == "lstm_v2":
                # f"{model_name};{event['event_name']};{event['nr_cell_id']};{event['ue_id']};{event['timestamp']};{str(merged_sequence_list)};{event_desc}"
                event[len(event)+1] = {
                    "id": len(event)+1,
                    "source": f"MobiWatch_{model_name}",
                    "name": event_item[1],
                    "cellID": event_item[2],
                    "ueID": event_item[3],
                    "timestamp": event_item[4],
                    "severity": "Medium",
                    "mobiflow_index": event_item[5],
                    "description": event_item[6],
                }
    
    return event

@tool
def fetch_sdl_event_data_all_tool() -> dict:
    ''' 
    Fetch all network event data generated by MobieXpert and MobiWatch from SDL
    Returns:
        dict: A dictionary containing the network event data. Each dict object contains the following keys: ['id', 'source', 'name', 'cellID', 'ueID', 'timestamp', 'severity', 'description']
        Example event: {'id': 1, 'source': 'MobieXpert', 'name': 'RRC Null Cipher', 'cellID': '12345678', 'ueID': '38940', 'timestamp': '1745783800', 'severity': 'Critical', 'description': 'The UE uses null cipher mode in its RRC session, its RRC traffic data is subject to sniffing attack.'}
    '''
    return fetch_sdl_event_data_osc()

@tool
def fetch_sdl_event_data_by_ue_id_tool(ue_id: str) -> dict:
    ''' 
    Fetch network event data generated by MobieXpert and MobiWatch from SDL by UE ID
    Args:
        ue_id (str): The UE ID to filter the events.
    Returns:
        dict: A dictionary containing the network event data filtered by UE ID. Each dict object contains the following keys: ['id', 'source', 'name', 'cellID', 'ueID', 'timestamp', 'severity', 'description']
        Example event: {'id': 1, 'source': 'MobieXpert', 'name': 'RRC Null Cipher', 'cellID': '12345678', 'ueID': '38940', 'timestamp': '1745783800', 'severity': 'Critical', 'description': 'The UE uses null cipher mode in its RRC session, its RRC traffic data is subject to sniffing attack.'}
    '''
    all_events = fetch_sdl_event_data_osc()
    filtered_events = {k: v for k, v in all_events.items() if v.get("ueID") == ue_id}
    return filtered_events

@tool
def fetch_sdl_event_data_by_cell_id_tool(cell_id: str) -> dict:
    ''' 
    Fetch network event data generated by MobieXpert and MobiWatch from SDL by Cell ID
    Args:
        cell_id (str): The Cell ID to filter the events.
    Returns:
        dict: A dictionary containing the network event data filtered by Cell ID. Each dict object contains the following keys: ['id', 'source', 'name', 'cellID', 'ueID', 'timestamp', 'severity', 'description']
        Example event: {'id': 1, 'source': 'MobieXpert', 'name': 'RRC Null Cipher', 'cellID': '12345678', 'ueID': '38940', 'timestamp': '1745783800', 'severity': 'Critical', 'description': 'The UE uses null cipher mode in its RRC session, its RRC traffic data is subject to sniffing attack.'}
    '''
    all_events = fetch_sdl_event_data_osc()
    filtered_events = {k: v for k, v in all_events.items() if v.get("cellID") == cell_id}
    return filtered_events

def build_xapp_osc(xapp_name: str):
    """
    Build the xApp from the given xapp_name.
    Steps:
        step 1: get xapp_name
        step 2: go into xApp dir (if it doesn't exist, create it)
        step 3: git clone the xApp repo
        step 4: run Docker registry
        step 5: cd [xapp_name] and then ./build.sh
        step 6: check if build is successful
    Args:
        xapp_name (str): The name of the xApp to build.
    Returns:
        dict: A dictionary containing the status of the build process.
    """
    original_cwd = os.getcwd()
    logs = []  # We'll accumulate logs here

    try:
        if xapp_name in xapp_names:
            xapp_name = xapp_names[xapp_name]
            logs.append(f"[buildXapp] Using {xapp_name} repo for {xapp_name}")
        else:
            logs.append(f"[buildXapp] Using {xapp_name} repo for {xapp_name}")
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

@tool
def build_xapp_tool(xapp_name: str):
    """
    Build the xApp from the given xapp_name.
    Steps:
        step 1: get xapp_name
        step 2: go into xApp dir (if it doesn't exist, create it)
        step 3: git clone the xApp repo
        step 4: run Docker registry
        step 5: cd [xapp_name] and then ./build.sh
        step 6: check if build is successful
    Args:
        xapp_name (str): The name of the xApp to build.
        Please match the user input to nearest valid xApp name listed in the following
        ["MobieXpert xApp", "MobiWatch xApp", "MobiFlow Auditor xApp"]
    Returns:
        dict: A dictionary containing the status of the build process.
    """
    return build_xapp_osc(xapp_name)

def deploy_xapp_osc(xapp_name: str):
    '''
    Deploy the xApp from the given xapp_name.
    '''
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

        if xapp_name in xapp_names:
            xapp_name = xapp_names[xapp_name]
            logs.append(f"[buildXapp] Using {xapp_name} repo for {xapp_name}")
        else:
            logs.append(f"[buildXapp] Using {xapp_name} repo for {xapp_name}")
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

@tool
def deploy_xapp_tool(xapp_name: str):
    '''
    Deploy the xApp from the given xapp_name.
    Args:
        xapp_name (str): The name of the xApp to build.
        Please match the user input to nearest valid xApp name listed in the following
        ["MobieXpert xApp", "MobiWatch xApp", "MobiFlow Auditor xApp"]
    '''
    return deploy_xapp_osc(xapp_name)

def unDeploy_xapp_osc(xapp_name: str):
    ''' 
    Undeploy the xApp from the given xapp_name.
    Steps:
        step 1: find xapp_name corresponding directory
        step 2: check if xapp is deployed (kubectl get pods -A | grep)
        step 3: run ./undeploy.sh
        step 4: check undeployment is successful or not
    '''
    
    original_cwd = os.getcwd()
    try:
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

@tool
def unDeploy_xapp_tool(xapp_name: str):
    ''' 
    Undeploy the xApp from the given xapp_name.
    Args:
        xapp_name (str): The name of the xApp to build.
        Please match the user input to nearest valid xApp name listed in the following
        ["MobieXpert xApp", "MobiWatch xApp", "MobiFlow Auditor xApp"]
    Steps:
        step 1: find xapp_name corresponding directory
        step 2: check if xapp is deployed (kubectl get pods -A | grep)
        step 3: run ./undeploy.sh
        step 4: check undeployment is successful or not
    '''
    return unDeploy_xapp_osc(xapp_name)

@tool
def get_ue_mobiflow_data_all_tool() -> list:
    '''
    Get all UE MobiFlow telemetry from SDL
    Before analyzing the MobiFlow telemetry, ensure you have called get_ue_mobiflow_description_tool() to obtain the semantics associated with the data for better understanding.
    Returns:
        list: a list of UE MobiFlow telemetry in raw format (separated by ; delimiter)
    '''
    # get all keys for ue_mobiflow namespace
    namespace = sdl_namespaces[0]
    get_key_command = f'kubectl exec -it statefulset-ricplt-dbaas-server-0 -n ricplt -- sdlcli get keys {namespace}'
    keys_output = execute_command(get_key_command)

    # Parse keys (split by newlines)
    keys = [int(key.strip()) for key in keys_output.split("\n") if key.strip()]
    keys = sorted(keys)

    return get_ue_mobiflow_data_by_index(keys)

@tool
def get_ue_mobiflow_data_by_index_tool(index_list_str: str) -> list:
    '''
    Get UE MobiFlow telemetry from SDL using a specified index list
    Before analyzing the MobiFlow telemetry, ensure you have called get_ue_mobiflow_description_tool() to obtain the semantics associated with the data for better understanding.
    Args:
        index_list_str (str): a string containing the MobiFlow indexes separated by comma, e.g., 1,2,3,4,5,6
    Returns:
        list: a list of UE MobiFlow telemetry in raw format (separated by ; delimiter) 
    '''
    if index_list_str is None or len(index_list_str) == 0:
        return []
    index_list = []
    for i in index_list_str.split(","):
        index_list.append(int(i))
    return get_ue_mobiflow_data_by_index(index_list)

def get_ue_mobiflow_data_by_index(index_list: list) -> list:
    '''
    Get UE MobiFlow telemetry from SDL using a specified index list
    Args:
        index_list (list): a list of MobiFlow indexes (integers)
    Returns:
        list: a list of UE MobiFlow telemetry in raw format (separated by ; delimiter) 
    '''
    if index_list is None or len(index_list) == 0:
        return []
    max_batch_get_value = 20  # max number of keys to fetch in a single batch
    get_val_command = lambda ns, key: f'kubectl exec -it statefulset-ricplt-dbaas-server-0 -n ricplt -- sdlcli get {ns} {key}'  # template get value command

    # get all UE mobiflow
    mf_data = {}
    ue_mobiflow_key = sdl_namespaces[0]
    for i in range(0, len(index_list), max_batch_get_value):
        # Create a batch of keys
        batch_keys = [str(index_list[j]) for j in range(i, min(i + max_batch_get_value, len(index_list)))]

        # Create the command for the batch
        command = get_val_command(ue_mobiflow_key, " ".join(batch_keys))
        value = execute_command(command)

        # Process each value in the batch
        for line in [val.strip() for val in value.split("\n") if val.strip()]:
            k = int(line.split(":")[0])
            v = line.split(":")[1][2:]  # remove prefix
            mf_data[k] = v
        mf_data = dict(sorted(mf_data.items())) # sort values based on Index

    return list(mf_data.values())

@tool
def get_ue_mobiflow_description_tool() -> str:
    '''
    API to retreve the description of UE MobiFlow data fields. Each field is defined with its default value, description, and value range if applicable.
    '''
    return '''
    msg_type = "UE"                        # Msg hdr  - mobiflow type [UE, BS]
    msg_id = 0                             # Msg hdr  - unique mobiflow event ID
    mobiflow_ver = MOBIFLOW_VERSION        # Msg hdr  - version of Mobiflow
    generator_name = GENERATOR_NAME        # Msg hdr  - generator name (e.g., SECSM)
    #####################################################################
    timestamp = 0              # UE meta  - timestamp (ms)
    nr_cell_id = 0             # UE meta  - NR (5G) basestation id
    gnb_cu_ue_f1ap_id = 0      # UE meta  - UE id identified by gNB CU F1AP
    gnb_du_ue_f1ap_id = 0      # UE meta  - UE id identified by gNB DU F1AP
    rnti = 0                   # UE meta  - ue rnti
    s_tmsi = 0                 # UE meta  - ue s-tmsi
    rrc_cipher_alg = 0         # UE packet telemetry  - rrc cipher algorithm
    rrc_integrity_alg = 0      # UE packet telemetry  - rrc integrity algorithm
    nas_cipher_alg = 0         # UE packet telemetry  - nas cipher algorithm
    nas_integrity_alg = 0      # UE packet telemetry  - nas integrity algorithm
    #####################################################################
    rrc_msg = ""               # UE packet-agnostic telemetry  - RRC message
    nas_msg = ""               # UE packet-agnostic telemetry  - NAS message (an empty nas_msg could indicate an encrypted NAS message since MobiFlow cannot decode encrypted NAS messages)
    rrc_state = 0              # UE packet-agnostic telemetry  - RRC state       [INACTIVE, RRC_IDLE, RRC_CONNECTED, RRC_RECONFIGURED]
    nas_state = 0              # UE packet-agnostic telemetry  - NAS state (EMM) [EMM_DEREGISTERED, EMM_REGISTER_INIT, EMM_REGISTERED]
    rrc_sec_state = 0          # UE packet-agnostic telemetry  - security state  [SEC_CONTEXT_NOT_EXIST, SEC_CONTEXT_EXIST]
    #####################################################################
    reserved_field_1 = 0       # UE packet-specific telemetry
    reserved_field_2 = 0       # UE packet-specific telemetry
    reserved_field_3 = 0       # UE packet-specific telemetry
    '''

@tool
def get_event_description_tool() -> str:
    '''
    API to retreve the description of event data fields
    '''
    return '''
        Each event consists of the following fields with their descriptions:
        id: Unique ID of the event,
        source: The source that generates the event, i.e., the xApp name, 
        name: The name describing the event,
        cellID: The involved base station ID in this event,
        ueID: The involved user equipment's (UE) ID in this event,
        timestamp: The event timestamp,
        severity: The severity of event,
        mobiflow_index (if available): the MobiFlow telemetry index associated with the event, matching the msg_id field in each MobiFlow telemetry,
        description: The event description
    '''
