import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Mail, Calendar, Zap, Edit3, Save, X, Lock, BarChart3, Check, FileText, Lightbulb, Languages, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Pre-made avatar gradients
const AVATARS = [
  { id: 'violet-indigo', from: 'from-violet-500', to: 'to-indigo-500', emoji: null },
  { id: 'pink-rose', from: 'from-pink-500', to: 'to-rose-500', emoji: null },
  { id: 'blue-cyan', from: 'from-blue-500', to: 'to-cyan-500', emoji: null },
  { id: 'emerald-teal', from: 'from-emerald-500', to: 'to-teal-500', emoji: null },
  { id: 'amber-orange', from: 'from-amber-500', to: 'to-orange-500', emoji: null },
  { id: 'red-pink', from: 'from-red-500', to: 'to-pink-500', emoji: null },
  { id: 'cat', from: 'from-violet-600', to: 'to-purple-600', emoji: '🐱' },
  { id: 'dog', from: 'from-amber-600', to: 'to-yellow-600', emoji: '🐶' },
  { id: 'fox', from: 'from-orange-600', to: 'to-red-600', emoji: '🦊' },
  { id: 'panda', from: 'from-slate-600', to: 'to-gray-600', emoji: '🐼' },
  { id: 'rocket', from: 'from-blue-600', to: 'to-indigo-600', emoji: '🚀' },
  { id: 'star', from: 'from-yellow-500', to: 'to-amber-500', emoji: '⭐' },
];

const TOOL_LABELS = {
  resume: { label: 'Resume Builder', icon: FileText, color: 'text-violet-400' },
  project: { label: 'Project Generator', icon: Lightbulb, color: 'text-pink-400' },
  english: { label: 'English Improver', icon: Languages, color: 'text-blue-400' },
  interview: { label: 'Interview Coach', icon: MessageCircle, color: 'text-emerald-400' },
};

// Helper to get avatar style from picture string
export const getAvatarInfo = (picture) => {
  if (!picture) return null;
  if (picture.startsWith('http')) return { type: 'url', url: picture };
  const avatar = AVATARS.find(a => a.id === picture);
  if (avatar) return { type: 'preset', ...avatar };
  return null;
};

// Shared avatar render component
export const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-20 h-20 text-3xl',
  };
  const avatarInfo = getAvatarInfo(user?.picture);

  if (avatarInfo?.type === 'url') {
    return (
      <img
        src={avatarInfo.url}
        alt={user?.name || 'User'}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  if (avatarInfo?.type === 'preset') {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${avatarInfo.from} ${avatarInfo.to} flex items-center justify-center text-white font-bold`}>
        {avatarInfo.emoji || user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  }

  // Default gradient with initial
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold`}>
      {user?.name?.charAt(0).toUpperCase() || 'U'}
    </div>
  );
};

