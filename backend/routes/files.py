import os
from flask import Blueprint, send_from_directory, current_app, abort

files_bp = Blueprint('files', __name__)

@files_bp.route('/tenders/<tender_id>/<filename>')
def get_tender_file(tender_id, filename):
    """Get a tender_file by id - from tender folder in static"""
    directory = os.path.join(current_app.static_folder, 'tender', tender_id)
    try:
        return send_from_directory(directory, filename)
    except FileNotFoundError:
        abort(404)

@files_bp.route('/bids/<tender_id>/submissions/<vendor_identifier>/<filename>')
def get_submission_file(tender_id, vendor_identifier, filename):
    """Get a submission_file by id - from submission folder in static"""
    # vendor_identifier corresponds to the folder name (e.g., tech_supplies_co)
    directory = os.path.join(current_app.static_folder, 'bids', tender_id, 'submissions', vendor_identifier)
    try:
        return send_from_directory(directory, filename)
    except FileNotFoundError:
        abort(404)
