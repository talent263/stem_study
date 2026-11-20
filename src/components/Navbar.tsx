import React from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Building2,
  Calculator,
  FileCode,
  GraduationCap,
  LogOut,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Role } from '../types/index.ts';

export type NavTab = 'dashboard' | 'resources' | 'groups' | 'tools' | 'quiz' | 'audit' | 'guide';

interface NavbarProps {
  workspaceRole?: Role;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onNavigate: (path: string) => void;
  online: boolean;
}

const LOGIN_PATHS: Record<Role, string> = {
  STUDENT: '/login/student',
  TUTOR: '/login/tutor',
  ADMIN: '/login/admin',
};

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Workspace', icon: <Activity className="h-4 w-4" /> },
  { id: 'resources', label: 'Resources', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'groups', label: 'Study Groups', icon: <Users className="h-4 w-4" /> },
  { id: 'tools', label: 'STEM Tools', icon: <Calculator className="h-4 w-4" /> },
  { id: 'quiz', label: 'Practice Quiz', icon: <Award className="h-4 w-4" /> },
  { id: 'audit', label: 'Audit Ledger', icon: <ShieldAlert className="h-4 w-4" /> },
  { id: 'guide', label: 'Architecture Guide', icon: <FileCode className="h-4 w-4" /> },
];

export const ROLE_TABS: Record<Role, NavTab[]> = {
  STUDENT: ['dashboard', 'resources', 'groups', 'tools', 'quiz'],
  TUTOR: ['dashboard', 'resources', 'groups', 'tools', 'quiz', 'audit'],
  ADMIN: ['dashboard', 'resources', 'groups', 'tools', 'quiz', 'audit', 'guide'],
};

const roleColor: Record<Role, string> = {
  STUDENT: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  TUTOR: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  ADMIN: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
};

export const Navbar: React.FC<NavbarProps> = ({ workspaceRole, activeTab, setActiveTab, onNavigate, online }) => {
  const { user, firebaseUser, signOut } = useAuth();
  const navRole = workspaceRole || user?.role;
  const visibleItems = navRole ? NAV_ITEMS.filter((item) => ROLE_TABS[navRole].includes(item.id)) : [];

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl">
      <div className="border-b border-indigo-900/40 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-3 py-1.5 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 truncate">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
            <span className="hidden truncate font-semibold text-slate-200 sm:inline">University of Zimbabwe</span>
            <span className="font-semibold text-slate-200 sm:hidden">UZ</span>
            <span className="hidden text-slate-600 md:inline">|</span>
            <span className="hidden truncate text-slate-400 md:inline">Department of Software Engineering</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[11px]">
            <span className={`h-2 w-2 rounded-full ${online ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="hidden text-slate-400 sm:inline">Cloud sync:</span>
            <span className={online ? 'text-emerald-300' : 'text-amber-300'}>{online ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (user ? setActiveTab('dashboard') : onNavigate('/'))}
            className="group flex shrink-0 items-center gap-2 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-amber-700 text-white shadow-lg shadow-indigo-600/20 transition group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span>
              <span className="block bg-gradient-to-r from-white to-slate-300 bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-lg">
                STEM STUDY
              </span>
              <span className="hidden text-[10px] text-slate-500 sm:block">
                {user ? `${navRole || user.role} workspace` : 'Public resource library'}
              </span>
            </span>
          </button>

          {user && (
            <nav className="hidden items-center gap-1 lg:flex">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          <div className="flex shrink-0 items-center gap-2">
            {user ? (
              <>
                <div className={`hidden items-center gap-2 rounded-xl border px-2.5 py-1.5 sm:flex ${roleColor[user.role]}`}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-32 truncate text-xs font-semibold">{user.name}</span>
                  <span className="text-[9px] font-bold tracking-wide">{user.role}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : firebaseUser ? (
              <span className="text-xs text-slate-400">Loading account…</span>
            ) : (
              <div className="flex items-center gap-1.5">
                {(['STUDENT', 'TUTOR', 'ADMIN'] as Role[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onNavigate(LOGIN_PATHS[role])}
                    className={`rounded-lg border px-2.5 py-2 text-[10px] font-bold transition sm:px-3 sm:text-xs ${roleColor[role]} hover:brightness-125`}
                  >
                    <span className="hidden sm:inline">{role[0] + role.slice(1).toLowerCase()} sign in</span>
                    <span className="sm:hidden">{role[0] + role.slice(1).toLowerCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {user && (
          <nav className="flex gap-1 overflow-x-auto border-t border-slate-800 py-2 scrollbar-none lg:hidden">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={activeTab === item.id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                  activeTab === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
