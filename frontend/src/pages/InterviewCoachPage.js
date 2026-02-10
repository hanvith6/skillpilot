import React, { useState } from 'react';
import Layout from '../components/Layout';
import { MessageCircle, Copy, Sparkles, Zap, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const InterviewCoachPage = ({ user, onLogout, updateCredits }) => {
  const [questionType, setQuestionType] = useState('Tell me about yourself');
  const [background, setBackground] = useState('');
  const [emergentMode, setEmergentMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const creditsNeeded = emergentMode ? 20 : 15;

  const questionTypes = [
    'Tell me about yourself',
    'Why should we hire you?',
    'What are your strengths and weaknesses?',
    'Where do you see yourself in 5 years?',
    'Why do you want this job?',
    'Describe a challenging project',
    'How do you handle stress?',
    'What is your greatest achievement?'
  ];

  const handleGenerate = async () => {
    if (user.credits < creditsNeeded) {
      toast.error('Insufficient credits');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/generate/interview`,
        { question_type: questionType, background: background || null, emergent_mode: emergentMode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data.data.answer);
      updateCredits(user.credits - response.data.credits_used);
      toast.success(`Answer generated! ${response.data.credits_used} credits used`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="interview-coach-title">Interview Coach</h1>
          <p className="text-slate-400">Get personalized interview answers using the STAR method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Question Setup</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Interview Question</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger className="mt-1 bg-slate-950/50 border-white/10 text-white" data-testid="question-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      {questionTypes.map((q) => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Your Background (Optional)</Label>
                  <Textarea
                    placeholder="Share your background, skills, experience... This helps personalize your answer."
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="mt-1 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white min-h-[150px]" data-testid="background-input"
                  />
                </div>
                <div className="flex items-center justify-between glass-effect rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-white font-medium">Emergent Mode</div>
                      <div className="text-sm text-slate-400">Faster processing (+30% credits)</div>
                    </div>
                  </div>
                  <Switch checked={emergentMode} onCheckedChange={setEmergentMode} data-testid="emergent-toggle" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Credits needed:</span>
                  <span className="text-white font-bold text-lg" data-testid="credits-display">{creditsNeeded}</span>
                </div>
                <Button onClick={handleGenerate} disabled={loading || user.credits < creditsNeeded} className={`w-full py-6 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white ${emergentMode ? 'emergent-mode' : ''}`} data-testid="generate-button">
                  {loading ? 'Processing...' : <><Sparkles className="w-5 h-5 mr-2" />Generate Answer</>}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="glass-effect rounded-xl p-6 border border-white/10 min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Your Answer</h3>
                {result && (
                  <Button onClick={handleCopy} size="sm" variant="ghost" className="text-slate-400 hover:text-white" data-testid="copy-button">
                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
              {!result ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <MessageCircle className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400">Your personalized interview answer will appear here</p>
                </div>
              ) : (
                <div className="space-y-4" data-testid="interview-output">
                  <div className="glass-effect rounded-lg p-4 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent">
                    <h4 className="text-lg font-semibold text-violet-400 mb-3">Question: {questionType}</h4>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-line">{result}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InterviewCoachPage;
