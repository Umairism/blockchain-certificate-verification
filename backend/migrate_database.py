#!/usr/bin/env python3
"""
Database Migration Script
Adds new columns to existing Certificate table for revocation functionality
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    """Add new columns to the certificate table"""
    db_path = os.path.join('instance', 'certificates.db')
    
    if not os.path.exists(db_path):
        print("❌ Database file not found. Please run the application first to create the database.")
        return False
    
    print(f"🔄 Migrating database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(certificate)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print(f"📋 Current columns: {columns}")
        
        migrations_needed = []
        
        # Check and add status column
        if 'status' not in columns:
            migrations_needed.append(
                "ALTER TABLE certificate ADD COLUMN status VARCHAR(20) DEFAULT 'active'"
            )
            print("➕ Will add 'status' column")
        
        # Check and add revoked_by column
        if 'revoked_by' not in columns:
            migrations_needed.append(
                "ALTER TABLE certificate ADD COLUMN revoked_by INTEGER"
            )
            print("➕ Will add 'revoked_by' column")
        
        # Check and add revoked_at column
        if 'revoked_at' not in columns:
            migrations_needed.append(
                "ALTER TABLE certificate ADD COLUMN revoked_at DATETIME"
            )
            print("➕ Will add 'revoked_at' column")
        
        if not migrations_needed:
            print("✅ Database is already up to date!")
            conn.close()
            return True
        
        # Execute migrations
        for migration in migrations_needed:
            print(f"🔄 Executing: {migration}")
            cursor.execute(migration)
        
        # Update all existing certificates to have active status
        cursor.execute("UPDATE certificate SET status = 'active' WHERE status IS NULL")
        rows_updated = cursor.rowcount
        print(f"📝 Updated {rows_updated} existing certificates to 'active' status")
        
        conn.commit()
        conn.close()
        
        print("✅ Database migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def verify_migration():
    """Verify that the migration was successful"""
    db_path = os.path.join('instance', 'certificates.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check table structure
        cursor.execute("PRAGMA table_info(certificate)")
        columns = cursor.fetchall()
        
        print("\n📊 Final table structure:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Check data
        cursor.execute("SELECT COUNT(*) FROM certificate")
        total_certs = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM certificate WHERE status = 'active'")
        active_certs = cursor.fetchone()[0]
        
        print(f"\n📈 Certificate statistics:")
        print(f"  - Total certificates: {total_certs}")
        print(f"  - Active certificates: {active_certs}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting database migration...")
    print("=" * 50)
    
    if migrate_database():
        verify_migration()
        print("\n🎉 Migration process completed!")
    else:
        print("\n💥 Migration process failed!")
