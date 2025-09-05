#!/usr/bin/env python3
"""
Database Initialization Script
Creates database with the correct schema including revocation fields
"""

import os
import sys
sys.path.append('.')

from models import db, User, Certificate
from app import create_app

def init_database():
    """Initialize database with correct schema"""
    print("🚀 Initializing database...")
    
    # Create the application
    app = create_app()
    
    with app.app_context():
        # Create instance directory if it doesn't exist
        os.makedirs('instance', exist_ok=True)
        
        # Drop all tables and recreate them
        print("🔄 Dropping existing tables...")
        db.drop_all()
        
        print("🏗️  Creating tables with new schema...")
        db.create_all()
        
        # Verify table structure
        from sqlalchemy import text
        result = db.session.execute(text("PRAGMA table_info(certificate)"))
        columns = result.fetchall()
        
        print("📊 Certificate table structure:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        print("✅ Database initialized successfully!")
        return True

if __name__ == "__main__":
    init_database()
