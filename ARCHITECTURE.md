# 🏗️ CodesCam Architecture - Complete System Design

## 📊 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CodesCam v2.0                              │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Frontend Layer                          │   │
│  │  (React + TypeScript on port 3000)                          │   │
│  │                                                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│  │  │Dashboard │ │Analysis  │ │Reviews  │ │Reports  │       │   │
│  │  │Projects  │ │Results  │ │Team     │ │& Metrics│       │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                            ↓ API Routes                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      API Gateway                             │   │
│  │              Express + TypeScript (4000)                     │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │              Route Processors                        │    │   │
│  │  │                                                      │    │   │
│  │  │  • /api/repositories    (Git import)                │    │   │
│  │  │  • /api/analysis        (Performance & ML)          │    │   │
│  │  │  • /api/projects        (Team & collab)            │    │   │
│  │  │  • /api/webhooks        (CI/CD)                     │    │   │
│  │  │  • /api/search          (Full-text)                │    │   │
│  │  │  • /api/code-review     (Suggestions)              │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Business Logic Layer                       │   │
│  │                    (10 Services)                             │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │ Core Services (TypeScript)                           │   │   │
│  │  │                                                      │   │   │
│  │  │ 🔗 GitService              (Repository Analysis)    │   │   │
│  │  │    ├─ Clone repositories                            │   │   │
│  │  │    ├─ Fetch metadata                                │   │   │
│  │  │    ├─ Manage branches                               │   │   │
│  │  │    ├─ Track commits                                 │   │   │
│  │  │    └─ Setup webhooks                                │   │   │
│  │  │                                                      │   │   │
│  │  │ 📊 PerformanceService       (Bottleneck Detection)  │   │   │
│  │  │    ├─ Memory leak detection                         │   │   │
│  │  │    ├─ Concurrency analysis                          │   │   │
│  │  │    ├─ CPU profiling                                 │   │   │
│  │  │    └─ I/O bottleneck ID                             │   │   │
│  │  │                                                      │   │   │
│  │  │ 🤖 MLService               (Bug Prediction)         │   │   │
│  │  │    ├─ Pattern extraction                            │   │   │
│  │  │    ├─ Risk calculation                              │   │   │
│  │  │    ├─ Anomaly detection                             │   │   │
│  │  │    └─ Refactoring plans                             │   │   │
│  │  │                                                      │   │   │
│  │  │ 👥 CollaborationService    (Team Tools)             │   │   │
│  │  │    ├─ Code reviews                                  │   │   │
│  │  │    ├─ Discussions                                   │   │   │
│  │  │    ├─ @mentions                                     │   │   │
│  │  │    └─ Activity feeds                                │   │   │
│  │  │                                                      │   │   │
│  │  │ 🔄 CICDService             (Pipeline Integration)   │   │   │
│  │  │    ├─ GitHub Actions                                │   │   │
│  │  │    ├─ GitLab CI                                     │   │   │
│  │  │    ├─ Azure Pipelines                               │   │   │
│  │  │    ├─ Jenkins                                       │   │   │
│  │  │    └─ Notifications (Slack/Discord/Teams)          │   │   │
│  │  │                                                      │   │   │
│  │  │ 🔍 SearchService           (Full-text Search)       │   │   │
│  │  │    ├─ Complex filters                               │   │   │
│  │  │    ├─ Saved searches                                │   │   │
│  │  │    └─ Analytics                                     │   │   │
│  │  │                                                      │   │   │
│  │  │ 📦 DependencyService       (Vulnerability Scan)     │   │   │
│  │  │    ├─ CVE detection                                 │   │   │
│  │  │    ├─ License compliance                            │   │   │
│  │  │    └─ Supply chain risk                             │   │   │
│  │  │                                                      │   │   │
│  │  │ 💬 CodeReviewService       (Suggestions)            │   │   │
│  │  │    ├─ Auto-suggestions                              │   │   │
│  │  │    ├─ Security patterns                             │   │   │
│  │  │    └─ Performance tips                              │   │   │
│  │  │                                                      │   │   │
│  │  │ 📄 ReportsService          (Reports)                │   │   │
│  │  │ 🔐 SecretsService          (Sensitive data)         │   │   │
│  │  │ 🔀 DuplicationService      (Code duplication)       │   │   │
│  │  │ ⚙️  AdminService            (System admin)           │   │   │
│  │  │                                                      │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Data Layer                                │   │
│  │              (Prisma ORM + PostgreSQL)                      │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────┐    │   │
│  │  │ Database Models (12 extended):                    │    │   │
│  │  │ • Project                                         │    │   │
│  │  │ • Issue                                           │    │   │
│  │  │ • AnalysisResult                                  │    │   │
│  │  │ • CodeSnippet                                     │    │   │
│  │  │ • Repository                                      │    │   │
│  │  │ • Performance Profile                             │    │   │
│  │  │ • Webhook                                         │    │   │
│  │  │ • CodeReview                                      │    │   │
│  │  │ • Discussion                                      │    │   │
│  │  │ • SearchQuery                                     │    │   │
│  │  │ • Report                                          │    │   │
│  │  │ • Metrics                                         │    │   │
│  │  └────────────────────────────────────────────────────┘    │   │
│  │                                                              │   │
│  │           PostgreSQL Database (port 5432)                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 External Integrations

