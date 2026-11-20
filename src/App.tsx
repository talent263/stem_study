import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { Navbar, ROLE_TABS } from './components/Navbar.tsx';
import type { NavTab } from './components/Navbar.tsx';
import { RoleLoginView } from './components/RoleLoginView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ResourcesView } from './components/ResourcesView.tsx';
import { StudyGroupsView } from './components/StudyGroupsView.tsx';
import { StemToolsView } from './components/StemToolsView.tsx';
import { QuizView } from './components/QuizView.tsx';
import { AuditLogView } from './components/AuditLogView.tsx';
import { ArchitectureGuideView } from './components/ArchitectureGuideView.tsx';
import { subscribeResources, seedInitialResourcesIfEmpty } from './services/resourceService.ts';
import { subscribeStudyGroups, seedInitialStudyGroupsIfEmpty } from './services/studyGroupService.ts';
import { subscribeAuditLogs } from './services/auditService.ts';
import { testConnection } from './firebase/config.ts';
import type { AcademicResource, AuditLogEntry, Role, StudyGroup } from './types/index.ts';

type ParsedRoute =
  | { kind: 'landing' }
  | { kind: 'login'; role: Role }
  | { kind: 'workspace'; role: Role; tab: NavTab };

const ROLE_SLUGS: Record<Role, string> = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
};

const TAB_IDS: NavTab[] = ['dashboard', 'resources', 'groups', 'tools', 'quiz', 'audit', 'guide'];

function canUseWorkspaceRole(accountRole: Role, workspaceRole: Role): boolean {
  if (accountRole === 'ADMIN') return true;
  if (accountRole === 'TUTOR') return workspaceRole !== 'ADMIN';
  return workspaceRole === 'STUDENT';
}

function parseRoleSlug(value?: string): Role | null {
  switch (value) {
    case 'student': return 'STUDENT';
    case 'tutor': return 'TUTOR';
    case 'admin': return 'ADMIN';
    default: return null;
  }
}

function parseRoute(path: string): ParsedRoute {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'login') {
    const role = parseRoleSlug(parts[1]);
    if (role) return { kind: 'login', role };
  }

  const role = parseRoleSlug(parts[0]);
  if (role) {
    const tab = parts[1] as NavTab;
    return { kind: 'workspace', role, tab: TAB_IDS.includes(tab) ? tab : 'dashboard' };
  }

  return { kind: 'landing' };
}

