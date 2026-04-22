# 🎮 COMMAND REFERENCE - All Essential Commands

## 🚀 Getting Started

### 1. Start the System
```bash
# Navigate to project directory
cd /Users/vaa/Documents/CodesCam

# Start all containers (database, backend, frontend)
docker-compose up -d

# Verify containers are running
docker-compose ps

# Expected output:
# NAME              STATUS              PORTS
# codescan_postgres   Up (healthy)        5432
# codescan_backend    Up (healthy)        4000  
# codescan_frontend   Up                  3000
```

### 2. Stop the System
```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Stop specific container
docker-compose stop backend
```

### 3. View Logs
```bash
# View all logs
docker-compose logs

# Backend logs (live)
docker-compose logs -f backend

# Frontend logs (live)
docker-compose logs -f frontend

# Database logs (live)
docker-compose logs -f postgres

# Last 50 lines from backend
docker-compose logs --tail=50 backend
```

---

## 🔧 Backend Development

### Build Backend
```bash
# Navigate to backend directory
cd /Users/vaa/Documents/CodesCam/backend

# Install dependencies
npm install

# Build TypeScript (compile TS → JS)
npm run build

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint

# Run tests
npm test
```

### Run Backend Locally (Development)
```bash
# Start development server with hot reload
npm run dev

# Or run production build
npm run build
npm start

# The backend will be available at http://localhost:4000
```

### Build Backend Docker Image
```bash
# Build image
docker build -t codescan-backend:latest .

# Run container from image
docker run -p 4000:4000 \
  -e GITHUB_TOKEN=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 \
  -e DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codescan" \
  codescan-backend:latest
```

### Database Operations
```bash
# Navigate to backend directory (where prisma schema is)
cd /Users/vaa/Documents/CodesCam/backend

# Run pending migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name add_new_field

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (GUI for database)
npx prisma studio
```

---

## 🎨 Frontend Development

### Build Frontend
```bash
# Navigate to frontend directory
cd /Users/vaa/Documents/CodesCam/frontend

# Install dependencies
npm install

# Build React app
npm run build

# Check TypeScript
npm run type-check

# Run linter
npm run lint

# Run tests
npm test
```

### Run Frontend Locally
```bash
# Development mode with hot reload
npm start

# Production build + serve
npm run build
npx serve -s build -l 3000

# Access at http://localhost:3000
```

### Build Frontend Docker Image
```bash
# Build image
docker build -t codescan-frontend:latest .

# Run container
docker run -p 3000:80 codescan-frontend:latest
```

---

## 🔗 API Testing

### Using cURL

#### 1. Health Check
```bash
curl http://localhost:4000/health
```

#### 2. Import Repository
```bash
curl -X POST http://localhost:4000/api/repositories/import \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/facebook/react.git",
    "branch": "main",
    "projectName": "React"
  }' | jq
```

#### 3. Get Branches
```bash
curl -X GET http://localhost:4000/api/repositories/proj_1/branches | jq
```

#### 4. Get Commits
```bash
curl -X GET http://localhost:4000/api/repositories/proj_1/commits | jq
```

#### 5. Run ML Analysis
```bash
curl -X POST http://localhost:4000/api/analysis/proj_1/ml/predict-bugs \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const x = null; console.log(x.value);",
    "language": "javascript"
  }' | jq
```

#### 6. Performance Analysis
```bash
curl -X POST http://localhost:4000/api/analysis/proj_1/performance \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "app.js",
    "codeSnippet": "for(let i=0;i<1000000;i++) for(let j=0;j<1000000;j++){ }"
  }' | jq
```

#### 7. Scan Dependencies
```bash
curl -X POST http://localhost:4000/api/projects/proj_1/scan-dependencies \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

#### 8. Search Code
```bash
curl -X GET "http://localhost:4000/api/search?q=database&projectId=proj_1&language=javascript" | jq
```

#### 9. Code Review Suggestions
```bash
curl -X POST http://localhost:4000/api/code-review/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "code": "async function fetchData(id) { const res = await fetch(\"/api/users/\" + id); return res.json(); }",
    "language": "javascript"
  }' | jq
