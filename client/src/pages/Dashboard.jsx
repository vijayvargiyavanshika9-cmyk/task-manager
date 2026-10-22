import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI } from '../services/api';
import KanbanBoard from '../components/kanban/KanbanBoard';
import CreateProjectModal from '../components/kanban/CreateProjectModal';
import {
  Kanban,
  LogOut,
  FolderKanban,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  // Fetch all projects for the user
  const fetchProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const res = await projectAPI.getAll();
      if (res.data?.success) {
        const fetched = res.data.data || [];
        setProjects(fetched);
        if (fetched.length > 0) {
          // If no active project or active project was deleted, pick the first
          setActiveProject((prev) => {
            const exists = prev && fetched.some((p) => p._id === prev._id);
            return exists ? prev : fetched[0];
          });
        } else {
          setActiveProject(null);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  // Fetch tasks for currently active project
  const fetchTasks = useCallback(async (projectId) => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    try {
      setLoadingTasks(true);
      const res = await taskAPI.getByProject(projectId);
      if (res.data?.success) {
        setTasks(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeProject?._id) {
      fetchTasks(activeProject._id);
    } else {
      setTasks([]);
    }
  }, [activeProject, fetchTasks]);

  // Project Handlers
  const handleCreateProject = async (projectData) => {
    const res = await projectAPI.create(projectData);
    if (res.data?.success) {
      const newProj = res.data.data;
      setProjects((prev) => [newProj, ...prev]);
      setActiveProject(newProj);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await projectAPI.delete(projectId);
      const updated = projects.filter((p) => p._id !== projectId);
      setProjects(updated);
      setActiveProject(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  // Task Handlers
  const handleCreateTask = async (taskData) => {
    if (!activeProject?._id) return;
    const res = await taskAPI.create(activeProject._id, taskData);
    if (res.data?.success) {
      setTasks((prev) => [...prev, res.data.data]);
    }
  };

  const handleUpdateTask = async (taskId, updateData) => {
    const res = await taskAPI.update(taskId, updateData);
    if (res.data?.success) {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data.data : t))
      );
    }
  };

  const handleMoveTaskStatus = async (taskId, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await taskAPI.updateStatus(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to move task status:', err);
      // Revert if API fails
      if (activeProject?._id) fetchTasks(activeProject._id);
    }
  };

  const handleDeleteTask = async (taskId) => {
    await taskAPI.delete(taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Project Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* Project Switcher Dropdown */}
            {projects.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-semibold text-white transition-all shadow-sm"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeProject?.color || '#4f46e5' }}
                  />
                  <span>{activeProject?.title || 'Select Project'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {projectDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-40 animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Projects ({projects.length})
                    </div>
                    {projects.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setActiveProject(p);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                          activeProject?._id === p._id ? 'text-indigo-400 font-semibold bg-slate-800/40' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: p.color || '#4f46e5' }}
                          />
                          <span className="truncate">{p.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeProject && (
              <button
                onClick={() => handleDeleteProject(activeProject._id)}
                title="Delete project"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* New Project Action */}
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Loading State */}
        {loadingProjects ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm">Loading workspace projects...</span>
          </div>
        ) : projects.length === 0 ? (
          /* Empty Projects State */
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-4 shadow-inner">
              <FolderKanban className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Projects Found</h2>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              Get started by creating your first project workspace to organize and track tasks with Kanban boards.
            </p>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          /* Active Kanban Board */
          <div className="flex-1 flex flex-col">
            {loadingTasks ? (
              <div className="flex-1 flex items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-xs">Syncing board tasks...</span>
              </div>
            ) : (
              <KanbanBoard
                project={activeProject}
                tasks={tasks}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onMoveTaskStatus={handleMoveTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}
          </div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onCreate={handleCreateProject}
        />
      </main>
    </div>
  );
};

export default Dashboard;
