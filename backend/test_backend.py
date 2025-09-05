#!/usr/bin/env python3
"""
Test script to add a certificate directly to the backend
"""
import requests
import json

def test_backend():
    base_url = "http://127.0.0.1:5000/api"
    
    # First, login as admin
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    print("1. Logging in as admin...")
    try:
        response = requests.post(f"{base_url}/auth/login", json=login_data)
        print(f"Login response: {response.status_code}")
        
        if response.status_code == 200:
            login_result = response.json()
            print(f"Login result: {login_result}")
            
            # Extract token from nested structure
            data = login_result.get("data", {})
            token = data.get("access_token")
            
            if not token:
                print("❌ No access token in response")
                return
            print(f"✅ Login successful, token: {token[:20]}...")
            
            # Add certificate
            cert_data = {
                "student_name": "Test Student",
                "degree": "Computer Science",
                "issue_date": "2025-09-01",
                "certificate_id": "CERT12345"
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            print("\n2. Adding certificate...")
            cert_response = requests.post(f"{base_url}/add_certificate", json=cert_data, headers=headers)
            print(f"Add certificate response: {cert_response.status_code}")
            print(f"Response: {cert_response.text}")
            
            if cert_response.status_code == 201:
                print("✅ Certificate added successfully!")
                
                # Now try to verify it
                print("\n3. Verifying certificate...")
                verify_response = requests.get(f"{base_url}/verify/simple/CERT12345")
                print(f"Verify response: {verify_response.status_code}")
                print(f"Response: {verify_response.text}")
            else:
                print("❌ Failed to add certificate")
        else:
            print(f"❌ Login failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running on http://127.0.0.1:5000?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_backend()
