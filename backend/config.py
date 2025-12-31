"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of OpenRouter model identifiers
# Using latest models for Step 3 council deliberation
COUNCIL_MODELS = [
    "openai/gpt-5.2",  # GPT-5.2 - OpenAI's latest model
    "google/gemini-3-flash-preview",  # Gemini 3 Flash Preview - Google's latest
    "deepseek/deepseek-v3.2",  # DeepSeek V3.2 - Advanced reasoning
    "anthropic/claude-haiku-4.5",  # Claude Haiku 4.5 - Anthropic's latest
]

# Chairman model - synthesizes final response
# Using Gemini 3 Flash Preview for advanced reasoning and synthesis
CHAIRMAN_MODEL = "google/gemini-3-flash-preview"

# Prompt Engineering model (cheap and fast)
PROMPT_ENGINEERING_MODEL = "google/gemini-2.5-flash"

# Context Engineering model (cheap and fast)
CONTEXT_ENGINEERING_MODEL = "google/gemini-2.5-flash"

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
