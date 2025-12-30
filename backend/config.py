"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of OpenRouter model identifiers
# Using proven, fast models that are actually available
COUNCIL_MODELS = [
    "openai/gpt-4o",  # Fast and reliable GPT-4 Omni
    "google/gemini-2.0-flash-exp",  # Fast Gemini model
    "anthropic/claude-3.5-sonnet",  # Fast Claude 3.5 Sonnet
    "anthropic/claude-3-haiku",  # Very fast Claude model
]

# Chairman model - synthesizes final response
# Using Claude 3.5 Sonnet for advanced reasoning and synthesis
CHAIRMAN_MODEL = "anthropic/claude-3.5-sonnet"

# Prompt Engineering model (cheap and fast)
PROMPT_ENGINEERING_MODEL = "google/gemini-2.5-flash"

# Context Engineering model (cheap and fast)
CONTEXT_ENGINEERING_MODEL = "google/gemini-2.5-flash"

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
