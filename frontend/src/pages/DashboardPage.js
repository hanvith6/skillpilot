import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { FileText, Lightbulb, Languages, MessageCircle, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DashboardPage = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
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
      credits: 20
    },
    {
      title: 'Project Generator',
      description: 'Generate project reports',
      icon: Lightbulb,
      link: '/project-generator',
      gradient: 'from-pink-500/20 to-rose-500/20',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400',
      credits: 25
    },
    {
      title: 'English Improver',
      description: 'Polish your communication',
      icon: Languages,
      link: '/english-improver',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      credits: 10
    },
    {
      title: 'Interview Coach',
      description: 'Prepare for interviews',
      icon: MessageCircle,
      link: '/interview-coach',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      credits: 15
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
            <div className="text-3xl font-bold text-white">{history.length}</div>
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
            <div className="text-3xl font-bold text-white">{history.reduce((sum, h) => sum + (h.credits_used || 0), 0)}</div>
            <p className="text-slate-500 text-sm mt-2">Across all tools</p>
          </div>
        </div>

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
