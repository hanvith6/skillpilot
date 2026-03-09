import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RefundPolicyPage = () => (
  <div className="min-h-screen bg-[#020617] text-slate-300 px-4 py-10">
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center text-violet-400 hover:text-violet-300 mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Refund Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 9, 2026</p>

      <section className="space-y-6 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">1. Credit Purchases</h2>
          <p>All credit purchases on SkillPilot are final. Credits are digital goods delivered instantly upon successful payment and are available for immediate use.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">2. Eligibility for Refund</h2>
          <p>Refunds may be considered in the following cases:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Duplicate or accidental payment (same transaction charged twice)</li>
            <li>Payment was charged but credits were not added to your account</li>
            <li>Technical issues on our end that prevented you from using purchased credits</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">3. Non-Refundable Cases</h2>
          <p>Refunds will not be provided in the following cases:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Credits that have already been used (fully or partially)</li>
            <li>Dissatisfaction with AI-generated content quality</li>
            <li>Change of mind after purchase</li>
            <li>Account suspension due to terms of service violation</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">4. How to Request a Refund</h2>
          <p>To request a refund, email us at support@skillspilot.xyz with your registered email address, transaction/order ID, date of purchase, and reason for the refund request. We will review your request within 5-7 business days.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">5. Refund Processing</h2>
          <p>Approved refunds will be processed to the original payment method within 7-10 business days. The refund amount will be in the same currency as the original transaction.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">6. Contact</h2>
          <p>For refund-related queries, contact us at support@skillspilot.xyz.</p>
        </div>
      </section>
    </div>
  </div>
);

export default RefundPolicyPage;
