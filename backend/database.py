from pymongo import MongoClient
from flask import current_app, g
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    if 'db' not in g:
        # Use environment variable for MongoDB URI
        uri = current_app.config.get('MONGO_URI', os.environ.get('MONGODB_URI'))
        client = MongoClient(uri)
        g.db = client[current_app.config.get('MONGO_DBNAME', 'db')]
    return g.db

def init_db(app):
    # Optional: Initialize indexes here if needed
    pass
