import React, { useState, useEffect } from 'react';
import { Search, X, FolderKanban, CheckSquare, Users, FileText, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export const GlobalSearchModal = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], projects: [], documents: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults({ tasks: [], projects: [], documents: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [tasksRes, projectsRes, docsRes] = await Promise.all([
          api.get(`/tasks?search=${encodeURIComponent(query)}`),
          api.get(`/projects?search=${encodeURIComponent(query)}`),
          api.get(`/files?search=${encodeURIComponent(query)}`),
        ]);

        setResults({
          tasks: tasksRes.data.tasks || [],
          projects: projectsRes.data.projects || [],
          documents: docsRes.data.documents || [],
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-brand-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search tasks, projects, specs, or documents..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-6 text-slate-400 text-sm">Searching across organization...</div>
          )}

          {!loading && !query && (
            <div className="text-center py-10 text-slate-400 text-sm">
              Type keywords to quickly jump to any task, sprint, or asset.
            </div>
          )}

          {!loading && query && results.tasks.length === 0 && results.projects.length === 0 && results.documents.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No matching resources found for "{query}".
            </div>
          )}

          {/* Tasks Results */}
          {results.tasks.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-brand-400" />
                <span>Tasks ({results.tasks.length})</span>
              </div>
              <div className="space-y-1">
                {results.tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => {
                      onSelectResult('task', task);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700/60 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-brand-300">
                        <span className="text-brand-400 mr-2 font-mono text-xs">[{task.key}]</span>
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Status: {task.status} • Priority: {task.priority}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {results.projects.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
                <span>Projects ({results.projects.length})</span>
              </div>
              <div className="space-y-1">
                {results.projects.map((proj) => (
                  <div
                    key={proj._id}
                    onClick={() => {
                      onSelectResult('project', proj);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700/60 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300">
                        {proj.name} ({proj.key})
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {proj.description || 'No description provided'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Results */}
          {results.documents.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Documents & Files ({results.documents.length})</span>
              </div>
              <div className="space-y-1">
                {results.documents.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => {
                      onSelectResult('document', doc);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700/60 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-purple-300">
                        {doc.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Category: {doc.category} • {(doc.fileSize / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
