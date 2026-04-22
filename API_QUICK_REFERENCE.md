# 🎯 QUICK REFERENCE - API Usage Examples

## 1️⃣ Import & Analyze Git Repository

**Endpoint:**
```
POST http://localhost:4000/api/repositories/import
```

**Request:**
```bash
curl -X POST http://localhost:4000/api/repositories/import \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/facebook/react.git",
    "branch": "main",
    "projectName": "React Framework Analysis"
  }'
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "proj_123",
    "name": "React Framework Analysis",
    "url": "https://github.com/facebook/react",
    "stats": {
      "typescript": { "files": 245, "lines": 89234 },
      "javascript": { "files": 128, "lines": 45300 },
      "css": { "files": 45, "lines": 12400 }
    },
    "contributors": [
      { "name": "Dan Abramov", "commits": 2340, "percentage": 35 }
    ],
    "totalCommits": 8934,
    "lastCommit": "2024-01-15T10:30:00Z"
  },
  "message": "✅ Repository imported and analyzed successfully"
}
```

---

## 2️⃣ ML Bug Prediction

**Endpoint:**
```
POST http://localhost:4000/api/analysis/:projectId/ml/predict-bugs
```

**Request:**
```bash
curl -X POST http://localhost:4000/api/analysis/proj_123/ml/predict-bugs \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const x = null; console.log(x.value); if (!Array.isArray(data)) process(data);",
    "language": "javascript"
  }'
```

**Response:**
```json
{
  "bugPrediction": {
    "score": 78,
    "severity": "HIGH",
    "confidence": 0.92,
    "message": "High probability of runtime errors detected"
  },
  "detectedPatterns": [
    {
      "pattern": "null_dereference",
      "severity": "CRITICAL",
      "line": 1,
      "description": "Potential null pointer dereference"
    },
    {
      "pattern": "type_check_missing",
      "severity": "HIGH",
      "line": 1,
      "description": "Missing type validation before operation"
    }
  ],
  "riskFactors": {
    "error_handling": 0.8,
    "type_safety": 0.9,
    "null_checks": 0.95,
    "boundary_conditions": 0.7
  },
  "refactoringPlan": [
    "Add null/undefined checks before property access",
    "Use optional chaining operator (?.)",
    "Add type guards for data validation",
    "Consider using TypeScript for type safety"
  ]
}
```

---

## 3️⃣ Performance Analysis

**Endpoint:**
```
POST http://localhost:4000/api/analysis/:projectId/performance
```

**Request:**
```bash
curl -X POST http://localhost:4000/api/analysis/proj_123/performance \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "src/utils/processing.js",
    "codeSnippet": "for (let i = 0; i < 1000000; i++) { for (let j = 0; j < 1000000; j++) { /* nested loops */ } }"
  }'
```

**Response:**
```json
{
  "performanceAnalysis": {
    "overallScore": 25,
    "recommendation": "CRITICAL: Multiple performance issues detected"
  },
  "findings": {
    "memoryLeaks": [
      {
        "type": "Event listener accumulation",
        "severity": "HIGH",
        "line": 42
      }
    ],
    "concurrencyIssues": [
      {
        "type": "Race condition",
        "severity": "MEDIUM",
        "description": "Shared variable access without synchronization"
      }
    ],
    "cpuIntensive": [
      {
        "type": "Nested loops - O(n²) complexity",
        "severity": "CRITICAL",
        "estimatedTime": "1000000ms for 1M iterations"
      }
    ],
    "ioBottlenecks": [
      {
        "type": "Synchronous file operations",
        "severity": "HIGH",
        "line": 78
      }
    ]
  },
  "recommendations": [
    "Use async operations instead of synchronous I/O",
    "Optimize nested loops - consider hashmap or indexed arrays",
    "Remove event listener accumulation with proper cleanup",
    "Use worker threads for CPU-intensive calculations"
  ]
}
```

---

## 4️⃣ Code Review - Get Suggestions

**Endpoint:**
```
POST http://localhost:4000/api/code-review/suggestions
```

