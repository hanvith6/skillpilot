import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FileText, Upload, Download, Sparkles, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ResumeBuilderPage = ({ user, onLogout, updateCredits }) => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [country, setCountry] = useState('USA');
  const [emergentMode, setEmergentMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [historyId, setHistoryId] = useState(null);

  const creditsNeeded = emergentMode ? 26 : 20;

  const handleGenerate = async () => {
    if (!resumeText.trim() || !targetRole.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (user.credits < creditsNeeded) {
      toast.error('Insufficient credits');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/generate/resume`,
        {
          resume_text: resumeText,
          target_role: targetRole,
          country: country,
          emergent_mode: emergentMode
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResult(response.data.data);
      setHistoryId(response.data.history_id);
      updateCredits(user.credits - response.data.credits_used);
      toast.success(`Resume generated! ${response.data.credits_used} credits used`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    if (!historyId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/download/${historyId}/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${historyId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="resume-builder-title">Resume Builder</h1>
          <p className="text-slate-400">Create ATS-optimized professional resumes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Input Details</h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Target Role *</Label>
                  <Input
                    placeholder="e.g., Software Engineer Intern"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="mt-1 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white"
                    data-testid="target-role-input"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Target Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="mt-1 bg-slate-950/50 border-white/10 text-white" data-testid="country-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="UK">UK</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Resume Content / Notes *</Label>
                  <Textarea
                    placeholder="Paste your existing resume or enter your details (education, experience, projects, skills)..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="mt-1 bg-slate-950/50 border-white/10 focus:border-violet-500 text-white min-h-[200px]"
                    data-testid="resume-text-input"
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
                  <Switch
                    checked={emergentMode}
                    onCheckedChange={setEmergentMode}
                    data-testid="emergent-mode-toggle"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400">Credits needed:</span>
                  <span className="text-white font-bold text-lg" data-testid="credits-display">{creditsNeeded}</span>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || user.credits < creditsNeeded}
                  className={`w-full py-6 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white ${emergentMode ? 'emergent-mode' : ''}`}
                  data-testid="generate-resume-button"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <div className="glass-effect rounded-xl p-6 border border-white/10 min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Generated Resume</h3>
                {result && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleDownload('pdf')}
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                      data-testid="download-pdf-button"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => handleDownload('docx')}
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                      data-testid="download-docx-button"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      DOCX
                    </Button>
                  </div>
                )}
              </div>

              {!result ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                  <FileText className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400">Your generated resume will appear here</p>
                </div>
              ) : (
                <div className="space-y-6 text-white" data-testid="resume-output">
                  {result.summary && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Professional Summary</h4>
                      <p className="text-slate-300 leading-relaxed">{result.summary}</p>
                    </div>
                  )}

                  {result.skills && result.skills.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm border border-violet-500/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.experience && result.experience.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Experience</h4>
                      <div className="space-y-3">
                        {result.experience.map((exp, index) => (
                          <div key={index} className="pl-4 border-l-2 border-violet-500/30">
                            <div className="font-semibold text-white">{exp.title}</div>
                            <div className="text-sm text-slate-400">{exp.company} • {exp.duration}</div>
                            {exp.points && exp.points.length > 0 && (
                              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-300 text-sm">
                                {exp.points.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.education && result.education.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Education</h4>
                      <div className="space-y-2">
                        {result.education.map((edu, index) => (
                          <div key={index} className="text-slate-300">
                            <div className="font-semibold">{edu.degree}</div>
                            <div className="text-sm text-slate-400">{edu.institution} • {edu.year}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.projects && result.projects.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-violet-400 mb-2">Projects</h4>
                      <div className="space-y-3">
                        {result.projects.map((project, index) => (
                          <div key={index}>
                            <div className="font-semibold text-white">{project.name}</div>
                            <p className="text-sm text-slate-300 mt-1">{project.description}</p>
                            {project.tech && project.tech.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.tech.map((tech, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
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

export default ResumeBuilderPage;
