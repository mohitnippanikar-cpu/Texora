import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from database import get_db

vendors_bp = Blueprint('vendors', __name__)

def get_vendor_collection():
    return get_db().vendors

def get_submission_collection():
    return get_db().submissions

@vendors_bp.route('/vendors/<vendor_id>', methods=['GET'])
def get_vendor(vendor_id):
    print(f"Fetching vendor with ID: {vendor_id}")
    db = get_db()
    # Search by vendor_id string
    vendor = db.vendors.find_one({'vendor_id': vendor_id}, {'_id': 0})
    if vendor:
        return jsonify(vendor), 200
    return jsonify({"error": "Vendor not found"}), 404

@vendors_bp.route('/tenders/<tender_id>/submissions', methods=['POST'])
def upload_submission(tender_id):
    db = get_db()
    data = request.json
    # ... (validation) ...
    data['tender_id'] = tender_id
    # Ensure status is submitted initially
    data['status'] = 'submitted'
    
    db.submissions.insert