```
┌─────────────────────────────────────────────────────────────┐
│                  CodesCam API Gateway                       │
└─────────────────────────────────────────────────────────────┘
         ↓                    ↓                        ↓
    ┌────────────┐    ┌───────────────┐    ┌──────────────┐
    │   GitHub   │    │  GitLab / Git │    │   Jenkins /  │
    │            │    │                │    │   Azure      │
    │ • API v3   │    │ • API          │    │ • CI/CD      │
    │ • Webhooks │    │ • Webhooks     │    │ • Pipelines  │
    │ • OAuth2   │    │ • Runners      │    │ • Build info │
    └────────────┘    └───────────────┘    └──────────────┘

         ↓                    ↓                        ↓
    ┌────────────────────────────────────────────────────────┐
    │        Notification Services (Multi-channel)          │
    ├────────────────────────────────────────────────────────┤
    │  🔴 Slack    │  💜 Discord   │  🏢 MS Teams           │
    │              │                │                        │
    │ • Messages   │ • Embeds       │ • Cards                │
    │ • Threads    │ • Reactions    │ • Adaptive cards       │
    │ • Reactions  │ • Webhooks     │ • @mentions            │
    └────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow - Repository Import Example

```
User Interface
     │
     │ Click "Import Repository" + paste GitHub URL
     ↓
POST /api/repositories/import
     │
     ↓
Advanced Routes Handler
     │
     ├─→ Extract & validate URL
     │
     ├─→ GitService.cloneRepository()
     │   │
     │   ├─→ Fetch repo metadata from GitHub API
     │   │
     │   ├─→ Clone to local filesystem
     │   │
     │   └─→ Cache repository path
     │
     ├─→ Analyze Code Structure
     │   │
     │   ├─→ Scan languages/framework
     │   │
     │   ├─→ Count files/LOC
     │   │
     │   └─→ Extract dependencies
     │
     ├─→ Store in Database
     │   │
     │   └─→ Save Project + Repository + Metadata
     │
     ├─→ Trigger Auto-analysis
     │   │
     │   ├─→ Performance Analysis
     │   │
     │   ├─→ ML Bug Prediction
     │   │
     │   └─→ Dependency Scanning
     │
     ↓
Return Success Response + Project ID
     │
     ↓
Frontend updates with new project
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│            Docker Container Orchestration            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Container 1: PostgreSQL                           │
│  ├─ Image: postgres:15                             │
│  ├─ Port: 5432                                     │
│  ├─ Volume: /data/postgres                         │
│  └─ Health: ✅ Running                              │
│                                                      │
│  Container 2: Backend API                          │
│  ├─ Image: codescan-backend:latest                │
│  ├─ Port: 4000                                     │
│  ├─ Environment:                                   │
│  │  • GITHUB_TOKEN                                │
│  │  • DATABASE_URL                                │
│  │  • CORS_ORIGIN                                 │
│  ├─ Health: ✅ Healthy                              │
│  └─ Deps: postgres                                 │
│                                                      │
│  Container 3: Frontend                             │
│  ├─ Image: codescan-frontend:latest               │
│  ├─ Port: 3000                                     │
│  ├─ Nginx reverse proxy                           │
│  ├─ Health: ✅ Running                              │
│  └─ Deps: backend                                  │
│                                                      │
└──────────────────────────────────────────────────────┘
          ↓                ↓                ↓
    ┌─────────────────────────────────────────┐
    │    Docker Network: codescan-network    │
    │    (Inter-container communication)     │
    └─────────────────────────────────────────┘
          ↓                ↓                ↓
    ┌─────────────────────────────────────────┐
    │    Localhost Ports (Host Machine)       │
    │  3000 (Frontend) ← → 4000 (Backend)    │
    │                    5432 (Database)     │
    └─────────────────────────────────────────┘
