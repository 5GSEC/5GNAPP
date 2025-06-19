import subprocess
import os
from utils import *
from langchain.tools import tool


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
def update_ran_cu_config_tool(config_data: str) -> bool:
    '''
    Update the configuration of the currently running CU.
    Args:
        config_data (str): The new configuration data to be written to the CU.
    '''
    return update_oai_ran_cu_config(config_data)

def update_oai_ran_cu_config(config_data: str) -> bool:
    '''
    Update the OAI RAN CU configuration 
    '''
    # load OAI RAN path from env variable
    oai_ran_cu_config_path = os.getenv('OAI_RAN_CU_CONFIG_PATH', '/opt/oai-ran')
    if oai_ran_cu_config_path is None or oai_ran_cu_config_path == "":
        print("OAI RAN CU configuration path is not set in environment variables.")
        return False
    
    # write the configuration data to the file
    try:
        with open(oai_ran_cu_config_path, 'w') as config_file:
            config_file.write(config_data)
        return True
    except Exception as e:
        print(f"Error updating OAI RAN CU configuration: {e}")
        return False


@tool
def reboot_ran_cu_tool() -> bool:
    '''
    Reboot the RAN CU.
    '''
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

