import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { CreditCard, Check, Zap, Globe, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useRazorpay } from 'react-razorpay';
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PurchaseCreditsPage = ({ user, onLogout, updateCredits }) => {
  const [loading, setLoading] = useState('');
  const { Razorpay } = useRazorpay();
  const [geoData, setGeoData] = useState(null);
  const [geoLoading, setGeoLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/geo/detect`);
        setGeoData(res.data);
      } catch {
        setGeoData({ region: 'global', is_vpn: false, country_code: 'UNKNOWN' });
      } finally {
        setGeoLoading(false);
      }
    };
    detectLocation();
  }, []);

  const packages = [
    {
      id: 'starter_inr',
      name: 'Starter',
      credits: 100,
      price: 99,
      currency: 'INR',
      symbol: '₹',
      popular: false
    },
    {
      id: 'pro_inr',
      name: 'Pro',
      credits: 300,
      price: 249,
      currency: 'INR',
      symbol: '₹',
      popular: true
    },
    {
      id: 'unlimited_inr',
      name: 'Unlimited',
      credits: 600,
      price: 299,
      currency: 'INR',
      symbol: '₹',
      popular: false
    },
    {
      id: 'starter_usd',
      name: 'Starter',
      credits: 100,
      price: 4,
      currency: 'USD',
      symbol: '$',
      popular: false
    },
    {
      id: 'pro_usd',
      name: 'Pro',
      credits: 300,
      price: 5,
      currency: 'USD',
      symbol: '$',
      popular: true
    },
    {
      id: 'unlimited_usd',
      name: 'Unlimited',
      credits: 600,
      price: 6,
      currency: 'USD',
      symbol: '$',
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

  const handlePurchase = async (packageId) => {
    setLoading(packageId);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios.post(
        `${API_URL}/api/payments/razorpay/create-order`,
        { package_id: packageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const pkg = packages.find(p => p.id === packageId);

      const options = {
        key: response.data.key_id,
        amount: response.data.amount,
        currency: response.data.currency,
        order_id: response.data.order_id,
        name: 'SkillPilot',
        image: `${window.location.origin}/favicon.svg`,
        description: `Purchase ${pkg.credits} Credits`,
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

  const indiaPackages = packages.filter(p => p.currency === 'INR');
  const globalPackages = packages.filter(p => p.currency === 'USD');

  const ACCENT_STYLES = {
    violet: {
      border: 'border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-transparent',
      badge: 'bg-gradient-to-r from-violet-600 to-violet-700',
      price: 'text-violet-400',
      btn: 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white glow-violet',
    },
    blue: {
      border: 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-transparent',
      badge: 'bg-gradient-to-r from-blue-600 to-blue-700',
      price: 'text-blue-400',
      btn: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white glow-emerald',
    },
  };

  const renderPackages = (pkgs, accentColor) => {
    const styles = ACCENT_STYLES[accentColor];
    return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {pkgs.map((pkg) => (
        <div key={pkg.id} className={`glass-effect rounded-xl p-6 border ${pkg.popular ? styles.border : 'border-white/10'} relative`} data-testid={`package-${pkg.id}`}>
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className={`${styles.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                POPULAR
              </span>
            </div>
          )}
          <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
          <div className={`text-4xl font-bold ${styles.price} mb-4`}>
            {pkg.symbol}{pkg.price}
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
            onClick={() => handlePurchase(pkg.id)}
            disabled={!!loading}
            className={`w-full ${pkg.popular ? styles.btn : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
            data-testid={`buy-${pkg.id}`}
          >
            {loading === pkg.id ? 'Processing...' : 'Buy Now'}
          </Button>
        </div>
      ))}
    </div>
    );
  };

  if (geoLoading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (geoData?.is_vpn) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">VPN/Proxy Detected</h2>
          <p className="text-slate-400 max-w-md">
            Please disable your VPN or proxy to access the purchase page. We need to verify your location to show the correct pricing.
          </p>
        </div>
      </Layout>
    );
  }

  const isIndia = geoData?.region === 'india';

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="purchase-title">Purchase Credits</h1>
          <p className="text-slate-400">Choose a package and boost your productivity</p>
        </div>

        {isIndia ? (
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-violet-400" />
                <h2 className="text-2xl font-bold text-white">India Pricing</h2>
              </div>
            </div>
            {renderPackages(indiaPackages, 'violet')}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Global Pricing</h2>
              </div>
            </div>
            {renderPackages(globalPackages, 'blue')}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PurchaseCreditsPage;
