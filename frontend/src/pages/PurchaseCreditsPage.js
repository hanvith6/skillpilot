import React, { useState } from 'react';
import Layout from '../components/Layout';
import { CreditCard, Check, Zap, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

const PurchaseCreditsPage = ({ user, onLogout, updateCredits }) => {
  const [loading, setLoading] = useState('');
  const [Razorpay] = useRazorpay();

  const packages = [
    {
      id: 'starter_inr',
      name: 'Starter',
      credits: 100,
      price: 99,
      currency: 'INR',
      region: 'India',
      popular: false
    },
    {
      id: 'pro_inr',
      name: 'Pro',
      credits: 300,
      price: 249,
      currency: 'INR',
      region: 'India',
      popular: true
    },
    {
      id: 'unlimited_inr',
      name: 'Unlimited',
      credits: 600,
      price: 299,
      currency: 'INR',
      region: 'India',
      popular: false
    },
    {
      id: 'starter_usd',
      name: 'Starter',
      credits: 100,
      price: 4,
      currency: 'USD',
      region: 'Global',
      popular: false
    },
    {
      id: 'pro_usd',
      name: 'Pro',
      credits: 300,
      price: 5,
      currency: 'USD',
      region: 'Global',
      popular: true
    },
    {
      id: 'unlimited_usd',
      name: 'Unlimited',
      credits: 600,
      price: 6,
      currency: 'USD',
      region: 'Global',
      popular: false
    }
  ];

  const handleRazorpayPurchase = async (packageId) => {
    setLoading(packageId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/payments/razorpay/create-order`,
        { package_id: packageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: response.data.key_id,
        amount: response.data.amount,
        currency: response.data.currency,
        order_id: response.data.order_id,
        name: 'SkillMate AI',
        description: `Purchase ${packages.find(p => p.id === packageId).credits} Credits`,
        handler: async (razorpayResponse) => {
          try {
            await axios.post(
              `${API_URL}/api/payments/razorpay/verify`,
              {
                order_id: razorpayResponse.razorpay_order_id,
                payment_id: razorpayResponse.razorpay_payment_id,
                signature: razorpayResponse.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            toast.success('Credits added successfully!');
            const userRes = await axios.get(`${API_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            updateCredits(userRes.data.credits);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#7C3AED'
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment failed');
    } finally {
      setLoading('');
    }
  };

  const handleStripePurchase = async (packageId) => {
    setLoading(packageId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/payments/stripe/create-checkout`,
        { package_id: packageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment failed');
      setLoading('');
    }
  };

  const indiaPackages = packages.filter(p => p.currency === 'INR');
  const globalPackages = packages.filter(p => p.currency === 'USD');

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="purchase-title">Purchase Credits</h1>
          <p className="text-slate-400">Choose a package and boost your productivity</p>
        </div>

        {/* India Pricing */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-violet-400" />
              <h2 className="text-2xl font-bold text-white">India Pricing</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {indiaPackages.map((pkg) => (
              <div key={pkg.id} className={`glass-effect rounded-xl p-6 border ${pkg.popular ? 'border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-transparent' : 'border-white/10'} relative`} data-testid={`package-${pkg.id}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-violet-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="text-4xl font-bold text-violet-400 mb-4">₹{pkg.price}</div>
                <div className="text-slate-400 mb-6">{pkg.credits} Credits</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    All AI tools
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    PDF & DOCX downloads
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    Emergent Mode
                  </li>
                </ul>
                <Button
                  onClick={() => handleRazorpayPurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full ${pkg.popular ? 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white glow-violet' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                  data-testid={`buy-${pkg.id}`}
                >
                  {loading === pkg.id ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Pricing */}
        <div>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Global Pricing</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {globalPackages.map((pkg) => (
              <div key={pkg.id} className={`glass-effect rounded-xl p-6 border ${pkg.popular ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-transparent' : 'border-white/10'} relative`} data-testid={`package-${pkg.id}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="text-4xl font-bold text-blue-400 mb-4">${pkg.price}</div>
                <div className="text-slate-400 mb-6">{pkg.credits} Credits</div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    All AI tools
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    PDF & DOCX downloads
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    Emergent Mode
                  </li>
                </ul>
                <Button
                  onClick={() => handleStripePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full ${pkg.popular ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white glow-emerald' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                  data-testid={`buy-${pkg.id}`}
                >
                  {loading === pkg.id ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PurchaseCreditsPage;
