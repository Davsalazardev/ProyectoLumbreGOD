import { Project, Analysis, IssuesResponse, Metrics, QualityGate } from '../types';

const BASE_URL = process.env.REACT_APP_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Projects
  listProjects: (): Promise<Project[]> =>
    request('/projects'),

  getProject: (id: string): Promise<Project> =>
    request(`/projects/${id}`),

  createProject: (data: { name: string; language?: string }): Promise<Project> =>
    request('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  discoverLocalProjects: (): Promise<any> =>
    request('/projects/discover'),

  importLocalProjects: (): Promise<any> =>
    request('/projects/import', {
      method: 'POST'
    }),

  // Analysis
  analyzeProject: (id: string, code: string, filename: string): Promise<{ analysisId: string; status: string }> =>
    request(`/projects/${id}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ code, filename })
    }),

  getAnalysisStatus: (projectId: string, analysisId: string): Promise<Analysis> =>
    request(`/projects/${projectId}/analyses/${analysisId}`),

  // Issues
  getIssues: (
    projectId: string,
    params?: {
      severity?: string;
      type?: string;
      file?: string;
      resolution?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<IssuesResponse> => {
    const qs = new URLSearchParams();
    if (params?.severity) qs.set('severity', params.severity);
    if (params?.type) qs.set('type', params.type);
    if (params?.file) qs.set('file', params.file);
    if (params?.resolution) qs.set('resolution', params.resolution);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/projects/${projectId}/issues${query}`);
  },

  // Metrics
  getMetrics: (projectId: string): Promise<Metrics> =>
    request(`/projects/${projectId}/metrics`),

  // Quality Gate
  getQualityGate: (projectId: string): Promise<QualityGate> =>
    request(`/projects/${projectId}/quality-gate`),

  // Issues Resolving
  resolveIssue: (issueId: string, resolution: string): Promise<any> =>
    request(`/projects/issues/${issueId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution })
    }),

  // Issue Comments
  getIssueComments: (issueId: string): Promise<any[]> =>
    request(`/issues/${issueId}/comments`),

  addIssueComment: (issueId: string, text: string): Promise<any> =>
    request(`/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text })
    }),

  updateIssueComment: (commentId: string, text: string): Promise<any> =>
    request(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text })
    }),

  deleteIssueComment: (commentId: string): Promise<any> =>
    request(`/comments/${commentId}`, {
      method: 'DELETE'
    }),

  // Issue Resolution
  markIssueFixed: (issueId: string, message: string): Promise<any> =>
    request(`/issues/${issueId}/mark-fixed`, {
      method: 'POST',
      body: JSON.stringify({ message })
    }),

  markIssueFalsePositive: (issueId: string, message: string): Promise<any> =>
    request(`/issues/${issueId}/mark-false-positive`, {
      method: 'POST',
      body: JSON.stringify({ message })
    }),

  markIssueWontFix: (issueId: string, message: string): Promise<any> =>
    request(`/issues/${issueId}/mark-wont-fix`, {
      method: 'POST',
      body: JSON.stringify({ message })
    }),

  // Generic methods for custom endpoints
  post: (path: string, body?: any): Promise<any> =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  put: (path: string, body?: any): Promise<any> =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  get: (path: string): Promise<any> =>
    request(path)
};
