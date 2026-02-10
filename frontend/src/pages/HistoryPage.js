import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { FileText, Lightbulb, Languages, MessageCircle, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HistoryPage = ({ user, onLogout }) => {
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
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Resume': return FileText;
      case 'Project': return Lightbulb;
      case 'English': return Languages;
      case 'Interview': return MessageCircle;
      default: return FileText;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="history-title">Generation History</h1>
          <p className="text-slate-400">All your AI-generated content in one place</p>
        </div>

        {loading ? (
          <div className="glass-effect rounded-xl p-8 border border-white/10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="glass-effect rounded-xl p-12 border border-white/10 text-center">
            <p className="text-slate-400 text-lg">No generation history yet. Start using our AI tools!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => {
              const Icon = getIcon(item.type);
              return (
                <div key={item.id || index} className="glass-effect glass-effect-hover rounded-xl p-5 border border-white/10" data-testid={`history-item-${index}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{item.title}</h4>
                        <div className="flex items-center space-x-3 text-sm text-slate-400">
                          <span>{item.type}</span>
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
                          <span>•</span>
                          <span>{item.credits_used} credits</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;
