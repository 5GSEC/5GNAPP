import os
import json
from langchain.tools import tool

@tool
def get_all_mitre_fight_techniques() -> dict:
    ''' 
    This function will read all the MiTRE Fight techniques from a local json file that is created from the official MiTRE Fight Git Repo (https://github.com/mitre/FiGHT/)
    Returns:
        dict: A dictionary containing all the MiTRE Fight techniques. Each dict object is a specific technique encoded as (key, value) pairs. Each technique will contain fields like Name, Descriptions, and Mitigations.
    '''
    with open("mitre_fight_techniques.json", 'r') as f:
        techniques = json.load(f)

    return techniques


@tool
def get_mitre_fight_technique_by_id(tech_id: str) -> dict:
    '''
    This function will read a specific MiTRE Fight technique from a local json file that is created from the official MiTRE Fight Git Repo (https://github.com/mitre/FiGHT/). A speficied technique ID needs to be provided.
    Input: tech_id (str) - the ID of a MiTRE Fight technique (e.g., "FGT1199.501")
    Returns:
        dict: A dictionary containing the specified MiTRE Fight technique. Each dict object is a specific technique encoded as (key, value) pairs. Each technique will contain fields like Name, Descriptions, and Mitigations. If the technique ID is not found, an empty dict will be returned.
    '''
    if tech_id == None or len(tech_id) == 0:
        return {}
    tech = {}
    with open("mitre_fight_techniques.json", 'r') as f:
        techniques = json.load(f)
        if tech_id in techniques.keys():
            tech = techniques[tech_id]

    return tech


    