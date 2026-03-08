import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ReferralSection from '../components/ReferralSection';
import { FileText, Lightbulb, Languages, MessageCircle, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

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

  const CHART_COLORS = { resume: '#8b5cf6', project: '#ec4899', english: '#3b82f6', interview: '#10b981' };
  const CHART_LABELS = { resume: 'Resume', project: 'Project', english: 'English', interview: 'Interview' };

  const chartData = stats?.breakdown ? Object.entries(stats.breakdown).map(([key, value]) => ({
    name: CHART_LABELS[key] || key,
    value,
    color: CHART_COLORS[key] || '#6b7280',
  })) : [];

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

    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

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

        {/* Credit Usage Chart */}
        {chartData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Credit Usage</h2>
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        formatter={(value, name) => [`${value} uses`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-300">{item.name}</span>
                      <span className="text-sm text-slate-500 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
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
              {history.map((item, index) => (
                <div key={item.id || index} className="glass-effect glass-effect-hover rounded-xl p-4 border border-white/10" data-testid={`history-item-${index}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{item.title}</h4>
                        <div className="flex items-center space-x-3 text-sm text-slate-400">
                          <span>{item.type}</span>
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">{item.credits_used} credits</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
