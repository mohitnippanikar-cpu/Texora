import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from database import get_db
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime
import threading
from ai_eval import evaluate_submission_async

submissions_bp = Blueprint('submissions', __name__)

@submissions_bp.route('/tenders/<tender_id>/submit', methods=['POST'])
def create_submission(tender_id):
    """Create a new submission for a tender"""
    db = get_db()
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['bidder_name', 'bidder_contact', 'bidder_phone', 'bidder_email', 'bid_amount']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Create vendor if company_name is provided
    if 'company_name' in data:
        vendor_id = f"vendor-{uuid.uuid4().hex}"
        db.vendors.insert_one({
            'vendor_id': vendor_id,
            'company_name': data['company_name'],
            'created_at': datetime.utcnow()
        })
        data['vendor_id'] = vendor_id
    
    # make new bid_id like - "bid-<uuid4().hex>"
    if 'bid_id' not in data:
        data['bid_id'] = f"bid-{uuid.uuid4().hex}"
    
    data['tender_id'] = tender_id
    data['submitted_at'] = datetime.utcnow()
    
    # Default stage 0: on upload
    if 'current_stage' not in data:
        data['current_stage'] = 0
    
    # Initialize attachments list if not present
    if 'attachments' not in data:
        data['attachments'] = []
        
    db.submissions.insert_one(data)

    # Trigger AI evaluation asynchronously using a Timer to ensure DB write completes first
    threading.Thread(target=evaluate_submission_async, args=(data['bid_id'],)).start()

    
    return jsonify({"message": "Submission created successfully", "bid_id": data['bid_id']}), 201

@submissions_bp.route('/tenders/<tender_id>/submissions', methods=['GET'])
def get_submissions(tender_id):
    """Get all submissions for a tender with specific fields"""
    db = get_db()
    submissions = list(db.submissions.find({'tender_id': tender_id}))
    
    result = []
    for sub in submissions:
        # vendor name
        vendor_name = sub.get('bidder_name')
        if not vendor_name and 'vendor_id' in sub:
            vendor = db.vendors.find_one({'vendor_id': sub['vendor_id']})
            if vendor:
                vendor_name = vendor.get('company_name')
        
        # individual scores
        individual_scores = {}
        if 'evaluation' in sub:
            eval_data = sub['evaluation']
            individual_scores = {
                'verification_score': eval_data.get('verification_score'),
                'elegibility_score': eval_data.get('elegibility_score'),
                'technical_score': eval_data.get('technical_score'),
                'financial_score': eval_data.get('financial_score'),
                'legal_score': eval_data.get('legal_score')
            }

        result.append({
            'vendor_name': vendor_name,
            'submission_id': sub.get('bid_id'),
            'total_score': sub.get('evaluation_score'),
            'individual_scores': individual_scores,
            'current_stage': sub.get('current_stage', 0)
        })
        
    return jsonify(result), 200

