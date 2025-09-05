#!/usr/bin/env python3
"""
Debug script to check database contents
"""
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from database import db
from models import User, Certificate

def create_app():
    """Create Flask app for debugging"""
    app = Flask(__name__)
    
    # Use the same database path as the main app
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    return app

def main():
    # Create Flask app
    app = create_app()
    
    with app.app_context():
        print("=== DATABASE DEBUG INFO ===")
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print()
        
        # Check users
        users = User.query.all()
        print(f"Total users: {len(users)}")
        for user in users:
            print(f"  - {user.username} ({user.role})")
        print()
        
        # Check certificates
        certificates = Certificate.query.all()
        print(f"Total certificates: {len(certificates)}")
        for cert in certificates:
            print(f"  - {cert.certificate_id}")
            print(f"    Student: {cert.student_name}")
            print(f"    Degree: {cert.degree}")
            print(f"    Issue Date: {cert.issue_date}")
            print(f"    Created by: {cert.created_by}")
            print()
        
        # Search for specific certificate
        target_cert = "CERT_1756763354177_5LX0F5SA1"
        cert = Certificate.query.filter_by(certificate_id=target_cert).first()
        print(f"Searching for {target_cert}: {'FOUND' if cert else 'NOT FOUND'}")
        
        if cert:
            print(f"  Student: {cert.student_name}")
            print(f"  Degree: {cert.degree}")
            print(f"  Issue Date: {cert.issue_date}")

if __name__ == "__main__":
    main()