const AppContent: React.FC = () => {
  const { user, firebaseUser, loading, selectedLoginRole, clearSelectedLoginRole } = useAuth();
  const { error: showError } = useToast();
  const showErrorRef = useRef(showError);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [online, setOnline] = useState(true);
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const navigate = useCallback((path: string, replace = false) => {
    if (window.location.pathname !== path) {
      if (replace) window.history.replaceState({}, '', path);
      else window.history.pushState({}, '', path);
    }
    setPathname(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    testConnection().then(setOnline);
    const unsubscribeResources = subscribeResources(setResources);
    const unsubscribeGroups = subscribeStudyGroups(setStudyGroups);
    return () => {
      unsubscribeResources();
      unsubscribeGroups();
    };
  }, []);

  useEffect(() => {
    if (!user || (user.role !== 'TUTOR' && user.role !== 'ADMIN')) {
      setAuditLogs([]);
      return;
    }
    return subscribeAuditLogs(setAuditLogs);
  }, [user?.id, user?.role]);

  useEffect(() => {
    // Seed starter content from the trusted administrator account only.
    if (user?.role !== 'ADMIN') return;
    seedInitialResourcesIfEmpty({ id: user.id, name: user.name, role: user.role });
    seedInitialStudyGroupsIfEmpty({ id: user.id, name: user.name, role: user.role });
  }, [user]);

  const currentRoute = parseRoute(pathname);
  const showWorkspace = Boolean(firebaseUser && user);

  useEffect(() => {
    if (loading) return;

    if (firebaseUser && user) {
      const selectedRoleIsAllowed = selectedLoginRole !== null && canUseWorkspaceRole(user.role, selectedLoginRole);
      if (selectedLoginRole && !selectedRoleIsAllowed) {
        showErrorRef.current(
          `${selectedLoginRole} access is not assigned to this account`,
          `This Google account has the ${user.role} role. Opening its ${user.role.toLowerCase()} workspace instead.`
        );
      }
      if (selectedLoginRole) clearSelectedLoginRole();

      const route = parseRoute(pathname);
      const routeIsAllowed =
        route.kind === 'workspace' &&
        canUseWorkspaceRole(user.role, route.role) &&
        ROLE_TABS[route.role].includes(route.tab) &&
        ROLE_TABS[user.role].includes(route.tab);
      if (!routeIsAllowed) {
        const destinationRole: Role = selectedRoleIsAllowed && selectedLoginRole ? selectedLoginRole : user.role;
        navigate(`/${ROLE_SLUGS[destinationRole]}/dashboard`, true);
      }
      return;
    }

    const route = parseRoute(pathname);
    if (route.kind === 'workspace') {
      navigate(`/login/${ROLE_SLUGS[route.role]}`, true);
    }
  }, [
    clearSelectedLoginRole,
    firebaseUser,
    loading,
    navigate,
    pathname,
    selectedLoginRole,
    user,
  ]);

  const setActiveTab = (tab: NavTab) => {
    if (!user) return;
    const route = parseRoute(pathname);
    const viewRole = route.kind === 'workspace' && canUseWorkspaceRole(user.role, route.role)
      ? route.role
      : user.role;
    if (!ROLE_TABS[viewRole].includes(tab) || !ROLE_TABS[user.role].includes(tab)) return;
    navigate(`/${ROLE_SLUGS[viewRole]}/${tab}`);
  };

  const workspaceRole = showWorkspace && currentRoute.kind === 'workspace' &&
    canUseWorkspaceRole(user!.role, currentRoute.role)
    ? currentRoute.role
    : user?.role;
  const renderWorkspace = () => {
    if (!user) return null;
    const route = parseRoute(pathname);
    const viewRole = route.kind === 'workspace' && canUseWorkspaceRole(user.role, route.role)
      ? route.role
      : user.role;
    const activeTab = route.kind === 'workspace' && route.role === viewRole ? route.tab : 'dashboard';

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            role={viewRole}
            name={user.name}
            resourceCount={resources.length}
            pendingResourceCount={resources.filter((resource) => resource.status === 'pending').length}
            groupCount={studyGroups.length}
            onNavigate={setActiveTab}
          />
        );
      case 'resources': return <ResourcesView resources={resources} />;
      case 'groups': return <StudyGroupsView groups={studyGroups} />;
      case 'tools': return <StemToolsView />;
      case 'quiz': return <QuizView />;
      case 'audit': return user.role === 'ADMIN' || user.role === 'TUTOR' ? <AuditLogView logs={auditLogs} /> : null;
      case 'guide': return user.role === 'ADMIN' ? <ArchitectureGuideView /> : null;
      default: return null;
    }
  };

  const loginRole = currentRoute.kind === 'login' ? currentRoute.role : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 selection:bg-indigo-600 selection:text-white">
      <Navbar
        workspaceRole={workspaceRole}
        activeTab={showWorkspace && currentRoute.kind === 'workspace' ? currentRoute.tab : 'dashboard'}
        setActiveTab={setActiveTab}
        onNavigate={navigate}
        online={online}
      />

      {loginRole && !showWorkspace ? (
        <RoleLoginView role={loginRole} onNavigate={navigate} />
      ) : (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {showWorkspace ? (
            renderWorkspace()
          ) : (
            <>
              <section className="mb-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Public resource library</p>
                <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">Explore STEM study materials</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Browse resources and study guides. Sign in through the Student, Tutor, or Administrator page to access your role workspace and contribute.
                </p>
              </section>
              <ResourcesView resources={resources} />
            </>
          )}
        </main>
      )}

      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">STEM STUDY</span>
            <span>•</span>
            <span>University of Zimbabwe Software Engineering Department</span>
          </div>
          <span className="text-slate-400">Lead Engineer: <strong className="text-slate-300">Talent Nechiturike</strong></span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
