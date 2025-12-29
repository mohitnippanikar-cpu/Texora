# To run this code you need to install the following dependencies:
# pip install google-genai

import base64
import os
from google import genai
from google.genai import types

from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
)

def ai_chat(system_prompt, user_prompt, file_attachments=None, temp=0):
    """
    Interact with the Gemini AI chat model, optionally including file attachments.

    Args:
        system_prompt (str): The system-level instructions for the AI.
        user_prompt (str): The user's message or query.
        file_attachments (list of str): List of file paths to attach.
        temp (float): Temperature setting for response variability.

    Returns:
        str: The AI-generated response text.
    """

    model = "gemini-2.0-flash" 

    parts = []
    
    # Handle file attachments
    if file_attachments:
        for attachment in file_attachments:
            if isinstance(attachment, str):
                # It's a file path
                file_path = attachment
                # Simple mime-type detection based on extension
                mime_type = "application/octet-stream"
                if file_path.lower().endswith(".pdf"):
                    mime_type = "application/pdf"
                elif file_path.lower().endswith((".jpg", ".jpeg")):
                    mime_type = "image/jpeg"
                elif file_path.lower().endswith(".png"):
                    mime_type = "image/png"
                
                with open(file_path, "rb") as f:
                    file_bytes = f.read()
            elif isinstance(attachment, dict):
                # It's a dict with data and mime_type
                file_bytes = attachment.get('data')
                mime_type = attachment.get('mime_type', 'application/octet-stream')
            else:
                continue

            parts.append(types.Part.from_bytes(
                data=file_bytes,
                mime_type=mime_type
            ))

    # Add the text prompt
    parts.append(types.Part.from_text(text=user_prompt))

    contents = [
        types.Content(
            role="user",
            parts=parts,
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        temperature=temp,
        response_mime_type="application/json",
        system_instruction=[
            types.Part.from_text(text=system_prompt),
        ],
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )

    return response.text

