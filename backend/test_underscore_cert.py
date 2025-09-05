#!/usr/bin/env python3
"""
Test script to add a certificate with underscores
"""
import requests
import json

def test_certificate_with_underscores():
    base_url = "http://127.0.0.1:5000/api"
    
    # Login as admin
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    print("1. Logging in as admin...")
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    
    if response.status_code == 200:
        login_result = response.json()
        data = login_result.get("data", {})
        token = data.get("access_token")
        
        # Add certificate with underscores
        cert_data = {
            "student_name": "John Doe",
            "degree": "Computer Science",
            "issue_date": "2025-09-01",
            "certificate_id": "CERT_1756761881392_3AD63KKX6"
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print("\n2. Adding certificate with underscores...")
        cert_response = requests.post(f"{base_url}/add_certificate", json=cert_data, headers=headers)
        print(f"Add certificate response: {cert_response.status_code}")
        print(f"Response: {cert_response.text}")
        
        if cert_response.status_code == 201:
            print("✅ Certificate added successfully!")
            
            # Verify it
            print("\n3. Verifying certificate...")
            verify_response = requests.get(f"{base_url}/verify/simple/CERT_1756761881392_3AD63KKX6")
            print(f"Verify response: {verify_response.status_code}")
            print(f"Response: {verify_response.text}")
        else:
            print("❌ Failed to add certificate")
    else:
        print(f"❌ Login failed: {response.text}")

if __name__ == "__main__":
    test_certificate_with_underscores()
