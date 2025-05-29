import logging
import os
from dotenv import load_dotenv
import openai
import json
import requests

logger = logging.getLogger(__name__)

load_dotenv()

def get_chatbot_response(prompt):
    WRAPPER_API_URL = "https://openai-api-wrapper-urtjok3rza-wl.a.run.app/api/chat/completions/"
    payload = json.dumps({
        "messages": [
            {"role": "system", "content": "Your are helpful assistent"},
            {"role": "user", "content": prompt}
        ],
        "model": "gpt-4",
        "stop": "string",
        "temperature": 1,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "max_tokens": 4096
    })

    headers = {
        'x-api-token': os.getenv("OPENAI_API_KEY"),
        'Content-Type': 'application/json',
    }
    try: 
        response = requests.post(WRAPPER_API_URL, data=payload, headers=headers)
        logger.info(f"Response status code: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"Error from API: {response.text}")
            return "An error occurred while processing your request."
        return response.json().get('choices', [{}])[0].get('message', {}).get('content', '').strip()
    except Exception as e:
        print(f"Error in get_chatbot_response: {e}")
        return "An error occurred while processing your request."
