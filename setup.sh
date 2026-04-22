#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   CodeScan — Local Setup Script      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v npm  >/dev/null 2>&1 || { echo "❌ npm not found."; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required (found v$NODE_VERSION)"
  exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Backend setup
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo ""
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   Created backend/.env — edit DATABASE_URL if needed"
fi

echo ""
echo "🗄️  Pushing database schema..."
npm run prisma:push

echo ""
echo "🌱 Seeding demo data..."
npm run seed

cd ..

# Frontend setup
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ ! -f .env ]; then
  cp .env.example .env
fi

cd ..

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ✅ Setup complete!                                  ║"
echo "║                                                       ║"
echo "║   Start backend:  cd backend && npm run dev          ║"
echo "║   Start frontend: cd frontend && npm start           ║"
echo "║                                                       ║"
echo "║   Dashboard: http://localhost:3000                    ║"
echo "║   API:        http://localhost:4000                   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
