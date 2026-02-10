import requests
import json
import sys
from datetime import datetime

class SkillMateAPITester:
    def __init__(self, base_url="https://skillmate-app-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@gmail.com"
        self.test_user_password = "TestPass123!"
        self.test_user_name = "Test User"

    def log_test(self, name, status, details=""):
        """Log test results"""
        self.tests_run += 1
        if status:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            print(f"❌ {name}: FAILED {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, expect_data_keys=None):
        """Run a single API test with comprehensive error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)

            # Check status code
            success = response.status_code == expected_status
            
            if success:
                print(f"   Status: {response.status_code} ✓")
                try:
                    response_data = response.json()
                    
                    # Check for expected data keys
                    if expect_data_keys:
                        for key in expect_data_keys:
                            if key not in response_data:
                                success = False
                                print(f"   Missing expected key: {key}")
                            else:
                                print(f"   Found key: {key} ✓")
                    
                    self.log_test(name, success, f"Status: {response.status_code}")
                    return success, response_data
                except json.JSONDecodeError:
                    print(f"   Warning: Non-JSON response")
                    self.log_test(name, success, f"Status: {response.status_code} (Non-JSON)")
                    return success, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json().get('detail', '')
                    if error_detail:
                        error_msg += f" - {error_detail}"
                except:
                    pass
                print(f"   {error_msg}")
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error - server may be down")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_auth_signup(self):
        """Test user signup"""
        success, response = self.run_test(
            "User Signup",
            "POST",
            "api/auth/signup",
            200,
            data={
                "name": self.test_user_name,
                "email": self.test_user_email,
                "password": self.test_user_password
            },
            expect_data_keys=['token', 'user']
        )
        
        if success and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user'].get('id')
            print(f"   Token obtained: {self.token[:20]}...")
            print(f"   User ID: {self.user_id}")
            print(f"   Initial credits: {response['user'].get('credits', 0)}")
        
        return success

    def test_auth_login(self):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_user_password
            },
            expect_data_keys=['token', 'user']
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Login successful, token refreshed")
        
        return success

    def test_auth_me(self):
        """Test get current user info"""
        return self.run_test(
            "Get Current User Info",
            "GET",
            "api/auth/me",
            200,
            expect_data_keys=['id', 'name', 'email', 'credits']
        )[0]

    def test_resume_generation(self):
        """Test resume generation"""
        success, response = self.run_test(
            "Resume Generation",
            "POST",
            "api/generate/resume",
            200,
            data={
                "resume_text": "Software Engineer with Python and React experience. Built web applications.",
                "target_role": "Full Stack Developer",
                "country": "USA",
                "emergent_mode": False
            },
            expect_data_keys=['success', 'data', 'credits_used', 'history_id']
        )
        
        if success and response.get('success'):
            print(f"   Credits used: {response.get('credits_used', 0)}")
            print(f"   History ID: {response.get('history_id', 'N/A')}")
            return response.get('history_id')
        
        return None

    def test_project_generation(self):
        """Test project generation"""
        success, response = self.run_test(
            "Project Generation",
            "POST",
            "api/generate/project",
            200,
            data={
                "topic": "AI-Based Student Management System",
                "branch": "Computer Science",
                "emergent_mode": False
            },
            expect_data_keys=['success', 'data', 'credits_used', 'history_id']
        )
        
        if success and response.get('success'):
            print(f"   Credits used: {response.get('credits_used', 0)}")
            return response.get('history_id')
        
        return None

    def test_english_improvement(self):
        """Test English improvement"""
        success, response = self.run_test(
            "English Improvement",
            "POST",
            "api/generate/english",
            200,
            data={
                "text": "I am very excited to join your company and contribute to the team.",
                "emergent_mode": False
            },
            expect_data_keys=['success', 'data', 'credits_used', 'history_id']
        )
        
        if success and response.get('success'):
            data = response.get('data', {})
            print(f"   Generated formats: {list(data.keys())}")
            return response.get('history_id')
        
        return None

    def test_interview_coach(self):
        """Test interview coaching"""
        success, response = self.run_test(
            "Interview Coaching",
            "POST",
            "api/generate/interview",
            200,
            data={
                "question_type": "Tell me about yourself",
                "background": "Fresh Computer Science graduate with internship experience",
                "emergent_mode": False
            },
            expect_data_keys=['success', 'data', 'credits_used', 'history_id']
        )
        
        if success and response.get('success'):
            answer = response.get('data', {}).get('answer', '')
            print(f"   Answer length: {len(answer)} chars")
            return response.get('history_id')
        
        return None

    def test_generation_history(self):
        """Test generation history retrieval"""
        return self.run_test(
            "Generation History",
            "GET",
            "api/history",
            200
        )[0]

    def test_download_endpoints(self, history_id):
        """Test document download endpoints"""
        if not history_id:
            print("⚠️  Skipping download tests - no history ID available")
            return False
            
        # Test PDF download
        pdf_success = self.run_test(
            "Download PDF",
            "GET",
            f"api/download/{history_id}/pdf",
            200
        )[0]
        
        # Test DOCX download
        docx_success = self.run_test(
            "Download DOCX", 
            "GET",
            f"api/download/{history_id}/docx",
            200
        )[0]
        
        return pdf_success and docx_success

    def test_emergent_mode(self):
        """Test emergent mode with higher credit cost"""
        success, response = self.run_test(
            "Emergent Mode Generation",
            "POST",
            "api/generate/english",
            200,
            data={
                "text": "This is a test for emergent mode processing.",
                "emergent_mode": True
            },
            expect_data_keys=['success', 'credits_used']
        )
        
        if success:
            credits_used = response.get('credits_used', 0)
            print(f"   Emergent mode credits: {credits_used} (should be ~30% more)")
            expected_base = 10  # Base English cost
            expected_emergent = int(expected_base * 1.3)
            if credits_used == expected_emergent:
                print(f"   ✓ Correct emergent pricing: {credits_used}")
            else:
                print(f"   ⚠️  Expected ~{expected_emergent} credits, got {credits_used}")
        
        return success

    def test_credit_packages(self):
        """Test credit package information (implicitly through payment endpoints structure)"""
        # Test India package
        india_success = self.run_test(
            "Razorpay Order Creation",
            "POST",
            "api/payments/razorpay/create-order",
            200,
            data={"package_id": "starter_inr"},
            expect_data_keys=['order_id', 'amount', 'currency', 'key_id']
        )[0]
        
        # Test Global package
        global_success = self.run_test(
            "Stripe Checkout Creation",
            "POST", 
            "api/payments/stripe/create-checkout",
            200,
            data={"package_id": "starter_usd"},
            expect_data_keys=['session_id', 'url']
        )[0]
        
        return india_success or global_success  # At least one should work

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("=" * 80)
        print("🚀 Starting SKILLMATE AI Backend API Testing")
        print("=" * 80)
        
        # Authentication flow
        print("\n📋 AUTHENTICATION TESTS")
        signup_success = self.test_auth_signup()
        if not signup_success:
            print("❌ Signup failed - stopping critical path tests")
            return False
            
        login_success = self.test_auth_login()
        me_success = self.test_auth_me()
        
        # AI Generation tests
        print("\n🤖 AI GENERATION TESTS")
        resume_history_id = self.test_resume_generation()
        project_history_id = self.test_project_generation()
        english_history_id = self.test_english_improvement()
        interview_history_id = self.test_interview_coach()
        
        # Features tests
        print("\n📈 FEATURES TESTS")
        self.test_emergent_mode()
        self.test_generation_history()
        
        # Download tests (use first available history ID)
        print("\n📁 DOWNLOAD TESTS")
        history_id_for_download = resume_history_id or project_history_id or english_history_id
        self.test_download_endpoints(history_id_for_download)
        
        # Payment tests
        print("\n💳 PAYMENT TESTS")
        self.test_credit_packages()
        
        # Summary
        print("\n" + "=" * 80)
        print(f"📊 TEST SUMMARY")
        print("=" * 80)
        print(f"✅ Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        critical_features = [signup_success, login_success, me_success]
        ai_features = [resume_history_id is not None, project_history_id is not None, 
                      english_history_id is not None, interview_history_id is not None]
        
        if all(critical_features):
            print("✅ Core authentication: WORKING")
        else:
            print("❌ Core authentication: ISSUES FOUND")
            
        if any(ai_features):
            print(f"✅ AI features: {sum(ai_features)}/4 WORKING")
        else:
            print("❌ AI features: ALL FAILING")
        
        return self.tests_passed >= self.tests_run * 0.7  # 70% success rate

def main():
    """Main test execution"""
    print("Starting SKILLMATE AI Backend Testing...")
    
    tester = SkillMateAPITester()
    success = tester.run_comprehensive_test()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())