```

### Using Postman

```bash
# 1. Import collection
# Import these endpoints into Postman:
GET    http://localhost:4000/health
GET    http://localhost:4000/api/repositories/:projectId/branches
GET    http://localhost:4000/api/repositories/:projectId/commits
POST   http://localhost:4000/api/repositories/import
POST   http://localhost:4000/api/analysis/:projectId/performance
POST   http://localhost:4000/api/analysis/:projectId/ml/predict-bugs
POST   http://localhost:4000/api/projects/:projectId/code-reviews
POST   http://localhost:4000/api/projects/:projectId/scan-dependencies
POST   http://localhost:4000/api/code-review/suggestions
GET    http://localhost:4000/api/search
POST   http://localhost:4000/api/search/save
POST   http://localhost:4000/api/projects/:projectId/webhook

# 2. Add tests to each endpoint
# 3. Run collection to test all endpoints at once
```

---

## 📦 Docker Commands

### View Container Status
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View specific container info
docker inspect codescan_backend

# View resource usage (CPU, memory)
docker stats

# View container ip
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' codescan_backend
```

### Container Management
```bash
# Restart container
docker-compose restart backend

# Rebuild specific service
docker-compose up -d --build backend

# Remove all stopped containers
docker container prune

# View events in real-time
docker events --filter 'container=codescan_backend'

# Attach to container shell
docker exec -it codescan_backend bash

# Copy file from container
docker cp codescan_backend:/app/file.txt ./

# Copy file to container
docker cp ./file.txt codescan_backend:/app/
```

### Network Commands
```bash
# View docker networks
docker network ls

# Inspect codescan network
docker network inspect codescan-network

# Check container connectivity
docker exec codescan_backend ping postgres
```

---

## 🐘 PostgreSQL Commands

### Connect to Database
```bash
# From within the container
docker exec -it codescan_postgres psql -U postgres -d codescan

# From local machine (if connected to Docker network)
psql -h localhost -U postgres -d codescan

# Password: postgres (default)
```

### Database Operations (Inside psql)
```sql
-- List all databases
\l

-- Connect to codescan database
\c codescan

-- List all tables
\dt

-- Describe table
\d projects

-- List all schemas
\dn

-- View table data
SELECT * FROM projects LIMIT 10;

-- Get row count
SELECT COUNT(*) FROM issues;

-- Exit psql
\q
```

### Backup/Restore Database
```bash
# Backup database
docker exec codescan_postgres pg_dump -U postgres codescan > backup.sql

# Restore database
docker exec -i codescan_postgres psql -U postgres codescan < backup.sql

# Export to CSV
docker exec codescan_postgres psql -U postgres -d codescan \
  -c "COPY projects TO STDOUT WITH CSV HEADER" > projects.csv
```

---

## 🔐 Environment Configuration

### Update .env File
```bash
# Navigate to backend directory
cd backend

# Edit .env
nano .env

# Content should be:
GITHUB_TOKEN=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
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/codescan
```

### Reload Environment
```bash
# Source env file (Linux/Mac)
source .env

# Verify env variable
echo $GITHUB_TOKEN

# View all env vars
env | grep GITHUB
```

---

## 📊 Monitoring & Debugging

### View System Health
```bash
# Health endpoint
curl http://localhost:4000/health | jq

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "github": "authenticated",
    "git": "available"
  }
}
```

### Check Service Status
```bash
# View service logs for errors
docker-compose logs backend | grep -i error

# View last startup
docker-compose logs backend | tail -20

# Check database connection
docker exec codescan_backend npm run type-check

# Validate all endpoints are responding
curl -s http://localhost:4000/health && echo "✅ Backend OK"
curl -s http://localhost:3000 | head -5 && echo "✅ Frontend OK"
```

### Debug Issues
```bash
# Check if port is in use
lsof -i :4000
lsof -i :3000
lsof -i :5432

# Kill process on port
kill -9 $(lsof -t -i :4000)

# Check network connectivity
docker network inspect codescan-network

# View environment variables in container
docker exec codescan_backend env | grep GITHUB
```

---

## 🔄 CI/CD Integration

