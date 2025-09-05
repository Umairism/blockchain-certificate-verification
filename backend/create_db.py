#!/usr/bin/env python3
"""
Simple Database Creation Script
Creates database with the correct schema without importing the full app
"""

import sqlite3
import os

def create_database():
    """Create database with the correct schema"""
    print("🚀 Creating database with correct schema...")
    
    # Create instance directory
    os.makedirs('instance', exist_ok=True)
    
    # Connect to database
    db_path = os.path.join('instance', 'certificates.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            password_hash VARCHAR(120) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create certificates table with revocation fields
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS certificate (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            certificate_id VARCHAR(50) UNIQUE NOT NULL,
            student_name VARCHAR(100) NOT NULL,
            degree VARCHAR(100) NOT NULL,
            issue_date DATE NOT NULL,
            qr_code_path VARCHAR(200),
            created_by INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            revoked_by INTEGER,
            revoked_at DATETIME,
            FOREIGN KEY (created_by) REFERENCES user(id),
            FOREIGN KEY (revoked_by) REFERENCES user(id)
        )
    ''')
    
    conn.commit()
    
    # Verify table structure
    cursor.execute("PRAGMA table_info(certificate)")
    columns = cursor.fetchall()
    
    print("📊 Certificate table structure:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
    
    conn.close()
    print("✅ Database created successfully!")

if __name__ == "__main__":
    create_database()
