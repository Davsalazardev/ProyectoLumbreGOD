"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cicdService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * CI/CD Integration Service
 * Jenkins, GitHub Actions, GitLab CI, Azure Pipelines, Slack, Discord, Teams
 */
exports.cicdService = {
    /**
     * Process GitHub Actions workflow results
     */
    async processGitHubActionsWebhook(payload) {
        const workflowRun = payload.workflow_run || {};
        return {
            source: 'github-actions',
            status: workflowRun.status === 'completed' ?
                (workflowRun.conclusion === 'success' ? 'PASSED' : 'FAILED') : 'IN_PROGRESS',
            workflowName: workflowRun.name,
            branch: workflowRun.head_branch,
            commit: workflowRun.head_sha,
            author: payload.sender?.login,
            startedAt: workflowRun.created_at,
            completedAt: workflowRun.updated_at,
            duration: workflowRun.run_number,
            logs: await this.fetchGitHubActionsLogs(workflowRun.id)
        };
    },
    /**
     * Fetch GitHub Actions logs
     */
    async fetchGitHubActionsLogs(runId) {
        // Mock logs
        return `Build started at 2024-01-20 10:00:00
[INFO] Compiling code...
[INFO] Running tests...
[INFO] Publishing artifacts...
Build completed successfully!`;
    },
    /**
     * Process Jenkins build results
     */
    async processJenkinsBuild(payload) {
        const build = payload.build || {};
        return {
            source: 'jenkins',
            status: build.result === 'SUCCESS' ? 'PASSED' : build.result === 'FAILURE' ? 'FAILED' : 'UNSTABLE',
            jobName: build.job_name,
            buildNumber: build.number,
            branch: build.full_url?.includes('parameter') ? payload.ref : 'main',
            duration: build.duration_milliseconds,
            startTime: build.timestamp,
            testResults: {
                passed: build.testResults?.passed || 0,
                failed: build.testResults?.failed || 0,
                skipped: build.testResults?.skipped || 0
            },
            coverage: build.coverage || 0
        };
    },
    /**
     * Process GitLab CI results
     */
    async processGitLabCIPipeline(payload) {
        const pipeline = payload.object_attributes || {};
        const project = payload.project || {};
        return {
            source: 'gitlab-ci',
            status: pipeline.status.toUpperCase(),
            projectName: project.name,
            pipelineId: pipeline.id,
            branch: pipeline.ref,
            commit: payload.checkout_sha?.substring(0, 7),
            stages: payload.builds?.map((build) => ({
                name: build.stage,
                status: build.status,
                duration: build.duration
            })) || [],
            startedAt: pipeline.created_at,
            finishedAt: pipeline.finished_at
        };
    },
    /**
     * Process Azure Pipelines results
     */
    async processAzurePipelinesBuild(payload) {
        const resource = payload.resource || {};
        const result = resource.result;
        return {
            source: 'azure-pipelines',
            status: result === 'succeeded' ? 'PASSED' : result === 'failed' ? 'FAILED' : 'IN_PROGRESS',
            buildId: resource.id,
            definitionName: resource.definition?.name,
            branch: resource.sourceBranch,
            commit: resource.sourceVersion?.substring(0, 7),
            startTime: resource.startTime,
            finishTime: resource.finishTime,
            requestedBy: resource.requestedBy?.displayName,
            jobs: resource.jobs?.map((job) => ({
                name: job.name,
                status: job.result,
                log: job.log
            })) || []
        };
    },
    /**
     * Send notification to Slack
     */
    async sendSlackNotification(webhookUrl, status, buildInfo) {
        const colors = {
            'PASSED': '#36a64f',
            'FAILED': '#ff0000',
            'IN_PROGRESS': '#ffa500'
        };
        const message = {
            attachments: [{
                    color: colors[status],
                    title: `Build ${status}`,
                    fields: [
                        { title: 'Project', value: buildInfo.projectName || 'CodesCam Analysis', short: true },
                        { title: 'Branch', value: buildInfo.branch || 'main', short: true },
                        { title: 'Commit', value: buildInfo.commit || 'N/A', short: true },
                        { title: 'Status', value: status, short: true },
                        { title: 'Duration', value: buildInfo.duration || 'pending', short: true },
                        { title: 'Author', value: buildInfo.author || 'Unknown', short: true }
                    ],
                    footer: 'CodesCam CI/CD',
                    ts: Math.floor(Date.now() / 1000)
                }]
        };
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            return { success: true };
        }
        catch (error) {
            console.error('Slack notification failed:', error);
            return { success: false, error };
        }
    },
    /**
     * Send notification to Discord
     */
    async sendDiscordNotification(webhookUrl, status, buildInfo) {
        const colors = {
            'PASSED': 3066993, // Green
            'FAILED': 15158332, // Red
            'IN_PROGRESS': 16776960 // Orange
        };
        const embed = {
            title: `Build ${status}`,
            color: colors[status],
            fields: [
                { name: 'Project', value: buildInfo.projectName || 'CodesCam Analysis', inline: true },
                { name: 'Branch', value: buildInfo.branch || 'main', inline: true },
                { name: 'Commit', value: buildInfo.commit || 'N/A', inline: true },
                { name: 'Status', value: status, inline: true },
                { name: 'Duration', value: buildInfo.duration || 'pending', inline: true },
                { name: 'Author', value: buildInfo.author || 'Unknown', inline: true }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'CodesCam CI/CD' }
        };
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
            return { success: true };
        }
        catch (error) {
            console.error('Discord notification failed:', error);
            return { success: false, error };
        }
    },
    /**
     * Send notification to Microsoft Teams
     */
    async sendTeamsNotification(webhookUrl, status, buildInfo) {
        const themeColors = {
            'PASSED': '228B22',
            'FAILED': 'FF0000',
            'IN_PROGRESS': 'FFA500'
        };
        const card = {
            '@type': 'MessageCard',
            '@context': 'https://schema.org/extensions',
            summary: `Build ${status}`,
            themeColor: themeColors[status],
            sections: [{
                    activityTitle: `Build ${status} - ${buildInfo.projectName || 'CodesCam'}`,
                    activitySubtitle: `Branch: ${buildInfo.branch || 'main'}`,
                    facts: [
                        { name: 'Status', value: status },
                        { name: 'Commit', value: buildInfo.commit || 'N/A' },
                        { name: 'Author', value: buildInfo.author || 'Unknown' },
                        { name: 'Duration', value: buildInfo.duration || 'pending' }
                    ]
                }]
        };
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(card)
            });
            return { success: true };
        }
        catch (error) {
            console.error('Teams notification failed:', error);
            return { success: false, error };
        }
    },
    /**
     * Create deployment pipeline configuration
     */
    generateGitHubActionsYAML(projectName) {
        return `name: CodesCam Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  analyze:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18.x'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run CodesCam Analysis
      run: npm run analyze
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
    
    - name: Upload results
      uses: actions/upload-artifact@v2
      with:
        name: analysis-results
        path: ./analysis-results/
    
    - name: Comment PR
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const results = JSON.parse(fs.readFileSync('./analysis-results/summary.json'));
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: \`# CodesCam Analysis Results\\n\\n\${results.summary}\`
          });`;
    },
    /**
     * Generate GitLab CI configuration
     */
    generateGitLabCIYAML(projectName) {
        return `stages:
  - analyze
  - test
  - deploy

variables:
  DOCKER_IMAGE: \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHA

before_script:
  - npm install

codescam_analysis:
  stage: analyze
  script:
    - npm run analyze
    - mkdir -p artifacts
    - cp -r analysis-results/* artifacts/
  artifacts:
    paths:
      - artifacts/
    reports:
      junit: artifacts/junit.xml
  coverage: '/Coverage: \(\d+.\d+%\)/'

unit_tests:
  stage: test
  script:
    - npm run test
  coverage: '/Line Coverage: (\d+\.\d+)%/'

deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
  environment:
    name: staging
  only:
    - develop`;
    },
    /**
     * Generate Azure Pipelines configuration
     */
    generateAzurePipelinesYAML(projectName) {
        return `trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  buildConfiguration: 'Release'
  nodeVersion: '18.x'

stages:
  - stage: Analyze
    displayName: 'Run CodesCam Analysis'
    jobs:
      - job: Analysis
        displayName: 'Analyze Code'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: \$(nodeVersion)
          
          - script: npm install
            displayName: 'Install dependencies'
          
          - script: npm run analyze
            displayName: 'Run CodesCam analysis'
            env:
              GITHUB_TOKEN: \$(GITHUB_TOKEN)
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: 'analysis-results'
              artifactName: 'analysis-results'`;
    },
    /**
     * Create code coverage badge
     */
    generateCoverageBadge(coverage) {
        const color = coverage >= 80 ? '4c1' : coverage >= 60 ? 'dfb612' : 'e05d44';
        return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="140" height="20">
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <clipPath id="a">
        <rect width="140" height="20" rx="3"/>
      </clipPath>
      <g clip-path="url(#a)">
        <path fill="#555" d="M0 0h105v20H0z"/>
        <path fill="#${color}" d="M105 0h35v20H105z"/>
        <path fill="url(#b)" d="M0 0h140v20H0z"/>
      </g>
      <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
        <text x="525" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="950">coverage</text>
        <text x="525" y="140" transform="scale(.1)" textLength="950">coverage</text>
        <text x="1210" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="250">${coverage}%</text>
        <text x="1210" y="140" transform="scale(.1)" textLength="250">${coverage}%</text>
      </g>
    </svg>`;
    },
    /**
     * Get deployment status summary
     */
    async getDeploymentSummary(projectId) {
        return {
            lastDeploy: new Date(Date.now() - 86400000),
            status: 'healthy',
            uptime: 99.95,
            failureRate: 0.05,
            averageDeployTime: '15m 32s',
            deployFrequency: 'Daily',
            changeFailureRate: 2.5,
            meanTimeToRecovery: '1h 20m'
        };
    }
};
//# sourceMappingURL=cicd.service.js.map