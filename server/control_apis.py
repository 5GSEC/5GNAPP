import subprocess
import os
from utils import *
from langchain.tools import tool
from langgraph.types import interrupt

@tool
def get_ran_cu_config_tool() -> str:
    '''
    Get the configuration of the currently running CU.
    Return:
        str: The configuration of the currently running CU.
    '''
    return get_oai_ran_cu_config()

def get_oai_ran_cu_config() -> str:
    '''
    Get the OAI RAN CU configuration 
    '''
    # load OAI RAN path from env variable
    oai_ran_cu_config_path = os.getenv('OAI_RAN_CU_CONFIG_PATH', '/opt/oai-ran')
    if oai_ran_cu_config_path is None or oai_ran_cu_config_path == "":
        return "OAI RAN CU configuration path is not set in environment variables."
    
    # read the configuration file
    if os.path.exists(oai_ran_cu_config_path):
        try:
            with open(oai_ran_cu_config_path, 'r') as config_file:
                config_data = config_file.read()
            return config_data
        except Exception as e:
            print(f"Error reading OAI RAN CU configuration: {e}")
            return f"Error reading configuration from path {oai_ran_cu_config_path}"

@tool
def update_ran_cu_config_tool(config_data: str) -> str:
    '''
    Update the configuration of the currently running CU. The invocation will be sent to the human in the loop for approval or edits.
    Return:
        str: A message indicating whether the configuration was successfully updated or not.
    Args:
        config_data (str): The new configuration data to be written to the CU.
    '''
    response = interrupt(  
        f"Trying to call `update_ran_cu_config_tool` with the following config \n\n```{{'config_data': {config_data}}}```\n\n Please approve or deny this action."
    )
    if response["type"] == "accept":
        pass
    elif response["type"] == "edit":
        config_data = response["args"]["config_data"]
    elif response["type"] == "deny":
        return "update_ran_cu_config_tool operation denied by the user."
    else:
        raise ValueError(f"Unknown response type: {response['type']}")

    return update_oai_ran_cu_config(config_data)

def update_oai_ran_cu_config(config_data: str) -> str:
    '''
    Update the OAI RAN CU configuration 
    '''
    # load OAI RAN path from env variable
    oai_ran_cu_config_path = os.getenv('OAI_RAN_CU_CONFIG_PATH', '/opt/oai-ran')
    if oai_ran_cu_config_path is None or oai_ran_cu_config_path == "":
        return "OAI RAN CU configuration path is not set in environment variables."
    
    # write the configuration data to the file
    try:
        # TODO: temp disable
        # with open(oai_ran_cu_config_path, 'w') as config_file:
        #     config_file.write(config_data) 
        return f"OAI RAN CU configuration updated successfully at path {oai_ran_cu_config_path}."
    except Exception as e:
        return f"Error updating OAI RAN CU configuration: {e}"

@tool
def reboot_ran_cu_tool() -> bool:
    '''
    Reboot the RAN CU. The invocation will be sent to the human in the loop for approval or edits.
    '''
    response = interrupt(  
        f"Trying to call `reboot_ran_cu_tool` (no argument provided)."
        "Please approve or suggest edits."
    )
    if response["type"] == "accept":
        pass
    elif response["type"] == "deny":
        return "reboot_ran_cu_tool operation denied by the user."
    else:
        raise ValueError(f"Unknown response type: {response['type']}")

    return reboot_oai_ran_cu()

def reboot_oai_ran_cu() -> bool:
    '''
    Reboot the OAI RAN CU.
    '''
    # load OAI RAN path from env variable
    oai_ran_cu_config_path = os.getenv('OAI_RAN_CU_CONFIG_PATH', '/opt/oai-ran')
    try:
        # execute docker commands to reboot the CU
        pass
        # subprocess.run(["sudo", "systemctl", "reboot"], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error rebooting RAN CU: {e}")
        return False

