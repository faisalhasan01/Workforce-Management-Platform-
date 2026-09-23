import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Users,
  Plus,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useOrg } from '../context/OrgContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';

export const DashboardPage = ({ onNavigate, onOpenAi, onOpenCreateTask }) => {
  const { activeOrg, canManageProjects } = useOrg();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeOrg?._id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
          <span>Loading Executive Analytics...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const statusDist = data?.statusDistribution || [];
  const priorityDist = data?.priorityDistribution || [];
  const teamWorkload = data?.teamWorkload || [];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time delivery KPIs, team utilization, and velocity tracking for{' '}
            <strong className="text-slate-200">{activeOrg?.name}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenAi}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot</span>
          </button>

          {canManageProjects && (
            <button
              onClick={onOpenCreateTask}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{metrics.totalProjects || 0}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% On Track
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Multi-tenant portfolio active</div>
        </div>

        {/* Tasks Progress */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completed Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{metrics.completedTasks || 0}</span>
            <span className="text-xs text-slate-400">/ {metrics.totalTasks || 0} Total</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.overallProgress || 0}%` }}
            />
          </div>
        </div>

        {/* Active Sprints */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Sprints
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{metrics.activeSprints || 0}</span>
            <span className="text-xs text-slate-400">of {metrics.totalSprints || 0} total</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">2-week agile sprint cadence</div>
        </div>

        {/* Velocity Points */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sprint Velocity
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{metrics.completedPoints || 0}</span>
            <span className="text-xs text-slate-400">/ {metrics.totalPoints || 0} Points</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Story points burn rate</div>
        </div>
      </div>

      {/* Middle Row: Status Distribution & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Workflow Pipeline Distribution</h2>
              <p className="text-xs text-slate-400">Current task allocation across Kanban states</p>
            </div>
            <button
              onClick={() => onNavigate('kanban')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View Board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {statusDist.map((item) => {
              const percentage =
                metrics.totalTasks > 0 ? Math.round((item.value / metrics.totalTasks) * 100) : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <span className="text-slate-400 font-semibold">
                      {item.value} tasks ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.name === 'Done'
                          ? 'bg-emerald-400'
                          : item.name === 'In Progress'
                          ? 'bg-amber-400'
                          : item.name === 'In Review'
                          ? 'bg-purple-400'
                          : item.name === 'Todo'
                          ? 'bg-sky-400'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Severity & Priority Matrix</h2>
              <p className="text-xs text-slate-400">Risk management breakdown by urgency</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Total: {metrics.totalTasks || 0}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {priorityDist.map((p) => {
              const borderStyles = {
                Urgent: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
                High: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                Medium: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
                Low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
              };

              return (
                <div
                  key={p.name}
                  className={`p-4 rounded-xl border ${borderStyles[p.name]} flex flex-col justify-between`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{p.name}</span>
                  <div className="mt-2 text-2xl font-extrabold">{p.value}</div>
                  <span className="text-[10px] opacity-75 mt-1">
                    {metrics.totalTasks > 0 ? Math.round((p.value / metrics.totalTasks) * 100) : 0}% of workload
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Workload Allocation */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-400" />
              <span>Team Capacity & Workload Allocation</span>
            </h2>
            <p className="text-xs text-slate-400">Active assignments per workforce member</p>
          </div>
          <button
            onClick={() => onNavigate('team')}
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1"
          >
            <span>Manage Team</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Role / Department</th>
                <th className="py-2.5 px-3 text-center">Assigned</th>
                <th className="py-2.5 px-3 text-center">In Progress</th>
                <th className="py-2.5 px-3 text-center">Completed</th>
                <th className="py-2.5 px-3">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {teamWorkload.map((m) => {
                const utilPercentage =
                  m.assignedTasks > 0 ? Math.round((m.completedTasks / m.assignedTasks) * 100) : 0;
                return (
                  <tr key={m.userId} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 flex items-center space-x-2.5">
                      <img
                        src={m.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                        alt={m.name}
                        className="w-7 h-7 rounded-full border border-slate-700 object-cover"
                      />
                      <span className="font-semibold text-slate-200">{m.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{m.jobTitle}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      {m.assignedTasks}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-400">
                      {m.inProgressTasks}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-400">
                      {m.completedTasks}
                    </td>
                    <td className="py-3 px-3 w-40">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-400 h-full rounded-full"
                            style={{ width: `${utilPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {utilPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
