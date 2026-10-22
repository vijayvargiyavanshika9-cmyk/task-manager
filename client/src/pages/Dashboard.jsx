import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Kanban, LogOut, LayoutGrid, FolderKanban, Users, ShieldCheck, CheckCircle } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Kanban className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FlowTask</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Workspace
            </span>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-indigo-500/30 bg-slate-800"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user?.name ? user.name.slice(0, 2) : 'US'}
                </div>
              )}
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-white leading-tight">{user?.name}</div>
                <div className="text-xs text-slate-400 leading-tight">{user?.email}</div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-slate-700/60 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/60 border border-slate-800 p-6 sm:p-8 mb-8 shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated Session Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Welcome, {user?.name || 'Workspace Member'} 👋
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Your personal workspace is ready. Organize projects, manage task boards, and collaborate seamlessly across your workflows.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Status</p>
                  <p className="text-slate-400">Workspace Ready</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <FolderKanban className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Projects</p>
                  <p className="text-slate-400">Organized Views</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <Users className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Account</p>
                  <p className="text-slate-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Project Workspaces</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structure work into dedicated projects with full team visibility, clear deadlines, and customized board settings.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Kanban Task Boards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track task cards seamlessly across customizable columns: To Do, In Progress, In Review, and Done.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Team Collaboration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign tasks to team members, set priorities, leave detailed comments, and monitor progress in real-time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
