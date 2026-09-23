import React, { useState } from 'react';
import { Sparkles, X, Check, Copy, ListTodo, Calendar, Bot, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export const AiProductivityModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('subtasks');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [subtaskResult, setSubtaskResult] = useState(null);
  const [standupResult, setStandupResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSubtasks = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setLoading(true);
    setSubtaskResult(null);
    try {
      const res = await api.post('/ai/subtasks', {
        title: taskTitle,
        description: taskDesc,
      });
      if (res.data.success) {
        setSubtaskResult(res.data.data);
      }
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStandup = async () => {
    setLoading(true);
    setStandupResult(null);
    try {
      const res = await api.post('/ai/standup');
      if (res.data.success) {
        setStandupResult(res.data.standup);
      }
    } catch (err) {
      console.error('AI standup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>AI Productivity Suite</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  Sprint Automation
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated story breakdown, acceptance criteria, and Agile standups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('subtasks')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'subtasks'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Story & Subtask Generator</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('standup');
              if (!standupResult) handleGenerateStandup();
            }}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'standup'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agile Daily Standup</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'subtasks' ? (
            <div className="space-y-4">
              <form onSubmit={handleGenerateSubtasks} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Feature or Task Title
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Implement real-time drag-and-drop Kanban synchronization"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Additional Context / Scope (Optional)
                  </label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    rows={2}
                    placeholder="Describe any tech stack constraints or acceptance specifics..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !taskTitle.trim()}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Requirements...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Breakdown</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Subtask Results */}
              {subtaskResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-750">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-300">Complexity:</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {subtaskResult.suggestedStoryPoints} Story Points
                      </span>
                      <span className="text-xs text-slate-400">({subtaskResult.riskScore})</span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(
                            {
                              subtasks: subtaskResult.subtasks.map((s) => s.title),
                              acceptanceCriteria: subtaskResult.acceptanceCriteria,
                            },
                            null,
                            2
                          )
                        )
                      }
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Actionable Subtasks
                    </h3>
                    <ul className="space-y-1.5">
                      {subtaskResult.subtasks.map((st, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                          <span className="w-4 h-4 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{st.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Acceptance Criteria
                    </h3>
                    <ul className="space-y-1.5">
                      {subtaskResult.acceptanceCriteria.map((ac, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{ac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standup Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Synthesized from your recent completed and in-progress ticket activity.
                </p>
                <button
                  onClick={handleGenerateStandup}
                  disabled={loading}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Refresh Standup</span>
                </button>
              </div>

              {loading && (
                <div className="text-center py-12 text-slate-400 text-sm flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Aggregating sprint activity and generating standup...</span>
                </div>
              )}

              {standupResult && !loading && (
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-750">
                    <span className="text-xs font-semibold text-slate-300">
                      Standup for {standupResult.userName}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `**Yesterday:**\n${standupResult.yesterday.map((i) => `- ${i}`).join('\n')}\n\n**Today:**\n${standupResult.today.map((i) => `- ${i}`).join('\n')}\n\n**Blockers:**\n${standupResult.blockers.map((i) => `- ${i}`).join('\n')}`
                        )
                      }
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied to Clipboard' : 'Copy Slack Format'}</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                      Yesterday / Completed
                    </h4>
                    <ul className="space-y-1">
                      {standupResult.yesterday.map((y, i) => (
                        <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>{y}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1.5">
                      Today / In Progress
                    </h4>
                    <ul className="space-y-1">
                      {standupResult.today.map((t, i) => (
                        <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                          <span className="text-indigo-400">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                      Blockers & Dependencies
                    </h4>
                    <ul className="space-y-1">
                      {standupResult.blockers.map((b, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-amber-400">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
