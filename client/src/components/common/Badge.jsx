import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    Urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    High: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Medium: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        styles[priority] || styles.Medium
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    Backlog: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    Todo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    'In Progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'In Review': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Done: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Planning: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    'On Hold': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Completed: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
        styles[status] || styles.Todo
      }`}
    >
      {status}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const styles = {
    Owner: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    Admin: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    'Project Manager': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'Team Member': 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    Viewer: 'bg-slate-600/20 text-slate-300 border-slate-500/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
        styles[role] || styles['Team Member']
      }`}
    >
      {role}
    </span>
  );
};
