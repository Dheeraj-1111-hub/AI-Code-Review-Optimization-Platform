import { Request, Response } from 'express';
import crypto from 'crypto';
import { webhookQueue } from '../queue';

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'development_secret';

export const handleGithubWebhook = async (req: Request, res: Response) => {
  try {
    // 1. Verify GitHub Signature (Crucial for Enterprise Security)
    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) {
      return res.status(401).send('No signature provided');
    }

    const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) {
      // Allow bypass in development if testing via Postman/ngrok
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).send('Invalid signature');
      }
    }

    const event = req.headers['x-github-event'] as string;
    const action = req.body.action;

    // 2. Offload processing to BullMQ immediately to respond 200 OK to GitHub
    await webhookQueue.add('github-event', {
      event,
      action,
      payload: req.body
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });

    res.status(200).send('Webhook received and queued.');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
};
