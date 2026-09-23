import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, RefreshCw, Clock } from 'lucide-react';
import api from '../services/api';
import { useOrg } from '../context/OrgContext';

export const AuditLogsPage = () => {
  const { activeOrg } = useOrg();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = '/audit?limit=50';
      if (actionFilter) url += `&action=${actionFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeOrg?._id, actionFilter]);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Audit Trail & Activity Compliance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of state mutations, role changes, and access security records.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Audit Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Audit Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    Loading security audit trails...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No activity recorded for this period.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans flex items-center space-x-2">
                      <img
                        src={log.user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                        alt={log.user?.name}
                        className="w-5 h-5 rounded-full border border-slate-700 object-cover"
                      />
                      <span className="font-semibold text-slate-200">
                        {log.user?.name || 'System Actor'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{log.entityType}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-sans">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">{log.ipAddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
