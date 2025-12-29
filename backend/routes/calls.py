import os
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

load_dotenv()

calls_bp = Blueprint('calls', __name__, url_prefix='/api/calls')

# Load VAPI credentials from environment variables
VAPI_API_URL = "https://api.vapi.ai/call/phone"
VAPI_AUTH_TOKEN = os.environ.get("VAPI_AUTH_TOKEN")
VAPI_PHONE_NUMBER_ID = os.environ.get("VAPI_PHONE_NUMBER_ID")
VAPI_ASSISTANT_ID = os.environ.get("VAPI_ASSISTANT_ID")

@calls_bp.route('/make-call', methods=['POST'])
def make_call():
    try:
        data = request.json
        mobile_number = data.get('mobile')
        items = data.get('items', [])  # Expecting a list of items

        if not mobile_number:
            return jsonify({"error": "Mobile number is required"}), 400

        # Construct the prompt context based on the items list
        items_details = []
        for item in items:
            name = item.get('item', 'Unknown Item')
            quantity = item.get('quantity', 'Unknown Quantity')
            vendor_price = item.get('pricing')
            my_budget = item.get('budget')

            detail_str = f"- Item: {name}, Quantity: {quantity}"
            
            if vendor_price is not None:
                detail_str += f", Vendor Price: {vendor_price}"
            else:
                detail_str += ", Vendor Price: Not provided (Ask for it)"
            
            if my_budget is not None:
                detail_str += f", My Budget: {my_budget}"
            
            items_details.append(detail_str)

        items_text = "\n".join(items_details)
        
        system_prompt = (
            "[Identity]\n"
            "You are Riya, an excellent pricing negotiator representing the government or LSTK side. Your role is to interact with vendors to secure the best possible prices on goods and services.\n\n"
            "[Style]\n"
            "Adopt a strategic, confident, and persuasive tone. Communicate clearly and assertively, ensuring that your negotiation style is effective yet respectful.\n\n"
            "[Response Guidelines]\n"
            "- Deliver responses that are concise and focused.\n"
            "- When discussing prices, use clear numerical values without unnecessary qualifiers.\n"
            "- Verify any figures or terms provided by the user before proceeding with negotiations.\n\n"
            "[Task & Goals]\n"
            "1. You are calling a vendor regarding the following requirements:\n"
            f"{items_text}\n"
            "2. Assess any gaps in provided data. If the vendor price is missing, ask for their quote first. If the budget is provided, try to bring the vendor as close to the budget as possible.\n"
            "3. Initiate negotiation by conveying the importance of securing the best possible price, emphasizing cost-effectiveness for both parties.\n"
            "4. Persuade vendors by highlighting mutual benefits or market justifications, aiming for reduced pricing.\n"
            "5. Employ strategic negotiation tactics to appeal to the vendor's interests, such as volume discounts or long-term contracting.\n"
            "6. Finalize the discussion by confirming any agreed-upon prices or terms for the user’s review.\n\n"
            "[Error Handling / Fallback]\n"
            "- If any price or detail provided by the vendor is unclear, ask targeted clarifying questions.\n"
            "- If negotiation attempts are repeatedly unsuccessful, diplomatically suggest revisiting the discussion or escalating to a human negotiator if necessary."
        )

        # Updated payload structure based on Vapi documentation
        payload = {
            "phoneNumberId": VAPI_PHONE_NUMBER_ID,
            "assistantId": VAPI_ASSISTANT_ID,
            "customer": {
                "number": mobile_number
            },
            # Using metadata to pass the dynamic system prompt and other details
            "metadata": {
                "prompt": system_prompt,
                "items_details": items_text,
                # You can add other custom fields here if your assistant logic uses them
            }
        }

        headers = {
            "Authorization": f"Bearer {VAPI_AUTH_TOKEN}",
            "Content-Type": "application/json"
        }

        response = requests.post(VAPI_API_URL, json=payload, headers=headers)
        
        if response.status_code == 201 or response.status_code == 200:
            return jsonify({
                "message": "Call initiated successfully",
                "vapi_response": response.json()
            }), 200
        else:
            return jsonify({
                "error": "Failed to initiate call",
                "details": response.text
            }), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500 


if __name__ == '__main__':
    # Mocking the request context to test the function directly
    from flask import Flask
    app = Flask(__name__)
    
    # Sample payload dictionary
    test_payload = {
        "mobile": "+918879109025",  # Replace with a real number for testing
        "items": [
            {
                "item": "Laptops",
                "quantity": 10,
                "pricing": 1200,
                "budget": 1000
            }
        ]
    }

    with app.test_request_context(json=test_payload):
        print(make_call())
