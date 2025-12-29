from flask import Flask, jsonify
from flask_cors import CORS
from routes.tenders import tenders_bp
from routes.submissions import submissions_bp
from routes.vendors import vendors_bp
from routes.files import files_bp
from database import init_db

# Initialize the Flask application
app = Flask(__name__, static_folder='static', static_url_path='/static')

# Enable CORS
CORS(app)

# Initialize Database
init_db(app)

# Register Blueprints
app.register_blueprint(tenders_bp)
app.register_blueprint(submissions_bp)
app.register_blueprint(vendors_bp)
app.register_blueprint(files_bp)

@app.route('/')
def index():
    return jsonify({"message": "Tender Management API is running"}), 200

if __name__ == '__main__':
    # Run the application on port from environment variable (default 8080 for Cloud Run)
    import os
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, port=port, host='0.0.0.0')
