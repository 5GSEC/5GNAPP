from http.server import BaseHTTPRequestHandler, HTTPServer
from flask import Flask # pip install flask
from flask_cors import CORS # pip install flask-cors
import subprocess
import sqlite3
import json
import csv
import re

app = Flask(__name__)
CORS(app) # for remote access

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
    print(command)
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
    for pod in pod_names:
        services[pod] = ""

    for line in lines:
        for pod in pod_names:
            if pod in line:
                services[pod] = line.replace("(", "") # tmp soluton to solve getting (4d20h ago) as the age
                break

    # MobiIntrospect
    program_name = "loader"
    command = f"pgrep -x {program_name}" # need to makes sure pgrep is available
    output = execute_command(command)
    if output:
        services["mobiintrospect"] = " ; ;Running; ;" # TODO get the age of the process
    else:
        services["mobiintrospect"] = ""
    
    print(json.dumps(services, indent=4))
    return services


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
    ns_target = ["ue_mobiflow", "bs_mobiflow", "mobiexpert-event"]
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
        print(value)
        values = [val.strip() for val in value.split("\n") if val.strip()]
        for val in values:
            val = val.split(":")[1][2:]  # remove prefix
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
        values = [val.strip() for val in value.split("\n") if val.strip()]
        for val in values:
            val = val.split(":")[1][2:]  # remove prefix
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


    print(json.dumps(network, indent=4))
    return network

@app.route('/fetchCsvData', methods=['GET'])
def fetch_csv_data():

    # fetch csv data

    # Path to your CSV file

    csv_data_path = ['db/5G-Sample-Data - BS.csv', 'db/5G-Sample-Data - UE.csv', 'db/5G-Sample-Data - Event.csv']

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


if __name__ == "__main__":
    # run()
    app.run(host="0.0.0.0", port=8080)
