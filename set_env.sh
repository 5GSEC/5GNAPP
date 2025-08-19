#!/bin/bash
# Simple setup script for 5GNAPP and MobiLLM environment

echo "Setting up 5GNAPP and MobiLLM xApp environment..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the xApp root path
export XAPP_ROOT_PATH=<PATH_TO_XAPP>
export GOOGLE_API_KEY=<GOOGLE_API_KEY>
export OAI_RAN_CU_CONFIG_PATH=<PATH_TO_OAI_RAN_CU_CONFIG>
# export LANGCHAIN_PROJECT=<LANGCHAIN_PROJECT>
# export LANGSMITH_TRACING=true
# export LANGSMITH_API_KEY=<LANGSMITH_API_KEY>


echo "Done"