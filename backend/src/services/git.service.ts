/**
 * Lightweight Git service that uses GitHub API - NO LOCAL CLONING
 * Fetches data directly from GitHub without storing files locally
 * Data is temporary and not persisted to disk
 */
export class GitService {
  private githubToken = process.env.GITHUB_TOKEN;

  /**
   * Parse GitHub URL to get owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    // Limpiar la URL: remover trailing slash y .git
    let cleanUrl = url.trim().replace(/\/$/, '').replace(/\.git$/, '');
    
    const match = cleanUrl.match(/github\.com[:/]([^/]+)\/([^/\s.]+)/i);
    if (!match) throw new Error(`Invalid GitHub URL format: ${url}`);
    
    const owner = match[1];
    const repo = match[2];
    console.log(`✅ Parsed GitHub URL: owner="${owner}", repo="${repo}" from URL: ${url}`);
    
    return { owner, repo };
  }

  /**
   * Make GitHub API request with authentication
   */
  private async githubRequest(endpoint: string, options: any = {}) {
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CodesCam'
    };

    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
      console.log(`🔐 Token found: YES (${this.githubToken.substring(0, 10)}...)`);
      console.log(`🔐 Authorization header value: "${headers['Authorization'].substring(0, 20)}..."`);
    } else {
      console.log(`❌ NO TOKEN AVAILABLE - githubToken is: ${this.githubToken}`);
    }

    const finalHeaders = { ...headers, ...options.headers };
    console.log(`📤 URL: https://api.github.com${endpoint}`);
    console.log(`📋 All headers being sent:`, finalHeaders);
    console.log(`📋 Authorization header in final: ${finalHeaders['Authorization'] ? 'YES - ' + finalHeaders['Authorization'].substring(0, 15) + '...' : 'NO'}`);

    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: finalHeaders
    });

    console.log(`📥 GitHub response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorDetails = '';
      try {
        // Read body as text once, then try to parse as JSON
        const bodyText = await response.text();
        if (bodyText) {
          try {
            const errorBody = JSON.parse(bodyText);
            errorDetails = JSON.stringify(errorBody);
            console.log(`❌ Error response body:`, errorBody);
          } catch {
            errorDetails = bodyText;
            console.log(`❌ Error response text:`, bodyText);
          }
        }
      } catch (e) {
        console.log(`❌ Could not read error response:`, e);
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}${errorDetails ? ' - ' + errorDetails : ''}`);
    }

    return response.json();
  }

  /**
   * Import a repository from GitHub (NO LOCAL CLONING)
   */
  async importRepository(url: string, branch = 'main') {
    const { owner, repo } = this.parseGitHubUrl(url);
    
    try {
      console.log(`📥 Starting GitHub API analysis for: ${url}`);
      
      const metadata = await this.getRepositoryMetadata(owner, repo);
      console.log(`📊 Repository default branch: ${metadata.defaultBranch}`);
      
      // Use the repository's default branch if no branch specified or if main doesn't exist
      const targetBranch = metadata.defaultBranch || branch;
      console.log(`🔀 Using branch: ${targetBranch} (requested: ${branch})`);
      
      const commits = await this.getCommitHistory(owner, repo, targetBranch, 1);
      const contributors = await this.getContributors(owner, repo, 5);

      return {
        success: true,
        repository: metadata,
        branch: targetBranch,
        lastCommit: commits[0] || null,
        topContributors: contributors,
        message: `✅ Repository ${metadata.name} imported and analyzed (no local storage)`
      };
    } catch (error) {
      throw new Error(`Failed to import repository: ${error}`);
    }
  }

  /**
   * Get repository metadata from GitHub API
   */
  async getRepositoryMetadata(owner: string, repo: string) {
    try {
      const repoData: any = await this.githubRequest(`/repos/${owner}/${repo}`);

      // Get languages
      const languages: any = await this.githubRequest(`/repos/${owner}/${repo}/languages`);

      // Get basic stats
      return {
        id: repoData.id,
        name: repoData.name,
        owner: repoData.owner.login,
        url: repoData.html_url,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        language: repoData.language,
        languages: languages,
        isPublic: !repoData.private,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        defaultBranch: repoData.default_branch,
        topics: repoData.topics || [],
        license: repoData.license?.spdx_id || null,
        size: repoData.size,
        archived: repoData.archived
      };
    } catch (error) {
      throw new Error(`Failed to get repository metadata: ${error}`);
    }
  }

  /**
   * Get all branches from repository
   */
  async getAllBranches(owner: string, repo: string): Promise<any[]> {
    try {
      const branches: any = await this.githubRequest(`/repos/${owner}/${repo}/branches?per_page=100`);
      return branches.map((b: any) => ({
        name: b.name,
        commit: {
          hash: b.commit.sha,
          message: b.commit.commit.message,
          date: b.commit.commit.author.date,
          author: b.commit.commit.author.name
        },
        isDefault: b.name === 'main' || b.name === 'master'
      }));
    } catch (error) {
      throw new Error(`Failed to get branches: ${error}`);
    }
  }

  /**
   * Get commit history without cloning
   */
  async getCommitHistory(owner: string, repo: string, branch = 'main', limit = 50): Promise<any[]> {
    try {
      const endpoint = `/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${limit}`;
      console.log(`📝 GitHub API Request: ${endpoint}`);
      console.log(`🔐 Token present: ${!!this.githubToken}`);
      
      const commits: any = await this.githubRequest(endpoint);

      return commits.map((c: any) => ({
        hash: c.sha.substring(0, 7),
        fullHash: c.sha,
        author: c.commit.author?.name || 'Unknown',
        email: c.commit.author?.email || '',
        date: c.commit.author?.date || new Date().toISOString(),
        message: c.commit.message,
        url: c.html_url,
        filesChanged: c.files?.length || 0,
        additions: c.stats?.additions || 0,
        deletions: c.stats?.deletions || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get commit history: ${error}`);
    }
  }

  /**
   * Get pull requests
   */
  async getPullRequests(owner: string, repo: string, state = 'open', limit = 10): Promise<any[]> {
    try {
      const prs: any = await this.githubRequest(
        `/repos/${owner}/${repo}/pulls?state=${state}&per_page=${limit}`
      );

      return prs.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        state: pr.state,
        created: pr.created_at,
        updated: pr.updated_at,
        url: pr.html_url,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        commits: pr.commits || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get pull requests: ${error}`);
    }
  }

  /**
   * Get repository contributors
   */
  async getContributors(owner: string, repo: string, limit = 30): Promise<any[]> {
    try {
      const contributors: any = await this.githubRequest(
        `/repos/${owner}/${repo}/contributors?per_page=${limit}`
      );

      return contributors.map((contrib: any) => ({
        username: contrib.login,
        avatar: contrib.avatar_url,
        contributions: contrib.contributions,
        url: contrib.html_url
      }));
    } catch (error) {
      throw new Error(`Failed to get contributors: ${error}`);
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(owner: string, repo: string, filePath: string, branch = 'main'): Promise<string> {
    try {
      const token = process.env.GITHUB_TOKEN;
      const headers: any = {
        'Accept': 'application/vnd.github.raw+json',
        'User-Agent': 'CodesCam'
      };

      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      throw new Error(`Failed to get file content: ${error}`);
    }
  }

  /**
   * Get repository languages from GitHub API
   */
  async getRepositoryLanguages(owner: string, repo: string): Promise<any> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GitHub token not configured');

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch languages');
      return response.json();
    } catch (error) {
      throw new Error(`GitHub API error: ${error}`);
    }
  }

  /**
   * Set up webhook for automatic analysis
   */
  async setupWebhook(owner: string, repo: string, webhookUrl: string): Promise<any> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GitHub token not configured');

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'web',
          active: true,
          events: ['push', 'pull_request'],
          config: {
            url: webhookUrl,
            content_type: 'json'
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create webhook');
      return response.json();
    } catch (error) {
      throw new Error(`GitHub API error: ${error}`);
    }
  }

  /**
   * Get recent release info
   */
  async getLatestRelease(owner: string, repo: string): Promise<any> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GitHub token not configured');

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Failed to fetch releases:', error);
      return null;
    }
  }

  /**
   * Get repository issues (without PRs)
   */
  async getIssues(owner: string, repo: string, state = 'open', limit = 10): Promise<any[]> {
    try {
      const issues: any = await this.githubRequest(
        `/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit}`
      );

      return issues
        .filter((issue: any) => !issue.pull_request) // Exclude PRs
        .map((issue: any) => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: issue.user.login,
          created: issue.created_at,
          updated: issue.updated_at,
          labels: issue.labels.map((l: any) => l.name),
          url: issue.html_url
        }));
    } catch (error) {
      throw new Error(`Failed to get issues: ${error}`);
    }
  }

  /**
   * Get repository releases with download info
   */
  async getReleases(owner: string, repo: string, limit = 10): Promise<any[]> {
    try {
      const releases: any = await this.githubRequest(
        `/repos/${owner}/${repo}/releases?per_page=${limit}`
      );

      return releases.map((release: any) => ({
        version: release.tag_name,
        name: release.name,
        published: release.published_at,
        draft: release.draft,
        prerelease: release.prerelease,
        downloads: release.assets.reduce((sum: number, asset: any) => sum + asset.download_count, 0),
        url: release.html_url
      }));
    } catch (error) {
      throw new Error(`Failed to get releases: ${error}`);
    }
  }

  /**
   * Get code frequency statistics
   */
  async getCodeFrequency(owner: string, repo: string): Promise<any[]> {
    try {
      const data: any = await this.githubRequest(
        `/repos/${owner}/${repo}/stats/code_frequency`
      );
      return data || [];
    } catch (error) {
      console.warn('Code frequency not available:', error);
      return [];
    }
  }

  /**
   * Get traffic analytics (views and clones)
   */
  async getTraffic(owner: string, repo: string): Promise<any> {
    try {
      const views: any = await this.githubRequest(
        `/repos/${owner}/${repo}/traffic/views`
      );
      const clones: any = await this.githubRequest(
        `/repos/${owner}/${repo}/traffic/clones`
      );

      return {
        views: views?.uniques || 0,
        clones: clones?.uniques || 0
      };
    } catch (error) {
      console.warn('Traffic data not available:', error);
      return { views: 0, clones: 0 };
    }
  }

  /**
   * Get commit network graph timeline
   */
  async getNetworkData(owner: string, repo: string, branch: string, limit = 30): Promise<any> {
    try {
      const commits = await this.getCommitHistory(owner, repo, branch, limit);
      return {
        branch,
        commits: commits.map(c => ({
          date: c.date,
          author: c.author,
          message: c.message,
          url: c.url
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get network data: ${error}`);
    }
  }

  /**
   * Get README file content
   */
  async getReadmeContent(owner: string, repo: string): Promise<string | null> {
    try {
      const readme: any = await this.getFileContent(owner, repo, 'README.md', 'main');
      return readme;
    } catch {
      try {
        return await this.getFileContent(owner, repo, 'README.md', 'master');
      } catch {
        return null;
      }
    }
  }

  /**
   * Get repository license information
   */
  async getLicense(owner: string, repo: string): Promise<string | null> {
    try {
      const license: any = await this.githubRequest(
        `/repos/${owner}/${repo}/license`
      );
      return (license as any)?.license?.name || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if repository is archived
   */
  async isArchived(owner: string, repo: string): Promise<boolean> {
    try {
      const repoData: any = await this.githubRequest(
        `/repos/${owner}/${repo}`
      );
      return (repoData as any)?.archived || false;
    } catch {
      return false;
    }
  }

  /**
   * Get fork information and parent repository details
   */
  async getForkInfo(owner: string, repo: string): Promise<any> {
    try {
      const repoData: any = await this.githubRequest(
        `/repos/${owner}/${repo}`
      );

      return {
        isFork: repoData?.fork || false,
        forkCount: repoData?.forks_count || 0,
        parent: repoData?.parent
          ? {
              name: repoData.parent.name,
              owner: repoData.parent.owner.login,
              url: repoData.parent.html_url
            }
          : null
      };
    } catch (error) {
      throw new Error(`Failed to get fork info: ${error}`);
    }
  }

  /**
   * Get all topics/tags for a repository
   */
  async getRepositoryTopics(owner: string, repo: string): Promise<string[]> {
    try {
      const data: any = await this.githubRequest(
        `/repos/${owner}/${repo}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      return data?.topics || [];
    } catch (error) {
      console.warn('Topics not available:', error);
      return [];
    }
  }

  /**
   * Search repositories (using GitHub search API)
   */
  async searchRepositories(query: string, limit = 5): Promise<any[]> {
    try {
      const results: any = await this.githubRequest(
        `/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}`
      );

      return (results.items || []).map((repo: any) => ({
        name: repo.name,
        owner: repo.owner.login,
        url: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language
      }));
    } catch (error) {
      throw new Error(`Failed to search repositories: ${error}`);
    }
  }

  /**
   * Get repository collaborators
   */
  async getCollaborators(owner: string, repo: string, limit = 10): Promise<any[]> {
    try {
      const collaborators: any = await this.githubRequest(
        `/repos/${owner}/${repo}/collaborators?per_page=${limit}`
      );

      return collaborators.map((collab: any) => ({
        username: collab.login,
        role: collab.role_name,
        avatar: collab.avatar_url,
        url: collab.html_url
      }));
    } catch (error) {
      throw new Error(`Failed to get collaborators: ${error}`);
    }
  }
}

export const gitService = new GitService();