@submissions_bp.route('/submissions/<bid_id>', methods=['GET'])
def get_submission(bid_id):
    """Get a specific submission details with combined evaluation logic"""
    db = get_db()
    submission = db.submissions.find_one({'bid_id': bid_id}, {'_id': 0})
    
    if not submission:
        return jsonify({'error': 'Submission not found'}), 404
        
    # Fetch associated tender to get requirements
    tender_id = submission.get('tender_id')
    tender_reqs = {}
    if tender_id:
        tender = db.tenders.find_one({'tender_id': tender_id}, {'_id': 0, 'requirements': 1})
        
        tender_reqs = tender['requirements']

    # Combine Requirements and Evaluation if evaluation exists
    if 'evaluation' in submission:
        eval_data = submission['evaluation']
        
        def merge_criteria(req_list, eval_list):
            merged = []
            if req_list and isinstance(req_list, list):
                for i, req in enumerate(req_list):
                    status = eval_list[i] if eval_list and i < len(eval_list) else None
                    merged.append({"requirement": req, "met": status})
            return merged

        # 1. Eligibility
        eligibility = {
            "score": eval_data.get('elegibility_score'),
            "reasoning": eval_data.get('elegibility_reasoning'),
            "items": merge_criteria(tender_reqs.get('eligibility'), eval_data.get('elegibility'))
        }

        # 2. Legal
        legal = {
            "score": eval_data.get('legal_score'),
            "reasoning": eval_data.get('legal_reasoning'),
            "items": merge_criteria(tender_reqs.get('legal'), eval_data.get('legal'))
        }

        # 3. Financial
        financial = {
            "score": eval_data.get('financial_score'),
            "reasoning": eval_data.get('financial_reasoning'),
            "checklist": merge_criteria(tender_reqs.get('financial_checklist'), eval_data.get('financial_checklist')),
            "breakdown": eval_data.get('financial')
        }

        # 4. Technical
        tech_skus_merged = []
        req_skus = tender_reqs.get('technical_sku', {})
        eval_skus = eval_data.get('technical_sku', {})
        
        if req_skus:
            for component, specs in req_skus.items():
                comp_results = eval_skus.get(component, [])
                spec_list = []
                if isinstance(specs, dict):
                    for idx, (spec_key, spec_val) in enumerate(specs.items()):
                        met = comp_results[idx] if idx < len(comp_results) else None
                        spec_list.append({
                            "spec": spec_key,
                            "required": spec_val,
                            "met": met
                        })
                tech_skus_merged.append({
                    "component": component,
                    "specs": spec_list
                })

        technical = {
            "score": eval_data.get('technical_score'),
            "reasoning": eval_data.get('technical_reasoning'),
            "checklist": merge_criteria(tender_reqs.get('technical_checklist'), eval_data.get('technical_checklist')),
            "skus": tech_skus_merged
        }

        # 5. Verification
        verification = {
            "score": eval_data.get('verification_score'),
            "reasoning": eval_data.get('verification_reasoning'),
            "items": []
        }
        if 'verification' in eval_data:
            for k, v in eval_data['verification'].items():
                verification['items'].append({"check": k, "passed": v})

        # Replace raw evaluation with structured data
        submission['evaluation'] = {
            "eligibility": eligibility,
            "legal": legal,
            "financial": financial,
            "technical": technical,
            "verification": verification
        }

    # Vendor details logic
    current_stage = submission.get('current_stage', 0)
    try:
        stage_val = int(current_stage)
    except (ValueError, TypeError):
        stage_val = 0

    if stage_val > 1 and 'vendor_id' in submission:
        vendor = db.vendors.find_one({'vendor_id': submission['vendor_id']}, {'_id': 0})
        if vendor:
            submission['vendor_details'] = vendor

    return jsonify(submission), 200

@submissions_bp.route('/submissions/<bid_id>/attachments/<filename>', methods=['GET'])
def get_submission_attachment(bid_id, filename):
    """Get bid file attachment by filename"""
    # serve file
    directory = os.path.join(current_app.static_folder, 'submissions', bid_id)
    return send_from_directory(directory, filename)

@submissions_bp.route('/submissions/<bid_id>/attachments', methods=['POST'])
def add_submission_attachment(bid_id):
    """Upload an attachment for a submission"""
    db = get_db()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        filename = secure_filename(file.filename)
        # Save to static/submissions/{bid_id}/
        upload_folder = os.path.join(current_app.static_folder, 'submissions', bid_id)
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # URL for accessing the file
        file_url = f"/submissions/{bid_id}/attachments/{filename}"
        
        attachment_data = {
            "file_name": filename,
            "url": file_url,
            "uploaded_at": datetime.utcnow()
        }
        
        db.submissions.update_one(
            {'bid_id': bid_id},
            {'$push': {'attachments': attachment_data}}
        )
        
        return jsonify(attachment_data), 201

@submissions_bp.route('/submissions/<submission_id>/update_stage', methods=['POST'])
def update_submission_stage(submission_id):
    """Update stage for a submission"""
    db = get_db()
    data = request.json
    
    if not data or 'stage' not in data:
        return jsonify({'error': 'New stage not provided'}), 400
        
    new_stage = data['stage']
    
    submission = db.submissions.find_one({'bid_id': submission_id})
    if not submission:
        return jsonify({'error': 'Submission not found'}), 404
        
    old_stage = submission.get('current_stage', 0)
    
    db.submissions.update_one(
        {'bid_id': submission_id},
        {'$set': {'current_stage': new_stage}}
    )
    
    return jsonify({
        "message": "Stage updated successfully",
        "old_stage": old_stage,
        "new_stage": new_stage
    }), 200


