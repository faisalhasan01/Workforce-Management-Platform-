import React, { useState, useEffect } from 'react';
import { Kanban, Plus, Filter, Search, Sparkles, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useOrg } from '../context/OrgContext';
import { useSocket } from '../context/SocketContext';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { TaskDetailModal } from '../components/kanban/TaskDetailModal';
import { CreateTaskModal } from '../components/kanban/CreateTaskModal';

export const KanbanPage = ({ onOpenAi }) => {
  const { activeOrg, canEditTasks, members } = useOrg();
  const { socket } = useSocket();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [activeTask, setActiveTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quickAddStatus, setQuickAddStatus] = useState('Todo');

  const columns = [
    { id: 'Backlog', title: 'Backlog', colorDot: 'bg-slate-400' },
    { id: 'Todo', title: 'To Do', colorDot: 'bg-indigo-400' },
    { id: 'In Progress', title: 'In Progress', colorDot: 'bg-amber-400' },
    { id: 'In Review', title: 'In Review', colorDot: 'bg-purple-400' },
    { id: 'Done', title: 'Completed', colorDot: 'bg-emerald-400' },
  ];

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        if (res.data.success) {
          setProjects(res.data.projects);
          if (res.data.projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(res.data.projects[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    fetchProjects();
  }, [activeOrg?._id]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = '/tasks?';
      if (selectedProjectId) url += `projectId=${selectedProjectId}&`;
      if (priorityFilter !== 'All') url += `priority=${priorityFilter}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    }
  }, [selectedProjectId, priorityFilter, activeOrg?._id]);

  // Real-time socket events for Kanban
  useEffect(() => {
    if (!socket) return;

    const handleTaskMoved = (data) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === data.taskId ? { ...t, status: data.newStatus } : t))
      );
    };

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => [newTask, ...prev]);
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    socket.on('task:moved', handleTaskMoved);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket]);

  // Drag and Drop handlers
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task._id);
    e.dataTransfer.setData('originStatus', task.status);
  };

  const handleDropTask = async (e, targetStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    const originStatus = e.dataTransfer.getData('originStatus');

    if (!taskId || originStatus === targetStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await api.put(`/tasks/${taskId}/move`, { status: targetStatus });
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Revert if error
      fetchTasks();
    }
  };

  const handleCardClick = (task) => {
    setActiveTask(task);
    setShowDetailModal(true);
  };

  const handleQuickAdd = (colStatus) => {
    setQuickAddStatus(colStatus);
    setShowCreateModal(true);
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-[calc(100vh-4rem)] space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <Kanban className="w-6 h-6 text-brand-400" />
              <span>Agile Kanban Board</span>
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Drag and drop tasks between columns to update status in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchTasks}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAi}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Story Breakdown</span>
          </button>

          {canEditTasks && (
            <button
              onClick={() => {
                setQuickAddStatus('Todo');
                setShowCreateModal(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Project Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          {/* Priority Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400">Priority:</span>
            {['All', 'Urgent', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  priorityFilter === p
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTasks()}
              placeholder="Search cards..."
              className="pl-8 pr-3 py-1 rounded-xl bg-slate-800 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-brand-500 w-36 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex-1 overflow-x-auto pb-4">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Loading Kanban Board...
          </div>
        ) : (
          <div className="flex items-start space-x-4 h-full min-w-max">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <KanbanColumn
                  key={col.id}
                  status={col.id}
                  title={col.title}
                  colorDot={col.colorDot}
                  tasks={colTasks}
                  onTaskClick={handleCardClick}
                  onDragStart={handleDragStart}
                  onDropTask={handleDropTask}
                  onQuickAdd={handleQuickAdd}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showDetailModal && activeTask && (
        <TaskDetailModal
          task={activeTask}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          members={members}
          onTaskUpdated={(updated) => {
            setActiveTask(updated);
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
          }}
          onTaskDeleted={(deletedId) => {
            setTasks((prev) => prev.filter((t) => t._id !== deletedId));
          }}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          projects={projects}
          members={members}
          initialStatus={quickAddStatus}
          onTaskCreated={(newTask) => {
            setTasks((prev) => [newTask, ...prev]);
          }}
        />
      )}
    </div>
  );
};
