import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { FileText, Lightbulb, Languages, MessageCircle, Download, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import useDownload from '../hooks/useDownload';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HistoryPage = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(null);
  const { download } = useDownload();
  const [searchParams] = useSearchParams();
  const openItemRef = useRef(null);
  const hasScrolled = useRef(false);

  const handleDownload = (historyId, format, type) => {
    download(historyId, format, type.toLowerCase());
  };

  const handleCopy = async (text, itemId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(itemId);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const getDocType = (type) => {
    switch (type) {
      case 'Resume': return 'resume';
      case 'Project': return 'project';
      case 'English': return 'english';
      case 'Interview': return 'interview';
      default: return 'document';
    }
  };

  const renderContentPreview = (item) => {
    const content = item.content;
    if (!content) return <p className="text-slate-400 text-sm">No content available</p>;

    switch (item.type) {
      case 'Resume':
        return (
          <div className="space-y-3">
            {content.summary && (
              <div>
                <h5 className="text-sm font-medium text-violet-400 mb-1">Summary</h5>
                <p className="text-slate-300 text-sm leading-relaxed">{content.summary}</p>
              </div>
            )}
            {content.skills && content.skills.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-violet-400 mb-1">Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {content.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'Project':
        return (
          <div className="space-y-3">
            {content.abstract && (
              <div>
                <h5 className="text-sm font-medium text-violet-400 mb-1">Abstract</h5>
                <p className="text-slate-300 text-sm leading-relaxed">{content.abstract}</p>
              </div>
            )}
            {content.problem_statement && (
              <div>
                <h5 className="text-sm font-medium text-violet-400 mb-1">Problem Statement</h5>
                <p className="text-slate-300 text-sm leading-relaxed">{content.problem_statement}</p>
              </div>
            )}
          </div>
        );
      case 'English':
        return (
          <div className="space-y-3">
            {content.formal && (
              <div>
                <h5 className="text-sm font-medium text-violet-400 mb-1">Formal</h5>
                <p className="text-slate-300 text-sm leading-relaxed">{content.formal}</p>
              </div>
            )}
            {content.semi_formal && (
              <div>
                <h5 className="text-sm font-medium text-violet-400 mb-1">Semi-Formal</h5>
                <p className="text-slate-300 text-sm leading-relaxed">{content.semi_formal}</p>
              </div>
            )}
            {content.simple && (
              <div>
                <h5 className="text-sm font-medium text-violet-400 mb-1">Simple</h5>
                <p className="text-slate-300 text-sm leading-relaxed">{content.simple}</p>
              </div>
            )}
          </div>
        );
      case 'Interview':
        return (
          <div className="space-y-3">
            {content.answer && (
              <div>
                <h5 className="text-sm font-medium text-violet-400 mb-1">Answer</h5>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{content.answer}</p>
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-slate-400 text-sm">Content preview not available for this type</p>;
    }
  };

  const getCopyText = (item) => {
    const content = item.content;
    if (!content) return '';
    if (item.type === 'English') {
      return [content.formal, content.semi_formal, content.simple].filter(Boolean).join('\n\n---\n\n');
    }
    if (item.type === 'Interview') {
      return content.answer || '';
    }
    return '';
  };

  useEffect(() => {
    fetchHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-expand item from URL param (e.g., ?open=uuid)
  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId && history.length > 0 && !hasScrolled.current) {
      setExpanded(openId);
      hasScrolled.current = true;
      // Scroll to the item after a brief delay for DOM render
      setTimeout(() => {
        if (openItemRef.current) {
          openItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [history, searchParams]);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await axios.get(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
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

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Resume': return { bg: 'bg-violet-500/20', color: 'text-violet-400' };
      case 'Project': return { bg: 'bg-pink-500/20', color: 'text-pink-400' };
      case 'English': return { bg: 'bg-blue-500/20', color: 'text-blue-400' };
      case 'Interview': return { bg: 'bg-emerald-500/20', color: 'text-emerald-400' };
      default: return { bg: 'bg-violet-500/20', color: 'text-violet-400' };
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
              const typeStyle = getTypeStyle(item.type);
              const isExpanded = expanded === item.id;
              const isDownloadable = item.type === 'Resume' || item.type === 'Project';
              const isCopyable = item.type === 'English' || item.type === 'Interview';
              return (
                <div key={item.id || index}
                  ref={item.id === searchParams.get('open') ? openItemRef : null}
                  className="glass-effect rounded-xl border border-white/10 overflow-hidden"
                  data-testid={`history-item-${index}`}
                >
                  <div
                    className="p-5 cursor-pointer glass-effect-hover"
                    onClick={() => setExpanded(isExpanded ? null : item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg ${typeStyle.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${typeStyle.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{item.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-slate-400">
                            <span className={typeStyle.color}>{item.type}</span>
                            <span>•</span>
                            <span>{formatDate(item.created_at)}</span>
                            <span>•</span>
                            <span>{item.credits_used} credits</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/10 pt-4">
                      <div className="mb-4">
                        {renderContentPreview(item)}
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        {isDownloadable && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10 text-slate-300 hover:bg-violet-500/20 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.id, 'pdf', item.type);
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10 text-slate-300 hover:bg-violet-500/20 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.id, 'docx', item.type);
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              DOCX
                            </Button>
                          </>
                        )}
                        {isCopyable && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-slate-300 hover:bg-violet-500/20 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(getCopyText(item), item.id);
                            }}
                          >
                            {copied === item.id ? (
                              <Check className="w-4 h-4 mr-2 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 mr-2" />
                            )}
                            {copied === item.id ? 'Copied' : 'Copy'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
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
