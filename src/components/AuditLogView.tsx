import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  CheckCircle,
  AlertTriangle,
  Key,
  Database,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { AuditLogEntry, Role } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { canViewAuditLogs } from '../utils/rbac.ts';

export const AuditLogView: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
  const { user } = useAuth();
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const hasOversight = user ? canViewAuditLogs(user.role) : false;

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesAction = filterAction === 'ALL' || l.action === filterAction;
      const matchesRole = filterRole === 'ALL' || l.userRole === filterRole;
      const matchesSearch =
        l.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.metadata && l.metadata.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesAction && matchesRole && matchesSearch;
    });
  }, [logs, filterAction, filterRole, searchQuery]);

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'AUTH_LOGIN':
      case 'AUTH_LOGOUT':
      case 'ROLE_SWITCH':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'UPLOAD_RESOURCE':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'VERIFY_RESOURCE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'REJECT_RESOURCE':
      case 'DELETE_RESOURCE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'CREATE_STUDY_GROUP':
      case 'JOIN_STUDY_GROUP':
      case 'SEND_GROUP_MESSAGE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'DOWNLOAD_RESOURCE':
      case 'RATE_RESOURCE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Architecture Guide Step 6
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Firestore Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
            Centralized Audit Logging & RBAC Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time audit records tracking user authentication, role elevations, resource verifications, and room operations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 shrink-0">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Real-Time Stream Active</span>
          <span className="font-mono font-bold text-white">({logs.length} logged)</span>
        </div>
      </div>

      {/* RBAC Role Matrix Card */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          STEM STUDY: Role-Based Access Control (RBAC) Specification Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">STUDENT</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Tier 1</span>
            </div>
            <p className="text-slate-400">
              Browse resources, download revision notes, rate documents, submit new materials (status: pending), participate in peer study rooms.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">TUTOR</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Tier 2</span>
            </div>
            <p className="text-slate-400">
              All Student rights plus: Verify & approve academic resources with official tutor feedback notes, review solutions, create study groups.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">ADMIN (Talent Nechiturike)</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Tier 3</span>
            </div>
            <p className="text-slate-400">
              Full system oversight: Inspect immutable audit trails, moderate all resources, manage roles, and review security policies.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by target resource, user name, or metadata..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Actions</option>
            <option value="AUTH_LOGIN">AUTH_LOGIN</option>
            <option value="AUTH_LOGOUT">AUTH_LOGOUT</option>
            <option value="ROLE_SWITCH">ROLE_SWITCH</option>
            <option value="UPLOAD_RESOURCE">UPLOAD_RESOURCE</option>
            <option value="VERIFY_RESOURCE">VERIFY_RESOURCE</option>
            <option value="REJECT_RESOURCE">REJECT_RESOURCE</option>
            <option value="DELETE_RESOURCE">DELETE_RESOURCE</option>
            <option value="ADD_COMMENT">ADD_COMMENT</option>
            <option value="CREATE_STUDY_GROUP">CREATE_STUDY_GROUP</option>
            <option value="JOIN_STUDY_GROUP">JOIN_STUDY_GROUP</option>
            <option value="SEND_GROUP_MESSAGE">SEND_GROUP_MESSAGE</option>
            <option value="DOWNLOAD_RESOURCE">DOWNLOAD_RESOURCE</option>
            <option value="RATE_RESOURCE">RATE_RESOURCE</option>
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">STUDENT</option>
            <option value="TUTOR">TUTOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.userRole === 'ADMIN'
                            ? 'text-purple-300 bg-purple-500/20'
                            : log.userRole === 'TUTOR'
                            ? 'text-amber-300 bg-amber-500/20'
                            : 'text-emerald-300 bg-emerald-500/20'
                        }`}
                      >
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[220px] truncate" title={log.target}>
                      {log.target}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] max-w-[280px] truncate" title={log.metadata}>
                      {log.metadata || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
