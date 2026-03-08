import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ReferralSection from '../components/ReferralSection';
import { FileText, Lightbulb, Languages, MessageCircle, ArrowRight, Zap, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TOOL_CONFIG = {
  Resume: { icon: FileText, color: 'text-violet-400', bg: 'bg-violet-500/20', barColor: 'bg-gradient-to-r from-violet-500 to-violet-600', label: 'Resume' },
  Project: { icon: Lightbulb, color: 'text-pink-400', bg: 'bg-pink-500/20', barColor: 'bg-gradient-to-r from-pink-500 to-pink-600', label: 'Project' },
  English: { icon: Languages, color: 'text-blue-400', bg: 'bg-blue-500/20', barColor: 'bg-gradient-to-r from-blue-500 to-blue-600', label: 'English' },
  Interview: { icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600', label: 'Interview' },
};

const DashboardPage = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await axios.get(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setHistory(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await axios.get(`${API_URL}/api/history/stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const tools = [
    {
      title: 'Resume Builder',
      description: 'Create ATS-optimized resumes',
      icon: FileText,
      link: '/resume-builder',
      gradient: 'from-violet-500/20 to-purple-500/20',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400',
      credits: 5
    },
    {
      title: 'Project Generator',
      description: 'Generate project reports',
      icon: Lightbulb,
      link: '/project-generator',
      gradient: 'from-pink-500/20 to-rose-500/20',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400',
      credits: 8
    },
    {
      title: 'English Improver',
      description: 'Polish your communication',
      icon: Languages,
      link: '/english-improver',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      credits: 2
    },
    {
      title: 'Interview Coach',
      description: 'Prepare for interviews',
      icon: MessageCircle,
      link: '/interview-coach',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      credits: 3
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Build chart data from stats breakdown
  const breakdown = stats?.breakdown || {};
  const totalUses = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="dashboard-title">Welcome back, {user?.name}!</h1>
          <p className="text-slate-400">Let's create something amazing today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Available Credits</span>
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white" data-testid="dashboard-credits">{user?.credits || 0}</div>
            <Link to="/purchase">
              <Button variant="link" className="text-violet-400 hover:text-violet-300 p-0 mt-2" data-testid="dashboard-buy-credits">
                Buy more credits <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Total Generations</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats?.total_generations ?? history.length}</div>
            <Link to="/history">
              <Button variant="link" className="text-violet-400 hover:text-violet-300 p-0 mt-2" data-testid="dashboard-view-history">
                View all history <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Credits Used</span>
              <FileText className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats?.total_credits_used ?? history.reduce((sum, h) => sum + (h.credits_used || 0), 0)}</div>
            <p className="text-slate-500 text-sm mt-2">Across all tools</p>
          </div>
        </div>

        {/* Credit Usage Breakdown */}
        {totalUses > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Credit Usage</h2>
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="space-y-4">
                {Object.entries(TOOL_CONFIG).map(([key, config]) => {
                  const count = breakdown[key] || 0;
                  const percentage = totalUses > 0 ? (count / totalUses) * 100 : 0;
                  const Icon = config.icon;
                  return (
                    <div key={key} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <span className="text-sm font-medium text-slate-200">{config.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400">{count} {count === 1 ? 'use' : 'uses'}</span>
                          <span className="text-xs text-slate-500 w-12 text-right">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${config.barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(percentage, percentage > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {stats?.most_used_tool && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <p className="text-sm text-slate-400">
                    Most used: <span className="text-white font-medium">{stats.most_used_tool}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Access Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">AI Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link key={index} to={tool.link} data-testid={`tool-card-${index}`}>
                  <div className={`glass-effect glass-effect-hover rounded-xl p-6 border border-white/10 bg-gradient-to-br ${tool.gradient} hover:-translate-y-1 transition-all duration-300 h-full`}>
                    <div className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center mb-4`}>
                      <Icon className={`${tool.iconColor} w-6 h-6`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{tool.title}</h3>
                    <p className="text-slate-400 text-sm mb-3">{tool.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{tool.credits} credits</span>
                      <ArrowRight className="w-4 h-4 text-violet-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Referral Section */}
        <div className="mb-8">
          <ReferralSection user={user} />
        </div>

        {/* Recent History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <Link to="/history">
              <Button variant="ghost" className="text-violet-400 hover:text-violet-300 hover:bg-white/5" data-testid="view-all-history-button">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="glass-effect rounded-xl p-8 border border-white/10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="glass-effect rounded-xl p-8 border border-white/10 text-center">
              <p className="text-slate-400">No activity yet. Start by using one of the AI tools above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => {
                const config = TOOL_CONFIG[item.type] || TOOL_CONFIG.Resume;
                const Icon = config.icon;
                return (
                  <div
                    key={item.id || index}
                    className="glass-effect glass-effect-hover rounded-xl p-4 border border-white/10 cursor-pointer hover:border-white/20 transition-all duration-200"
                    data-testid={`history-item-${index}`}
                    onClick={() => navigate(`/history?open=${item.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{item.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-slate-400">
                            <span className={config.color}>{config.label}</span>
                            <span>·</span>
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="text-sm text-slate-500">{item.credits_used} cr</span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
