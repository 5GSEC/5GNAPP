from mobillm_multiagent import MobiLLM_Multiagent
import os

os.environ["GOOGLE_API_KEY"] = "AIzaSyD5W_UAx2QRabottm6yh64vtDlLowUqVW4"
os.environ["OAI_RAN_CU_CONFIG_PATH"] = "/homes/prakhar/projects/5GNAPP/server/gnb-cu1-docker.conf"
os.environ["HF_HOME"] = "/scratch/bdnc/psharma12/hf_models/"


def test(*kwargs):
    agent = MobiLLM_Multiagent(local_model="mistralai/Mixtral-8x7B-Instruct-v0.1")
    result = agent.invoke("""[security analysis]
    Event Details:
    - Source: MobieXpert
    - Name: RRC Null Cipher
    - Cell ID: 20000
    - UE ID: 54649
    - Time: Mon Jun 09 2025 11:28:00 GMT-0400 (Eastern Daylight Time)
    - Severity: Critical
    - Description: The UE uses null cipher mode in its RRC session, its RRC traffic data is subject to sniffing attack.
    """)
    while True:
        # Check if an interrupt occurred in the result
        if "__interrupt__" in result.keys():
            interrupt_value = result["__interrupt__"][0].value
            # Ask the user for input to handle the interrupt
            user_input = input(f'Approve the tool call?\n{interrupt_value}\nYour option (yes/edit/no): ')

            if user_input.lower() == "yes":
                resume_command = {"type": "accept"}
            elif user_input.lower() == "no":
                resume_command = {"type": "deny"}
            elif user_input.lower() == "edit":
                new_value = input("Enter your edited value: ")
                resume_command = {
                    "type": "edit",
                    "config_data": new_value
                }
            else:
                print("Invalid input. Please enter 'yes', 'no', or 'edit'.")
                continue  # re-prompt

            # Resume the graph with the chosen command
            thread_id = result["thread_id"]
            result = agent.resume(resume_command, thread_id)
            
        else:
            break  # No interrupt means the flow is complete; exit the loop


    if "chat_response" in result:
        print("Chat Response:", result["chat_response"])
        print("\n\n")
    if "threat_summary" in result:
        print("Threat Summary:", result["threat_summary"])
        print("\n\n")
    if "mitre_technique" in result:
        print("MITRE Technique:", result["mitre_technique"])
        print("\n\n")
    if "countermeasures" in result:
        print("Countermeasures:", result["countermeasures"])
        print("\n\n")
    if "outcome" in result:
        print("Outcome:", result["outcome"])
        print("\n\n")
    if "tools_called" in result:
        print("Tools Called:")
        for tool in result["tools_called"]:
            print(tool)
        print("\n\n")

test()