### GitHub Actions Test Webhook
```bash
curl -X POST http://localhost:4000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "repository": {
      "name": "test-repo",
      "full_name": "user/test-repo",
      "owner": {"login": "user"}
    },
    "ref": "refs/heads/main",
    "commits": [
      {
        "id": "abc123",
        "message": "Test commit",
        "timestamp": "2024-01-15T10:00:00Z"
      }
    ]
  }' | jq
```

---

## 📈 Performance Optimization

### Cleaning Up
```bash
# Remove old Docker images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (⚠️ WARNING: deletes everything not in use)
docker system prune -a --volumes

# Check disk usage
docker system df
```

### Build Optimization
```bash
# Build without cache (fresh build)
docker-compose build --no-cache

# Build with buildkit (faster)
DOCKER_BUILDKIT=1 docker build -t codescan-backend:latest .

# Inspect image layers
docker history codescan-backend:latest
```

---

## 🎯 Production Deployment

### Build Production Images
```bash
# Build all images for production
docker-compose -f docker-compose.yml build

# Tag images
docker tag codescan-backend:latest registry.example.com/codescan-backend:1.0
docker tag codescan-frontend:latest registry.example.com/codescan-frontend:1.0

# Push to registry
docker push registry.example.com/codescan-backend:1.0
docker push registry.example.com/codescan-frontend:1.0
```

### Deploy to Production
```bash
# On production server
cd /opt/codescan

# Pull latest code
git pull origin main

# Update environment variables
nano .env

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose logs backend
curl https://api.codescan.io/health
```

---

## 📚 Useful Aliases

Add to your `.zshrc` or `.bashrc`:

```bash
# CodesCam shortcuts
alias cc="cd /Users/vaa/Documents/CodesCam"
alias ccup="docker-compose up -d && echo '✅ CodesCam started'"
alias ccdown="docker-compose down && echo '✅ CodesCam stopped'"
alias cclogs="docker-compose logs -f"
alias ccbackend="docker-compose logs -f backend"
alias ccdb="docker exec -it codescan_postgres psql -U postgres -d codescan"
alias ccbuild="npm run build && echo '✅ Build complete'"
alias cchealth="curl http://localhost:4000/health | jq"

# Reload aliases
source ~/.zshrc
```

---

## 🆘 Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild image
docker-compose up --build backend

# Check port conflict
lsof -i :4000

# Check environment
docker exec codescan_backend env | grep DATABASE_URL
```

### Database Connection Issues
```bash
# Test connection
docker exec codescan_postgres psql -U postgres -c "SELECT 1"

# Check database exists
docker exec codescan_postgres psql -U postgres -l | grep codescan

# Reset database
npx prisma migrate reset --force

# Resync schema
npx prisma db push
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running
curl http://localhost:4000/health

# Check CORS headers
curl -i -H "Origin: http://localhost:3000" http://localhost:4000/health

# Check network connectivity
docker exec codescan_frontend curl http://backend:4000/health

# Verify CORS_ORIGIN in .env
grep CORS_ORIGIN backend/.env
```

### Docker Compose Issues
```bash
# Rebuild all services
docker-compose up --build

# Remove all containers
docker-compose rm -f

# Start fresh
docker-compose up -d

# Validate docker-compose.yml
docker-compose config
```

---

## 📋 Quick Status Check

```bash
#!/bin/bash
# Create this as check-status.sh

echo "🔍 Checking CodesCam Status..."
echo ""

echo "1️⃣  Docker Containers:"
docker-compose ps
echo ""

echo "2️⃣  Backend Health:"
curl -s http://localhost:4000/health | jq '.status' || echo "❌ Backend down"
echo ""

echo "3️⃣  Frontend Status:"
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend running" || echo "❌ Frontend down"
echo ""

echo "4️⃣  Database Connection:"
docker exec codescan_postgres psql -U postgres -c "SELECT 1" > /dev/null 2>&1 && echo "✅ Database OK" || echo "❌ Database error"
echo ""

echo "5️⃣  Ports in Use:"
lsof -i :3000 -i :4000 -i :5432
echo ""

echo "✅ Status check complete!"
```

Run it:
```bash
chmod +x check-status.sh
./check-status.sh
```

---

Generated: 2024
Version: 2.0
Status: ✅ Complete Command Reference