import { PrismaClient } from '@prisma/client';
import * as nodemailer from 'nodemailer';

const prisma = new PrismaClient();

/**
 * Email and in-app notification service
 */
export class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeEmailTransport();
  }

  private initializeEmailTransport() {
    // Initialize nodemailer with Gmail or custom SMTP
    // In production, use environment variables for credentials
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      console.warn('Email transporter not configured, skipping email send');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@codescam.dev',
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  /**
   * Create in-app notification
   */
  async createNotification(userId: string, projectId: string, type: string, message: string) {
    return prisma.notification.create({
      data: {
        userId,
        projectId,
        type,
        message
      }
    });
  }

  /**
   * Notify on analysis complete
   */
  async notifyAnalysisComplete(projectId: string, analysisId: string, metrics: any) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    });

    if (!project) return;

    const bugCount = metrics?.bugs || 0;
    const vulnCount = metrics?.vulnerabilities || 0;
    const smellCount = metrics?.codeSmells || 0;

    const message = `✅ Analysis complete: ${bugCount} bugs, ${vulnCount} vulnerabilities, ${smellCount} code smells detected.`;

    // Create in-app notification
    await this.createNotification(project.userId, projectId, 'ANALYSIS_COMPLETE', message);

    // Send email notification
    await this.sendEmail(
      project.user.email,
      `Analysis Complete: ${project.name}`,
      `
        <h2>Analysis Complete</h2>
        <p>Your analysis for <strong>${project.name}</strong> has completed.</p>
        <h3>Summary</h3>
        <ul>
          <li><strong>Bugs:</strong> ${bugCount}</li>
          <li><strong>Vulnerabilities:</strong> ${vulnCount}</li>
          <li><strong>Code Smells:</strong> ${smellCount}</li>
          <li><strong>Lines of Code:</strong> ${metrics?.loc || 0}</li>
        </ul>
        <p><a href="${process.env.FRONTEND_URL}/projects/${projectId}">View Results</a></p>
      `
    );
  }

  /**
   * Notify on quality gate failure
   */
  async notifyQualityGateFailed(projectId: string, failedConditions: string[]) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    });

    if (!project) return;

    const message = `⚠️ Quality Gate Failed: ${failedConditions.join(', ')}`;

    await this.createNotification(project.userId, projectId, 'QUALITY_GATE_FAILED', message);

    await this.sendEmail(
      project.user.email,
      `Quality Gate Failed: ${project.name}`,
      `
        <h2>Quality Gate Failed</h2>
        <p>The quality gate for <strong>${project.name}</strong> has failed.</p>
        <h3>Failed Conditions</h3>
        <ul>
          ${failedConditions.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <p><a href="${process.env.FRONTEND_URL}/projects/${projectId}">View Details</a></p>
      `
    );
  }

  /**
   * Notify on critical issue found
   */
  async notifyCriticalIssue(projectId: string, issue: any) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    });

    if (!project) return;

    const message = `🚨 CRITICAL: ${issue.message} in ${issue.file}:${issue.line}`;

    await this.createNotification(project.userId, projectId, 'CRITICAL_ISSUE_FOUND', message);

    // Only send email for CRITICAL severity
    if (process.env.NOTIFY_CRITICAL_EMAIL === 'true') {
      await this.sendEmail(
        project.user.email,
        `🚨 CRITICAL ISSUE: ${project.name}`,
        `
          <h2>Critical Issue Found</h2>
          <p>A critical security/reliability issue was detected in <strong>${project.name}</strong>.</p>
          <h3>Issue Details</h3>
          <ul>
            <li><strong>Message:</strong> ${issue.message}</li>
            <li><strong>File:</strong> ${issue.file}</li>
            <li><strong>Line:</strong> ${issue.line}</li>
            <li><strong>Rule:</strong> ${issue.rule}</li>
            <li><strong>Severity:</strong> ${issue.severity}</li>
          </ul>
          <p><a href="${process.env.FRONTEND_URL}/projects/${projectId}">Fix Now</a></p>
        `
      );
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, skip = 0, take = 20, unreadOnly = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false })
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { read: true }
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string) {
    return prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false }
    });
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        analyses: {
          where: { status: 'COMPLETED' },
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: { metrics: true }
        }
      }
    });

    const summary = projects
      .filter(p => p.analyses.length > 0)
      .map(p => {
        const metrics = p.analyses[0].metrics;
        return `<tr><td>${p.name}</td><td>${metrics?.bugs || 0}</td><td>${metrics?.vulnerabilities || 0}</td><td>${metrics?.codeSmells || 0}</td></tr>`;
      })
      .join('');

    await this.sendEmail(
      user.email,
      `Weekly CodesCam Report`,
      `
        <h2>Weekly Analysis Report</h2>
        <p>Hello ${user.name},</p>
        <p>Here's your weekly CodesCam summary:</p>
        <table border="1" cellpadding="8">
          <thead>
            <tr>
              <th>Project</th>
              <th>Bugs</th>
              <th>Vulnerabilities</th>
              <th>Code Smells</th>
            </tr>
          </thead>
          <tbody>
            ${summary || '<tr><td colspan="4">No recent analyses</td></tr>'}
          </tbody>
        </table>
        <p><a href="${process.env.FRONTEND_URL}/projects">View Dashboard</a></p>
      `
    );
  }
}

export const notificationService = new NotificationService();
