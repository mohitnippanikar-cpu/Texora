from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os
import json

load_dotenv()

# Connect to MongoDB
client = MongoClient(os.getenv("MONGODB_URI"))
db = client['db']

def seed_tenders():
    tenders_collection = db.tenders
    with open('jsons/tender.json') as f:
        tender_data = json.load(f)
        # Check if tender already exists
        if not tenders_collection.find_one({'tender_id': tender_data['tender_id']}):
            tenders_collection.insert_one(tender_data)
            print(f"Inserted tender {tender_data['tender_id']}")
        else:
            print(f"Tender {tender_data['tender_id']} already exists. Skipping insertion.")
def seed_variations():
    tenders_collection = db.tenders
    
    variations = [
        {
            "tender_id": "TND-2025-0122",
            "title": "Supply of Networking Infrastructure",
            "description": "Tender for the supply and installation of networking hardware including routers, switches, and cabling.",
            "stage": "live",
            "end_date": "2025-08-15T17:00:00Z",
            "amount": 7500000,
            "earnest_money_deposit": 75000,
            "attachments": [
                {"file_name": "network_specs.pdf", "url": "/tenders/TND-2025-0122/network_specs.pdf"}
            ],
            "contact_person": "Priya Sharma",
            "contact_phone": "+91 9876543210",
            "contact_email": "priya.sharma@company.com",
            "requirements": {
                "elegibility": [
                    "Minimum 7 years of experience in networking infrastructure.",
                    "Cisco Certified Partner status required."
                ],
                "technical_sku": {
                    "Routers": {"throughput": "10Gbps", "ports": "8x 10G SFP+"},
                    "Switches": {"ports": "48x 1G PoE+", "uplink": "4x 10G SFP+"},
                    "Cabling": {"type": "CAT6A", "length": "5000m"}
                },
                "technical_checklist": [
                    "Delivery Time: Within 4 weeks.",
                    "Installation: Full site configuration required."
                ],
                "financial": {
                    "Routers": {"rate_per_unit": 0, "quantity": 5, "total_cost": 0},
                    "Switches": {"rate_per_unit": 0, "quantity": 20, "total_cost": 0},
                    "Cabling": {"rate_per_unit": 0, "quantity": 1, "total_cost": 0},
                    "others": {"transportation": 0, "installation": 0, "warranty": 0},
                    "total_budget": 0
                },
                "financial_checklist": ["Quotes valid for 60 days.", "Payment: 50% advance."],
                "legal": ["Compliance with TRAI regulations."]
            }
        },
        {
            "tender_id": "TND-2025-0123",
            "title": "Annual Maintenance Contract for IT Assets",
            "description": "Comprehensive AMC for all IT hardware across 3 office locations.",
            "stage": "draft",
            "end_date": "2025-09-01T17:00:00Z",
            "amount": 2500000,
            "earnest_money_deposit": 25000,
            "attachments": [
                {"file_name": "asset_list.xlsx", "url": "/tenders/TND-2025-0123/asset_list.xlsx"}
            ],
            "contact_person": "Rahul Verma",
            "contact_phone": "+91 9123456789",
            "contact_email": "rahul.verma@company.com",
            "requirements": {
                "elegibility": [
                    "Minimum 3 years experience in IT facility management.",
                    "Must have a local support center within 20km."
                ],
                "technical_sku": {
                    "Desktop Support": {"sla": "4 hours response", "coverage": "9am-6pm"},
                    "Server Support": {"sla": "1 hour response", "coverage": "24x7"}
                },
                "technical_checklist": [
                    "Manpower: 2 resident engineers required.",
                    "Reporting: Weekly uptime reports."
                ],
                "financial": {
                    "Desktop Support": {"rate_per_unit": 0, "quantity": 12, "total_cost": 0},
                    "Server Support": {"rate_per_unit": 0, "quantity": 12, "total_cost": 0},
                    "others": {"emergency_visits": 0},
                    "total_budget": 0
                },
                "financial_checklist": ["Quarterly billing cycle."],
                "legal": ["NDA required for all staff."]
            }
        },
        {
            "tender_id": "TND-2025-0124",
            "title": "Supply of Ergonomic Office Furniture",
            "description": "Procurement of ergonomic chairs and height-adjustable desks for new wing.",
            "stage": "awarded",
            "end_date": "2025-06-30T17:00:00Z",
            "amount": 3000000,
            "earnest_money_deposit": 30000,
            "attachments": [
                {"file_name": "furniture_design.pdf", "url": "/tenders/TND-2025-0124/furniture_design.pdf"}
            ],
            "contact_person": "Sneha Gupta",
            "contact_phone": "+91 9988776655",
            "contact_email": "sneha.gupta@company.com",
            "requirements": {
                "elegibility": [
                    "BIFMA certification mandatory.",
                    "Green Guard certification preferred."
                ],
                "technical_sku": {
                    "Ergonomic Chairs": {"mesh_back": "yes", "lumbar_support": "adjustable"},
                    "Standing Desks": {"motor": "dual", "height_range": "70-120cm"}
                },
                "technical_checklist": [
                    "Warranty: 5 years on mechanism.",
                    "Fabric: Fire retardant."
                ],
                "financial": {
                    "Ergonomic Chairs": {"rate_per_unit": 0, "quantity": 100, "total_cost": 0},
                    "Standing Desks": {"rate_per_unit": 0, "quantity": 50, "total_cost": 0},
                    "others": {"assembly": 0, "freight": 0},
                    "total_budget": 0
                },
                "financial_checklist": ["100% payment after successful installation."],
                "legal": ["Must use eco-friendly materials."]
            }
        }
    ]

    for tender in variations:
        if not tenders_collection.find_one({'tender_id': tender['tender_id']}):
            tenders_collection.insert_one(tender)
            print(f"Inserted variation tender {tender['tender_id']}")
        else:
            print(f"Variation tender {tender['tender_id']} already exists. Skipping.")

if __name__ == "__main__":
    # seed_tenders()
    # seed_variations()

    # clean db
    db.tenders.delete_many({})
    print("Cleared tenders collection.")
    db.submissions.delete_many({})
    print("Cleared submissions collection.")
    db.vendors.delete_many({})
    print("Cleared vendors collection.")