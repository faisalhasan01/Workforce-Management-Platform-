import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, FileSpreadsheet, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { useOrg } from '../context/OrgContext';

export const ReportsPage = () => {
  const { activeOrg } = useOrg();
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [anRes, prRes, tkRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/projects'),
          api.get('/tasks'),
        ]);

        if (anRes.data.success) setAnalytics(anRes.data);
        if (prRes.data.success) setProjects(prRes.data.projects);
        if (tkRes.data.success) setTasks(tkRes.data.tasks);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeOrg?._id]);

  const handleExportCSV = () => {
    if (tasks.length === 0) return;

    const headers = ['Task Key', 'Title', 'Project', 'Status', 'Priority', 'Story Points', 'Assignee', 'Due Date'];
    const rows = tasks.map((t) => [
      t.key,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.project?.name || ''}"`,
      t.status,
      t.priority,
      t.storyPoints || 0,
      `"${t.assignee?.name || 'Unassigned'}"`,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeOrg?.slug || 'enterprise'}_tasks_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const reportData = {
      organization: activeOrg?.name,
      generatedAt: new Date().toISOString(),
      metrics: analytics?.metrics,
      projects: projects.map((p) => ({
        key: p.key,
        name: p.name,
        status: p.status,
        progress: p.progress,
        totalTasks: p.totalTasks,
        completedTasks: p.completedTasks,
      })),
      tasks: tasks.map((t) => ({
        key: t.key,
        title: t.title,
        status: t.status,
        priority: t.priority,
        points: t.storyPoints,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `${activeOrg?.slug || 'enterprise'}_executive_summary.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto print:p-0 print:m-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <span>Executive Business Reports & Export</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export sprint completion statistics, velocity audits, and CSV records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-8 print:border-0 print:bg-white print:text-black">
        {/* Organization Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 print:border-black">
          <div>
            <h2 className="text-xl font-bold text-white print:text-black">{activeOrg?.name}</h2>
            <div className="text-xs text-slate-400 print:text-gray-600 mt-1">
              Quarterly Engineering & Sprint Delivery Assessment Report
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-gray-600">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Plan: {activeOrg?.plan} Tier</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 print:border-gray-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="mt-1 text-2xl font-extrabold text-white print:text-black">
              {analytics?.metrics?.totalProjects || 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 print:border-gray-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tasks Completed
            </span>
            <div className="mt-1 text-2xl font-extrabold text-emerald-400 print:text-black">
              {analytics?.metrics?.completedTasks || 0} / {analytics?.metrics?.totalTasks || 0}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 print:border-gray-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Sprint Velocity
            </span>
            <div className="mt-1 text-2xl font-extrabold text-purple-400 print:text-black">
              {analytics?.metrics?.completedPoints || 0} pts
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 print:border-gray-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Overall Progress
            </span>
            <div className="mt-1 text-2xl font-extrabold text-brand-400 print:text-black">
              {analytics?.metrics?.overallProgress || 0}%
            </div>
          </div>
        </div>

        {/* Projects Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 print:text-black uppercase tracking-wider">
            Initiatives Breakdown
          </h3>
          <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
            <thead className="bg-slate-850 print:bg-gray-100 text-slate-400 print:text-gray-700">
              <tr>
                <th className="py-2.5 px-3">Project Key</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3 text-right">Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-gray-200">
              {projects.map((p) => (
                <tr key={p._id}>
                  <td className="py-2.5 px-3 font-mono font-bold text-brand-400 print:text-black">
                    {p.key}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200 print:text-black">
                    {p.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{p.status}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-300 print:text-black">
                    {p.progress}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-400">
                    {p.completedTasks}/{p.totalTasks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
