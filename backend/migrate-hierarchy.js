#!/usr/bin/env node
/**
 * Migration script to organize existing issues into hierarchy
 * This is a one-time script to populate FolderMetric and FileMetric for existing analyses
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function organizeAnalysisHierarchy(analysisId, issues) {
  try {
    const folderMap = {};
    const fileMap = {};

    // Group issues by folder and file
    for (const issue of issues) {
      const filePath = issue.file || 'unknown';
      const folderPath = path.dirname(filePath);

      if (!folderMap[folderPath]) folderMap[folderPath] = [];
      folderMap[folderPath].push(issue);

      if (!fileMap[filePath]) fileMap[filePath] = [];
      fileMap[filePath].push(issue);
    }

    // Create or update FolderMetric records
    for (const [folderPath, folderIssues] of Object.entries(folderMap)) {
      const bugs = folderIssues.filter(i => i.type === 'BUG').length;
      const vulnerabilities = folderIssues.filter(i => i.type === 'VULNERABILITY').length;
      const codeSmells = folderIssues.filter(i => i.type === 'CODE_SMELL').length;
      const files = new Set(folderIssues.map(i => i.file)).size;

      await prisma.folderMetric.upsert({
        where: { analysisId_folderPath: { analysisId, folderPath } },
        update: { 
          bugs, 
          vulnerabilities, 
          codeSmells, 
          files 
        },
        create: {
          analysisId,
          folderPath,
          bugs,
          vulnerabilities,
          codeSmells,
          files
        }
      });
    }

    // Create or update FileMetric records
    for (const [filePath, fileIssues] of Object.entries(fileMap)) {
      const bugs = fileIssues.filter(i => i.type === 'BUG').length;
      const vulnerabilities = fileIssues.filter(i => i.type === 'VULNERABILITY').length;
      const codeSmells = fileIssues.filter(i => i.type === 'CODE_SMELL').length;
      const loc = fileIssues[0]?.loc || 0; // Use first issue's LOC as example

      await prisma.fileMetric.upsert({
        where: { analysisId_filePath: { analysisId, filePath } },
        update: { 
          bugs, 
          vulnerabilities, 
          codeSmells,
          loc
        },
        create: {
          analysisId,
          filePath,
          bugs,
          vulnerabilities,
          codeSmells,
          loc
        }
      });
    }

    console.log(`✓ Organized ${Object.keys(folderMap).length} folders and ${Object.keys(fileMap).length} files for analysis ${analysisId}`);
  } catch (error) {
    console.error(`✗ Error organizing analysis ${analysisId}:`, error.message);
  }
}

async function migrateExistingAnalyses() {
  try {
    console.log('Starting hierarchy migration for existing analyses...\n');

    const analyses = await prisma.analysis.findMany({
      include: { issues: true }
    });

    console.log(`Found ${analyses.length} analyses to migrate\n`);

    for (const analysis of analyses) {
      console.log(`Processing analysis ${analysis.id} with ${analysis.issues.length} issues...`);
      await organizeAnalysisHierarchy(analysis.id, analysis.issues);
    }

    console.log('\n✓ Hierarchy migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateExistingAnalyses();
