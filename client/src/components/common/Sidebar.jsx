import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  Users,
  MessageSquare,
  FileText,
  Calendar,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useOrg } from '../../context/OrgContext';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { activeOrg, currentRole } = useOrg();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck, restricted: ['Viewer', 'Team Member'] },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-900/90 flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <div className="font-extrabold text-base tracking-tight text-white flex items-center space-x-1.5">
            <span>Nexus</span>
            <span className="text-brand-400">Work</span>
          </div>
          <div className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
            Enterprise SaaS
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Platform
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isRestricted = item.restricted && item.restricted.includes(currentRole);
          const isActive = activeTab === item.id;

          if (isRestricted) return null;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Tenant Plan Information */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-850/80 border border-slate-750">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              {activeOrg?.plan || 'Enterprise'} Plan
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              ACTIVE
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Unlimited projects, AI copilot & multi-tenancy enabled.
          </div>
        </div>
      </div>
    </aside>
  );
};
