import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage = () => (
  <div className="min-h-screen bg-[#020617] text-slate-300 px-4 py-10">
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center text-violet-400 hover:text-violet-300 mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Terms and Conditions</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 9, 2026</p>

      <section className="space-y-6 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2>
          <p>Welcome to SkillPilot ("we", "our", "us"). By accessing or using our website at skillspilot.xyz and our services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">2. Services</h2>
          <p>SkillPilot is an AI-powered engineering companion that provides tools including Resume Builder, Project Generator, English Improver, and Interview Coach. Users purchase credits to access these services.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">3. User Accounts</h2>
          <p>You must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">4. Credits and Payments</h2>
          <p>Credits are purchased through our payment partner Razorpay (for India) or Stripe (for global users). Credits are non-transferable and tied to your account. Pricing is displayed based on your geographic location.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">5. Acceptable Use</h2>
          <p>You agree not to misuse our services, including but not limited to: using VPN/proxy to manipulate pricing, attempting to reverse-engineer the platform, generating harmful or illegal content, or reselling credits or generated content commercially without permission.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">6. Intellectual Property</h2>
          <p>Content generated through our AI tools is provided for your personal use. The SkillPilot platform, branding, and underlying technology remain our intellectual property.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">7. Limitation of Liability</h2>
          <p>SkillPilot provides AI-generated content on an "as-is" basis. We do not guarantee the accuracy, completeness, or suitability of any generated content. We are not liable for any damages arising from the use of our services.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">8. Termination</h2>
          <p>We reserve the right to suspend or terminate your account if you violate these terms. Upon termination, unused credits will be forfeited.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">9. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">10. Contact</h2>
          <p>For questions about these terms, contact us at support@skillspilot.xyz.</p>
        </div>
      </section>
    </div>
  </div>
);

export default TermsPage;
