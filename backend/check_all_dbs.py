#!/usr/bin/env python3
"""
Debug script to check both database files
"""
import os
import sqlite3

def check_database(db_path):
    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        return
    
    print(f"\n=== CHECKING DATABASE: {db_path} ===")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check users table
        cursor.execute("SELECT username, role FROM user")
        users = cursor.fetchall()
        print(f"Users: {len(users)}")
        for username, role in users:
            print(f"  - {username} ({role})")
        
        # Check certificates table
        cursor.execute("SELECT certificate_id, student_name, degree FROM certificate")
        certs = cursor.fetchall()
        print(f"Certificates: {len(certs)}")
        for cert_id, student, degree in certs:
            print(f"  - {cert_id}: {student} - {degree}")
            
    except sqlite3.OperationalError as e:
        print(f"Error querying database: {e}")
    finally:
        conn.close()

def main():
    # Check both potential database locations
    db_paths = [
        "F:/Github/instance/app.db",
        "F:/Github/backend/instance/app.db"
    ]
    
    for db_path in db_paths:
        check_database(db_path)

if __name__ == "__main__":
    main()
