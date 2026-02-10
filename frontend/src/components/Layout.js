import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, FileText, Lightbulb, Languages, MessageCircle, History, CreditCard, User, LogOut, Zap } from 'lucide-react';
import { Button } from './ui/button';

const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Sparkles },
    { name: 'Resume Builder', href: '/resume-builder', icon: FileText },
    { name: 'Project Generator', href: '/project-generator', icon: Lightbulb },
    { name: 'English Improver', href: '/english-improver', icon: Languages },
    { name: 'Interview Coach', href: '/interview-coach', icon: MessageCircle },
    { name: 'History', href: '/history', icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-effect z-30 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-white text-lg">SkillMate AI</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          data-testid="mobile-menu-button"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 glass-effect border-r border-white/5 transform transition-transform duration-300 ease-in-out z-40 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <Link to="/dashboard" className="flex items-center space-x-2" data-testid="logo-link">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg">SkillMate AI</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-white" data-testid="close-sidebar-button">
              <X size={20} />
            </button>
          </div>

          {/* Credits Display */}
          <div className="px-4 py-4">
            <div className="glass-effect rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Available Credits</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white" data-testid="user-credits">{user?.credits || 0}</div>
              <Link to="/purchase">
                <Button className="w-full mt-3 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white" size="sm" data-testid="buy-credits-button">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy Credits
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active 
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="px-4 py-4 border-t border-white/5">
            <div className="flex items-center space-x-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5" size="sm" data-testid="profile-button">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button onClick={onLogout} variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5" size="sm" data-testid="logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30" 
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        {/* Background Ambient Lights */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px]"></div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
