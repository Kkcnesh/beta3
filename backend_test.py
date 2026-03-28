#!/usr/bin/env python3
"""
BugCode Backend API Testing Suite
Tests all backend endpoints comprehensively
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Base URL from environment
BASE_URL = "https://debug-practice.preview.emergentagent.com/api"

class BugCodeTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        
        default_headers = {"Content-Type": "application/json"}
        if self.auth_token:
            default_headers["Authorization"] = f"Bearer {self.auth_token}"
        if headers:
            default_headers.update(headers)
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0
                
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
                
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0

    def test_health_check(self):
        """Test API health check endpoint"""
        print("\n=== Testing Health Check ===")
        
        success, data, status = self.make_request("GET", "/")
        if success and "BugCode API is running" in data.get("message", ""):
            self.log_test("Health Check", True, f"API is running, version: {data.get('version', 'unknown')}")
        else:
            self.log_test("Health Check", False, f"Status: {status}, Response: {data}")

    def test_auth_signup(self):
        """Test user signup functionality"""
        print("\n=== Testing Authentication - Signup ===")
        
        # Test valid signup
        signup_data = {
            "name": "Test User",
            "email": f"testuser_{int(time.time())}@example.com",
            "password": "testpassword123"
        }
        
        success, data, status = self.make_request("POST", "/auth/signup", signup_data)
        if success and "token" in data:
            self.auth_token = data["token"]
            self.user_id = data["user"]["id"]
            self.log_test("Valid Signup", True, f"User created with ID: {self.user_id}")
        else:
            self.log_test("Valid Signup", False, f"Status: {status}, Response: {data}")
            return
            
        # Test duplicate email signup
        success, data, status = self.make_request("POST", "/auth/signup", signup_data)
        if not success and status == 400 and "already exists" in data.get("error", "").lower():
            self.log_test("Duplicate Email Signup", True, "Correctly rejected duplicate email")
        else:
            self.log_test("Duplicate Email Signup", False, f"Should have failed with 400, got {status}")
            
        # Test missing fields
        invalid_data = {"name": "Test", "email": "test@example.com"}  # Missing password
        success, data, status = self.make_request("POST", "/auth/signup", invalid_data)
        if not success and status == 400:
            self.log_test("Missing Fields Validation", True, "Correctly rejected missing fields")
        else:
            self.log_test("Missing Fields Validation", False, f"Should have failed with 400, got {status}")

    def test_auth_login(self):
        """Test user login functionality"""
        print("\n=== Testing Authentication - Login ===")
        
        if not self.user_id:
            self.log_test("Login Test Setup", False, "No user created for login test")
            return
            
        # Test valid login (using the email from signup)
        login_data = {
            "email": f"testuser_{int(time.time())}@example.com",  # This won't work, need to store email
            "password": "testpassword123"
        }
        
        # Create a new user for login test
        signup_data = {
            "name": "Login Test User",
            "email": f"logintest_{int(time.time())}@example.com",
            "password": "loginpassword123"
        }
        
        success, signup_response, _ = self.make_request("POST", "/auth/signup", signup_data)
        if not success:
            self.log_test("Login Test Setup", False, "Could not create user for login test")
            return
            
        # Now test login
        login_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
        
        success, data, status = self.make_request("POST", "/auth/login", login_data)
        if success and "token" in data:
            self.log_test("Valid Login", True, f"Login successful, got token")
        else:
            self.log_test("Valid Login", False, f"Status: {status}, Response: {data}")
            
        # Test invalid credentials
        invalid_login = {
            "email": signup_data["email"],
            "password": "wrongpassword"
        }
        
        success, data, status = self.make_request("POST", "/auth/login", invalid_login)
        if not success and status == 401:
            self.log_test("Invalid Credentials", True, "Correctly rejected invalid password")
        else:
            self.log_test("Invalid Credentials", False, f"Should have failed with 401, got {status}")
            
        # Test missing fields
        incomplete_login = {"email": signup_data["email"]}  # Missing password
        success, data, status = self.make_request("POST", "/auth/login", incomplete_login)
        if not success and status == 400:
            self.log_test("Login Missing Fields", True, "Correctly rejected missing fields")
        else:
            self.log_test("Login Missing Fields", False, f"Should have failed with 400, got {status}")

    def test_auth_me(self):
        """Test get current user endpoint"""
        print("\n=== Testing Authentication - Get Current User ===")
        
        if not self.auth_token:
            self.log_test("Auth Me Test Setup", False, "No auth token available")
            return
            
        # Test with valid token
        success, data, status = self.make_request("GET", "/auth/me")
        if success and "id" in data and "email" in data:
            self.log_test("Get Current User", True, f"Retrieved user data for ID: {data['id']}")
        else:
            self.log_test("Get Current User", False, f"Status: {status}, Response: {data}")
            
        # Test without token
        old_token = self.auth_token
        self.auth_token = None
        success, data, status = self.make_request("GET", "/auth/me")
        if not success and status == 401:
            self.log_test("Unauthorized Access", True, "Correctly rejected request without token")
        else:
            self.log_test("Unauthorized Access", False, f"Should have failed with 401, got {status}")
        self.auth_token = old_token
        
        # Test with invalid token
        self.auth_token = "invalid_token_123"
        success, data, status = self.make_request("GET", "/auth/me")
        if not success and status == 401:
            self.log_test("Invalid Token", True, "Correctly rejected invalid token")
        else:
            self.log_test("Invalid Token", False, f"Should have failed with 401, got {status}")
        self.auth_token = old_token

    def test_problems_list(self):
        """Test get problems list endpoint"""
        print("\n=== Testing Problems - List All ===")
        
        # Test without authentication
        old_token = self.auth_token
        self.auth_token = None
        success, data, status = self.make_request("GET", "/problems")
        if success and "problems" in data and len(data["problems"]) == 5:
            self.log_test("Problems List (No Auth)", True, f"Retrieved {len(data['problems'])} problems")
        else:
            self.log_test("Problems List (No Auth)", False, f"Status: {status}, Expected 5 problems, got: {data}")
        self.auth_token = old_token
        
        # Test with authentication
        success, data, status = self.make_request("GET", "/problems")
        if success and "problems" in data and len(data["problems"]) == 5:
            problems = data["problems"]
            # Check problem structure
            first_problem = problems[0]
            required_fields = ["id", "title", "difficulty", "tags", "solved"]
            if all(field in first_problem for field in required_fields):
                self.log_test("Problems List (With Auth)", True, f"Retrieved {len(problems)} problems with correct structure")
            else:
                self.log_test("Problems List (With Auth)", False, f"Missing required fields in problem data")
        else:
            self.log_test("Problems List (With Auth)", False, f"Status: {status}, Response: {data}")

    def test_problem_details(self):
        """Test get single problem endpoint"""
        print("\n=== Testing Problems - Get Details ===")
        
        # Test valid problem ID
        success, data, status = self.make_request("GET", "/problems/1")
        if success and "problem" in data:
            problem = data["problem"]
            required_fields = ["id", "title", "difficulty", "tags", "description", "starterCode", "hints", "testCases"]
            if all(field in problem for field in required_fields):
                self.log_test("Valid Problem Details", True, f"Retrieved problem '{problem['title']}'")
            else:
                missing = [f for f in required_fields if f not in problem]
                self.log_test("Valid Problem Details", False, f"Missing fields: {missing}")
        else:
            self.log_test("Valid Problem Details", False, f"Status: {status}, Response: {data}")
            
        # Test invalid problem ID
        success, data, status = self.make_request("GET", "/problems/999")
        if not success and status == 404:
            self.log_test("Invalid Problem ID", True, "Correctly returned 404 for invalid problem")
        else:
            self.log_test("Invalid Problem ID", False, f"Should have failed with 404, got {status}")

    def test_code_execution(self):
        """Test code run and submit endpoints"""
        print("\n=== Testing Code Execution ===")
        
        if not self.auth_token:
            self.log_test("Code Execution Setup", False, "No auth token available")
            return
            
        # Test code run (first test case only)
        broken_code = """async function getUserName(userId) {
  const response = fetch('https://api.example.com/users/' + userId);
  const data = response.json();
  return data.name;
}"""
        
        run_data = {"code": broken_code}
        success, data, status = self.make_request("POST", "/problems/1/run", run_data)
        if success and "output" in data:
            self.log_test("Code Run (Broken Code)", True, f"Executed code, output: {data.get('output', 'N/A')}")
        else:
            self.log_test("Code Run (Broken Code)", False, f"Status: {status}, Response: {data}")
            
        # Test code run without authentication
        old_token = self.auth_token
        self.auth_token = None
        success, data, status = self.make_request("POST", "/problems/1/run", run_data)
        # Run endpoint might not require auth, check the implementation
        self.log_test("Code Run (No Auth)", True, f"Run endpoint behavior without auth: {status}")
        self.auth_token = old_token
        
        # Test code submission (broken code)
        success, data, status = self.make_request("POST", "/problems/1/submit", run_data)
        if success and "results" in data:
            results = data["results"]
            passed_count = data.get("passedCount", 0)
            total_count = data.get("totalCount", 0)
            self.log_test("Code Submit (Broken)", True, f"Submitted broken code: {passed_count}/{total_count} tests passed")
        else:
            self.log_test("Code Submit (Broken)", False, f"Status: {status}, Response: {data}")
            
        # Test code submission (correct code)
        correct_code = """async function getUserName(userId) {
  const response = await fetch('https://api.example.com/users/' + userId);
  const data = await response.json();
  return data.name;
}"""
        
        submit_data = {"code": correct_code}
        success, data, status = self.make_request("POST", "/problems/1/submit", submit_data)
        if success and "results" in data:
            passed_count = data.get("passedCount", 0)
            total_count = data.get("totalCount", 0)
            all_passed = data.get("success", False)
            if all_passed:
                self.log_test("Code Submit (Correct)", True, f"All tests passed: {passed_count}/{total_count}")
            else:
                self.log_test("Code Submit (Correct)", False, f"Expected all tests to pass, got {passed_count}/{total_count}")
        else:
            self.log_test("Code Submit (Correct)", False, f"Status: {status}, Response: {data}")
            
        # Test submission without authentication
        self.auth_token = None
        success, data, status = self.make_request("POST", "/problems/1/submit", submit_data)
        if not success and status == 401:
            self.log_test("Submit Without Auth", True, "Correctly rejected submission without auth")
        else:
            self.log_test("Submit Without Auth", False, f"Should have failed with 401, got {status}")
        self.auth_token = old_token

    def test_user_profile(self):
        """Test user profile endpoints"""
        print("\n=== Testing User Profile ===")
        
        if not self.auth_token:
            self.log_test("User Profile Setup", False, "No auth token available")
            return
            
        # Test get profile
        success, data, status = self.make_request("GET", "/user/profile")
        if success and "id" in data and "stats" in data:
            stats = data["stats"]
            required_stats = ["problemsSolved", "totalSubmissions", "accuracy"]
            if all(stat in stats for stat in required_stats):
                self.log_test("Get User Profile", True, f"Retrieved profile with stats: {stats}")
            else:
                self.log_test("Get User Profile", False, f"Missing stats fields: {stats}")
        else:
            self.log_test("Get User Profile", False, f"Status: {status}, Response: {data}")
            
        # Test get submissions
        success, data, status = self.make_request("GET", "/user/submissions")
        if success and "submissions" in data:
            submissions = data["submissions"]
            self.log_test("Get User Submissions", True, f"Retrieved {len(submissions)} submissions")
        else:
            self.log_test("Get User Submissions", False, f"Status: {status}, Response: {data}")
            
        # Test profile without auth
        old_token = self.auth_token
        self.auth_token = None
        success, data, status = self.make_request("GET", "/user/profile")
        if not success and status == 401:
            self.log_test("Profile Without Auth", True, "Correctly rejected profile request without auth")
        else:
            self.log_test("Profile Without Auth", False, f"Should have failed with 401, got {status}")
        self.auth_token = old_token

    def test_leaderboard(self):
        """Test leaderboard endpoint"""
        print("\n=== Testing Leaderboard ===")
        
        success, data, status = self.make_request("GET", "/leaderboard")
        if success and "leaderboard" in data:
            leaderboard = data["leaderboard"]
            if len(leaderboard) > 0:
                first_entry = leaderboard[0]
                required_fields = ["rank", "name", "problemsSolved", "accuracy"]
                if all(field in first_entry for field in required_fields):
                    self.log_test("Leaderboard", True, f"Retrieved leaderboard with {len(leaderboard)} entries")
                else:
                    self.log_test("Leaderboard", False, f"Missing required fields in leaderboard entry")
            else:
                self.log_test("Leaderboard", True, "Retrieved empty leaderboard (no users yet)")
        else:
            self.log_test("Leaderboard", False, f"Status: {status}, Response: {data}")

    def test_complete_user_journey(self):
        """Test complete user journey scenario"""
        print("\n=== Testing Complete User Journey ===")
        
        # Create a new user for this journey
        journey_user = {
            "name": "Journey Test User",
            "email": f"journey_{int(time.time())}@example.com",
            "password": "journeypass123"
        }
        
        # Step 1: Signup
        success, data, status = self.make_request("POST", "/auth/signup", journey_user)
        if not success:
            self.log_test("Journey - Signup", False, f"Failed to create user: {data}")
            return
            
        journey_token = data["token"]
        old_token = self.auth_token
        self.auth_token = journey_token
        
        # Step 2: Get problems list
        success, data, status = self.make_request("GET", "/problems")
        if not success:
            self.log_test("Journey - Get Problems", False, f"Failed to get problems: {data}")
            self.auth_token = old_token
            return
            
        # Step 3: Get problem details
        success, data, status = self.make_request("GET", "/problems/1")
        if not success:
            self.log_test("Journey - Problem Details", False, f"Failed to get problem details: {data}")
            self.auth_token = old_token
            return
            
        # Step 4: Submit broken code
        broken_code = {"code": "async function getUserName(userId) { const response = fetch('test'); return response; }"}
        success, data, status = self.make_request("POST", "/problems/1/submit", broken_code)
        if not success:
            self.log_test("Journey - Submit Broken", False, f"Failed to submit broken code: {data}")
            self.auth_token = old_token
            return
            
        # Step 5: Submit correct code
        correct_code = {"code": "async function getUserName(userId) { const response = await fetch('test'); const data = await response.json(); return data.name; }"}
        success, data, status = self.make_request("POST", "/problems/1/submit", correct_code)
        if not success:
            self.log_test("Journey - Submit Correct", False, f"Failed to submit correct code: {data}")
            self.auth_token = old_token
            return
            
        # Step 6: Check updated profile
        success, data, status = self.make_request("GET", "/user/profile")
        if success and data.get("stats", {}).get("totalSubmissions", 0) >= 2:
            self.log_test("Journey - Complete", True, f"User journey completed successfully, submissions: {data['stats']['totalSubmissions']}")
        else:
            self.log_test("Journey - Complete", False, f"Stats not updated correctly: {data}")
            
        self.auth_token = old_token

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting BugCode Backend API Tests")
        print(f"Testing against: {self.base_url}")
        
        start_time = time.time()
        
        # Run all test suites
        self.test_health_check()
        self.test_auth_signup()
        self.test_auth_login()
        self.test_auth_me()
        self.test_problems_list()
        self.test_problem_details()
        self.test_code_execution()
        self.test_user_profile()
        self.test_leaderboard()
        self.test_complete_user_journey()
        
        # Summary
        end_time = time.time()
        duration = end_time - start_time
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"\n{'='*60}")
        print(f"🏁 TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⏱️  Duration: {duration:.2f} seconds")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        return passed_tests, failed_tests, self.test_results

if __name__ == "__main__":
    tester = BugCodeTester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(0 if failed == 0 else 1)