import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Lightbulb, Languages, MessageCircle, Sparkles, Zap, TrendingUp, Check } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const features = [
    {
      icon: FileText,
      title: 'Resume Builder',
      description: 'Transform rough notes into ATS-friendly, professional resumes tailored to specific job roles and countries.',
      gradient: 'from-violet-500/20 to-purple-500/20',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400'
    },
    {
      icon: Lightbulb,
      title: 'Project Generator',
      description: 'Generate complete final year project reports with abstract, architecture, modules, and 20 viva questions.',
      gradient: 'from-pink-500/20 to-rose-500/20',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-400'
    },
    {
      icon: Languages,
      title: 'English Improver',
      description: 'Convert mixed English to three polished versions: formal, semi-formal, and simple professional tones.',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      icon: MessageCircle,
      title: 'Interview Coach',
      description: 'Get personalized, authentic interview answers using the STAR method for HR and technical questions.',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    }
  ];

  const pricing = [
    { region: 'India', price: '₹99-₹299', credits: '100-600' },
    { region: 'Global', price: '$4-$6', credits: '100-600' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px]"></div>
      </div>

      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-white">SkillPilot</span>
        </div>
        <div className="space-x-4">
          <Link to="/auth">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5" data-testid="nav-login-button">
              Login
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white glow-violet" data-testid="nav-get-started-button">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32 text-center">
        <div className="inline-flex items-center space-x-2 glass-effect rounded-full px-4 py-1.5 mb-8">
          <span className="flex w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-slate-300 font-medium">Powered by Google Gemini AI</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          Turn Student Work into
          <br />
          <span className="gradient-text">Professional Results</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Level up your career game with AI tools designed specifically for engineering students. 
          Build ATS resumes, generate project reports, polish your English, and ace interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/auth">
            <Button className="px-8 py-6 text-lg bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white glow-violet-strong" data-testid="hero-start-button">
              Start Building Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2 text-slate-400">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>100 Free Credits on Signup</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
            <div className="text-sm text-slate-400">Students Helped</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">50K+</div>
            <div className="text-sm text-slate-400">Documents Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-sm text-slate-400">User Rating</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-slate-400">Four powerful AI tools in one platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className={`glass-effect glass-effect-hover rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 border border-white/5 bg-gradient-to-br ${feature.gradient}`}
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110`}>
                  <Icon className={`${feature.iconColor} w-7 h-7`} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Premium Mode Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="glass-effect rounded-2xl p-12 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-6">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Premium Mode</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-6">
            Need results fast? Activate Premium Mode for priority processing and faster, more concise outputs. Perfect for last-minute deadlines.
          </p>
          <div className="inline-flex items-center space-x-2 text-amber-400 font-medium">
            <TrendingUp className="w-5 h-5" />
            <span>Only +30% credits</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Regional Pricing</h2>
          <p className="text-xl text-slate-400">Fair pricing for students worldwide</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricing.map((plan, index) => (
            <div key={index} className="glass-effect rounded-xl p-8 border border-white/10 hover:border-violet-500/30 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.region}</h3>
              <div className="text-4xl font-bold text-violet-400 mb-4">{plan.price}</div>
              <div className="text-slate-400 mb-6">{plan.credits} Credits</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-emerald-400 mr-2" />
                  All AI tools included
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-emerald-400 mr-2" />
                  PDF & DOCX downloads
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-emerald-400 mr-2" />
                  Premium Mode access
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white" data-testid={`pricing-button-${index}`}>
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="glass-effect rounded-2xl p-12 border border-white/10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-xl text-slate-400 mb-8">Join thousands of students already using SkillPilot</p>
          <Link to="/auth">
            <Button className="px-10 py-6 text-lg bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white glow-violet-strong" data-testid="cta-button">
              Start Free with 100 Credits
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white">SkillPilot</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <a href="/terms" className="hover:text-violet-400 transition-colors">Terms & Conditions</a>
            <a href="/privacy" className="hover:text-violet-400 transition-colors">Privacy Policy</a>
            <a href="/refund" className="hover:text-violet-400 transition-colors">Refund Policy</a>
            <a href="/cancellation" className="hover:text-violet-400 transition-colors">Cancellation Policy</a>
            <a href="/shipping" className="hover:text-violet-400 transition-colors">Shipping & Exchange</a>
            <a href="/contact" className="hover:text-violet-400 transition-colors">Contact Us</a>
          </div>
        </div>
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>&copy; 2026 SkillPilot. Powered by Google Gemini. Built for engineering students worldwide.</p>
          <p className="mt-2">Crafted with <span className="text-red-400">&hearts;</span> by{' '}
            <a href="https://www.linkedin.com/in/hanvith-reddy-a67857252/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">
              Hanvith Reddy B
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
