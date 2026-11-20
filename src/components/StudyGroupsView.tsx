import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Send,
  Calendar,
  BookOpen,
  MessageSquare,
  Sparkles,
  UserCheck,
  Hash,
  X,
  ChevronRight,
} from 'lucide-react';
import { StudyGroup, GroupMessage } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import {
  createStudyGroup,
  subscribeGroupMessages,
  sendGroupMessage,
  joinStudyGroup,
} from '../services/studyGroupService.ts';

export const StudyGroupsView: React.FC<{ groups: StudyGroup[] }> = ({ groups }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const canCreateGroup = user?.role === 'TUTOR' || user?.role === 'ADMIN';

  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Group Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('Software Engineering');
  const [newDescription, setNewDescription] = useState('');
  const [newSchedule, setNewSchedule] = useState('Tuesdays & Thursdays, 16:00 CAT');
  const [newTopics, setNewTopics] = useState('');

  // Default to first group if none selected
  useEffect(() => {
    if (!selectedGroup && groups.length > 0) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  // Subscribe to messages of active group
  useEffect(() => {
    if (!selectedGroup) return;
    const unsub = subscribeGroupMessages(selectedGroup.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [selectedGroup]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !user || !msgInput.trim()) return;

    try {
      await sendGroupMessage(selectedGroup.id, selectedGroup.title, msgInput.trim(), {
        id: user.id,
        name: user.name,
        role: user.role,
      });
      setMsgInput('');
    } catch (err) {
      error('Message Error', 'Could not send message to study room.');
    }
  };

  const handleJoin = async (grp: StudyGroup) => {
    if (!user) return;
    try {
      await joinStudyGroup(grp, { id: user.id, name: user.name, role: user.role });
      success('Joined Study Group!', `You joined "${grp.title}".`);
      if (selectedGroup?.id === grp.id) {
        setSelectedGroup({ ...grp, memberCount: (grp.memberCount || 1) + 1 });
      }
    } catch (err) {
      error('Join Failed', 'Could not register membership.');
    }
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newTitle.trim() || !newCourseCode.trim()) {
      error('Missing Information', 'Please provide a group title and course code.');
      return;
    }

    try {
      const gId = await createStudyGroup(
        {
          title: newTitle.trim(),
          courseCode: newCourseCode.trim().toUpperCase(),
          department: newDepartment,
          description: newDescription.trim() || 'Peer collaboration room for STEM students.',
          creatorId: user.id,
          creatorName: user.name,
          maxMembers: 30,
          meetingSchedule: newSchedule.trim(),
          topics: newTopics.trim() || 'Problem solving & revision',
          isPublic: true,
        },
        { id: user.id, name: user.name, role: user.role }
      );

      success('Study Group Created!', `"${newTitle}" is now active in the cloud.`);
      setIsCreateOpen(false);

      // Reset
      setNewTitle('');
      setNewCourseCode('');
      setNewDescription('');
      setNewTopics('');
    } catch (err) {
      error('Creation Failed', 'Could not initialize study group.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Peer Collaboration & Study Rooms
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Join synchronous study rooms, discuss difficult engineering problems, and coordinate exam prep schedules.
          </p>
        </div>
        {canCreateGroup && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:from-indigo-500 hover:to-purple-500"
          >
            <Plus className="h-4 w-4" />
            <span>Create Study Room</span>
          </button>
        )}
      </div>

      {/* Main Grid: Groups List (Left) + Active Room & Synchronous Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Group Cards */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Active Study Squads ({groups.length})</span>
            <span className="text-[11px] text-emerald-400 font-mono">Live Sync</span>
          </h2>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {groups.map((grp) => {
              const isSelected = selectedGroup?.id === grp.id;
              return (
                <div
                  key={grp.id}
                  onClick={() => setSelectedGroup(grp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {grp.courseCode}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{grp.memberCount} members</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{grp.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {grp.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">{grp.meetingSchedule}</span>
                    </span>
                    {user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin(grp);
                        }}
                        className="rounded bg-indigo-600/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-200 transition-colors hover:bg-indigo-600 hover:text-white"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-Room Live Workspace */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-[640px]">
          {selectedGroup ? (
            <>
              {/* Room Header */}
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300">
                        {selectedGroup.courseCode}
                      </span>
                      <span className="text-xs text-slate-400">{selectedGroup.department}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Hash className="w-4 h-4 text-indigo-400" />
                      {selectedGroup.title}
                    </h2>
                  </div>
                  {user && (
                    <button
                      onClick={() => handleJoin(selectedGroup)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Join Room</span>
                    </button>
                  )}
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Schedule: <strong className="text-slate-200">{selectedGroup.meetingSchedule}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    <span>Focus Topics: <strong className="text-slate-200">{selectedGroup.topics}</strong></span>
                  </div>
                </div>
              </div>

              {/* Synchronous Chat Messages Container */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2 scrollbar-none">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet in this study room.</p>
                    <p className="mt-0.5 text-slate-600">Start the discussion by asking a question or sharing notes below!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSelf = user ? m.senderId === user.id : false;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                          <span className="font-semibold text-slate-300">{m.senderName}</span>
                          <span className="text-slate-500 font-mono">({m.senderRole})</span>
                          <span>•</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isSelf
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                              : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              {user ? (
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-800 pt-3">
                  <input
                    type="text"
                    placeholder={`Send a study question or solution note to ${selectedGroup.courseCode}...`}
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!msgInput.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              ) : (
                <p className="border-t border-slate-800 pt-3 text-xs text-slate-500">Sign in to join the conversation.</p>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a study group from the list to join the discussion.
            </div>
          )}
        </div>
      </div>

      {/* Create Study Group Modal */}
      {isCreateOpen && canCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Create Peer Study Room
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SE201, CS101"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Physics & Electronics">Physics & Electronics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Group Room Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UZ Distributed Systems Study Squad"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meeting Schedule
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mondays & Wednesdays, 17:00 CAT"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Focus Topics & Agenda
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design patterns, exam questions, past paper review"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Room Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this group's goals..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Create & Launch Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
