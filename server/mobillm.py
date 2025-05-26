from sdl_apis import *
from mitre_apis import *
# Import necessary libraries from LangChain and Google
# Make sure you have them installed:
# pip install langchain langchain_google_genai google-generativeai
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import tool, AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate # For custom prompts if needed
from langchain.tools import Tool # Import the Tool class
from langchain import hub # For pre-built prompts
from langchain.memory import ConversationBufferWindowMemory # Import memory

class MobiLLMAgent:

    def __init__(self, google_api_key: str=None, gemini_llm_model: str="gemini-2.5-flash-preview-04-17"):
        self.init_completed = False
        self.gemini_llm_model = gemini_llm_model
        # --- Configuration ---
        # IMPORTANT: Set your GOOGLE_API_KEY as an environment variable.
        # LangChain's Google Generative AI integration will automatically pick it up.
        # If you don't use dotenv, ensure the environment variable is set in your system.
        # Alternatively, you can pass api_key directly to ChatGoogleGenerativeAI, but env var is preferred.
        if not os.getenv("GOOGLE_API_KEY") and google_api_key == None:
            print("Warning: GOOGLE_API_KEY not found in environment variables.")
            print("Please set it for the LangChain Gemini LLM to work.")
            return
        elif google_api_key is not None:
            os.environ["GOOGLE_API_KEY"] = google_api_key
            # You could set it here as a fallback, but it's not recommended for production:
            # os.environ["GOOGLE_API_KEY"] = "YOUR_ACTUAL_API_KEY"

        # --- LLM Initialization ---
        # Initialize the Gemini LLM through LangChain
        try:
            self.llm = ChatGoogleGenerativeAI(model=self.gemini_llm_model, temperature=0.3)
            # You can adjust temperature and other parameters as needed.
            # temperature=0 makes the model more deterministic, higher values make it more creative.
        except Exception as e:
            print(f"Error initializing Gemini LLM: {e}")
            print("Ensure your GOOGLE_API_KEY is set correctly and you have internet access.")
            return

        # --- Tool Definitions ---
        # Your custom tools need to be wrapped in the LangChain Tool class.
        # The 'name' should be a string the LLM can use to call the tool.
        # The 'description' is crucial; it's taken from the function's docstring if not provided explicitly.
        # Ensure your functions in sdl_apis.py have clear and informative docstrings.

        # Example of how to get docstrings (if needed, but Tool class does this automatically)
        # desc_mobiflow_all = get_ue_mobiflow_data_all.__doc__
        # desc_mobiflow_desc = get_ue_mobiflow_description.__doc__
        # desc_sdl_event_data = fetch_sdl_event_data_osc.__doc__
        # desc_event_desc = get_event_description.__doc__

        try:
            # List of tools the agent can use
            self.tools = [
                get_ue_mobiflow_data_all_tool,
                get_ue_mobiflow_data_by_index_tool,
                get_ue_mobiflow_description_tool,
                fetch_sdl_event_data_all_tool,
                fetch_sdl_event_data_by_ue_id_tool,
                fetch_sdl_event_data_by_cell_id_tool,
                get_event_description_tool,
                fetch_service_status_tool,
                build_xapp_tool,
                deploy_xapp_tool,
                unDeploy_xapp_tool,
                get_all_mitre_fight_techniques,
                get_mitre_fight_technique_by_id
            ]
        except AttributeError as e:
            print(f"Error creating Tools: {e}. This often means a function is missing a docstring or is not correctly imported.")
            print("Ensure all functions from sdl_apis.py (get_ue_mobiflow_data_all, get_ue_mobiflow_description, fetch_sdl_event_data_osc, get_event_description) are defined, imported, and have docstrings.")
            return
        except Exception as e:
            print(f"An unexpected error occurred while defining tools: {e}")
            return

        # --- Agent Creation ---
        # LangChain provides helper functions to create agents.
        # For ReAct, we can use `create_react_agent`.
        # It requires an LLM, the tools, and a prompt.

        # --- Agent Prompt Creation ---
        # We will create a custom prompt template that includes the task background and instructions.
        # This prompt structure is crucial for the ReAct agent.
        # It needs placeholders for `tools`, `tool_names`, `input`, and `agent_scratchpad`.

        # --- Task Background and Instructions ---
        # Define the background and instructions for the agent
        self.TASK_BACKGROUND = """
        You are a helpful assistant specialized in 5G security, who will help the network operator respond to questions that may involve general questions in operations, and security-related questions such as to classify, explain, and propose countermeasures for the identified anomalies, issues, and threats in the network. These security events are generated by two xApps in the system, a rule-based intrusion detection system MobieXpert for attack detection as well as a deep-learning xApp MobiWatch (trained on normal data) for anomaly detection. You are provided with a few tools to interact with the 5G network to retrieve network data and detected events in the network. The network data is constructed as a special data format called MobiFlow, which describes the User Equipment's (UE) protocol activity with the base stations.
        """


        self.CUSTOM_REACT_PROMPT_TEMPLATE = f"""
        {self.TASK_BACKGROUND}

        You have access to the following tools:
        {{tools}}

        Use the following format for your reasoning process:

        Question: the input question you must answer
        Thought: you should always think about what to do to answer the question based on the instructions.
        Action: the action to take, should be one of [{{tool_names}}]
        Action Input: the input to the action, If the tool's description does not state it require argument, simply invoke the tool without argument. Otherwise, provide the appropriate input.
        Observation: the result of the action

        ... (this Thought/Action/Action Input/Observation can repeat N times)

        Thought: I now have enough information to answer the user's question.
        Final Answer: the final answer to the original input question.

        Previous conversation history:
        {{chat_history}}

        Begin!

        Question: {{input}}
        Thought:{{agent_scratchpad}}
        """

        try:
            # The PromptTemplate needs to know about 'chat_history' as an input variable
            self.prompt = PromptTemplate(
                input_variables=["chat_history", "input", "agent_scratchpad", "tools", "tool_names"],
                template=self.CUSTOM_REACT_PROMPT_TEMPLATE
            )
        except Exception as e:
            print(f"Error creating custom prompt template: {e}")
            return

        # --- Memory Initialization ---
        # k is the number of past interactions to remember
        # memory_key is the variable name in the prompt that will contain the chat history
        # return_messages=True ensures the history is formatted as a list of messages, suitable for chat models
        memory_key = "chat_history"
        self.memory = ConversationBufferWindowMemory(
            memory_key=memory_key,
            k=5, # Remember the last 5 interactions
            return_messages=True
        )


        # Create the ReAct agent
        # The agent itself is the logic that decides what to do.
        try:
            self.agent = create_react_agent(self.llm, self.tools, self.prompt)
        except Exception as e:
            print(f"Error creating ReAct agent: {e}")
            return

        # --- Agent Executor ---
        # The AgentExecutor is what runs the agent, calls tools, and passes results back to the agent
        # until the agent decides it's finished.
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            memory=self.memory, # Pass the memory object
            verbose=True,  # Set to True to see the agent's thought process
            handle_parsing_errors=True, # Handles cases where the LLM output is not perfectly formatted
            max_iterations=10 # Prevent infinite loops
        )

        self.init_completed = True
    
    def init_successful(self) -> bool:
        return self.init_completed

    def inference(self, user_query: str) -> dict:
        try:
            # The 'input' key in the dictionary corresponds to the {input} placeholder in the prompt.
            # The 'agent_scratchpad' is handled internally by the AgentExecutor.
            # For chat-based prompts, the input might be structured differently,
            # e.g., {"input": user_query, "chat_history": []}
            # The specific input keys depend on the prompt template used.
            # The `hwchase17/react-chat` prompt expects "input".
            return self.agent_executor.invoke({"input": user_query})
        except Exception as e:
            return {"output": f"Error during agent execution for query '{user_query}': {e}"}
            # This can happen due to LLM errors, tool errors, or parsing errors
            # if handle_parsing_errors doesn't catch everything.