```

---

## 📈 Request Processing Pipeline

```
HTTP Request
    │
    ↓
Express Router
    │
    ├─→ Request Validation (path, body, query)
    │
    ├─→ Type Checking (TypeScript)  
    │
    ├─→ Route Handler
    │   │
    │   ├─→ Parse parameters
    │   │
    │   └─→ Call appropriate Service
    │
    ├─→ Service Layer
    │   │
    │   ├─→ Business Logic (Analysis/Processing)
    │   │
    │   ├─→ Database Operations (Prisma)
    │   │
    │   ├─→ External API Calls (GitHub, etc.)
    │   │
    │   └─→ Error Handling
    │
    ├─→ Response Assembly
    │   │
    │   ├─→ Format JSON
    │   │
    │   └─→ Set status codes
    │
    ↓
HTTP Response (200/400/500)
    │
    ↓
Frontend (React)
    │
    ├─→ Parse response
    │
    ├─→ Update state
    │
    └─→ Re-render UI
```

---

## 🛣️ API Endpoint Organization

```
┌─── /api  (Base API Router) ───────────────────────────────────┐
│                                                                 │
├── /repositories (Git Integration)                            │
│   ├─ POST   /import                                          │
│   ├─ GET    /:projectId/branches                             │
│   ├─ GET    /:projectId/commits                              │
│   └─ POST   /:projectId/webhook                              │
│                                                                 │
├── /analysis (Analysis Engines)                               │
│   ├─ POST   /:projectId/performance                          │
│   └─ POST   /:projectId/ml/predict-bugs                      │
│                                                                 │
├── /projects (Project Management)                             │
│   ├─ POST   /:projectId/code-reviews                         │
│   ├─ POST   /:projectId/discussions                          │
│   ├─ GET    /:projectId/activity-feed                        │
│   └─ POST   /:projectId/scan-dependencies                    │
│                                                                 │
├── /code-review (Code Review Tools)                           │
│   └─ POST   /suggestions                                     │
│                                                                 │
├── /search (Search Functions)                                 │
│   ├─ GET    /  (with query params)                           │
│   └─ POST   /save                                            │
│                                                                 │
└── /webhooks (CI/CD Webhooks)                                 │
    └─ POST   /github                                          │
```

---

## 🔐 Security & Authentication

```
┌────────────────────────────────────────────────┐
│        Request Authorization Flow             │
└────────────────────────────────────────────────┘

1. Client sends request
        │
        ├─ Header: "Authorization: Bearer TOKEN"
        │      or
        └─ Environment: GITHUB_TOKEN

        ↓

2. GitService validates token
        │
        ├─ Verify format (ghp_XXX...)
        │
        ├─ Check token permissions
        │
        └─ Store securely in memory

        ↓

3. GitHub API calls
        │
        ├─ Include token in headers
        │
        ├─ Rate limiting (5000 req/hr)
        │
        └─ Handle 401/403 responses

        ↓

4. Database encryption
        │
        ├─ Sensitive fields encrypted
        │
        └─ Audit logs for access

        ↓

5. Response sanitization
        │
        ├─ Remove tokens from responses
        │
        └─ Log security events
```

---

## 📊 Data Models Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                    Core Data Models                         │
└─────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   Project    │ (Main entity)
    ├──────────────┤
    │ id           │
    │ name         │
    │ url          │───────┐
    │ description  │       │ 1:1
    │ createdAt    │       │
    └──────────────┘       │
            │              │
            │ 1:Many       ↓
            │         ┌──────────────────┐
            │         │   Repository     │
            │         ├──────────────────┤
            │         │ id               │
            │         │ projectId (FK)   │
            │         │ path             │
            │         │ clonedAt         │
            │         │ lastAnalyzedAt   │
            │         └──────────────────┘
            │
            ├── 1:Many
            │
            ↓
    ┌──────────────┐
    │    Issue     │ (Code issues)
    ├──────────────┤
    │ id           │
    │ projectId    │
    │ type         │
    │ severity     │
    │ description  │
    └──────────────┘

    ┌──────────────┐
    │AnalysisResult│ (Analysis output)
    ├──────────────┤
    │ id           │
    │ projectId    │
    │ type         │
    │ data: JSON   │
    │ timestamp    │
    └──────────────┘

    ┌──────────────┐
    │  CodeReview  │
    ├──────────────┤
    │ id           │
    │ projectId    │
    │ prNumber     │
    │ status       │
    │ reviewers[]  │
    └──────────────┘

    ┌──────────────┐
    │ Discussion   │
    ├──────────────┤
    │ id           │
    │ reviewId(FK) │
    │ comments[]   │
    │ mentions[]   │
    └──────────────┘
```

