import React, { useState } from 'react';
import { Users, UserPlus, Mail, Shield, Copy, Check, X, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useOrg } from '../context/OrgContext';
import { RoleBadge } from '../components/common/Badge';

export const TeamPage = () => {
  const { activeOrg, members, currentRole, isOwnerOrAdmin, refreshMembers } = useOrg();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Team Member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRoleChange = async (userId, newRole) => {
    if (!isOwnerOrAdmin) {
      alert('Only Owners and Admins have permission to modify member roles.');
      return;
    }

    try {
      const res = await api.put(`/orgs/${activeOrg._id}/members/${userId}/role`, {
        role: newRole,
      });
      if (res.data.success) {
        refreshMembers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member role.');
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/orgs/${activeOrg._id}/members`, {
        email: inviteEmail.trim(),
        name: inviteName.trim(),
        role: inviteRole,
      });

      if (res.data.success) {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteName('');
        refreshMembers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteCode = () => {
    if (activeOrg?.inviteCode) {
      navigator.clipboard.writeText(activeOrg.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-brand-400" />
            <span>Workforce & Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization members, assign dynamic roles, and configure tenant permissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Quick invite code pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono">Code: {activeOrg?.inviteCode}</span>
            <button
              onClick={copyInviteCode}
              className="text-brand-400 hover:text-brand-300"
              title="Copy Org Invite Code"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isOwnerOrAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Hierarchy Overview Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Role Permissions Hierarchy</span>
          </span>
          <span className="text-xs text-slate-400">Your Current Role: <strong className="text-slate-200">{currentRole}</strong></span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-850 border border-purple-500/30">
            <div className="font-bold text-purple-300">Owner</div>
            <div className="text-[11px] text-slate-400 mt-1">Full authority, billing, invite removal</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-850 border border-rose-500/30">
            <div className="font-bold text-rose-300">Admin</div>
            <div className="text-[11px] text-slate-400 mt-1">Manage members, projects, audit logs</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-850 border border-amber-500/30">
            <div className="font-bold text-amber-300">Project Manager</div>
            <div className="text-[11px] text-slate-400 mt-1">Create sprints, assign tasks, export reports</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-850 border border-sky-500/30">
            <div className="font-bold text-sky-300">Team Member</div>
            <div className="text-[11px] text-slate-400 mt-1">Update Kanban cards, chat, upload files</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-700">
            <div className="font-bold text-slate-300">Viewer</div>
            <div className="text-[11px] text-slate-400 mt-1">Read-only milestone & KPI visibility</div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Department / Title</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4 flex items-center space-x-3">
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                      alt={member.name}
                      className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-100">{member.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{member.email}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">{member.jobTitle || 'Engineer'}</div>
                    <div className="text-[11px] text-slate-400">{member.department || 'Engineering'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{member.status || 'Active'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isOwnerOrAdmin && member.role !== 'Owner' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Team Member">Team Member</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850/60">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-brand-400" />
                <span>Invite Team Member</span>
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Member Email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@enterprise.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned Dynamic Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Team Member">Team Member</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !inviteEmail.trim()}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
