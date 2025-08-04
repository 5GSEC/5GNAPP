import subprocess
import os
import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from custom_chatmodel import ChatAgenticxLAM

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

def extract_json_from_string(input_str: str):
    try:
        response = json.loads(input_str.strip().replace("\n", ""))
        return response
    except json.JSONDecodeError:
        json_match = re.search(r'{[\s\S]*}', input_str)
        try:
            response = json.loads(json_match.group()) if json_match else ""
        except json.JSONDecodeError:
            print(f"Fail to extract json from string {input_str}")
            return None
        return response

def pretty_print_message(message, indent=False):
    pretty_message = message.pretty_repr(html=True)
    if not indent:
        print(pretty_message)
        return

    indented = "\n".join("\t" + c for c in pretty_message.split("\n"))
    print(indented)


def pretty_print_messages(update, last_message=False):
    is_subgraph = False
    if isinstance(update, tuple):
        ns, update = update
        # skip parent graph updates in the printouts
        if len(ns) == 0:
            return

        graph_id = ns[-1].split(":")[0]
        print(f"Update from subgraph {graph_id}:")
        print("\n")
        is_subgraph = True

    for node_name, node_update in update.items():
        update_label = f"Update from node {node_name}:"
        if is_subgraph:
            update_label = "\t" + update_label

        print(update_label)
        print("\n")

        messages = convert_to_messages(node_update["messages"])
        if last_message:
            messages = messages[-1:]

        for m in messages:
            pretty_print_message(m, indent=is_subgraph)
        print("\n")

def instantiate_llm(local_model=None, google_api_key: str=None, gemini_llm_model: str="gemini-2.5-flash"):
    if local_model:
        llm = ChatAgenticxLAM(model=local_model, temperature=0.1)
    else:
        print('creating google model!!')  
        if not os.getenv("GOOGLE_API_KEY") and google_api_key == None:
            print("Warning: GOOGLE_API_KEY not found in environment variables.")
            print("Please set it for the LangChain Gemini LLM to work.")
            return
        elif google_api_key is not None:
            os.environ["GOOGLE_API_KEY"] = google_api_key
        try:
            llm = ChatGoogleGenerativeAI(model=gemini_llm_model, temperature=0.3)
        except Exception as e:
            print(f"Error initializing Gemini LLM: {e}")
            print("Ensure your GOOGLE_API_KEY is set correctly and you have internet access.")
    return llm
