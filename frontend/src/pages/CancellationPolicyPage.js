import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CancellationPolicyPage = () => (
  <div className="min-h-screen bg-[#020617] text-slate-300 px-4 py-10">
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center text-violet-400 hover:text-violet-300 mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Cancellation Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 9, 2026</p>

      <section className="space-y-6 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">1. Credit-Based Model</h2>
          <p>SkillPilot operates on a credit-based system, not a subscription model. You purchase credits as needed — there are no recurring charges or subscriptions to cancel.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">2. No Recurring Payments</h2>
          <p>Each credit purchase is a one-time transaction. You will not be charged again unless you initiate another purchase. There is no auto-renewal or recurring billing.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">3. Order Cancellation</h2>
          <p>Since credits are delivered instantly upon successful payment, orders cannot be cancelled after payment is completed. If a payment fails or is interrupted, no credits will be added and no charge will be applied.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">4. Account Deletion</h2>
          <p>You may request deletion of your account at any time by contacting us at support@skillspilot.xyz. Please note that any remaining unused credits will be forfeited upon account deletion and cannot be refunded.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">5. Service Discontinuation</h2>
          <p>In the unlikely event that SkillPilot discontinues its services, we will provide reasonable notice and make efforts to allow users to utilize their remaining credits before shutdown.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-2">6. Contact</h2>
          <p>For any questions about cancellation, contact us at support@skillspilot.xyz.</p>
        </div>
      </section>
    </div>
  </div>
);

export default CancellationPolicyPage;
