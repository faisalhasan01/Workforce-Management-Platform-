import React, { useState } from 'react';
import { X, Sparkles, Plus, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const CreateTaskModal = ({
  isOpen,
  onClose,
  projects = [],
  members = [],
  initialStatus = 'Todo',
  onTaskCreated,
}) => {
  if (!isOpen) return null;

  const [projectId, setProjectId] = useState(projects[0]?._id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('Medium');
  const [storyPoints, setStoryPoints] = useState(3);
  const [assigneeId, setAssigneeId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);

  const handleAiBreakdown = async () => {
    if (!title.trim()) {
      alert('Please enter a task title first so AI can analyze it.');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.post('/ai/subtasks', { title, description });
      if (res.data.success) {
        setSubtasks(res.data.data.subtasks);
        setStoryPoints(res.data.data.suggestedStoryPoints);
      }
    } catch (err) {
      console.error('AI breakdown error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId || !title.trim()) return;

    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await api.post('/tasks', {
        projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        storyPoints: Number(storyPoints),
        assigneeId: assigneeId || undefined,
        tags,
        subtasks,
      });

      if (res.data.success) {
        onTaskCreated(res.data.task);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850/60">
          <h2 className="text-base font-bold text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
              required
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Task Title *</label>
              <button
                type="button"
                onClick={handleAiBreakdown}
                disabled={aiLoading || !title.trim()}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Auto-Generate Subtasks (AI)</span>
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement webhook dispatch engine"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide context, acceptance criteria or details..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* AI Subtasks Preview */}
          {subtasks.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-850 border border-indigo-500/30 space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Generated Subtasks ({subtasks.length})</span>
              </span>
              <ul className="space-y-1">
                {subtasks.map((st, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{st.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grid: Status, Priority, Story Points */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Backlog">Backlog</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Points</label>
              <input
                type="number"
                min="1"
                max="20"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Assignee & Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Backend, API, Security"
                className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-brand-500/20"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
