import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search, Download, Trash2, Tag, Plus, X } from 'lucide-react';
import api from '../services/api';
import { useOrg } from '../context/OrgContext';

export const DocumentsPage = () => {
  const { activeOrg, canEditTasks } = useOrg();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Architecture');
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let url = '/files?';
      if (categoryFilter !== 'All') url += `category=${categoryFilter}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeOrg?._id, categoryFilter]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please choose a file to upload.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('category', category);
      formData.append('tags', tags);

      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setShowUploadModal(false);
        setTitle('');
        setFile(null);
        setTags('');
        fetchDocuments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const res = await api.delete(`/files/${id}`);
        if (res.data.success) {
          setDocuments((prev) => prev.filter((d) => d._id !== id));
        }
      } catch (err) {
        console.error('Failed to delete document:', err);
      }
    }
  };

  const categories = ['All', 'Architecture', 'Specifications', 'Meeting Notes', 'Contract', 'Assets', 'General'];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-brand-400" />
            <span>Document & Asset Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Central repository for architectural blueprints, system specifications, and compliance assets.
          </p>
        </div>

        {canEditTasks && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
            placeholder="Search documents or tags..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading document repository...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No documents found</h3>
          <p className="text-xs text-slate-500">Upload architectural diagrams or specifications to share with team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {doc.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {(doc.fileSize / 1024).toFixed(0)} KB
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                  {doc.fileName}
                </p>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-750"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <img
                    src={doc.uploadedBy?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={doc.uploadedBy?.name}
                    className="w-5 h-5 rounded-full border border-slate-700 object-cover"
                  />
                  <span className="truncate max-w-[90px]">{doc.uploadedBy?.name}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {canEditTasks && (
                    <button
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850/60">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-brand-400" />
                <span>Upload Document Asset</span>
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SOC-2 Compliance Audit"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Specifications">Specifications</option>
                  <option value="Meeting Notes">Meeting Notes</option>
                  <option value="Contract">Contract</option>
                  <option value="Assets">Assets</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select File *
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-brand-300 hover:file:bg-slate-750 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Security, Audit, v2"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !file}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
