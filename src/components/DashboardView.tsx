import React from 'react';
import { Activity, BookOpen, Calculator, FileCode, ShieldAlert, Users, ClipboardCheck } from 'lucide-react';
import type { Role } from '../types/index.ts';
import type { NavTab } from './Navbar.tsx';

interface DashboardViewProps {
  role: Role;
  name: string;
  resourceCount: number;
  pendingResourceCount: number;
  groupCount: number;
  onNavigate: (tab: NavTab) => void;
}

const ROLE_COPY: Record<Role, { title: string; intro: string }> = {
  STUDENT: {
    title: 'Student workspace',
    intro: 'Find course materials, work with peers, and plan your next study session.',
  },
  TUTOR: {
    title: 'Tutor workspace',
    intro: 'Review student submissions, verify reliable materials, and support study groups.',
  },
  ADMIN: {
    title: 'Administrator workspace',
    intro: 'Monitor platform activity, review academic content, and oversee collaboration.',
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  role,
  name,
  resourceCount,
  pendingResourceCount,
  groupCount,
  onNavigate,
}) => {
  const copy = ROLE_COPY[role];
  const cards: { title: string; description: string; metric: string; icon: React.ReactNode; tab: NavTab }[] = [
    {
      title: role === 'STUDENT' ? 'Browse resources' : role === 'TUTOR' ? 'Review resources' : 'Resource library',
      description: role === 'TUTOR' ? 'Review new uploads and verify trusted material.' : 'Search course notes, past papers, and verified guides.',
      metric: role === 'TUTOR' ? `${pendingResourceCount} awaiting review` : `${resourceCount} resources`,
      icon: role === 'TUTOR' ? <ClipboardCheck className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />,
      tab: 'resources',
    },
    {
      title: 'Study groups',
      description: role === 'TUTOR' ? 'Coordinate peer learning and support active rooms.' : 'Join peers working through the same courses.',
      metric: `${groupCount} active groups`,
      icon: <Users className="h-5 w-5" />,
      tab: 'groups',
    },
    {
      title: role === 'ADMIN' ? 'Audit ledger' : 'STEM tools & practice',
      description: role === 'ADMIN' ? 'Review sign-ins, resource changes, and group activity.' : 'Use STEM calculators and practice quizzes.',
      metric: role === 'ADMIN' ? 'Platform oversight' : 'Tools and quizzes',
      icon: role === 'ADMIN' ? <ShieldAlert className="h-5 w-5" /> : <Calculator className="h-5 w-5" />,
      tab: role === 'ADMIN' ? 'audit' : 'tools',
    },
  ];

  if (role === 'ADMIN') {
    cards.push({
      title: 'Architecture guide',
      description: 'Review the platform architecture and its implementation notes.',
      metric: 'System reference',
      icon: <FileCode className="h-5 w-5" />,
      tab: 'guide',
    });
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 p-6 sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">{role} portal</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Welcome, {name}. {copy.intro}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">
            <Activity className="h-4 w-4" />
            Live academic workspace
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => onNavigate(card.tab)}
            className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">{card.icon}</span>
              <span className="text-xs text-slate-500 transition group-hover:text-indigo-300">Open →</span>
            </div>
            <h2 className="mt-5 font-bold text-white">{card.title}</h2>
            <p className="mt-1 min-h-10 text-xs leading-5 text-slate-400">{card.description}</p>
            <p className="mt-4 border-t border-slate-800 pt-3 text-xs font-semibold text-slate-300">{card.metric}</p>
          </button>
        ))}
      </section>
    </div>
  );
};
