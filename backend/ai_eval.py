# To run this code you need to install the following dependencies:
# pip install google-genai requests

import requests
from google import genai
from google.genai import types
from pymongo import MongoClient
import json
import time
import os

from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
)
mongo_client = MongoClient(os.environ.get("MONGODB_URI"))
db = mongo_client['db']

def ai_chat(system_prompt, user_prompt:str='', file_attachments=None, temp=0):
    """
    Interact with the Gemini AI chat model, optionally including file attachments.

    Args:
        system_prompt (str): The system-level instructions for the AI.
        user_prompt (str): The user's message or query.
        file_attachments (list of str): List of file paths or URLs to attach.
        temp (float): Temperature setting for response variability.

    Returns:
        str: The AI-generated response text.
    """

    model = "gemini-2.0-flash" 

    parts = []

    if type(user_prompt) != str:
        print("User prompt is not string:", user_prompt)
    
    # Handle file attachments
    if file_attachments:
        for attachment in file_attachments:
            file_bytes = None
            mime_type = "application/octet-stream"

            if isinstance(attachment, str):
                if attachment.startswith(('http://', 'https://')):
                    # It's a URL
                    try:
                        response = requests.get(attachment)
                        response.raise_for_status()
                        file_bytes = response.content
                        
                        # Attempt to get mime type from headers, fallback to extension logic later if needed
                        content_type = response.headers.get('Content-Type')
                        if content_type:
                            mime_type = content_type.split(';')[0].strip()
                        
                        # If generic or missing, try to guess from URL path
                        if mime_type == "application/octet-stream" or not mime_type:
                            if attachment.lower().endswith(".pdf"):
                                mime_type = "application/pdf"
                            elif attachment.lower().endswith((".jpg", ".jpeg")):
                                mime_type = "image/jpeg"
                            elif attachment.lower().endswith(".png"):
                                mime_type = "image/png"

                    except requests.RequestException as e:
                        print(f"Error downloading URL {attachment}: {e}")
                        continue

                else:
                    # It's a local file path
                    file_path = attachment
                    if file_path.lower().endswith(".pdf"):
                        mime_type = "application/pdf"
                    elif file_path.lower().endswith((".jpg", ".jpeg")):
                        mime_type = "image/jpeg"
                    elif file_path.lower().endswith(".png"):
                        mime_type = "image/png"
                    
                    try:
                        with open(file_path, "rb") as f:
                            file_bytes = f.read()
                    except FileNotFoundError:
                        print(f"File not found: {file_path}")
                        continue

            elif isinstance(attachment, dict):
                # It's a dict with data and mime_type
                file_bytes = attachment.get('data')
                mime_type = attachment.get('mime_type', 'application/octet-stream')
            else:
                continue

            if file_bytes:
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



