import React, { useState, useEffect } from 'react';
import { projectAPI } from '../../services/api';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  Loader2,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

export const ProjectAnalytics = ({ project }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    if (!project?._id) return;
    setLoading(true);
    setError('');

    try {
      const res = await projectAPI.getAnalytics(project._id);
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [project?._id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm">Calculating workspace metrics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
        <p className="text-rose-400 mb-3">{error || 'No analytics data available.'}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    completionRate,
    byStatus = {},
    byPriority = {},
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Project Analytics & Insights</h2>
            <p className="text-xs text-slate-400">Real-time task distribution and completion performance</p>
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          title="Refresh metrics"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</span>
            <div className="text-2xl font-extrabold text-white mt-1">{totalTasks}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completion</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-extrabold text-white">{completionRate}%</span>
              <span className="text-xs text-slate-400">{completedTasks} of {totalTasks} done</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Progress</span>
            <div className="text-2xl font-extrabold text-white mt-1">{inProgressTasks}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue Tasks</span>
            <div className={`text-2xl font-extrabold mt-1 ${overdueTasks > 0 ? 'text-rose-400' : 'text-white'}`}>
              {overdueTasks}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            overdueTasks > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4">Task Status Distribution</h3>

          <div className="space-y-3.5">
            {[
              { key: 'todo', label: 'To Do', color: 'bg-sky-500', count: byStatus.todo || 0 },
              { key: 'in_progress', label: 'In Progress', color: 'bg-amber-500', count: byStatus.in_progress || 0 },
              { key: 'review', label: 'In Review', color: 'bg-purple-500', count: byStatus.review || 0 },
              { key: 'done', label: 'Done', color: 'bg-emerald-500', count: byStatus.done || 0 },
            ].map((col) => {
              const pct = totalTasks > 0 ? Math.round((col.count / totalTasks) * 100) : 0;
              return (
                <div key={col.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{col.label}</span>
                    <span className="text-slate-400">{col.count} tasks ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${col.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4">Task Priority Breakdown</h3>

          <div className="grid grid-cols-2 gap-3.5">
            {[
              { key: 'urgent', label: 'Urgent', bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400', count: byPriority.urgent || 0 },
              { key: 'high', label: 'High', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400', count: byPriority.high || 0 },
              { key: 'medium', label: 'Medium', bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', count: byPriority.medium || 0 },
              { key: 'low', label: 'Low', bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400', count: byPriority.low || 0 },
            ].map((item) => (
              <div
                key={item.key}
                className={`p-4 rounded-xl border flex flex-col justify-between ${item.bg}`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider">{item.label} Priority</span>
                <span className="text-2xl font-extrabold mt-2">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;
