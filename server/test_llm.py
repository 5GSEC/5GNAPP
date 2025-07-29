from mobillm_multiagent import MobiLLM_Multiagent

# Remember to set the env variable using export OAI_RAN_CU_CONFIG_PATH and export GOOGLE_API_KEY before running the script

# --- Test Running the Agent ---
if __name__ == "__main__":

    agent = MobiLLM_Multiagent()
    # result = agent.invoke("[chat] How many services are currently in Running state and how long they have been running?")
    # result = agent.invoke("[chat] How many cells are currently deployed in the network?")
    # result = agent.invoke("[chat] How many UEs are connected to the network?")
    # result = agent.invoke("[chat] What are the IMSIs of the UEs connected to the network?")
    # result = agent.invoke("[security analysis] Conduct a thorough security analysis for event ID 4")
    # result = agent.invoke("""[security analysis]
    # Event Details:
    # - Source: MobieXpert
    # - Name: RRC Null Cipher
    # - Cell ID: 20000
    # - UE ID: 54649
    # - Time: Mon Jun 09 2025 11:28:00 GMT-0400 (Eastern Daylight Time)
    # - Severity: Critical
    # - Description: The UE uses null cipher mode in its RRC session, its RRC traffic data is subject to sniffing attack.
    # """)


    # BTS Resource depletion attack. Traffic from bts-attack*.csv
    # No countermeasure strategy is available.
    result = agent.invoke("""[security analysis] 
    The MobieXpert xApp has detected a BTS resource depletion attack. A malicious UE repeatedly created fabricated RRC connections to the gNB to perform denial-of-service attacks to exhaust the gNB's resources.
    Given the following UE Mobiflow data, conduct a thorough security analysis.
    UE;0;v2.0;SECSM;1715111925;12345678;5008;5008;5008;0;2089900000000;0;0;0;0;RRCSetupRequest; ;0;0;0;0;0;0
    UE;1;v2.0;SECSM;1715111925;12345678;5008;5008;5008;0;2089900000000;0;0;0;0;RRCSetup; ;2;0;0;0;0;0
    UE;2;v2.0;SECSM;1715111925;12345678;5008;5008;5008;0;2089900000000;0;0;0;0;RRCSetupComplete;Registrationrequest;2;1;0;0;0;0
    UE;4;v2.0;SECSM;1715111925;12345678;5008;5008;5008;0;2089900000000;0;0;0;0;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    UE;5;v2.0;SECSM;1715111926;12345678;38784;38784;38784;0;2089900000001;0;0;0;0;RRCSetupRequest; ;0;0;0;0;0;0
    UE;6;v2.0;SECSM;1715111926;12345678;38784;38784;38784;0;2089900000001;0;0;0;0;RRCSetup; ;2;0;0;0;0;0
    UE;7;v2.0;SECSM;1715111926;12345678;38784;38784;38784;0;2089900000001;0;0;0;0;RRCSetupComplete;Registrationrequest;2;1;0;0;0;0
    UE;9;v2.0;SECSM;1715111926;12345678;38784;38784;38784;0;2089900000001;0;0;0;0;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    UE;10;v2.0;SECSM;1715111926;12345678;17134;17134;17134;0;2089900000002;0;0;0;0;RRCSetupRequest; ;0;0;0;0;0;0
    UE;11;v2.0;SECSM;1715111926;12345678;17134;17134;17134;0;2089900000002;0;0;0;0;RRCSetup; ;2;0;0;0;0;0
    UE;12;v2.0;SECSM;1715111926;12345678;17134;17134;17134;0;2089900000002;0;0;0;0;RRCSetupComplete;Registrationrequest;2;1;0;0;0;0
    UE;14;v2.0;SECSM;1715111926;12345678;17134;17134;17134;0;2089900000002;0;0;0;0;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    UE;15;v2.0;SECSM;1715111926;12345678;62256;62256;62256;0;2089900000003;0;0;0;0;RRCSetupRequest; ;0;0;0;0;0;0
    UE;16;v2.0;SECSM;1715111926;12345678;62256;62256;62256;0;2089900000003;0;0;0;0;RRCSetup; ;2;0;0;0;0;0
    UE;17;v2.0;SECSM;1715111926;12345678;62256;62256;62256;0;2089900000003;0;0;0;0;RRCSetupComplete;Registrationrequest;2;1;0;0;0;0
    UE;18;v2.0;SECSM;1715111926;12345678;62256;62256;62256;0;2089900000003;0;0;0;0;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    UE;20;v2.0;SECSM;1715111927;12345678;43597;43597;43597;0;2089900000004;0;0;0;0;RRCSetupRequest; ;0;0;0;0;0;0
    UE;21;v2.0;SECSM;1715111927;12345678;43597;43597;43597;0;2089900000004;0;0;0;0;RRCSetup; ;2;0;0;0;0;0
    """)

    # Blind DoS attack. Traffic from blind_dos_tmsi_*.csv
    # No countermeasure strategy is available.
    # result = agent.invoke("""[security analysis] 
    # The MobieXpert xApp has detected a Blind DoS attack. A malicious UE initiated an RRC connection using the same S-TMSI as another connected UE. The previously connected UE's session could have been released by the gNB.
    # Given the following UE Mobiflow data, conduct a thorough security analysis.
    # UE;0;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;RRCSetupRequest; ;0;0;0;3;0;0
    # UE;1;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;RRCSetup; ;2;0;0;0;0;0
    # UE;2;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;RRCSetupComplete;Registrationrequest;2;1;0;1;0;0
    # UE;3;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    # UE;4;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;ULInformationTransfer;Authenticationresponse;2;1;0;0;0;0
    # UE;5;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;DLInformationTransfer;Securitymodecommand;2;1;0;0;0;0
    # UE;6;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;ULInformationTransfer;Securitymodecomplete;2;1;0;0;0;0
    # UE;7;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;SecurityModeCommand; ;2;1;0;0;0;0
    # UE;8;v2.0;SECSM;1746320761;12345678;61850;61850;61850;123456;2089900004788;2;2;0;2;SecurityModeComplete; ;2;1;3;0;0;0
    # UE;9;v2.0;SECSM;1746320775;12345678;0;53464;53464;123456;2089900000000;0;0;0;0;RRCSetupRequest; ;0;0;0;3;0;0
    # """)

    # Downlink DoS attack. Traffic from dnlink_dos_1.csv
    # No countermeasure strategy is available.
    # result = agent.invoke("""[security analysis] 
    # The MobieXpert xApp has detected a Blind DoS attack. A man-in-the-middle attacker overwrites a downlink (gNB to UE) plain-text NAS message with a registration reject message to force the UE to de-register from the ongoing connection.
    # Given the following UE Mobiflow data, conduct a thorough security analysis.
    # UE;31;v2.0;SECSM;1746321023;12345678;26168;26168;26168;0;2089900000000;0;0;0;0;RRCSetupRequest; ;0;0;0;3;0;0
    # UE;32;v2.0;SECSM;1746321023;12345678;26168;26168;26168;0;2089900000000;0;0;0;0;RRCSetup; ;2;0;0;0;0;0
    # UE;33;v2.0;SECSM;1746321023;12345678;26168;26168;26168;0;2089900000000;0;0;0;0;RRCSetupComplete;Registrationrequest;2;1;0;1;0;0
    # UE;34;v2.0;SECSM;1746321023;12345678;26168;26168;26168;0;2089900000000;0;0;0;0;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    # """)

    # Downlink IMSI Extraction attack. Traffic from dnlink_imsi_extr_1.csv
    # No countermeasure strategy is available.
    # result = agent.invoke("""[security analysis] 
    # The MobieXpert xApp has detected a Downlink IMSI Extraction attack. A man-in-the-middle attacker overwrites a plain-text NAS message with an identity response message to force the UE to transmit its IMSI in plain-text.
    # Given the following UE Mobiflow data, conduct a thorough security analysis.
    # UE;35;v2.0;SECSM;1746321089;12345678;47344;47344;47344;0;2089900000000;0;0;0;0;RRCSetupRequest; ;0;0;0;3;0;0
    # UE;36;v2.0;SECSM;1746321089;12345678;47344;47344;47344;0;2089900000000;0;0;0;0;RRCSetup; ;2;0;0;0;0;0
    # UE;37;v2.0;SECSM;1746321089;12345678;47344;47344;47344;0;2089900000000;0;0;0;0;RRCSetupComplete;Registrationrequest;2;1;0;1;0;0
    # UE;38;v2.0;SECSM;1746321089;12345678;47344;47344;47344;0;2089900000000;0;0;0;0;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    # UE;39;v2.0;SECSM;1746321089;12345678;47344;47344;47344;0;2089900000000;0;0;0;0;ULInformationTransfer;Identityresponse;2;1;0;0;0;0
    # """)

    # Null ciphering & Integrity attack. Traffic from null_cipher_integ_*.csv
    # The LLM should invoke RAN CU Config Tuning APIs to adjust the ciphering and integrity mode (removing "nea0" or "nia0") in the RAN CU config file.
    # result = agent.invoke("""[security analysis] 
    # The MobieXpert xApp has detected a null ciphering or integrity attack. The victim UE uses null cipher or integrity mode in its RRC or NAS session, its  traffic data is subject to sniffing attack over the air.
    # Given the following UE Mobiflow data, conduct a thorough security analysis.
    # UE;39;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;RRCSetupRequest; ;0;0;0;3;0;0
    # UE;40;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;RRCSetup; ;2;0;0;0;0;0
    # UE;41;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;RRCSetupComplete;Registrationrequest;2;1;0;1;0;0
    # UE;42;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    # UE;43;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;ULInformationTransfer;Authenticationresponse;2;1;0;0;0;0
    # UE;44;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;DLInformationTransfer;Securitymodecommand;2;1;0;0;0;0
    # UE;45;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;ULInformationTransfer;Securitymodecomplete;2;1;0;0;0;0
    # UE;46;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;SecurityModeCommand; ;2;1;0;0;0;0
    # UE;47;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;SecurityModeComplete; ;2;1;1;0;0;0
    # UE;48;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;RRCReconfiguration; ;2;1;1;0;0;0
    # UE;49;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;RRCReconfigurationComplete; ;2;1;1;0;0;0
    # UE;50;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;UECapabilityEnquiry; ;2;1;1;0;0;0
    # UE;51;v2.1;SECSM;1749482880;20000;1;54649;54649;0;2089900004719;0;2;0;2;UECapabilityInformation; ;2;1;1;0;0;0
    # UE;52;v2.1;SECSM;1749482881;20000;1;54649;54649;0;2089900004719;0;2;0;2;ULInformationTransfer;Registrationcomplete;2;2;1;0;0;0
    # UE;53;v2.1;SECSM;1749482881;20000;1;54649;54649;0;2089900004719;0;2;0;2;ULInformationTransfer;ULNAStransport;2;2;1;0;0;0
    # UE;54;v2.1;SECSM;1749482881;20000;1;54649;54649;0;2089900004719;0;2;0;2;RRCReconfiguration; ;2;2;1;0;0;0
    # UE;55;v2.1;SECSM;1749482881;20000;1;54649;54649;0;2089900004719;0;2;0;2;RRCReconfigurationComplete; ;2;2;1;0;0;0
    # """)

    # Uplink IMSI Extraction. Traffic from uplink_imsi_extr_1.csv
    # No countermeasure strategy is available.
    # result = agent.invoke("""[security analysis] 
    # The MobieXpert xApp has detected a uplink IMSI Extraction attack. A man-in-the-middle attacker overwrites an uplink (UE to gNB) plain-text NAS message force the gNB to trigger a identity request to ask the UE to transmit its permanent identity in plain-text.
    # Given the following UE Mobiflow data, conduct a thorough security analysis.
    # UE;59;v2.0;SECSM;1746321324;12345678;50192;50192;50192;0;2089900000000;0;0;0;0;RRCSetupRequest; ;0;0;0;3;0;0
    # UE;60;v2.0;SECSM;1746321324;12345678;50192;50192;50192;0;2089900000000;0;0;0;0;RRCSetup; ;2;0;0;0;0;0
    # UE;61;v2.0;SECSM;1746321324;12345678;50192;50192;50192;0;2089900000000;0;0;0;0;RRCSetupComplete;Registrationrequest;2;1;0;2;0;0
    # UE;62;v2.0;SECSM;1746321324;12345678;50192;50192;50192;0;2089900000000;0;0;0;0;DLInformationTransfer;Identityrequest;2;1;0;0;0;0
    # UE;63;v2.0;SECSM;1746321324;12345678;50192;50192;50192;0;2089900000000;0;0;0;0;ULInformationTransfer;Identityresponse;2;1;0;0;0;0
    # UE;64;v2.0;SECSM;1746321324;12345678;50192;50192;50192;0;2089900000000;0;0;0;0;DLInformationTransfer;Authenticationrequest;2;1;0;0;0;0
    # UE;65;v2.0;SECSM;1746321324;12345678;50192;50192;50192;0;2089900000000;0;0;0;0;ULInformationTransfer;Authenticationresponse;2;1;0;0;0;0
    # UE;66;v2.0;SECSM;1746321324;12345678;50192;50192;50192;0;2089900000000;0;0;0;0;DLInformationTransfer;Registrationreject;2;0;0;0;0;0
    # """)

    # tune the below code to print the result in a more readable format
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
