import React, { useState } from 'react';
import {
  X,
  Calendar,
  CheckSquare,
  MessageSquare,
  Trash2,
  Send,
  Plus,
  Tag,
  Hash,
} from 'lucide-react';
import api from '../../services/api';
import { PriorityBadge, StatusBadge } from '../common/Badge';

export const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  members = [],
}) => {
  if (!isOpen || !task) return null;

  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee?._id || '');
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStatus = async (newVal) => {
    setStatus(newVal);
    try {
      const res = await api.put(`/tasks/${task._id}/move`, { status: newVal });
      if (res.data.success) {
        onTaskUpdated(res.data.task);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdatePriority = async (newVal) => {
    setPriority(newVal);
    try {
      const res = await api.put(`/tasks/${task._id}`, { priority: newVal });
      if (res.data.success) {
        onTaskUpdated(res.data.task);
      }
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const handleUpdateAssignee = async (newVal) => {
    setAssigneeId(newVal);
    try {
      const res = await api.put(`/tasks/${task._id}`, { assignee: newVal || null });
      if (res.data.success) {
        onTaskUpdated(res.data.task);
      }
    } catch (err) {
      console.error('Failed to update assignee:', err);
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const res = await api.put(`/tasks/${task._id}/subtasks/${subtaskId}`);
      if (res.data.success) {
        onTaskUpdated(res.data.task);
      }
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      const updatedSubtasks = [...(task.subtasks || []), { title: newSubtaskTitle.trim(), completed: false }];
      const res = await api.put(`/tasks/${task._id}`, { subtasks: updatedSubtasks });
      if (res.data.success) {
        onTaskUpdated(res.data.task);
        setNewSubtaskTitle('');
      }
    } catch (err) {
      console.error('Failed to add subtask:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, { text: newComment });
      if (res.data.success) {
        onTaskUpdated(res.data.task);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete task ${task.key}? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/tasks/${task._id}`);
        if (res.data.success) {
          onTaskDeleted(task._id);
          onClose();
        }
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850/60">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20">
              {task.key}
            </span>
            <span className="text-xs text-slate-400">
              Project: <strong className="text-slate-200">{task.project?.name}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Details, Subtasks, Comments */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">{task.title}</h2>
              <p className="mt-2 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Subtasks Checklist */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-brand-400" />
                  <span>Subtasks / Checklist</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {task.subtasks?.filter((s) => s.completed).length || 0} of{' '}
                  {task.subtasks?.length || 0} completed
                </span>
              </div>

              <div className="space-y-1.5">
                {task.subtasks?.map((subtask) => (
                  <label
                    key={subtask._id}
                    className="flex items-start space-x-2.5 p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer text-xs transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(subtask._id)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span
                      className={
                        subtask.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-200'
                      }
                    >
                      {subtask.title}
                    </span>
                  </label>
                ))}
              </div>

              {/* Add Subtask Input */}
              <form onSubmit={handleAddSubtask} className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new checklist step..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-brand-400 text-xs font-medium border border-slate-700 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                <span>Discussion Thread ({task.comments?.length || 0})</span>
              </h3>

              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {task.comments?.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  task.comments?.map((comment) => (
                    <div
                      key={comment._id}
                      className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">
                          {comment.user?.name || 'Team Member'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-750 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Col: Metadata Controls */}
          <div className="space-y-4 bg-slate-850/50 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="Backlog">Backlog</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => handleUpdatePriority(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => handleUpdateAssignee(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-slate-400 font-semibold mb-1">Story Points</span>
              <span className="inline-block px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-bold border border-slate-700">
                {task.storyPoints || 3} Points
              </span>
            </div>

            {task.dueDate && (
              <div>
                <span className="block text-slate-400 font-semibold mb-1">Due Date</span>
                <span className="text-slate-300 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
