#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma db push --schema=src/prisma/schema.prisma --skip-generate --accept-data-loss

echo "🌱 Checking if seed is needed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.project.count()
  .then(count => {
    console.log('Existing projects: ' + count);
    process.exit(count === 0 ? 0 : 1);
  })
  .catch(() => process.exit(0))
  .finally(() => prisma.\$disconnect());
" && node dist/seed.js && echo "✅ Seed complete" || echo "⏭️  Skipping seed (data exists)"

echo "🚀 Starting CodeScan API on port 4000..."
exec node dist/index.js
