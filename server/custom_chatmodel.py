from typing import Any, Callable, Literal, Optional, Union, List, Dict, cast

from langchain_core.callbacks import (
    CallbackManagerForLLMRun,
)
from langchain_core.language_models import BaseChatModel
from langchain_core.runnables import Runnable
from langchain_core.tools import BaseTool

from langchain_core.messages import (
    AIMessage,
    AIMessageChunk,
    BaseMessage,
)

from langchain_core.utils.function_calling import (
    convert_to_json_schema,
    convert_to_openai_tool,
)

from collections.abc import AsyncIterator, Iterator, Mapping, Sequence
from langchain_core.messages.ai import UsageMetadata
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from pydantic import Field, PrivateAttr
from load_hf_model import ModelLoader
from langchain_core.language_models import LanguageModelInput

class ChatAgenticxLAM(BaseChatModel):
    model_name: str = Field(alias="model")
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    timeout: Optional[int] = None
    stop: Optional[List[str]] = None
    max_retries: int = 2

    _model: ModelLoader = PrivateAttr() # to bypass pydantic BaseModel attribute assignment

    def __init__(self, base_model="Salesforce/xLAM-8x7b-r", **data):
        super().__init__(**data)
        self._model = ModelLoader(base_model_id=base_model, fourbit=False, atebit=True)

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:

        prompt = messages[-1].content

        response = self._model.invoke(prompt)

        return ChatResult(
            generations=[ ChatGeneration( message=AIMessage( content=response ) ) ]
        )

    def bind_tools(
        self,
        tools: Sequence[Union[dict[str, Any], type, Callable, BaseTool]],
        *,
        tool_choice: Optional[
            Union[dict, str, Literal["auto", "none", "required"], bool]  # noqa: PYI051
        ] = None,
        **kwargs: Any,
    ) -> Runnable[LanguageModelInput, BaseMessage]:

        formatted_tools = [convert_to_openai_tool(tool) for tool in tools]
        if tool_choice is not None and tool_choice:
            if len(formatted_tools) != 1:
                msg = (
                    "When specifying `tool_choice`, you must provide exactly one "
                    f"tool. Received {len(formatted_tools)} tools."
                )
                raise ValueError(msg)
            if isinstance(tool_choice, str):
                if tool_choice not in ("auto", "none", "required"):
                    tool_choice = {
                        "type": "function",
                        "function": {"name": tool_choice},
                    }
            elif isinstance(tool_choice, bool):
                tool_choice = formatted_tools[0]
            elif isinstance(tool_choice, dict):
                if (
                    formatted_tools[0]["function"]["name"]
                    != tool_choice["function"]["name"]
                ):
                    msg = (
                        f"Tool choice {tool_choice} was specified, but the only "
                        f"provided tool was {formatted_tools[0]['function']['name']}."
                    )
                    raise ValueError(msg)
            else:
                msg = (
                    f"Unrecognized tool_choice type. Expected str, bool or dict. "
                    f"Received: {tool_choice}"
                )
                raise ValueError(msg)
            kwargs["tool_choice"] = tool_choice
        return super().bind(tools=formatted_tools, **kwargs)

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model."""
        return "agentic model using mixtral 8x7B as base"

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters.

        This information is used by the LangChain callback system, which
        is used for tracing purposes make it possible to monitor LLMs.
        """
        return {
            "model_name": self.model_name,
        }