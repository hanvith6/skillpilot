import React from 'react';
import Layout from '../components/Layout';
import { User, Mail, Calendar, Zap } from 'lucide-react';

const ProfilePage = ({ user, onLogout }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="profile-title">Profile</h1>
          <p className="text-slate-400">Manage your account settings</p>
        </div>

        <div className="max-w-2xl">
          <div className="glass-effect rounded-xl p-8 border border-white/10">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 glass-effect rounded-lg border border-white/5">
                <User className="w-5 h-5 text-violet-400" />
                <div className="flex-1">
                  <div className="text-sm text-slate-400">Full Name</div>
                  <div className="text-white font-medium">{user?.name}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 glass-effect rounded-lg border border-white/5">
                <Mail className="w-5 h-5 text-violet-400" />
                <div className="flex-1">
                  <div className="text-sm text-slate-400">Email Address</div>
                  <div className="text-white font-medium">{user?.email}</div>
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
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
