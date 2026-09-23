import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  Bell,
  Search,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import { useSocket } from '../../context/SocketContext';
import { RoleBadge } from './Badge';

export const Navbar = ({ onOpenSearch, onOpenAi }) => {
  const { user, logout, demoLogin } = useAuth();
  const { organizations, activeOrg, currentRole, switchOrg } = useOrg();
  const { isConnected, notifications, markAllRead } = useSocket();

  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const orgRef = useRef(null);
  const userRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (orgRef.current && !orgRef.current.contains(e.target)) setShowOrgMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Active Organization Switcher */}
      <div className="flex items-center space-x-4">
        <div className="relative" ref={orgRef}>
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-sm font-medium transition-colors"
          >
            <Building2 className="w-4 h-4 text-brand-400" />
            <span className="font-semibold max-w-[140px] truncate">
              {activeOrg?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showOrgMenu && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                Workspaces ({organizations.length})
              </div>
              <div className="space-y-1 mt-1">
                {organizations.map((org) => (
                  <button
                    key={org._id}
                    onClick={() => {
                      switchOrg(org._id);
                      setShowOrgMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      org._id === activeOrg?._id
                        ? 'bg-brand-500/15 text-brand-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-medium">{org.name}</div>
                      <div className="text-xs text-slate-400">{org.plan} Tier</div>
                    </div>
                    {org._id === activeOrg?._id && (
                      <span className="w-2 h-2 rounded-full bg-brand-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real-time connection pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] font-medium">
            {isConnected ? 'Real-Time Sync Active' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Middle: Global Search bar trigger */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 text-slate-400 text-sm transition-all group"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-400 transition-colors" />
            <span>Search tasks, projects, people...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-750 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: AI Assistant, Notifications & User Menu */}
      <div className="flex items-center space-x-3">
        {/* AI Productivity Trigger */}
        <button
          onClick={onOpenAi}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-indigo-300 text-sm font-medium transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-750">
                <span className="text-sm font-semibold text-slate-200">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border text-xs transition-colors ${
                        n.read
                          ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                          : 'bg-brand-500/10 border-brand-500/20 text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-100">{n.title}</div>
                      <div className="mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="mt-1 text-[10px] text-slate-400">{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / RBAC Switcher Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="hidden lg:block text-left">
              <div className="text-sm font-semibold text-slate-200 leading-none">{user?.name}</div>
              <div className="text-[11px] text-slate-400 leading-none mt-1">{currentRole}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in duration-100">
              <div className="pb-3 border-b border-slate-750">
                <div className="font-semibold text-slate-100">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                <div className="mt-2 flex items-center justify-between">
                  <RoleBadge role={currentRole} />
                  <span className="text-xs text-slate-400">{user?.jobTitle}</span>
                </div>
              </div>

              {/* Assessment 1-Click Role Switcher */}
              <div className="py-2 border-b border-slate-750">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3 text-brand-400" />
                  <span>Switch Demo Role (Assessment)</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Admin', 'Project Manager', 'Team Member', 'Viewer'].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        demoLogin(r);
                        setShowUserMenu(false);
                      }}
                      className="px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs text-left truncate transition-colors border border-slate-700/50"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
