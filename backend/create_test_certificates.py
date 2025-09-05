#!/usr/bin/env python3
"""
Test Certificate Creation Script
Creates sample certificates for testing the search and delete functionality
"""

import sqlite3
import os
import uuid
from datetime import datetime, timedelta
import random

def create_test_certificates():
    """Create test certificates in the database"""
    db_path = os.path.join('instance', 'certificates.db')
    
    if not os.path.exists(db_path):
        print("❌ Database not found. Please run the app first to create the database.")
        return False
    
    # Sample data
    students = [
        "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", 
        "David Wilson", "Jessica Miller", "Christopher Anderson", "Amanda Taylor",
        "Robert Martinez", "Jennifer Thompson", "William Garcia", "Ashley Rodriguez",
        "James Martinez", "Brittany Lee", "Daniel Anderson", "Samantha Clark"
    ]
    
    degrees = [
        "Bachelor of Science in Computer Science",
        "Master of Business Administration", 
        "Bachelor of Arts in Psychology",
        "Master of Science in Data Science",
        "Bachelor of Engineering in Software Engineering",
        "Master of Arts in Digital Marketing",
        "Bachelor of Science in Information Technology",
        "Master of Science in Cybersecurity",
        "Bachelor of Arts in Graphic Design",
        "Master of Science in Artificial Intelligence"
    ]
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # First, check if we have users (needed for created_by field)
        cursor.execute("SELECT id FROM user WHERE role = 'admin' LIMIT 1")
        admin_user = cursor.fetchone()
        
        if not admin_user:
            # Create an admin user for testing
            cursor.execute("""
                INSERT INTO user (username, password_hash, role, created_at)
                VALUES ('testadmin', 'dummy_hash', 'admin', ?)
            """, (datetime.now(),))
            admin_id = cursor.lastrowid
            print(f"✅ Created test admin user with ID: {admin_id}")
        else:
            admin_id = admin_user[0]
            print(f"📋 Using existing admin user with ID: {admin_id}")
        
        # Check if certificates already exist
        cursor.execute("SELECT COUNT(*) FROM certificate")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"📋 Found {existing_count} existing certificates")
            response = input("Do you want to add more test certificates? (y/n): ")
            if response.lower() != 'y':
                conn.close()
                return True
        
        certificates_to_create = 15
        print(f"🚀 Creating {certificates_to_create} test certificates...")
        
        for i in range(certificates_to_create):
            # Generate certificate data
            student_name = random.choice(students)
            degree = random.choice(degrees)
            certificate_id = f"CERT-{uuid.uuid4().hex[:8].upper()}"
            
            # Random issue date within last 2 years
            days_ago = random.randint(1, 730)
            issue_date = datetime.now() - timedelta(days=days_ago)
            
            # 90% active, 10% revoked for testing
            status = 'revoked' if random.random() < 0.1 else 'active'
            revoked_by = admin_id if status == 'revoked' else None
            revoked_at = datetime.now() if status == 'revoked' else None
            
            # Insert certificate
            cursor.execute("""
                INSERT INTO certificate (
                    certificate_id, student_name, degree, issue_date, 
                    created_by, status, revoked_by, revoked_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                certificate_id, student_name, degree, issue_date.date(),
                admin_id, status, revoked_by, revoked_at
            ))
            
            print(f"  ✅ Created: {certificate_id} - {student_name} ({status})")
        
        conn.commit()
        
        # Get final statistics
        cursor.execute("SELECT COUNT(*) FROM certificate")
        total_certs = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM certificate WHERE status = 'active'")
        active_certs = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM certificate WHERE status = 'revoked'")
        revoked_certs = cursor.fetchone()[0]
        
        conn.close()
        
        print("\n📊 Certificate Statistics:")
        print(f"  📋 Total certificates: {total_certs}")
        print(f"  ✅ Active certificates: {active_certs}")
        print(f"  ❌ Revoked certificates: {revoked_certs}")
        print("\n🎉 Test certificates created successfully!")
        print("\n💡 You can now:")
        print("  - View them in the Admin Dashboard")
        print("  - Search and filter in All Certificates page")
        print("  - Test the delete/revoke functionality")
        print("  - Check them in the Blockchain Viewer")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create test certificates: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    create_test_certificates()
