#!/usr/bin/env python3
"""
Test script for incident status update endpoint.
Run this after starting the API server to verify functionality.
"""

import requests
import json
import sys

API_BASE_URL = "http://127.0.0.1:8000"

def test_status_update():
    """Test the PATCH /incidents/{id} endpoint."""
    
    print("🧪 Testing Incident Status Update Endpoint")
    print("=" * 50)
    
    # First, get all incidents to find one to update
    print("1. Fetching existing incidents...")
    try:
        response = requests.get(f"{API_BASE_URL}/incidents/")
        response.raise_for_status()
        incidents = response.json()
        
        if not incidents:
            print("❌ No incidents found. Please create some test incidents first.")
            return False
            
        incident_id = incidents[0]["id"]
        original_status = incidents[0]["status"]
        print(f"✅ Found incident {incident_id} with status: {original_status}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to fetch incidents: {e}")
        return False
    
    # Test valid status updates
    valid_statuses = ["acknowledged", "resolved", "open"]
    
    for new_status in valid_statuses:
        if new_status == original_status:
            continue
            
        print(f"\n2. Testing status update to '{new_status}'...")
        
        payload = {"status": new_status}
        
        try:
            response = requests.patch(
                f"{API_BASE_URL}/incidents/{incident_id}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            updated_incident = response.json()
            if updated_incident["status"] == new_status:
                print(f"✅ Successfully updated status to '{new_status}'")
                print(f"   Updated at: {updated_incident.get('updated_at', 'N/A')}")
            else:
                print(f"❌ Status not updated correctly. Expected: {new_status}, Got: {updated_incident['status']}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to update status to '{new_status}': {e}")
            return False
    
    # Test invalid status
    print(f"\n3. Testing invalid status update...")
    invalid_payload = {"status": "invalid_status"}
    
    try:
        response = requests.patch(
            f"{API_BASE_URL}/incidents/{incident_id}",
            json=invalid_payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 422:  # Validation error
            print("✅ Invalid status correctly rejected with 422 error")
        else:
            print(f"❌ Expected 422 error for invalid status, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Unexpected error testing invalid status: {e}")
        return False
    
    # Test non-existent incident
    print(f"\n4. Testing non-existent incident...")
    fake_id = "00000000-0000-0000-0000-000000000000"
    
    try:
        response = requests.patch(
            f"{API_BASE_URL}/incidents/{fake_id}",
            json={"status": "acknowledged"},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 404:
            print("✅ Non-existent incident correctly returns 404 error")
        else:
            print(f"❌ Expected 404 error for non-existent incident, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Unexpected error testing non-existent incident: {e}")
        return False
    
    print(f"\n🎉 All tests passed! The status update endpoint is working correctly.")
    return True

def print_curl_examples():
    """Print curl command examples for manual testing."""
    
    print("\n📋 Manual Testing with curl:")
    print("=" * 50)
    
    print("\n1. Get all incidents:")
    print("curl -X GET http://127.0.0.1:8000/incidents/")
    
    print("\n2. Update incident status to 'acknowledged':")
    print('curl -X PATCH http://127.0.0.1:8000/incidents/{INCIDENT_ID} \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"status": "acknowledged"}\'')
    
    print("\n3. Update incident status to 'resolved':")
    print('curl -X PATCH http://127.0.0.1:8000/incidents/{INCIDENT_ID} \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"status": "resolved"}\'')
    
    print("\n4. Test invalid status (should return 422):")
    print('curl -X PATCH http://127.0.0.1:8000/incidents/{INCIDENT_ID} \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"status": "invalid"}\'')
    
    print("\n5. Test non-existent incident (should return 404):")
    print('curl -X PATCH http://127.0.0.1:8000/incidents/00000000-0000-0000-0000-000000000000 \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"status": "acknowledged"}\'')

if __name__ == "__main__":
    print_curl_examples()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("\n" + "=" * 60)
        success = test_status_update()
        sys.exit(0 if success else 1)
    else:
        print(f"\n💡 To run automated tests, use: python {sys.argv[0]} --test")
        print("   Make sure the API server is running first!")
