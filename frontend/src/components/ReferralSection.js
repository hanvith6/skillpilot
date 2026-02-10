import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Users, Coins, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ReferralSection = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/referrals/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = `${window.location.origin}/auth?ref=${user.referral_code}`;

  const handleShare = (platform) => {
    const message = `Join me on SkillMate AI and get 120 FREE credits to build resumes, projects & more! Use my code: ${user.referral_code}`;
    
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Invite Friends, Earn Credits!</h3>
          <p className="text-sm text-slate-400">Get 50 credits for each friend who signs up</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-effect rounded-lg p-4 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-slate-400">Total Referrals</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.total_referrals || 0}</div>
        </div>
        <div className="glass-effect rounded-lg p-4 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-slate-400">Credits Earned</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.credits_earned || 0}</div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="text-sm text-slate-400 mb-2 block">Your Referral Code</label>
        <div className="flex space-x-2">
          <Input
            value={user.referral_code}
            readOnly
            className="bg-slate-950/50 border-white/10 text-white font-mono text-lg"
            data-testid="referral-code-display"
          />
          <Button
            onClick={handleCopy}
            className="bg-violet-600 hover:bg-violet-700"
            data-testid="copy-referral-button"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="mb-6">
        <label className="text-sm text-slate-400 mb-2 block">Share via</label>
        <div className="flex space-x-2">
          <Button
            onClick={() => handleShare('whatsapp')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            data-testid="share-whatsapp"
          >
            <Share2 className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={() => handleShare('twitter')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            data-testid="share-twitter"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Twitter
          </Button>
          <Button
            onClick={() => handleShare('telegram')}
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
            data-testid="share-telegram"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Telegram
          </Button>
        </div>
      </div>

      {/* How it Works */}
      <div className="glass-effect rounded-lg p-4 border border-white/5 bg-gradient-to-br from-violet-500/10 to-transparent">
        <h4 className="text-sm font-semibold text-white mb-2">How it works</h4>
        <ul className="space-y-1 text-sm text-slate-400">
          <li>• Share your referral code with friends</li>
          <li>• They sign up and get 120 credits (100 + 20 bonus)</li>
          <li>• You earn 50 credits for each successful referral</li>
          <li>• No limit on referrals - invite unlimited friends!</li>
        </ul>
      </div>

      {/* Recent Referrals */}
      {stats?.recent_referrals && stats.recent_referrals.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-white mb-3">Recent Referrals</h4>
          <div className="space-y-2">
            {stats.recent_referrals.slice(0, 5).map((ref, index) => (
              <div key={index} className="flex items-center justify-between glass-effect rounded-lg p-3 border border-white/5">
                <span className="text-sm text-slate-300">{ref.referred_user_name || 'New User'}</span>
                <span className="text-xs text-emerald-400">+{ref.credits_awarded} credits</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralSection;
