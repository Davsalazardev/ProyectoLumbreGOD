import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Issue, Severity, IssueType } from '../types';
import { api } from '../services/api';
import { SeverityBadge } from './SeverityBadge';
import { IssueTypeBadge } from './IssueTypeBadge';

interface Props {
  projectId: string;
}

const SEVERITIES: Severity[] = ['CRITICAL', 'MAJOR', 'MINOR', 'INFO'];
const TYPES: IssueType[] = ['BUG', 'VULNERABILITY', 'CODE_SMELL'];
const PAGE_SIZE = 50; // Optimized for 16k+ LOC

export const IssueTable: React.FC<Props> = ({ projectId }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [severity, setSeverity] = useState('');
  const [type, setType] = useState('');
  const [fileFilter, setFileFilter] = useState('');
  const [fileInput, setFileInput] = useState('');
  const [resolution, setResolution] = useState('OPEN');
  const [sortBy, setSortBy] = useState<'severity' | 'line' | 'file'>('severity');

  // UI State
  const [expandedIssueIds, setExpandedIssueIds] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getIssues(projectId, {
        severity: severity || undefined,
        type: type || undefined,
        file: fileFilter || undefined,
        resolution: resolution || undefined,
        page,
        limit: PAGE_SIZE
      });
      setIssues(res.issues);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e) {
      setError('Error loading issues. For large projects (16k+ LOC), this may take a moment.');
    } finally {
      setLoading(false);
    }
  }, [projectId, severity, type, fileFilter, resolution, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const toggleIssue = (id: string) => {
    const newExpanded = new Set(expandedIssueIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      if (!comments[id]) {
        loadComments(id);
      }
    }
    setExpandedIssueIds(newExpanded);
  };

  const loadComments = async (issueId: string) => {
    try {
      const issueComments = await api.getIssueComments(issueId);
      setComments(prev => ({ ...prev, [issueId]: issueComments }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const addComment = async (issueId: string) => {
    if (!commentText[issueId]?.trim()) return;
    try {
      await api.addIssueComment(issueId, commentText[issueId]);
      setCommentText(prev => ({ ...prev, [issueId]: '' }));
      await loadComments(issueId);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleResolution = async (issueId: string, newResolution: string) => {
    try {
      if (newResolution === 'FIXED') {
        await api.markIssueFixed(issueId, 'Issue resolved');
      } else if (newResolution === 'FALSE_POSITIVE') {
        await api.markIssueFalsePositive(issueId, 'False positive');
      } else if (newResolution === 'WONT_FIX') {
        await api.markIssueWontFix(issueId, 'Not applicable');
      }
      await fetchIssues();
    } catch (error) {
      console.error('Failed to update issue resolution:', error);
    }
  };

  const handleFileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFileFilter(fileInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSeverity('');
    setType('');
    setFileFilter('');
    setFileInput('');
    setResolution('OPEN');
    setPage(1);
  };

  const hasFilters = severity || type || fileFilter || resolution !== 'OPEN';

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      switch (sortBy) {
        case 'severity': {
          const severityOrder = { CRITICAL: 0, MAJOR: 1, MINOR: 2, INFO: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        case 'line':
          return a.line - b.line;
        case 'file':
          return a.file.localeCompare(b.file);
        default:
          return 0;
      }
    });
  }, [issues, sortBy]);

  const stats = useMemo(() => ({
    critical: issues.filter(i => i.severity === 'CRITICAL').length,
    major: issues.filter(i => i.severity === 'MAJOR').length,
    minor: issues.filter(i => i.severity === 'MINOR').length,
    info: issues.filter(i => i.severity === 'INFO').length
  }), [issues]);

  return (
    <div className="space-y-4">
      {/* Filters Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Severity</label>
            <select
              value={severity}
              onChange={e => { setSeverity(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="">All</option>
              {SEVERITIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
            <select
              value={type}
              onChange={e => { setType(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="">All</option>
              {TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
            <select
              value={resolution}
              onChange={e => { setResolution(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="OPEN">Open</option>
              <option value="FIXED">Fixed</option>
              <option value="WONT_FIX">Won't Fix</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Sort</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="severity">By Severity</option>
              <option value="line">By Line</option>
              <option value="file">By File</option>
            </select>
          </div>
        </div>

        {/* Search & Statistics */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={fileInput}
            onChange={e => setFileInput(e.target.value)}
            placeholder="Search by file..."
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
          />
          <button onClick={handleFileSearch} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-mono transition-colors">Search</button>
          {hasFilters && <button onClick={clearFilters} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-mono transition-colors">Clear</button>}
        </div>

        {/* Stats & Navigation */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
          <div className="space-x-3">
            <span>🔴 Critical: {stats.critical}</span>
            <span>🟠 Major: {stats.major}</span>
            <span>🟡 Minor: {stats.minor}</span>
            <span>ℹ️ Info: {stats.info}</span>
          </div>
          <span>{total} total issues</span>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-400 font-mono">Loading issues...</p>
          <div className="mt-2 text-xs text-slate-500">Large projects may take a few moments to process</div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
          <p className="text-red-400 font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Issues List */}
      {!loading && sortedIssues.length > 0 && (
        <div className="space-y-2">
          {sortedIssues.map(issue => (
            <div key={issue.id} className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors">
              {/* Issue Header */}
              <div
                onClick={() => toggleIssue(issue.id)}
                className="p-3 cursor-pointer hover:bg-slate-800/40 transition-colors flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={issue.severity} />
                    <IssueTypeBadge type={issue.type} />
                    <span className="text-slate-400 font-mono text-sm">{issue.file}:{issue.line}</span>
                  </div>
                  <p className="text-slate-200 text-sm">{issue.message}</p>
                </div>
                <span className="text-slate-500 text-lg ml-2">{expandedIssueIds.has(issue.id) ? '▼' : '▶'}</span>
              </div>

              {/* Expanded Content */}
              {expandedIssueIds.has(issue.id) && (
                <div className="bg-slate-800/30 border-t border-slate-700 p-3 space-y-3">
                  {issue.codeSnippet && (
                    <div className="bg-slate-950/80 rounded p-2">
                      <p className="text-xs text-slate-500 mb-1">Code:</p>
                      <code className="text-xs text-slate-300 font-mono block whitespace-pre-wrap break-words">{issue.codeSnippet}</code>
                    </div>
                  )}

                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-500">Rule: <span className="text-slate-300 font-mono">{issue.rule}</span></span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {issue.resolution === 'OPEN' && (
                      <>
                        <button
                          onClick={() => handleResolution(issue.id, 'FIXED')}
                          className="px-3 py-1 bg-green-900/40 hover:bg-green-900/60 text-green-400 rounded text-xs font-mono transition-colors"
                        >
                          ✓ Mark Fixed
                        </button>
                        <button
                          onClick={() => handleResolution(issue.id, 'FALSE_POSITIVE')}
                          className="px-3 py-1 bg-blue-900/40 hover:bg-blue-900/60 text-blue-400 rounded text-xs font-mono transition-colors"
                        >
                          ? False Positive
                        </button>
                        <button
                          onClick={() => handleResolution(issue.id, 'WONT_FIX')}
                          className="px-3 py-1 bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-400 rounded text-xs font-mono transition-colors"
                        >
                          - Won't Fix
                        </button>
                      </>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="border-t border-slate-700 pt-2">
                    <p className="text-xs text-slate-400 mb-2 font-mono">Comments ({(comments[issue.id] || []).length})</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(comments[issue.id] || []).map(comment => (
                        <div key={comment.id} className="text-xs bg-slate-900/50 rounded p-2">
                          <p className="text-slate-400"><strong>{comment.user.name}:</strong></p>
                          <p className="text-slate-300">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add comment..."
                        value={commentText[issue.id] || ''}
                        onChange={e => setCommentText(prev => ({ ...prev, [issue.id]: e.target.value }))}
                        className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono"
                      />
                      <button
                        onClick={() => addComment(issue.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-xs font-mono transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-1 rounded text-sm font-mono transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-400 font-mono text-sm">Page {page} of {pages}</span>
          <button
            onClick={() => setPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-1 rounded text-sm font-mono transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedIssues.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-500 font-mono">No issues found</p>
        </div>
      )}
    </div>
  );
};

export default IssueTable;