**Request:**
```bash
curl -X POST http://localhost:4000/api/code-review/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "code": "async function fetchUser(id) { const user = await fetch(\"/api/users/\" + id); return user.json(); }",
    "language": "javascript",
    "context": "User API endpoint"
  }'
```

**Response:**
```json
{
  "suggestions": [
    {
      "type": "SECURITY",
      "severity": "HIGH",
      "suggestion": "Use URL constructor or encodeURIComponent for URL parameters",
      "reason": "String concatenation for URLs is vulnerable to injection attacks",
      "line": 1,
      "example": "new URL(`/api/users/${encodeURIComponent(id)}`)"
    },
    {
      "type": "BEST_PRACTICE",
      "severity": "MEDIUM",
      "suggestion": "Add error handling for network failures",
      "reason": "fetch() can fail without try/catch. Errors should be caught and handled",
      "line": 1
    },
    {
      "type": "PERFORMANCE",
      "severity": "MEDIUM",
      "suggestion": "Add timeout mechanism for fetch",
      "reason": "Network requests can hang indefinitely without timeout",
      "line": 1
    }
  ]
}
```

---

## 5️⃣ Dependency Scanning

**Endpoint:**
```
POST http://localhost:4000/api/projects/:projectId/scan-dependencies
```

**Request:**
```bash
curl -X POST http://localhost:4000/api/projects/proj_123/scan-dependencies \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "scanSummary": {
    "totalPackages": 245,
    "vulnerabilities": 8,
    "outdated": 32,
    "riskScore": 6.8
  },
  "vulnerabilities": [
    {
      "package": "lodash",
      "version": "4.17.15",
      "vulnerability": "Prototype Pollution",
      "severity": "HIGH",
      "cve": "CVE-2021-23337",
      "fix": "Update to 4.17.21 or higher",
      "description": "Lodash versions before 4.17.21 vulnerable to prototype pollution attack"
    }
  ],
  "outdated": [
    {
      "package": "react",
      "currentVersion": "16.0.0",
      "latestVersion": "18.2.0",
      "updateType": "MAJOR",
      "riskLevel": "MEDIUM"
    }
  ],
  "licenseCompliance": {
    "acceptable": 240,
    "warning": 3,
    "unacceptable": 2
  },
  "recommendations": [
    "🔴 Update lodash immediately (HIGH priority)",
    "🟡 Review license compliance for 2 packages",
    "🟢 Consider updating react to latest version (MAJOR breaking changes)"
  ]
}
```

---

## 6️⃣ Advanced Search

**Endpoint:**
```
GET http://localhost:4000/api/search?q=query&projectId=id&filters...
```

**Request:**
```bash
curl -X GET "http://localhost:4000/api/search?q=database%20connection&projectId=proj_123&language=javascript&severity=HIGH&type=BUG" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "results": [
    {
      "file": "src/services/db.js",
      "line": 42,
      "snippet": "const conn = mysql.createConnection(...);",
      "match": "database connection",
      "type": "BUG",
      "severity": "HIGH"
    },
    {
      "file": "src/utils/cache.js",
      "line": 15,
      "snippet": "// TODO: Fix database connection pooling",
      "match": "database connection",
      "type": "COMMENT",
      "severity": "MEDIUM"
    }
  ],
  "count": 2,
  "searchTime": "145ms"
}
```

---

## 7️⃣ Create Code Review

**Endpoint:**
```
POST http://localhost:4000/api/projects/:projectId/code-reviews
```

**Request:**
```bash
curl -X POST http://localhost:4000/api/projects/proj_123/code-reviews \
  -H "Content-Type: application/json" \
  -d '{
    "prNumber": 445,
    "title": "Add user authentication",
    "author": "john-dev",
    "reviewers": ["alice-senior", "bob-lead"],
    "description": "Implements OAuth2 authentication flow"
  }'
```

**Response:**
```json
{
  "success": true,
  "codeReview": {
    "id": "review_789",
    "prNumber": 445,
    "status": "PENDING_REVIEW",
    "suggestions": [
      {
        "line": 25,
        "comment": "Consider using environment variables for secrets",
        "author": "system",
        "severity": "HIGH"
      }
    ]
  }
}
```