def evaluate_submission_async(bid_id):
    """Placeholder function for AI evaluation logic"""
    # Direct connection to DB for async thread

    time.sleep(2)  # Ensure DB write has likely completed
    
    submission = db.submissions.find_one({'bid_id': bid_id})
    if not submission:
        client.close()
        return
    
    tender = db.tenders.find_one({'tender_id': submission['tender_id']})
    
    if not tender:
        print(f"AI EVAL : Tender {submission['tender_id']} not found for bid {bid_id}")
        client.close()
        return


    # Simulate evaluation process
    time.sleep(5)  # Simulate time-consuming evaluation

    server_url = os.getenv("SERVER_URL", "")
    
    
    # elegibility agent
    if not 'elegibility_reasoning' in submission.get('evaluation', {}):
        resp = ai_chat(
            """You will be provided with:
1. A complete bid document.
2. A requirement schema defining evaluation criteria and structure.

Your task:
* Read and interpret the bid document thoroughly and precisely.
* For each eligibility requirement, determine if it is met (true) or not met (false).
* Calculate an Elegibility Score (0–100) based on compliance with eligibility requirements.
* Provide concise Elegibility Reasoning (2–3 lines) explaining the score.

Output constraints:
* Generate output only in the exact JSON format provided.
* Do not alter structure.
* Output must be valid provided JSON only.

The bid document and requirements will be provided in the next message.

json output format (strictly follow this) -
{
"elegibility": [true, false, true],
    "elegibility_score": 85,
    "elegibility_reasoning": "The bidder has over 5 years of experience and holds ISO 9001 certification but has only supplied to 2 large corporations in the last 2 years, which does not meet the requirement of at least 3.",
}
""",
            file_attachments=[f"{server_url}{att['url']}" for att in submission.get('attachments', [])],
            user_prompt=
                f"elegibility_requirements : {tender['requirements'].get('eligibility', [])}",
            temp=0)
        resp = resp.replace('```json', '').replace('```', '')

        # save evaluation back to submission
        try:
            eval_json = json.loads(resp)
            # Use dot notation to avoid overwriting other evaluation fields
            update_fields = {f'evaluation.{k}': v for k, v in eval_json.items()}
            db.submissions.update_one(
                {'bid_id': bid_id},
                {'$set': update_fields}
            )
        except Exception as e:
            print(f"Error parsing elegibility JSON for bid {bid_id}: {e}")
        print(f"AI EVAL : Completed elegibility evaluation for bid {bid_id}")

    time.sleep(10)
    # technical agent
    if not 'technical_reasoning' in submission.get('evaluation', {}):
        resp = ai_chat(
            """You will be provided with:

    1. A complete bid document.
    2. A requirement schema defining evaluation criteria and structure.

    Your task:

    **Revised and Final Instruction (Incorporating SKU & Checklist Matching)**

    You will be provided with:

    1. A complete bid document.
    2. A requirement schema defining structure, evaluation rules, SKUs, and checklist items.
    3. A query containing all constraints and scoring logic.

    Your responsibilities:

    * Read and interpret the bid document **thoroughly and precisely**.
    * Perform **two independent matches**:

    1. **SKU Matching** – Match bidder-provided SKUs against required SKUs.
    2. **Checklist Matching** – Verify each checklist point against explicit statements in the bid.

    Matching rules:

    * For **each checklist item**:

    * If the requirement is **explicitly fulfilled or agreed** in the bid → mark `true`
    * If **missing, unclear, conditional, or not stated** → mark `false` (default)
    * No assumptions, inference, or benefit of doubt.

    Scoring:

    * Generate a **Technical Score (0–100)** based on:

    * Degree of SKU compliance
    * Degree of checklist compliance
    * Partial matches must reduce the score proportionally
    * Full compliance across SKUs and checklist = 100
    * Any deviation, ambiguity, or omission must reduce the score

    Reasoning:

    * Provide **Technical Reasoning** explaining:

    * Why the score was assigned
    * Why the ranking (if applicable) was given
    * Length: **2–3 lines maximum**
    * Reasoning must be strictly requirement-driven and evidence-based

    Output constraints:

    * Generate output **only in the exact JSON format provided**
    * Do **not** alter structure, keys, order, or nesting
    * Modify **values only**
    * No markdown
    * No explanations outside JSON
    * Output must be **valid JSON only**

    The bid document, schema, checklist, and evaluation rules will be provided in the next message.



    json output format (strictly follow this) - 

    {
    \"technical_sku\": {
            \"Intel Core processors\": [true, false],
            \"SSD Storage\": [true, true],
            \"RAM\": [true, false, true],
            \"Printer Technology\": [false, true]
            },
            \"technical_checklist\": [true, true, false],
            \"technical_score\": 80,
            \"technical_reasoning\": \"Meets most technical specifications but falls short on the processor generation and printer type requirements. Delivery time and installation requirements are met, but the maintenance period is only 1 year instead of the required 2 years.\"
    },
    \"technical_checklist\": [
        true, false, true, true
        ],
    }""",
        file_attachments=[f"{server_url}{att['url']}" for att in submission.get('attachments', [])],
        user_prompt=f"technical_checklist:{tender['requirements']['technical_checklist']}, technical_sku:{tender['requirements']['technical_sku']}",
        temp=0)
        resp = resp.replace('```json', '').replace('```', '')

        # save evaluation back to submission
        try:
            eval_json = json.loads(resp)
            # Use dot notation to avoid overwriting other evaluation fields
            update_fields = {f'evaluation.{k}': v for k, v in eval_json.items()}
            db.submissions.update_one(
                {'bid_id': bid_id},
                {'$set': update_fields}
            )
        except Exception as e:
            print(f"Error parsing evaluation JSON for bid {bid_id}: {e}")

        print(f"AI EVAL : Completed technical evaluation for bid {bid_id}")

    time.sleep(10)
    # financial agent
    if not 'financial_reasoning' in submission.get('evaluation', {}):
        resp = ai_chat(
            """You will be provided with:

    1. A complete bid document.
    2. A requirement schema defining evaluation criteria and structure.

    Your task:
    * Read and interpret the bid document thoroughly and precisely.
    * Extract financial details as per the requirement schema.
    * Calculate a Financial Score (0–100) based on compliance with financial requirements.
    * Provide concise Financial Reasoning (2–3 lines) explaining the score.
    
    Output constraints:
    * Generate output only in the exact JSON format provided.
    * Do not alter structure.(but can change items - keys)
    * Output must be valid provided JSON only.
    The bid document and requirements will be provided in the next message.

    json output format (strictly follow this) -
    {
        "financial": {
        "Intel Core processors": {
            "rate_per_unit": 30000,
            "quantity": 50,
            "total_cost": 1500000
        },
        "SSD Storage": {
            "rate_per_unit": 10000,
            "quantity": 50,
            "total_cost": 500000
        },
        "RAM": {
            "rate_per_unit": 16000,
            "quantity": 100,
            "total_cost": 1600000
        },
        "Printer Technology": {
            "rate_per_unit": 50000,
            "quantity": 20,
            "total_cost": 1000000
        },
        "others": {
            "transportation": 50000,
            "installation": 50000,
            "warranty": 100000
        },
        "total_budget": 4800000
        },

        "financial_checklist": [true, true, true],

        "financial_score": 95,
        "financial_reasoning": "The bid amount is within the acceptable range."
    }""",
        file_attachments=[f"{server_url}{att['url']}" for att in submission.get('attachments', [])],
        user_prompt=f"financial_checklist:{tender['requirements'].get('financial_checklist', [])}    you must extract+calculate Financial pricing and cost based on the given bid submission PDF for the following items - {list(tender['requirements'].get('technical_sku', {}).keys())}",
        temp=0)
        
        resp = resp.replace('```json', '').replace('```', '')

        # save evaluation back to submission
        try:
            eval_json = json.loads(resp)
            # Use dot notation to avoid overwriting other evaluation fields (like technical)
            update_fields = {f'evaluation.{k}': v for k, v in eval_json.items()}
            db.submissions.update_one(
                {'bid_id': bid_id},
                {'$set': update_fields}
            )
        except Exception as e:
            print(f"Error parsing financial evaluation JSON for bid {bid_id}: {e}")

        print(f"AI EVAL : Completed evaluation for bid {bid_id}")

    time.sleep(10)
    # legal agent
    if not 'legal_reasoning' in submission.get('evaluation', {}):
        resp = ai_chat(
            """You will be provided with:
1. A complete bid document.
2. A requirement schema defining evaluation criteria and structure.

Your task:
The bid document and requirements will be provided in the next message.


json output format (strictly follow this) -
{
"legal": [true, true],
"legal_score": 100,
"legal_reasoning": "The bidder complies with all local and national regulations and the products are 85% made in India."
}""",
        file_attachments=[f"{server_url}{att['url']}" for att in submission.get('attachments', [])],
        user_prompt=f"legal_requirements:{tender['requirements'].get('legal', [])}",
        temp=0)
        
        resp = resp.replace('```json', '').replace('```', '')

        # save evaluation back to submission
        try:
            eval_json = json.loads(resp)
            # Use dot notation to avoid overwriting other evaluation fields
            update_fields = {f'evaluation.{k}': v for k, v in eval_json.items()}
            db.submissions.update_one(
                {'bid_id': bid_id},
                {'$set': update_fields}
            )
        except Exception as e:
            print(f"Error parsing legal evaluation JSON for bid {bid_id}: {e}")

        print(f"AI EVAL : Completed legal evaluation for bid {bid_id}")
    
    # add verification in evaluation
    if 'verification' not in submission.get('evaluation', {}):
        ver = {"verification": {
        "Company Registration": True,
        "Tax Compliance": True,
        "Previous Work References": True,
        "ISO Certification": False,
        "GST Registration": True
        },
        "verification_score": 90,
        "verification_reasoning": "The bidder has valid company registration, tax compliance, and previous work references but lacks ISO certification."}

        db.submissions.update_one(
            {'bid_id': bid_id},
            {'$set': {'evaluation.verification': ver['verification'],
                    'evaluation.verification_score': ver['verification_score'],
                    'evaluation.verification_reasoning': ver['verification_reasoning']}}
        )

        print(f"AI EVAL : Completed verification for bid {bid_id}")
    
    #calc total score
    evaluation = db.submissions.find_one({'bid_id': bid_id}).get('evaluation', {})
    total_score = 0
    score_fields = ['elegibility_score', 'technical_score', 'financial_score', 'legal_score', 'verification_score']
    for field in score_fields:
        total_score += evaluation.get(field, 0)
    total_score = total_score / len(score_fields)
    db.submissions.update_one(
        {'bid_id': bid_id},
        {'$set': {'evaluation_score': total_score}}
    )

if __name__ == "__main__":
    system_prompt = "You are an AI assistant that processes file attachments and answers questions based on their content."
    user_prompt = " What is this paper related to? What is the title of it? You answer in few words as minimal as possible"
    file_attachments = [
        "https://arxiv.org/pdf/1706.03762",
    ]
    response = ai_chat(system_prompt, user_prompt, file_attachments, temp=0)
    print("AI Response:", response)