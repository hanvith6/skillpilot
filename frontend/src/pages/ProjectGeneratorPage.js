import React, { useState } from 'react';
import Layout from '../components/Layout';
import EmergentModeCard from '../components/EmergentModeCard';
import { Lightbulb, Download, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import useAIGeneration from '../hooks/useAIGeneration';
import useDownload from '../hooks/useDownload';

const ProjectGeneratorPage = ({ user, onLogout, updateCredits }) => {
  const [topic, setTopic] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [emergentMode, setEmergentMode] = useState(false);

  const { loading, result, historyId, generate } = useAIGeneration();
  const { download } = useDownload();

  const creditsNeeded = emergentMode ? 33 : 25;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a project topic');
      return;
    }
    if (user.credits < creditsNeeded) {
      toast.error('Insufficient credits');
      return;
    }
    await generate({
      endpoint: '/api/generate/project',
      payload: { topic, branch, emergent_mode: emergentMode },
      user,
      updateCredits,
      successMessage: (credits) => `Project generated! ${credits} credits used`,
    });
  };

  const handleDownload = (format) => download(historyId, format, 'project');

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="project-generator-title">Project Generator</h1>
          <p className="text-slate-400">Generate complete final year project reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div>
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Project Topic *</Label>
                  <Input
                    placeholder="e.g., Smart Traffic Management System"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white"
                    data-testid="topic-input"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Branch</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger className="mt-1 bg-slate-950/50 border-white/10 text-white" data-testid="branch-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="IoT">IoT</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <EmergentModeCard emergentMode={emergentMode} onToggle={setEmergentMode} testId="emergent-toggle" />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Credits needed:</span>
                  <span className="text-white font-bold text-lg" data-testid="credits-display">{creditsNeeded}</span>
                </div>
                <Button onClick={handleGenerate} disabled={loading || user.credits < creditsNeeded} className={`w-full py-6 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white ${emergentMode ? 'emergent-mode' : ''}`} data-testid="generate-button">
                  {loading ? 'Processing...' : <><Sparkles className="w-5 h-5 mr-2" />Generate Project</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Output */}
          <div>
            <div className="glass-effect rounded-xl p-6 border border-white/10 min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Generated Report</h3>
                {result && (
                  <div className="flex space-x-2">
                    <Button onClick={() => handleDownload('pdf')} size="sm" variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5" data-testid="download-pdf">
                      <Download className="w-4 h-4 mr-1" />PDF
                    </Button>
                    <Button onClick={() => handleDownload('docx')} size="sm" variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5" data-testid="download-docx">
                      <Download className="w-4 h-4 mr-1" />DOCX
                    </Button>
                  </div>
                )}
              </div>
              {!result ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <Lightbulb className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400">Your generated project report will appear here</p>
                </div>
              ) : (
                <div className="space-y-6 text-white" data-testid="project-output">
                  {result.abstract && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Abstract</h4>
                      <p className="text-slate-300 leading-relaxed">{result.abstract}</p>
                    </div>
                  )}
                  {result.problem_statement && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Problem Statement</h4>
                      <p className="text-slate-300 leading-relaxed">{result.problem_statement}</p>
                    </div>
                  )}
                  {result.objectives && result.objectives.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Objectives</h4>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {result.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.viva_questions && result.viva_questions.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Viva Questions ({result.viva_questions.length})</h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {result.viva_questions.slice(0, 5).map((q, i) => (
                          <div key={i} className="glass-effect p-3 rounded-lg border border-white/5">
                            <div className="font-medium text-white">Q{i+1}: {q.question || q}</div>
                            {q.answer && <div className="text-sm text-slate-400 mt-1">{q.answer}</div>}
                          </div>
                        ))}
                      </div>
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

export default ProjectGeneratorPage;
