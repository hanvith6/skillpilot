import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { CreditCard, Check, Zap, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useRazorpay } from 'react-razorpay';
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const detectRegion = () => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return 'india';
  const lang = navigator.language;
  if (lang === 'hi' || lang === 'hi-IN' || lang === 'en-IN') return 'india';
  return 'global';
};

const PurchaseCreditsPage = ({ user, onLogout, updateCredits }) => {
  const [loading, setLoading] = useState('');
  const detectedRegion = useMemo(() => detectRegion(), []);
  const [activeTab, setActiveTab] = useState(detectedRegion);
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

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to continue');
      return null;
    }
    return session.access_token;
  };

  const handleRazorpayPurchase = async (packageId) => {
    setLoading(packageId);
    try {
      const token = await getToken();
      if (!token) return;

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
            const freshToken = await getToken();
            await axios.post(
              `${API_URL}/api/payments/razorpay/verify`,
              {
                order_id: razorpayResponse.razorpay_order_id,
                payment_id: razorpayResponse.razorpay_payment_id,
                signature: razorpayResponse.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${freshToken}` } }
            );

            toast.success('Credits added successfully!');
            const userRes = await axios.get(`${API_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${freshToken}` }
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
      const token = await getToken();
      if (!token) return;

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

  const renderPackages = (pkgs, handler, accentColor, glowClass) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {pkgs.map((pkg) => (
        <div key={pkg.id} className={`glass-effect rounded-xl p-6 border ${pkg.popular ? `border-${accentColor}-500/50 bg-gradient-to-br from-${accentColor}-500/10 to-transparent` : 'border-white/10'} relative`} data-testid={`package-${pkg.id}`}>
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className={`bg-gradient-to-r from-${accentColor}-600 to-${accentColor}-700 text-white text-xs font-bold px-3 py-1 rounded-full`}>
                POPULAR
              </span>
            </div>
          )}
          <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
          <div className={`text-4xl font-bold text-${accentColor}-400 mb-4`}>
            {pkg.currency === 'INR' ? `₹${pkg.price}` : `$${pkg.price}`}
          </div>
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
              Premium Mode
            </li>
          </ul>
          <Button
            onClick={() => handler(pkg.id)}
            disabled={loading === pkg.id}
            className={`w-full ${pkg.popular ? `bg-gradient-to-r from-${accentColor}-600 to-${accentColor}-700 hover:from-${accentColor}-700 hover:to-${accentColor}-800 text-white ${glowClass}` : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
            data-testid={`buy-${pkg.id}`}
          >
            {loading === pkg.id ? 'Processing...' : 'Buy Now'}
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="purchase-title">Purchase Credits</h1>
          <p className="text-slate-400">Choose a package and boost your productivity</p>
        </div>

        {/* Region Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-effect rounded-lg p-1 border border-white/10 inline-flex">
            <button
              onClick={() => setActiveTab('india')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'india' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
              data-testid="tab-india"
            >
              India (INR)
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'global' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              data-testid="tab-global"
            >
              Global (USD)
            </button>
          </div>
        </div>

        {/* India Pricing */}
        {activeTab === 'india' && (
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-violet-400" />
                <h2 className="text-2xl font-bold text-white">India Pricing</h2>
              </div>
            </div>
            {renderPackages(indiaPackages, handleRazorpayPurchase, 'violet', 'glow-violet')}
          </div>
        )}

        {/* Global Pricing */}
        {activeTab === 'global' && (
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Global Pricing</h2>
              </div>
            </div>
            {renderPackages(globalPackages, handleStripePurchase, 'blue', 'glow-emerald')}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PurchaseCreditsPage;
