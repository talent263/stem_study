import React, { useState } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, LogIn, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { getGoogleSignInErrorMessage, useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import type { Role } from '../types/index.ts';

interface RoleLoginViewProps {
  role: Role;
  onNavigate: (path: string) => void;
}

const ROLE_DETAILS: Record<Role, { title: string; description: string; access: string; icon: React.ReactNode }> = {
  STUDENT: {
    title: 'Student sign in',
    description: 'Open your study workspace for course resources, peer groups, and STEM practice tools.',
    access: 'Browse and contribute learning materials, join study rooms, and track your revision.',
    icon: <BookOpen className="w-6 h-6" />,
  },
  TUTOR: {
    title: 'Tutor sign in',
    description: 'Open your tutor workspace to review academic resources and support study groups.',
    access: 'Verify submitted resources and help coordinate peer learning.',
    icon: <Users className="w-6 h-6" />,
  },
  ADMIN: {
    title: 'Administrator sign in',
    description: 'Open the administration workspace for platform oversight and audit records.',
    access: 'Manage platform operations and review the audit ledger.',
    icon: <ShieldCheck className="w-6 h-6" />,
  },
};

const ROLE_PATHS: Record<Role, string> = {
  STUDENT: '/login/student',
  TUTOR: '/login/tutor',
  ADMIN: '/login/admin',
};

export const RoleLoginView: React.FC<RoleLoginViewProps> = ({ role, onNavigate }) => {
  const { signInWithGoogle, loading } = useAuth();
  const { error: showError } = useToast();
  const [signingIn, setSigningIn] = useState(false);
  const details = ROLE_DETAILS[role];

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle(role);
    } catch (error) {
      showError('Google sign-in failed', getGoogleSignInErrorMessage(error));
      setSigningIn(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 sm:p-10">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Public resource library
        </button>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
          {details.icon}
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">STEM STUDY · {role}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{details.title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{details.description}</p>

        <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <GraduationCap className="h-4 w-4 text-indigo-300" />
            Your workspace
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{details.access}</p>
          {role !== 'STUDENT' && (
            <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-5 text-slate-500">
              {role === 'TUTOR'
                ? 'Tutor access is available to accounts that have been approved for the tutor role.'
                : 'Administrator access is limited to the provisioned administrator account.'}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading || signingIn}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60"
        >
          {signingIn || loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Continue with Google as {role.toLowerCase()}
        </button>

        <div className="mt-8 border-t border-slate-800 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Choose another sign-in page</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(['STUDENT', 'TUTOR', 'ADMIN'] as Role[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onNavigate(ROLE_PATHS[option])}
                aria-current={option === role ? 'page' : undefined}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  option === role
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-200'
                    : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                {option[0] + option.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
