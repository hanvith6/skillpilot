import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-[#020617] text-slate-300 px-4 py-10">
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center text-violet-400 hover:text-violet-300 mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 9, 2026</p>

      <section className="space-y-6 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2>
          <p>We collect information you provide during registration (name, email), payment information processed securely through Razorpay/Stripe, usage data related to our AI tools, and IP address for geo-location based pricing.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve our services, process payments, communicate service updates, detect and prevent fraud, and determine regional pricing through IP-based location detection.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">3. Data Storage and Security</h2>
          <p>Your data is stored securely using Supabase (PostgreSQL). We use industry-standard encryption and security measures. Payment information is processed by Razorpay/Stripe and is never stored on our servers.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">4. Third-Party Services</h2>
          <p>We use the following third-party services: Supabase for authentication and data storage, Razorpay and Stripe for payment processing, Google AI (Gemini) for content generation, and ip-api.com for location detection.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">5. Cookies</h2>
          <p>We use essential cookies for authentication and session management. No third-party tracking cookies are used.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">6. Your Rights</h2>
          <p>You have the right to access your personal data, request correction of inaccurate data, request deletion of your account and associated data, and opt out of non-essential communications.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">7. Data Retention</h2>
          <p>We retain your data for as long as your account is active. Upon account deletion, your personal data will be removed within 30 days, except where required by law.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">8. Children's Privacy</h2>
          <p>Our services are not intended for users under 13 years of age. We do not knowingly collect personal data from children.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">9. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or through the platform.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">10. Contact</h2>
          <p>For privacy-related questions or data requests, contact us at support@skillspilot.xyz.</p>
        </div>
      </section>
    </div>
  </div>
);

export default PrivacyPolicyPage;