const ProfilePage = ({ user, onLogout, updateUser }) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.picture || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Check if user signed in via Google (has a Google avatar)
  const [googleAvatar, setGoogleAvatar] = useState(null);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  useEffect(() => {
    fetchStats();
    checkGoogleAvatar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkGoogleAvatar = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.app_metadata?.provider === 'google' || authUser?.identities?.some(i => i.provider === 'google')) {
        setIsOAuthUser(true);
        const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture;
        if (avatarUrl) {
          setGoogleAvatar(avatarUrl);
          // If user has no picture set, auto-set to Google avatar
          if (!user?.picture) {
            saveAvatar(avatarUrl);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check auth provider:', error);
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
    } finally {
      setLoadingStats(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleEdit = () => {
    setEditName(displayName);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditName(displayName);
    setEditing(false);
  };

  const handleSave = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      await axios.patch(`${API_URL}/api/auth/me`, { name: trimmed }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setDisplayName(trimmed);
      setEditing(false);
      if (updateUser) updateUser({ name: trimmed });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const saveAvatar = async (avatarId) => {
    setSavingAvatar(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await axios.patch(`${API_URL}/api/auth/me`, { picture: avatarId }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      setSelectedAvatar(avatarId);
      if (updateUser) updateUser({ picture: avatarId });
      setShowAvatarPicker(false);
      toast.success('Avatar updated');
    } catch (error) {
      toast.error('Failed to update avatar');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Enter a valid email address');
      return;
    }

    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success('Verification email sent to ' + newEmail + '. Please check your inbox.');
      setNewEmail('');
      setShowEmailChange(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  const currentUser = { ...user, name: displayName, picture: selectedAvatar || user?.picture };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="profile-title">Profile</h1>
          <p className="text-slate-400">Manage your account settings</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Profile Card */}
          <div className="glass-effect rounded-xl p-8 border border-white/10">
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative group">
                <UserAvatar user={currentUser} size="md" />
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
                >
                  Change
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  {!editing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="text-slate-400 hover:text-violet-400 p-1 h-auto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>

            {/* Avatar Picker */}
            {showAvatarPicker && (
              <div className="mb-6 p-4 glass-effect rounded-lg border border-white/10">
                <div className="text-sm text-slate-400 mb-3">Choose an avatar</div>
                <div className="grid grid-cols-6 gap-3">
                  {googleAvatar && (
                    <button
                      onClick={() => saveAvatar(googleAvatar)}
                      disabled={savingAvatar}
                      className={`w-12 h-12 rounded-full overflow-hidden ring-2 transition-all ${selectedAvatar === googleAvatar ? 'ring-violet-400 scale-110' : 'ring-transparent hover:ring-white/30'}`}
                    >
                      <img src={googleAvatar} alt="Google" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  )}
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => saveAvatar(avatar.id)}
                      disabled={savingAvatar}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.from} ${avatar.to} flex items-center justify-center text-white font-bold ring-2 transition-all ${selectedAvatar === avatar.id ? 'ring-violet-400 scale-110' : 'ring-transparent hover:ring-white/30'}`}
                    >
                      {avatar.emoji || displayName?.charAt(0).toUpperCase() || 'U'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Fields */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 glass-effect rounded-lg border border-white/5">
                <User className="w-5 h-5 text-violet-400" />
                <div className="flex-1">
                  <div className="text-sm text-slate-400">Full Name</div>
                  {editing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-800/50 border-white/10 text-white max-w-xs"
                        placeholder="Enter your name"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave();
                          if (e.key === 'Escape') handleCancel();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={saving}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="text-white font-medium">{displayName}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 glass-effect rounded-lg border border-white/5">
                <Mail className="w-5 h-5 text-violet-400" />
                <div className="flex-1">
                  <div className="text-sm text-slate-400">Email Address</div>
                  <div className="flex items-center gap-3">
                    <div className="text-white font-medium">{user?.email}</div>
                    {!isOAuthUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmailChange(!showEmailChange)}
                        className="text-slate-400 hover:text-violet-400 p-1 h-auto text-xs"
                      >
                        Change
                      </Button>
                    )}
                  </div>
                  {showEmailChange && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="bg-slate-800/50 border-white/10 text-white max-w-xs"
                        placeholder="New email address"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEmailChange();
                          if (e.key === 'Escape') { setShowEmailChange(false); setNewEmail(''); }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={handleEmailChange}
                        disabled={savingEmail}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {savingEmail ? 'Sending...' : 'Update'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setShowEmailChange(false); setNewEmail(''); }}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 glass-effect rounded-lg border border-white/5">
                <Zap className="w-5 h-5 text-emerald-400" />
                <div className="flex-1">
                  <div className="text-sm text-slate-400">Available Credits</div>
                  <div className="text-white font-medium text-2xl">{user?.credits || 0}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 glass-effect rounded-lg border border-white/5">
                <Calendar className="w-5 h-5 text-violet-400" />
                <div className="flex-1">
                  <div className="text-sm text-slate-400">Member Since</div>
                  <div className="text-white font-medium">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change (only for email/password users) */}
          {!isOAuthUser && (
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-violet-400" />
                  <h3 className="text-lg font-semibold text-white">Password</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-violet-400 hover:text-violet-300"
                >
                  {showPasswordChange ? 'Cancel' : 'Change Password'}
                </Button>
              </div>
              {showPasswordChange && (
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-white"
                    placeholder="New password (min 8 characters)"
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-800/50 border-white/10 text-white"
                    placeholder="Confirm new password"
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordChange(); }}
                  />
                  {newPassword && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className={newPassword.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
                        {newPassword.length >= 8 ? <Check className="w-3 h-3 inline" /> : '○'} 8+ chars
                      </span>
                      <span className={newPassword === confirmPassword && confirmPassword ? 'text-emerald-400' : 'text-slate-500'}>
                        {newPassword === confirmPassword && confirmPassword ? <Check className="w-3 h-3 inline" /> : '○'} Matches
                      </span>
                    </div>
                  )}
                  <Button
                    onClick={handlePasswordChange}
                    disabled={savingPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Usage Stats */}
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">Usage Statistics</h3>
            </div>
            {loadingStats ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-violet-500"></div>
              </div>
            ) : stats ? (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 glass-effect rounded-lg border border-white/5">
                    <div className="text-2xl font-bold text-white">{stats.total_generations}</div>
                    <div className="text-xs text-slate-400">Generations</div>
                  </div>
                  <div className="text-center p-3 glass-effect rounded-lg border border-white/5">
                    <div className="text-2xl font-bold text-white">{stats.total_credits_used}</div>
                    <div className="text-xs text-slate-400">Credits Used</div>
                  </div>
                  <div className="text-center p-3 glass-effect rounded-lg border border-white/5">
                    <div className="text-2xl font-bold text-violet-400 capitalize">{stats.most_used_tool || 'N/A'}</div>
                    <div className="text-xs text-slate-400">Most Used</div>
                  </div>
                </div>
                {Object.keys(stats.breakdown).length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400 mb-2">Breakdown by tool</div>
                    {Object.entries(stats.breakdown).map(([tool, count]) => {
                      const toolInfo = TOOL_LABELS[tool] || { label: tool, color: 'text-slate-400' };
                      const Icon = toolInfo.icon || FileText;
                      const total = stats.total_generations || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={tool} className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${toolInfo.color}`} />
                          <span className="text-sm text-white w-36">{toolInfo.label}</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-12 text-right">{count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No usage data yet. Start using the AI tools!</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