---

## 8️⃣ Get Repository Branches

**Endpoint:**
```
GET http://localhost:4000/api/repositories/:projectId/branches
```

**Request:**
```bash
curl -X GET http://localhost:4000/api/repositories/proj_123/branches
```

**Response:**
```json
{
  "branches": [
    {
      "name": "main",
      "commit": {
        "hash": "a1b2c3d4e5f6g7h8",
        "date": "2024-01-15T10:30:00Z",
        "message": "Merge PR: Add authentication"
      },
      "isDefault": true
    },
    {
      "name": "develop",
      "commit": {
        "hash": "f1e2d3c4b5a6g7h8",
        "date": "2024-01-14T15:20:00Z",
        "message": "WIP: Performance optimization"
      },
      "isDefault": false
    }
  ],
  "count": 2
}
```

---

## 9️⃣ Setup GitHub Webhook

**Endpoint:**
```
POST http://localhost:4000/api/repositories/:projectId/webhook
```

**Request:**
```bash
curl -X POST http://localhost:4000/api/repositories/proj_123/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://api.codescan.io/webhooks/github",
    "events": ["push", "pull_request", "pull_request_review"],
    "active": true
  }'
```

**Response:**
```json
{
  "success": true,
  "webhook": {
    "id": "webhook_456",
    "url": "https://api.codescan.io/webhooks/github",
    "events": ["push", "pull_request", "pull_request_review"],
    "status": "ACTIVE",
    "lastDelivery": null,
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

---

## 🔟 Get Commits History

**Endpoint:**
```
GET http://localhost:4000/api/repositories/:projectId/commits?limit=10&branch=main
```

**Request:**
```bash
curl -X GET "http://localhost:4000/api/repositories/proj_123/commits?limit=10&branch=main"
```

**Response:**
```json
{
  "commits": [
    {
      "hash": "a1b2c3d4e5f6",
      "author": "John Dev",
      "date": "2024-01-15T10:30:00Z",
      "message": "Fix: Authorization header validation",
      "filesChanged": 3,
      "additions": 45,
      "deletions": 12
    }
  ],
  "count": 10
}
```

---

## 📋 Common Use Cases

### Scenario 1: Initial Repository Analysis
```bash
# 1. Import repo
curl -X POST http://localhost:4000/api/repositories/import \
  -d '{"url": "https://github.com/user/repo.git", "projectName": "My Repo"}'

# 2. Wait for import to complete
# 3. Scan dependencies
curl -X POST http://localhost:4000/api/projects/{projectId}/scan-dependencies

# 4. Run ML analysis on key files
curl -X POST http://localhost:4000/api/analysis/{projectId}/ml/predict-bugs \
  -d '{"code": "...", "language": "javascript"}'
```

### Scenario 2: Code Review Process
```bash
# 1. Get code review suggestions
curl -X POST http://localhost:4000/api/code-review/suggestions \
  -d '{"code": "...", "language": "javascript"}'

# 2. Create code review
curl -X POST http://localhost:4000/api/projects/{projectId}/code-reviews \
  -d '{"prNumber": 123, "title": "...", "reviewers": [...]}'

# 3. Add discussion
curl -X POST http://localhost:4000/api/projects/{projectId}/discussions \
  -d '{"reviewId": "...", "comment": "...", "mentions": [...]}'
```

### Scenario 3: Continuous Integration
```bash
# 1. Setup webhook
curl -X POST http://localhost:4000/api/repositories/{projectId}/webhook \
  -d '{"webhookUrl": "...", "events": ["push", "pull_request"]}'

# 2. GitHub automatically sends events
# 3. System auto-analyzes on each push
```

---

## 🔐 Authentication

Add GitHub token to environment:
```bash
GITHUB_TOKEN=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
```

Or pass in Authorization header:
```bash
Authorization: Bearer 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
```

---

Generated: 2024  
Last Updated: Now  
⚡ Ready to use!