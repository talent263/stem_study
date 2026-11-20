import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Star,
  MessageSquare,
  Tag,
  Filter,
  Check,
  X,
  FileText,
  Code,
  ShieldCheck,
  Send,
  Trash2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AcademicResource, ResourceComment, ResourceLevel, ResourceType } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import {
  createResource,
  updateResourceVerification,
  incrementDownloads,
  rateResource,
  deleteResource,
  subscribeComments,
  addComment,
} from '../services/resourceService.ts';
import { canVerifyResource, canDeleteResource, validateResourceData } from '../utils/rbac.ts';
import { prepareDocumentUpload } from '../utils/resourceUpload.ts';

const DEPARTMENTS = [
  'All Departments',
  'Software Engineering',
  'Computer Science',
  'Mathematics',
  'Electrical Engineering',
  'Physics & Electronics',
];

const RESOURCE_TYPES: (ResourceType | 'All Types')[] = [
  'All Types',
  'Past Paper',
  'Lecture Notes',
  'Lab Manual',
  'Tutorial & Solutions',
  'Code Snippet',
  'Revision Guide',
];

const LEVELS: (ResourceLevel | 'All Levels')[] = [
  'All Levels',
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Postgraduate',
];

export const ResourcesView: React.FC<{ resources: AcademicResource[] }> = ({ resources }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedType, setSelectedType] = useState<ResourceType | 'All Types'>('All Types');
  const [selectedLevel, setSelectedLevel] = useState<ResourceLevel | 'All Levels'>('All Levels');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<AcademicResource | null>(null);

  // Comments for selected resource
  const [comments, setComments] = useState<ResourceComment[]>([]);
  const [commentInput, setCommentInput] = useState('');

  // Tutor verification form inside modal
  const [verificationNotes, setVerificationNotes] = useState('');

  // Upload Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('Software Engineering');
  const [newLevel, setNewLevel] = useState<ResourceLevel>('Year 2');
  const [newType, setNewType] = useState<ResourceType>('Past Paper');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<{ fileName: string; fileType: string; fileSize: number; fileUrl: string } | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'All Departments' || res.department === selectedDept;
      const matchesType = selectedType === 'All Types' || res.resourceType === selectedType;
      const matchesLevel = selectedLevel === 'All Levels' || res.level === selectedLevel;
      const matchesVerified = !verifiedOnly || res.status === 'verified';

      return matchesSearch && matchesDept && matchesType && matchesLevel && matchesVerified;
    });
  }, [resources, searchQuery, selectedDept, selectedType, selectedLevel, verifiedOnly]);

  // Open resource details and subscribe to real-time comments
  const handleOpenDetails = (res: AcademicResource) => {
    setSelectedResource(res);
    setVerificationNotes(res.verificationNotes || '');
    const unsub = subscribeComments(res.id, (cmts) => {
      setComments(cmts);
    });
    return unsub;
  };

  // Upload handler
  const handleDocumentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingDocument(true);
      const documentData = await prepareDocumentUpload(file);
      setUploadedDocument(documentData);
      success('Document Attached', `"${file.name}" is ready to be published.`);
    } catch (err) {
      error('File Upload Failed', err instanceof Error ? err.message : 'Could not read selected document.');
    } finally {
      setIsUploadingDocument(false);
      event.target.value = '';
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Authentication Required', 'Please sign in before uploading resources.');
      return;
    }

    const validation = validateResourceData({
      title: newTitle,
      courseCode: newCourseCode,
      department: newDepartment,
      resourceType: newType,
      level: newLevel,
    });

    if (!validation.isValid) {
      error('Validation Failed', validation.errors[0]);
      return;
    }

    try {
      const parsedTags = newTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const initialStatus = user.role === 'ADMIN' || user.role === 'TUTOR' ? 'verified' : 'pending';

      await createResource(
        {
          title: newTitle.trim(),
          description: newDescription.trim() || 'Comprehensive academic study materials and notes.',
          courseCode: newCourseCode.trim().toUpperCase(),
          department: newDepartment,
          level: newLevel,
          resourceType: newType,
          tags: parsedTags.length > 0 ? parsedTags : ['Academic', 'STEM'],
          content: newContent.trim() || (uploadedDocument ? `Attached document: ${uploadedDocument.fileName}` : 'Refer to attached notes and syllabus guidelines.'),
          fileUrl: uploadedDocument?.fileUrl,
          fileName: uploadedDocument?.fileName,
          fileType: uploadedDocument?.fileType,
          fileSize: uploadedDocument?.fileSize,
          authorId: user.id,
          authorName: user.name,
          authorRole: user.role,
          status: initialStatus,
          verificationNotes:
            initialStatus === 'verified'
              ? `Auto-verified by ${user.name} (${user.role})`
              : 'Submitted for peer and tutor review.',
          verifiedBy: initialStatus === 'verified' ? user.name : undefined,
          verifiedAt: initialStatus === 'verified' ? new Date().toISOString() : undefined,
        },
        { id: user.id, name: user.name, role: user.role }
      );

      success('Resource Uploaded!', `"${newTitle}" has been saved and synced to the cloud.`);
      setIsUploadOpen(false);

      setNewTitle('');
      setNewCourseCode('');
      setNewDepartment('Software Engineering');
      setNewLevel('Year 2');
      setNewType('Past Paper');
      setNewDescription('');
      setNewContent('');
      setNewTags('');
      setUploadedDocument(null);
    } catch (err) {
      error('Upload Failed', err instanceof Error ? err.message : 'Could not save resource.');
    }
  };

  // Verification review handler (Tutor / Admin)
  const handleVerification = async (status: 'verified' | 'rejected') => {
    if (!selectedResource || !user) return;
    try {
      await updateResourceVerification(
        selectedResource.id,
        selectedResource.title,
        status,
        verificationNotes || (status === 'verified' ? 'Verified by academic tutor.' : 'Changes requested.'),
        { id: user.id, name: user.name, role: user.role }
      );
      success(
        status === 'verified' ? 'Resource Verified!' : 'Resource Rejected',
        `Status updated for "${selectedResource.title}"`
      );
      setSelectedResource((prev) =>
        prev
          ? {
              ...prev,
              status,
              verificationNotes,
              verifiedBy: user.name,
              verifiedAt: new Date().toISOString(),
            }
          : null
      );
    } catch (err) {
      error('Verification Error', err instanceof Error ? err.message : 'Failed to update verification status.');
    }
  };

  // Download simulation & count
  const handleDownload = async (res: AcademicResource) => {
    try {
      // Public visitors may download; only signed-in users can change the counter.
      if (user) {
        await incrementDownloads(res, { id: user.id, name: user.name, role: user.role });
      }

      // Create downloadable text file with markdown / content
      const blob = new Blob([res.content || res.description], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.courseCode}_${res.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success('Resource Downloaded', `Downloaded "${res.title}"`);
    } catch (err) {
      error('Download Failed', 'Could not record download action.');
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource || !user || !commentInput.trim()) return;

    try {
      await addComment(selectedResource.id, selectedResource.title, commentInput.trim(), {
        id: user.id,
        name: user.name,
        role: user.role,
      });
      setCommentInput('');
      success('Comment Posted', 'Your question or note was added to the discussion.');
    } catch (err) {
      error('Comment Failed', 'Could not submit comment.');
    }
  };

  // Delete Resource (Author or Tutor or Admin)
  const handleDeleteResource = async (res: AcademicResource) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete "${res.title}"?`)) return;

    try {
      await deleteResource(res.id, res.title, { id: user.id, name: user.name, role: user.role });
      success('Resource Deleted', `"${res.title}" was removed.`);
      if (selectedResource?.id === res.id) {
        setSelectedResource(null);
      }
    } catch (err) {
      error('Delete Failed', 'You may lack permissions to delete this resource.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            STEM Academic Resource Repository
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse peer-reviewed exam papers, lab tutorials, lecture notes, and code snippets curated for STEM students.
            {!user && ' Sign in to contribute materials and join discussions.'}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:from-indigo-500 hover:to-purple-500"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Academic Resource</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code (e.g. SE201, CS101), topic, title, or tag..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Department select */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Type select */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Level select */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            {/* Verified toggle button */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
                verifiedOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Only</span>
            </button>
          </div>
        </div>

        {/* Active Results Metric */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Showing <strong className="text-white">{filteredResources.length}</strong> academic resources
          </span>
          {verifiedOnly && (
            <span className="text-emerald-400 font-medium">Filtering by UZ Faculty Verified items</span>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed p-8">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No academic resources found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            {user
              ? 'Try adjusting your search query, selecting different departments, or upload a new resource for your peers.'
              : 'Try adjusting your search query or selecting a different department.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('All Departments');
              setSelectedType('All Types');
              setSelectedLevel('All Levels');
              setVerifiedOnly(false);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-medium transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const isVerified = res.status === 'verified';
            const canDelete = user ? canDeleteResource(user.role, user.id === res.authorId) : false;

            return (
              <div
                key={res.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all p-5 flex flex-col justify-between group shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  {/* Top Bar: Course Code & Verification Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {res.courseCode}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>UZ Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending Review</span>
                        </span>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteResource(res)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete resource"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => handleOpenDetails(res)}
                    className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-2"
                  >
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {res.department}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {res.level}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      {res.resourceType}
                    </span>
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-300" title={`Rating: ${res.ratingAvg}/5`}>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-200">{res.ratingAvg.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center gap-1" title={`${res.downloadsCount} downloads`}>
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>{res.downloadsCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(res)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-colors"
                      title="Download notes / past paper"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDetails(res)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-medium transition-all"
                    >
                      <span>Study</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Resource Modal */}
      {isUploadOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  +
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Upload STEM Academic Resource</h2>
                  <p className="text-xs text-slate-400">
                    Contribute past papers, code implementations, or revision notes to STEM STUDY.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SE201, CS101, MTH204"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {DEPARTMENTS.filter((d) => d !== 'All Departments').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Architecture Midterm Solutions & Design Patterns"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Level *
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as ResourceLevel)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {LEVELS.filter((l) => l !== 'All Levels').map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Resource Type *
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {RESOURCE_TYPES.filter((t) => t !== 'All Types').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of topics, exam paper year, or lab syllabus coverage..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Content, Formulas or Code Implementation
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste formulas, past exam answers, markdown notes, or code snippet..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Upload Document
                </label>
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.zip,.ppt,.pptx,.png,.jpg,.jpeg"
                    onChange={handleDocumentSelection}
                    className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
                  />
                  <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span>{uploadedDocument ? `Attached: ${uploadedDocument.fileName}` : 'No document selected yet'}</span>
                    {isUploadingDocument && <span className="text-indigo-300">Reading file…</span>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Architecture, UML, Patterns, Midterm2024"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Publish to Cloud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Details & Study Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedResource.courseCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
                      {selectedResource.department}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      {selectedResource.resourceType}
                    </span>
                    {selectedResource.status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>UZ Verified</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white leading-snug">
                    {selectedResource.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Uploaded by <strong className="text-slate-200">{selectedResource.authorName}</strong> ({selectedResource.authorRole}) • Level: {selectedResource.level}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="text-slate-400 hover:text-white p-1"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tutor & Admin Verification Review Panel */}
              {user && canVerifyResource(user.role) && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-200">
                        Tutor & Admin Oversight Panel (RBAC Step 4)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Current Status: <strong className="uppercase text-amber-300">{selectedResource.status}</strong>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Add tutor verification feedback / approval notes..."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerification('verified')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Verify</span>
                      </button>
                      <button
                        onClick={() => handleVerification('rejected')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-semibold flex items-center gap-1 border border-rose-500/30"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Flag / Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Study Content Area */}
              <div className="mt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Summary & Scope
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    {selectedResource.description}
                  </p>
                </div>

                {selectedResource.verificationNotes && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Faculty Verification Remarks:</p>
                      <p className="opacity-90">{selectedResource.verificationNotes}</p>
                      {selectedResource.verifiedBy && (
                        <p className="text-[10px] text-emerald-400/80 mt-0.5">
                          Verified by {selectedResource.verifiedBy}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      Detailed Learning Content & Solutions
                    </h4>
                    <button
                      onClick={() => handleDownload(selectedResource)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Markdown</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
                    {selectedResource.content || 'No text snippet attached.'}
                  </pre>
                </div>

                {/* Rating Bar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Rate this academic resource:</span>
                    {user ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => {
                              void rateResource(selectedResource, star, {
                                id: user.id,
                                name: user.name,
                                role: user.role,
                              });
                              success('Rating Submitted', `You rated ${star} stars!`);
                            }}
                            className="p-1 text-slate-600 transition-transform hover:scale-110 hover:text-amber-400"
                            title={`Rate ${star} star`}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">Sign in to rate</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Avg: {selectedResource.ratingAvg.toFixed(1)} / 5 ({selectedResource.ratingCount} reviews)
                  </span>
                </div>

                {/* Comments & Peer Discussions */}
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    Peer Q&A and Discussion ({comments.length})
                  </h4>

                  <div className="space-y-2.5 max-h-48 overflow-y-auto mb-3 pr-1">
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        No comments yet. Be the first to ask a question or leave a study tip!
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-indigo-300">
                              {c.authorName} <span className="text-slate-500 font-normal">({c.authorRole})</span>
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-200">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {user ? (
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask a question about this exam problem or note..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={!commentInput.trim()}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 hover:bg-indigo-500"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Post</span>
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-slate-500">Sign in to take part in the discussion.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Created: {new Date(selectedResource.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
