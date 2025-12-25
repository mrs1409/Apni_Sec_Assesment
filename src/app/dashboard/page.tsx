'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Cloud, 
  Users as UsersIcon, 
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  User
} from 'lucide-react';
import { IIssue, IApiResponse, IPaginatedResponse, IssueType, Priority, Status } from '@/types';

const ISSUE_TYPE_OPTIONS = [
  { value: 'CLOUD_SECURITY', label: 'Cloud Security', icon: Cloud },
  { value: 'RETEAM_ASSESSMENT', label: 'Reteam Assessment', icon: UsersIcon },
  { value: 'VAPT', label: 'VAPT', icon: AlertTriangle },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: '#22c55e' },
  { value: 'MEDIUM', label: 'Medium', color: '#f59e0b' },
  { value: 'HIGH', label: 'High', color: '#f97316' },
  { value: 'CRITICAL', label: 'Critical', color: '#ef4444' },
];

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', icon: AlertCircle, color: '#3b82f6' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: '#f59e0b' },
  { value: 'RESOLVED', label: 'Resolved', icon: CheckCircle2, color: '#22c55e' },
  { value: 'CLOSED', label: 'Closed', icon: X, color: '#64748b' },
];

function DashboardContent() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IIssue | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/issues?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data: IApiResponse<IPaginatedResponse<IIssue>> = await response.json();
        if (data.success && data.data) {
          setIssues(data.data.data);
          setPagination((prev) => ({
            ...prev,
            total: data.data!.pagination.total,
            totalPages: data.data!.pagination.totalPages,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleDeleteIssue = async (issueId: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchIssues();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete issue:', error);
    }
  };

  const getStatusInfo = (status: Status) => {
    return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  };

  const getPriorityInfo = (priority: Priority) => {
    return PRIORITY_OPTIONS.find((p) => p.value === priority) || PRIORITY_OPTIONS[1];
  };

  const getTypeInfo = (type: IssueType) => {
    return ISSUE_TYPE_OPTIONS.find((t) => t.value === type) || ISSUE_TYPE_OPTIONS[0];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b-3 border-[#1a1a2e] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#4ade80] border-3 border-[#1a1a2e] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#1a1a2e]" />
              </div>
              <span className="text-xl font-bold text-[#1a1a2e]">ApniSec</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-[#1a1a2e] font-semibold hover:bg-[#f1f5f9] transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button
                onClick={logout}
                className="btn-neo btn-neo-secondary text-sm py-2 px-4 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-[#64748b]">
            Manage your security issues and track assessment progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-neo-sm p-4">
            <p className="text-sm text-[#64748b] font-medium uppercase tracking-wide">Total Issues</p>
            <p className="text-2xl font-black text-[#1a1a2e]">{pagination.total}</p>
          </div>
          <div className="card-neo-sm p-4">
            <p className="text-sm text-[#64748b] font-medium uppercase tracking-wide">Open</p>
            <p className="text-2xl font-black text-[#3b82f6]">
              {issues.filter((i) => i.status === 'OPEN').length}
            </p>
          </div>
          <div className="card-neo-sm p-4">
            <p className="text-sm text-[#64748b] font-medium uppercase tracking-wide">In Progress</p>
            <p className="text-2xl font-black text-[#f59e0b]">
              {issues.filter((i) => i.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="card-neo-sm p-4">
            <p className="text-sm text-[#64748b] font-medium uppercase tracking-wide">Resolved</p>
            <p className="text-2xl font-black text-[#22c55e]">
              {issues.filter((i) => i.status === 'RESOLVED').length}
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="card-neo p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="input-neo pl-10 pr-4 py-2 text-sm w-full sm:w-64"
                />
              </div>

              <select
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                className="select-neo px-4 py-2 text-sm"
              >
                <option value="">All Types</option>
                {ISSUE_TYPE_OPTIONS.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="select-neo px-4 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-neo btn-neo-primary py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Issue
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="card-neo p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#4ade80] mx-auto" />
              <p className="text-[#64748b] mt-4">Loading issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="card-neo p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-[#f59e0b] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">No issues found</h3>
              <p className="text-[#64748b] mb-6">
                {filters.type || filters.status || filters.search
                  ? 'Try adjusting your filters'
                  : 'Create your first security issue to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-neo btn-neo-primary py-2 px-6 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Issue
              </button>
            </div>
          ) : (
            issues.map((issue) => {
              const typeInfo = getTypeInfo(issue.type);
              const statusInfo = getStatusInfo(issue.status);
              const priorityInfo = getPriorityInfo(issue.priority);
              const TypeIcon = typeInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <div key={issue.id} className="card-neo p-4 hover:shadow-[4px_4px_0_#1a1a2e] transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-[#f1f5f9] border-2 border-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-6 h-6 text-[#1a1a2e]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-[#1a1a2e] text-lg truncate">{issue.title}</h3>
                          <span className="badge" style={{ backgroundColor: priorityInfo.color, borderColor: '#1a1a2e' }}>
                            {priorityInfo.label}
                          </span>
                        </div>
                        <p className="text-[#64748b] text-sm line-clamp-2 mb-2">{issue.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-[#64748b]">{typeInfo.label}</span>
                          <span className="flex items-center gap-1" style={{ color: statusInfo.color }}>
                            <StatusIcon className="w-4 h-4" />
                            {statusInfo.label}
                          </span>
                          <span className="text-[#64748b]">{formatDate(issue.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setShowEditModal(true);
                        }}
                        className="p-2 border-2 border-[#1a1a2e] hover:bg-[#f1f5f9] transition-colors"
                        aria-label="Edit issue"
                      >
                        <Edit2 className="w-5 h-5 text-[#1a1a2e]" />
                      </button>
                      {deleteConfirm === issue.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteIssue(issue.id)}
                            className="p-2 bg-red-500 border-2 border-[#1a1a2e] text-white hover:bg-red-600"
                            aria-label="Confirm delete"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-2 border-2 border-[#1a1a2e] hover:bg-[#f1f5f9]"
                            aria-label="Cancel delete"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(issue.id)}
                          className="p-2 border-2 border-[#1a1a2e] hover:bg-red-50 text-red-500 transition-colors"
                          aria-label="Delete issue"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-neo btn-neo-secondary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="flex items-center px-4 font-medium text-[#1a1a2e]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="btn-neo btn-neo-secondary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <IssueModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchIssues();
          }}
        />
      )}

      {/* Edit Issue Modal */}
      {showEditModal && selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => {
            setShowEditModal(false);
            setSelectedIssue(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedIssue(null);
            fetchIssues();
          }}
        />
      )}
    </div>
  );
}

interface IssueModalProps {
  issue?: IIssue;
  onClose: () => void;
  onSuccess: () => void;
}

function IssueModal({ issue, onClose, onSuccess }: IssueModalProps) {
  const [formData, setFormData] = useState({
    type: issue?.type || 'CLOUD_SECURITY',
    title: issue?.title || '',
    description: issue?.description || '',
    priority: issue?.priority || 'MEDIUM',
    status: issue?.status || 'OPEN',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = issue ? `/api/issues/${issue.id}` : '/api/issues';
      const method = issue ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save issue');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border-4 border-[#1a1a2e] shadow-[8px_8px_0_#1a1a2e] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b-3 border-[#1a1a2e]">
          <h2 className="text-xl font-bold text-[#1a1a2e]">
            {issue ? 'Edit Issue' : 'Create New Issue'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f1f5f9] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#1a1a2e]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-3 border-red-500 p-4">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
              Issue Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as IssueType }))}
              className="select-neo"
              required
            >
              {ISSUE_TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="input-neo"
              placeholder="Brief title for the issue"
              required
              minLength={5}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="input-neo resize-none"
              rows={4}
              placeholder="Detailed description of the security issue..."
              required
              minLength={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as Priority }))}
                className="select-neo"
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1a1a2e] uppercase tracking-wide mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as Status }))}
                className="select-neo"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-neo btn-neo-secondary flex-1 justify-center py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-neo btn-neo-primary flex-1 justify-center py-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : issue ? (
                'Update Issue'
              ) : (
                'Create Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
