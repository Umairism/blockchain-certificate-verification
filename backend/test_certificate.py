import requests
import json

# Test configuration
BASE_URL = "http://localhost:5000/api"
CERTIFICATE_ID = "CERT_1756760573862_USKTGE3D4"

# First, let's get an admin token
def get_admin_token():
    """Get admin token for testing"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json()["data"]["access_token"]
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_certificate_search(token, cert_id):
    """Test certificate search and verification"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"🔍 Testing certificate: {cert_id}\n")
    
    # Test 1: Debug endpoint
    print("1. Debug Certificate Status:")
    try:
        response = requests.get(f"{BASE_URL}/debug/certificate/{cert_id}", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            debug_data = response.json()["data"]
            print(f"   Found in DB: {debug_data['found_in_database']}")
            print(f"   Found in Blockchain: {debug_data['found_in_blockchain']}")
            print(f"   Total certificates: {debug_data['total_certificates_in_db']}")
            print(f"   All certificate IDs: {debug_data['all_certificate_ids']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 2: Direct verification
    print("\n2. Direct Verification:")
    try:
        response = requests.get(f"{BASE_URL}/verify/{cert_id}", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Certificate found and verified!")
            print(f"   Student: {response.json()['data']['certificate']['student_name']}")
        else:
            print(f"   ❌ Verification failed: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 3: Search functionality
    print("\n3. Search by Certificate ID:")
    try:
        response = requests.get(f"{BASE_URL}/search?q={cert_id}", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()["data"]["results"]
            print(f"   Found {len(results)} results")
            for result in results:
                print(f"   - {result['certificate_id']}: {result['student_name']}")
        else:
            print(f"   Search failed: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 4: Search by partial ID
    print(f"\n4. Search by partial ID (last 8 chars):")
    partial_id = cert_id[-8:]
    try:
        response = requests.get(f"{BASE_URL}/search?q={partial_id}", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()["data"]["results"]
            print(f"   Found {len(results)} results with '{partial_id}'")
            for result in results:
                print(f"   - {result['certificate_id']}: {result['student_name']}")
        else:
            print(f"   Search failed: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # Test 5: Public verification (no auth)
    print("\n5. Public Verification (no auth):")
    try:
        response = requests.get(f"{BASE_URL}/verify/simple/{cert_id}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Public verification successful!")
            data = response.json()
            print(f"   Student: {data['student_name']}")
            print(f"   Degree: {data['degree']}")
        else:
            print(f"   ❌ Public verification failed: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")

if __name__ == "__main__":
    print("🚀 Certificate Search Debug Tool\n")
    
    # Get admin token
    token = get_admin_token()
    if not token:
        print("❌ Failed to get admin token. Make sure backend is running.")
        exit(1)
    
    print("✅ Admin token obtained\n")
    
    # Test the specific certificate
    test_certificate_search(token, CERTIFICATE_ID)
    
    print(f"\n📝 To test in browser:")
    print(f"1. Open: http://localhost:5000/api/verify/simple/{CERTIFICATE_ID}")
    print(f"2. Search API: http://localhost:5000/api/search?q={CERTIFICATE_ID}")
    print(f"3. Debug API: http://localhost:5000/api/debug/certificate/{CERTIFICATE_ID}")
