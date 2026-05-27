import { Resend } from 'resend';
import crypto from 'crypto';
import { Workspace, Role } from '../../models/Workspace';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

// Mock DB for invitations until we create the formal model
const mockInvitationsDb = new Map();

export class InvitationService {
  static async sendInvitation(workspaceId: string, email: string, role: Role, inviterName: string) {
    try {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) throw new Error('Workspace not found');

      // Generate a secure, random token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Store in DB (mocked for Phase 6 prototype)
      mockInvitationsDb.set(token, { email, workspaceId, role, expiresAt: Date.now() + 86400000 });

      const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${token}`;

      // Send email via Resend
      await resend.emails.send({
        from: 'DevLens Team <noreply@devlens.ai>',
        to: email,
        subject: `You've been invited to join ${workspace.name} on DevLens`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h2>Join ${workspace.name}</h2>
            <p>${inviterName} has invited you to collaborate on engineering reviews as a <strong>${role}</strong>.</p>
            <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              Accept Invitation
            </a>
            <p style="margin-top: 24px; color: #666; font-size: 14px;">
              If you didn't expect this invitation, you can ignore this email.
            </p>
          </div>
        `
      });

      console.log(`[Invitation Service] Sent invite to ${email} for workspace ${workspace.name}`);
      return { success: true, message: 'Invitation sent successfully' };

    } catch (error) {
      console.error('[Invitation Service] Failed to send invite:', error);
      throw error;
    }
  }
}
