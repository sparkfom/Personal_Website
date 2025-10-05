#!/usr/bin/env python3
"""
Backend API Testing Script for Benjamin Schwarz Consulting Site
Tests all backend endpoints with real data scenarios
"""

import requests
import json
import io
import os
from datetime import datetime

# Get backend URL from frontend env
BACKEND_URL = "https://efficiency-lab.preview.emergentagent.com/api"

def test_hello_world():
    """Test GET /api/ endpoint"""
    print("\n=== Testing Hello World Endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200 and response.json().get("message") == "Hello World":
            print("✅ Hello World endpoint working correctly")
            return True
        else:
            print("❌ Hello World endpoint failed")
            return False
    except Exception as e:
        print(f"❌ Hello World endpoint error: {e}")
        return False

def test_upload_flow():
    """Test complete upload flow: initiate -> chunk -> complete"""
    print("\n=== Testing Upload Flow ===")
    
    # Test data
    filename = "business_proposal.pdf"
    total_chunks = 2
    mime_type = "application/pdf"
    size = 2048
    
    # Create test chunks (1KB each)
    chunk1_data = b"A" * 1024  # First chunk
    chunk2_data = b"B" * 1024  # Second chunk
    
    try:
        # Step 1: Initiate upload
        print("\n--- Step 1: Initiate Upload ---")
        initiate_payload = {
            "filename": filename,
            "total_chunks": total_chunks,
            "mime_type": mime_type,
            "size": size
        }
        
        response = requests.post(f"{BACKEND_URL}/uploads/initiate", json=initiate_payload)
        print(f"Initiate Status: {response.status_code}")
        print(f"Initiate Response: {response.json()}")
        
        if response.status_code != 200:
            print("❌ Upload initiate failed")
            return False
            
        upload_id = response.json().get("upload_id")
        if not upload_id:
            print("❌ No upload_id returned")
            return False
            
        print(f"✅ Upload initiated with ID: {upload_id}")
        
        # Step 2: Upload chunks
        print("\n--- Step 2: Upload Chunks ---")
        
        # Upload chunk 0
        files = {'chunk': ('chunk0', io.BytesIO(chunk1_data), 'application/octet-stream')}
        data = {'upload_id': upload_id, 'index': 0}
        
        response = requests.post(f"{BACKEND_URL}/uploads/chunk", files=files, data=data)
        print(f"Chunk 0 Status: {response.status_code}")
        print(f"Chunk 0 Response: {response.json()}")
        
        if response.status_code != 200 or not response.json().get("received"):
            print("❌ Chunk 0 upload failed")
            return False
            
        # Upload chunk 1
        files = {'chunk': ('chunk1', io.BytesIO(chunk2_data), 'application/octet-stream')}
        data = {'upload_id': upload_id, 'index': 1}
        
        response = requests.post(f"{BACKEND_URL}/uploads/chunk", files=files, data=data)
        print(f"Chunk 1 Status: {response.status_code}")
        print(f"Chunk 1 Response: {response.json()}")
        
        if response.status_code != 200 or not response.json().get("received"):
            print("❌ Chunk 1 upload failed")
            return False
            
        print("✅ Both chunks uploaded successfully")
        
        # Step 3: Complete upload
        print("\n--- Step 3: Complete Upload ---")
        complete_payload = {"upload_id": upload_id}
        
        response = requests.post(f"{BACKEND_URL}/uploads/complete", json=complete_payload)
        print(f"Complete Status: {response.status_code}")
        print(f"Complete Response: {response.json()}")
        
        if response.status_code != 200:
            print("❌ Upload complete failed")
            return False
            
        result = response.json()
        if not all(key in result for key in ["file_id", "filename", "size"]):
            print("❌ Complete response missing required fields")
            return False
            
        if result["filename"] != filename or result["size"] != size:
            print("❌ Complete response has incorrect data")
            return False
            
        print("✅ Upload flow completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Upload flow error: {e}")
        return False

def test_consult_requests():
    """Test consult requests create and list"""
    print("\n=== Testing Consult Requests ===")
    
    try:
        # Step 1: Create a consult request
        print("\n--- Step 1: Create Consult Request ---")
        create_payload = {
            "name": "Sarah Johnson",
            "company": "TechCorp Solutions",
            "role": "CTO",
            "summary": "Need strategic consulting for digital transformation initiative. Looking to modernize legacy systems and implement cloud-native architecture.",
            "start_date": "2024-02-01",
            "budget": "$50,000 - $100,000"
        }
        
        response = requests.post(f"{BACKEND_URL}/consult-requests", json=create_payload)
        print(f"Create Status: {response.status_code}")
        print(f"Create Response: {response.json()}")
        
        if response.status_code != 200:
            print("❌ Consult request creation failed")
            return False
            
        created_request = response.json()
        required_fields = ["id", "created_at", "name", "summary"]
        if not all(field in created_request for field in required_fields):
            print("❌ Created request missing required fields")
            return False
            
        if created_request["name"] != create_payload["name"]:
            print("❌ Created request has incorrect name")
            return False
            
        print("✅ Consult request created successfully")
        request_id = created_request["id"]
        
        # Step 2: List consult requests
        print("\n--- Step 2: List Consult Requests ---")
        response = requests.get(f"{BACKEND_URL}/consult-requests")
        print(f"List Status: {response.status_code}")
        
        if response.status_code != 200:
            print("❌ Consult requests list failed")
            return False
            
        requests_list = response.json()
        print(f"Found {len(requests_list)} consult requests")
        
        if not isinstance(requests_list, list):
            print("❌ List response is not an array")
            return False
            
        # Find our created request
        found_request = None
        for req in requests_list:
            if req.get("id") == request_id:
                found_request = req
                break
                
        if not found_request:
            print("❌ Created request not found in list")
            return False
            
        print("✅ Consult requests working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Consult requests error: {e}")
        return False

def test_cv_endpoint():
    """Test CV redirect endpoint"""
    print("\n=== Testing CV Endpoint ===")
    
    try:
        # Test CV redirect (don't follow redirects to check status code)
        response = requests.get(f"{BACKEND_URL}/cv", allow_redirects=False)
        print(f"CV Status: {response.status_code}")
        print(f"CV Headers: {dict(response.headers)}")
        
        if response.status_code == 307:
            location = response.headers.get('location')
            if location and 'pdf' in location.lower():
                print(f"✅ CV endpoint redirecting correctly to: {location}")
                return True
            else:
                print("❌ CV redirect location invalid or missing")
                return False
        else:
            print("❌ CV endpoint not returning 307 redirect")
            return False
            
    except Exception as e:
        print(f"❌ CV endpoint error: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting Backend API Tests")
    print(f"Testing against: {BACKEND_URL}")
    
    results = {}
    
    # Test all endpoints
    results['hello_world'] = test_hello_world()
    results['upload_flow'] = test_upload_flow()
    results['consult_requests'] = test_consult_requests()
    results['cv_endpoint'] = test_cv_endpoint()
    
    # Summary
    print("\n" + "="*50)
    print("🏁 TEST SUMMARY")
    print("="*50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend tests passed!")
    else:
        print("⚠️  Some backend tests failed - check logs above")
    
    return results

if __name__ == "__main__":
    main()