import os
from flask import Blueprint, request, jsonify, current_app
from database import get_db
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime

tenders_bp = Blueprint('tenders', __name__)

def get_tender_collection():
    return get_db().tenders

@tenders_bp.route('/tenders', methods=['GET'])
def get_tenders():
    """Get all tenders
    """
    db = get_db()
    tenders = list(db.tenders.find({}, {
        '_id': 0,
        'tender_id': 1,
        'title': 1,
        'description': 1,
        'stage': 1,
        'end_date': 1,
        'amount': 1,
        'earnest_money_deposit': 1
    }))
    return jsonify(tenders), 200

@tenders_bp.route('/portal/tenders', methods=['GET'])
def get_tenders2():
    """Get all tenders
    """
    db = get_db()
    tenders = list(db.tenders.find({"stage": "live"}, {
        '_id': 0,
        'tender_id': 1,
        'title': 1,
        'description': 1,
        'stage': 1,
        'end_date': 1,
        'amount': 1,
        "attachments": 1,
        'earnest_money_deposit': 1
    }))
    return jsonify(tenders), 200







@tenders_bp.route('/tenders/<id>', methods=['GET'])
def get_tender(id):
    """Get a tender details by id"""
    db = get_db()
    tender = db.tenders.find_one({'tender_id': id}, {'_id': 0})
    if tender:
        return jsonify(tender), 200
    return jsonify({'error': 'Tender not found'}), 404

@tenders_bp.route('/tenders', methods=['POST'])
def create_tender():
    """Create a new tender"""
    db = get_db()
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # get last tender_id and increment
    last = db.tenders.find_one(sort=[("tender_id", -1)])
    current_year = datetime.now().year
    if last:
        last_id = int(last['tender_id'].split('-')[-1])
        new_id = f"TND-{current_year}-{last_id + 1:03d}"
    else: # First tender
        new_id = f"TND-{current_year}-001"

    data['tender_id'] = new_id
    
    # Basic validation could go here
    
    db.tenders.insert_one(data)
    
    return jsonify({"message": "Tender created successfully", "tender_id": new_id}), 201

@tenders_bp.route('/tenders/<id>', methods=['PUT'])
def update_tender(id):
    """Update a tender details/status by id"""
    db = get_db()
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # if stage is live/awarded, then edit is restricted
    existing_tender = db.tenders.find_one({'tender_id': id})
    if not existing_tender:
        return jsonify({'error': 'Tender not found'}), 404
    if existing_tender['stage'] in ['live', 'awarded']:
        return jsonify({'error': 'Cannot edit tender in live or awarded stage'}), 403
        
    result = db.tenders.update_one(
        {'tender_id': id},
        {'$set': data}
    )
    
    if result.matched_count:
        updated_tender = db.tenders.find_one({'tender_id': id}, {'_id': 0})
        return jsonify(updated_tender), 200
    return jsonify({'error': 'Tender not found'}), 404

@tenders_bp.route('/tenders/<id>', methods=['DELETE'])
def delete_tender(id):
    """Delete a tender by id"""
    db = get_db()
    result = db.tenders.delete_one({'tender_id': id})
    if result.deleted_count:
        return jsonify({'message': 'Tender deleted'}), 200
    return jsonify({'error': 'Tender not found'}), 404

@tenders_bp.route('/tenders/<id>/attachments', methods=['POST'])
def add_attachment(id):
    """Add attachment to a tender by id"""
    db = get_db()
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.static_folder, 'tender', id)
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # Construct URL
        file_url = f"/static/tender/{id}/{filename}"
        
        attachment_data = {
            "file_name": filename,
            "url": file_url
        }
        
        result = db.tenders.update_one(
            {'tender_id': id},
            {'$push': {'attachments': attachment_data}}
        )
        
        return jsonify(attachment_data), 201

@tenders_bp.route('/tenders/<id>/attachments/<filename>', methods=['DELETE'])
def remove_attachment(id, filename):
    """Remove attachment from a tender by id"""
    db = get_db()
    result = db.tenders.update_one(
        {'tender_id': id},
        {'$pull': {'attachments': {'file_name': filename}}}
    )
    
    if result.modified_count:
        # Remove file from disk
        file_path = os.path.join(current_app.static_folder, 'tender', id, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'message': 'Attachment removed'}), 200
    
    return jsonify({'error': 'Attachment or Tender not found'}), 404