---

## 🎯 Service Responsibilities

```
┌──────────────────────────────────────────────────────────────┐
│                Service Layer Responsibilities               │
├──────────────────────────────────────────────────────────────┤

GitService
  └─ Repository operations via shell & GitHub API
     ├─ Clone repositories from URLs
     ├─ Extract commit history
     ├─ Manage branches
     ├─ Calculate statistics
     └─ Setup webhooks for CI/CD

PerformanceService
  └─ Analyze code for performance issues
     ├─ Detect memory leaks
     ├─ Identify race conditions
     ├─ Profile CPU usage
     ├─ Analyze I/O patterns
     └─ Generate profiling reports

MLService
  └─ Predict bugs and risks
     ├─ Extract code patterns
     ├─ Calculate risk scores
     ├─ Detect anomalies
     ├─ Generate refactoring plans
     └─ Provide confidence scores

CollaborationService
  └─ Team coordination
     ├─ Create code reviews
     ├─ Manage discussions
     ├─ Track @mentions
     ├─ Record reactions
     └─ Generate activity feeds

CICDService
  └─ CI/CD integration
     ├─ Process GitHub webhooks
     ├─ Parse Jenkins builds
     ├─ Handle GitLab pipelines
     ├─ Send Slack/Discord/Teams notifications
     └─ Generate YAML configs

SearchService
  └─ Full-text search
     ├─ Complex query filtering
     ├─ Save search history
     ├─ Calculate trending
     └─ Optimize results

DependencyService
  └─ Vulnerability scanning
     ├─ Detect CVEs
     ├─ Check licenses
     ├─ Assess supply chain risk
     └─ Suggest upgrades

CodeReviewService
  └─ Auto-generate suggestions
     ├─ Security pattern detection
     ├─ Performance recommendations
     ├─ Best practice checking
     └─ Naming convention validation

ReportsService
  └─ Generate various reports
     ├─ Executive summaries
     ├─ Technical details
     ├─ Compliance reports
     └─ Remediation plans

SecretsService
  └─ Sensitive data detection
     ├─ Find API keys
     ├─ Detect passwords
     ├─ Identify PII
     └─ Flag tokens

DuplicationService
  └─ Code duplication analysis
     ├─ Find duplicate code blocks
     ├─ Calculate percentages
     ├─ Suggest refactoring
     └─ Track improvements

AdminService
  └─ System administration
     ├─ Health monitoring
     ├─ Performance metrics
     ├─ Audit logging
     └─ System statistics
```

---

## 📊 Technology Stack

```
Frontend:
  ├─ React 18.x
  ├─ TypeScript 5.x
  ├─ Tailwind CSS
  ├─ Axios (HTTP client)
  └─ React Router

Backend:
  ├─ Node.js 18.x
  ├─ Express.js
  ├─ TypeScript 5.x
  ├─ Prisma ORM
  ├─ shell.js (Git operations)
  ├─ axios (External APIs)
  └─ dotenv (Configuration)

Database:
  ├─ PostgreSQL 15
  ├─ Prisma Client
  └─ Connection pooling

DevOps:
  ├─ Docker
  ├─ Docker Compose
  └─ nginx (Reverse Proxy)

External APIs:
  ├─ GitHub API v3
  ├─ GitLab API
  ├─ Azure Pipelines API
  ├─ Jenkins API
  ├─ Slack Webhooks
  ├─ Discord Webhooks
  └─ Microsoft Teams

Development:
  ├─ npm package manager
  ├─ TypeScript compiler
  ├─ ESLint (Linting)
  ├─ pytest (if Python tests)
  └─ Jest (Unit tests)
```

---

Generated: 2024
Version: 2.0
Status: ✅ Complete System Design