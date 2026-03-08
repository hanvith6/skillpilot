import React, { useState } from 'react';
import Layout from '../components/Layout';
import EmergentModeCard from '../components/EmergentModeCard';
import { Languages, Copy, Sparkles, Check, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import useAIGeneration from '../hooks/useAIGeneration';
import useDownload from '../hooks/useDownload';

const EnglishImproverPage = ({ user, onLogout, updateCredits }) => {
  const [text, setText] = useState('');
  const [emergentMode, setEmergentMode] = useState(false);
  const [copied, setCopied] = useState('');

  const { loading, result, generate, historyId } = useAIGeneration();
  const { download } = useDownload();

  const handleDownload = (format) => download(historyId, format, 'english');

  const creditsNeeded = emergentMode ? 3 : 2;

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to improve');
      return;
    }
    if ((user?.credits || 0) < creditsNeeded) {
      toast.error('Insufficient credits');
      return;
    }
    await generate({
      endpoint: '/api/generate/english',
      payload: { text, emergent_mode: emergentMode },
      user,
      updateCredits,
      successMessage: (credits) => `Text improved! ${credits} credits used`,
    });
  };

  const handleCopy = async (type, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(''), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="english-improver-title">English Improver</h1>
          <p className="text-slate-400">Polish your professional communication in three tones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div>
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Your Text</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Enter your text *</Label>
                  <Textarea
                    placeholder="Enter mixed English text, email draft, or message...

Example:
hi sir, hope ur doing good. i want to apply for the internship position at ur company. plz let me know the process. thnx"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="mt-1 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white min-h-[250px]" data-testid="text-input"
                  />
                </div>
                <EmergentModeCard emergentMode={emergentMode} onToggle={setEmergentMode} testId="emergent-toggle" />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Credits needed:</span>
                  <span className="text-white font-bold text-lg" data-testid="credits-display">{creditsNeeded}</span>
                </div>
                <Button onClick={handleGenerate} disabled={loading || (user?.credits || 0) < creditsNeeded} className={`w-full py-6 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white ${emergentMode ? 'emergent-mode' : ''}`} data-testid="generate-button">
                  {loading ? 'Processing...' : <><Sparkles className="w-5 h-5 mr-2" />Improve Text</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Output */}
          <div>
            <div className="glass-effect rounded-xl p-6 border border-white/10 min-h-[600px] max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Improved Versions</h3>
                {result && (
                  <div className="flex space-x-2">
                    <Button onClick={() => handleDownload('pdf')} size="sm" variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                      <Download className="w-4 h-4 mr-1" />PDF
                    </Button>
                    <Button onClick={() => handleDownload('docx')} size="sm" variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                      <Download className="w-4 h-4 mr-1" />DOCX
                    </Button>
                  </div>
                )}
              </div>
              {!result ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <Languages className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400">Your improved text will appear here in 3 versions</p>
                </div>
              ) : (
                <div className="space-y-4" data-testid="english-output">
                  {result.formal && (
                    <div className="glass-effect rounded-lg p-4 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-violet-400">Formal</h4>
                        <Button onClick={() => handleCopy('formal', result.formal)} size="sm" variant="ghost" className="text-slate-400 hover:text-white" data-testid="copy-formal">
                          {copied === 'formal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{result.formal}</p>
                    </div>
                  )}
                  {result.semi_formal && (
                    <div className="glass-effect rounded-lg p-4 border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-blue-400">Semi-Formal</h4>
                        <Button onClick={() => handleCopy('semi', result.semi_formal)} size="sm" variant="ghost" className="text-slate-400 hover:text-white" data-testid="copy-semi">
                          {copied === 'semi' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{result.semi_formal}</p>
                    </div>
                  )}
                  {result.simple && (
                    <div className="glass-effect rounded-lg p-4 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-emerald-400">Simple</h4>
                        <Button onClick={() => handleCopy('simple', result.simple)} size="sm" variant="ghost" className="text-slate-400 hover:text-white" data-testid="copy-simple">
                          {copied === 'simple' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{result.simple}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnglishImproverPage;