# --- Running the Agent ---
if __name__ == "__main__":

    queries = [
        # "How many UEs are currently connected to cell ID 12345678?"

        # "Explain the anomaly events detected on UE ID 38940, analyze the UE traffic data and provide a more in-depth analysis beyond the provided descriptions in the event data, but keep the response as concise as possible and up to the point."

        # "Explain the Blind DoS attack detected and propose mitigation of this attack"

        # "What is the status of the E2 manager?"

        # '''
        # You are a cybersecurity expert focused on 5G network security. 
        # Analyze the Blind DoS detected as an attack event in the network.
        # Provide the following information. 
        # Keep the response as concise as possible and up to the point. Produce the output in well-formatted plain-text.
        # 1. An in-depth explanation of the threat or anomaly beyond the description, by analyzing the associated MobiFlow data.
        # 2. Recommended effective countermeasures to address this problem.
        # '''

        # '''
        # You are a cybersecurity expert focused on 5G network security. 
        # Analyze the MobiWath generated events detected on UE ID 38940 in the network.
        # Provide the following information. 
        # Keep the response as concise as possible and up to the point. Produce the output in well-formatted plain-text.
        # 1. An in-depth explanation of the threat or anomaly beyond the description, combine the analysis using the event data and associated MobiFlow data if necessary.
        # 2. Recommended effective countermeasures to address this problem.
        # '''

        '''
        Provide an in-depth analysis on the events detected on UE 38940, including:
        1. An explanation of the threat or anomaly beyond the given description, combine the analysis using the event data and associated MobiFlow data of the UE.
        2. Based on the analysis report, try to classify the identified threats using the MiTRE fight techniques. For the output, please provide the MiTRE Fight technique ID (such as "FGT1588") that you believe the threat or anomaly belongs to.
        3. If you have classified the threat or anomaly into a specific MiTRE Fight technique, report the corresponding mitigations in that MiTRE Fight technique.
        '''
    ]

    for user_query in queries:
        print(f"\n\nExecuting query: \"{user_query}\"")
        print("================================================")
        security_agent = MobiLLMAgent()
        if security_agent.init_successful() is True:
            response = security_agent.inference(user_query)
            print("------------------------------------------------")
            print(f"Final Answer from Agent: {response['output']}")
            print("================================================")
        print("\n")

