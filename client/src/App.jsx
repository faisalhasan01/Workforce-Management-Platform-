import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useOrg } from './context/OrgContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { KanbanPage } from './pages/KanbanPage';
import { TeamPage } from './pages/TeamPage';
import { ChatPage } from './pages/ChatPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AiProductivityModal } from './components/ai/AiProductivityModal';
import { CreateTaskModal } from './components/kanban/CreateTaskModal';

export const App = () => {
  const { isAuthenticated, loading } = useAuth();
  const { members } = useOrg();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-brand-500 animate-ping" />
          <span className="text-sm font-semibold tracking-wide">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleSearchResult = (type, item) => {
    if (type === 'task') {
      setActiveTab('kanban');
    } else if (type === 'project') {
      setActiveTab('projects');
    } else if (type === 'document') {
      setActiveTab('documents');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Platform Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenAi={() => setShowAiModal(true)}
        />

        {/* Page Switcher */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={setActiveTab}
              onOpenAi={() => setShowAiModal(true)}
              onOpenCreateTask={() => setShowCreateTaskModal(true)}
            />
          )}
          {activeTab === 'projects' && (
            <ProjectsPage
              onSelectProject={() => setActiveTab('kanban')}
            />
          )}
          {activeTab === 'kanban' && (
            <KanbanPage onOpenAi={() => setShowAiModal(true)} />
          )}
          {activeTab === 'team' && <TeamPage />}
          {activeTab === 'chat' && <ChatPage />}
          {activeTab === 'documents' && <DocumentsPage />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'audit' && <AuditLogsPage />}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectResult={handleSearchResult}
      />

      <AiProductivityModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
      />

      {showCreateTaskModal && (
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          members={members}
          onTaskCreated={() => {
            // Task created successfully
          }}
        />
      )}
    </div>
  );
};
