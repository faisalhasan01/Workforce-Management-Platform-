import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const OrgContext = createContext();

export const OrgProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null);
  const [currentRole, setCurrentRole] = useState('Team Member');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrganizations = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/orgs');
      if (res.data.success) {
        const orgList = res.data.organizations.map((item) => ({
          ...item.organization,
          role: item.role,
        }));
        setOrganizations(orgList);

        const savedOrgId = localStorage.getItem('nexus_org_id');
        let current = orgList.find((o) => o._id === savedOrgId) || orgList[0] || null;

        if (current) {
          setActiveOrg(current);
          setCurrentRole(current.role || 'Team Member');
          localStorage.setItem('nexus_org_id', current._id);
        }
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (orgId) => {
    if (!orgId) return;
    try {
      const res = await api.get(`/orgs/${orgId}/members`);
      if (res.data.success) {
        setMembers(res.data.members);
      }
    } catch (err) {
      console.error('Failed to fetch org members:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    } else {
      setOrganizations([]);
      setActiveOrg(null);
      setMembers([]);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    if (activeOrg?._id) {
      fetchMembers(activeOrg._id);
    }
  }, [activeOrg?._id]);

  const switchOrg = async (orgId) => {
    try {
      const res = await api.post(`/orgs/${orgId}/switch`);
      if (res.data.success) {
        const selected = organizations.find((o) => o._id === orgId);
        if (selected) {
          setActiveOrg(selected);
          setCurrentRole(selected.role || 'Team Member');
          localStorage.setItem('nexus_org_id', selected._id);
        }
        await fetchMembers(orgId);
        window.location.reload(); // Refresh application context for clean tenant switch
      }
    } catch (err) {
      console.error('Failed to switch organization:', err);
    }
  };

  const createNewOrg = async (name, plan) => {
    const res = await api.post('/orgs', { name, plan });
    if (res.data.success) {
      await fetchOrganizations();
    }
    return res.data;
  };

  const isOwnerOrAdmin = ['Owner', 'Admin'].includes(currentRole);
  const canManageProjects = ['Owner', 'Admin', 'Project Manager'].includes(currentRole);
  const canEditTasks = ['Owner', 'Admin', 'Project Manager', 'Team Member'].includes(currentRole);

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg,
        currentRole,
        members,
        loading,
        switchOrg,
        createNewOrg,
        refreshMembers: () => fetchMembers(activeOrg?._id),
        refreshOrgs: fetchOrganizations,
        isOwnerOrAdmin,
        canManageProjects,
        canEditTasks,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => useContext(OrgContext);
