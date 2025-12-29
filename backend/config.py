"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of OpenRouter model identifiers
# Updated to latest stable versions as of 2024/2025
COUNCIL_MODELS = [
    "openai/gpt-5.1",  # Latest GPT-5.1 model (if available, otherwise falls back to gpt-4o)
    "google/gemini-3-pro",  # Latest Gemini 3 Pro model
    "anthropic/claude-3.5-sonnet",  # Latest Claude 3.5 Sonnet
    "x-ai/grok-4",  # Latest Grok model
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
