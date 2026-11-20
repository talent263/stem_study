import React, { useState } from 'react';
import {
  FileText,
  Building2,
  CheckCircle,
  ExternalLink,
  Code2,
  Shield,
  Database,
  Layers,
  Terminal,
  Server,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ArchitectureGuideView: React.FC = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const pdfPath = '/assets/aistudio/STEM_STUDY_Architecture___Auth_Implementation_Guide_-_Talent_Nechiturike_151f63fd.pdf';

  const steps = [
    {
      step: 1,
      title: 'Project Initialization & Strict TypeScript Tooling',
      summary: 'Scaffolding enterprise foundation with strict TypeScript, modern bundler, and design token architecture.',
      details: `Initialized project with strict typing, Tailwind CSS styling, and lucide icon sets. Emphasizes type safety across API boundaries and client components.`,
      code: `npx create-next-app@latest stem-study --typescript --tailwind --eslint
cd stem-study
npm install prisma @prisma/client next-auth@beta sonner lucide-react`,
    },
    {
      step: 2,
      title: 'Schema Design & Data Modeling (RBAC & Audit)',
      summary: 'Defined relational & document schemas supporting RBAC and immutable audit logs.',
      details: `Modeled User profiles, Role enums (STUDENT, TUTOR, ADMIN), and AuditLog records with relational references and timestamp tracking.`,
      code: `model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  name  String?
  email String? @unique
  role  Role @default(STUDENT)
  auditLogs AuditLog[]
}

enum Role {
  STUDENT
  TUTOR
  ADMIN
}`,
    },
    {
      step: 3,
      title: 'Authentication & Session Extension',
      summary: 'Configured Auth with session callbacks to extend user tokens with role claims.',
      details: `JWT callback attaches role to token; session callback exposes role directly on session.user so routes and client components can enforce access control.`,
      code: `export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    }
  }
});`,
    },
    {
      step: 4,
      title: 'Role-Based Access Control (RBAC) Logic',
      summary: 'Guards routes, endpoints, and UI controls against unauthorized operations.',
      details: `Utility function inspects active session and verifies if the requester possesses the required tier (STUDENT, TUTOR, or ADMIN).`,
      code: `export async function authorize(requiredRole: "STUDENT" | "TUTOR" | "ADMIN") {
  const session = await auth();
  if (!session || session.user.role !== requiredRole) {
    throw new Error("Unauthorized access");
  }
}`,
    },
    {
      step: 5,
      title: 'Frontend UI & Sonner Toast Notifications',
      summary: 'Non-intrusive rich toast feedback system for feedback on actions, uploads, and errors.',
      details: `Configured Toaster provider at the root layout with richColors, positioning at bottom-right for clean status toasts during resource uploads.`,
      code: `<Toaster position="bottom-right" richColors />`,
    },
    {
      step: 6,
      title: 'Centralized Audit Logging Service',
      summary: 'Centralized ledger creating immutable records for every resource modification and login.',
      details: `Whenever a resource is created, verified, or user session begins, createLog captures userId, action, target entity, and timestamp.`,
      code: `export async function createLog(userId: string, action: string, target: string) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      target,
    }
  });
}`,
    },
    {
      step: 7,
      title: 'Data Management & Mutations',
      summary: 'Server actions and database mutations with type safety and automatic audit log linkage.',
      details: `Authenticates user, verifies permissions, performs persistent write, and commits corresponding audit log.`,
      code: `"use server";
export async function uploadResource(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Unauthenticated" };
  await createLog(session.user.id, "UPLOAD_RESOURCE", formData.get("name"));
  return { success: "Resource uploaded successfully!" };
}`,
    },
    {
      step: 8,
      title: 'Containerization & Docker Compose',
      summary: 'Docker Compose orchestration pairing the web application with persistent database instances.',
      details: `Reproducible developer setup running on port 3000 with environment isolation.`,
      code: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mongodb://mongo:27017/stem_study
    depends_on:
      - mongo`,
    },
    {
      step: 9,
      title: 'Environment Configuration & Secret Management',
      summary: 'Strictly typed environment configuration using .env.example templates to prevent key leaks.',
      details: `All database URLs, authentication secrets, and cloud configurations are strictly managed through environment templates.`,
      code: `# .env.example
DATABASE_URL="mongodb://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"`,
    },
    {
      step: 10,
      title: 'Stress-Testing, Polish & Verification',
      summary: 'Stress-testing the RBAC middleware, testing toast feedback under simulated latency.',
      details: `Verified authorization boundaries so students cannot bypass verification or tamper with audit logs.`,
      code: `// Verification assertion
assert(canVerifyResource('STUDENT') === false);
assert(canVerifyResource('TUTOR') === true);
assert(canVerifyResource('ADMIN') === true);`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-900/50 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Official Engineering Document
              </span>
              <span className="text-xs text-slate-400">University of Zimbabwe</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              STEM STUDY: Architecture & Implementation Guide
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Prepared by: <strong className="text-indigo-300">Talent Nechiturike</strong> • Software Engineering Dept.
            </p>
          </div>

          <a
            href={pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Open Original PDF</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400">Institution & Faculty</span>
            <p className="font-semibold text-white">University of Zimbabwe</p>
            <p className="text-[11px] text-slate-400">Faculty of Computer Engineering, Informatics & STEM</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400">Lead Engineer</span>
            <p className="font-semibold text-indigo-300">Talent Nechiturike</p>
            <p className="text-[11px] text-slate-400">Lead Architect & Full-Stack Developer</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400">Core Objectives</span>
            <p className="font-semibold text-white">Enterprise Scalability & Security</p>
            <p className="text-[11px] text-slate-400">Strict RBAC, Audit Logging, Real-Time Syncing</p>
          </div>
        </div>
      </div>

      {/* 10-Step Implementation Roadmap */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              10-Step Implementation Roadmap
            </h2>
            <p className="text-xs text-slate-400">
              Interactive review of the engineering decisions and architecture implemented from the journal.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((s) => {
            const isExpanded = expandedStep === s.step;
            return (
              <div
                key={s.step}
                className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : s.step)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-900/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {s.step}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{s.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{s.summary}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 space-y-3 animate-in fade-in duration-150">
                    <p className="text-xs text-slate-300 leading-relaxed">{s.details}</p>
                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 overflow-x-auto">
                      <pre className="text-xs font-mono text-indigo-200 leading-relaxed">
                        {s.code}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded PDF Preview Frame */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Attached PDF Engineering Journal
            </h3>
            <p className="text-xs text-slate-400">
              Direct rendering of the uploaded engineering guide: <code className="text-indigo-300">STEM_STUDY_Architecture___Auth_Implementation_Guide_-_Talent_Nechiturike.pdf</code>
            </p>
          </div>
          <a
            href={pdfPath}
            download="STEM_STUDY_Architecture_Guide.pdf"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>Download PDF Copy</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-[500px]">
          <iframe
            src={pdfPath}
            title="STEM STUDY Architecture Guide"
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* Engineering Reflection & Signatures */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-4">
        <div>
          <h4 className="font-bold text-white text-sm mb-1">Engineering Reflection</h4>
          <p className="text-slate-300 leading-relaxed italic">
            "Building STEM STUDY allowed me to bridge the gap between theoretical software architecture and practical implementation. By leveraging Auth and robust database syncing, I've created a system that is not only secure but also highly adaptable for future academic needs at the University of Zimbabwe. This project demonstrates my commitment to clean code, systematic logging, and robust security protocols."
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Lead Engineer</span>
            <p className="font-bold text-white text-sm mt-0.5">Talent Nechiturike</p>
            <p className="text-slate-400 text-[11px]">Software Engineering Dept, University of Zimbabwe</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Faculty Department</span>
            <p className="font-bold text-white text-sm mt-0.5">University of Zimbabwe</p>
            <p className="text-slate-400 text-[11px]">Department of Computer Engineering & Software Engineering</p>
          </div>
        </div>
      </div>
    </div>
  );
};
