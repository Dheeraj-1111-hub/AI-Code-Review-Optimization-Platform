import { Request, Response } from 'express';
import axios from 'axios';
import { env } from '../config/env';
import { AssistantConversation } from '../models/AssistantConversation';
import { AssistantMessage } from '../models/AssistantMessage';
import { Workspace } from '../models/Workspace';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.clerkId;
    const { workspaceId } = req.query;

    if (!workspaceId) {
      res.status(400).json({ error: 'workspaceId is required' });
      return;
    }

    const conversations = await AssistantConversation.find({
      workspaceId: workspaceId as string,
      userId,
    }).sort({ updatedAt: -1 }).limit(20);

    res.status(200).json({ data: conversations });
  } catch (error: any) {
    logger.error('Failed to get copilot history:', error);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.clerkId;
    const { id } = req.params;

    // Verify ownership
    const conversation = await AssistantConversation.findOne({ _id: id, userId });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messages = await AssistantMessage.find({ conversationId: id })
      .sort({ createdAt: 1 });

    res.status(200).json({ data: messages });
  } catch (error: any) {
    logger.error('Failed to get copilot messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.clerkId;
    const { message, context, workspaceId, conversationId } = req.body;

    if (!message || !workspaceId) {
      res.status(400).json({ error: 'message and workspaceId are required' });
      return;
    }

    // 1. Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await AssistantConversation.findOne({ _id: conversationId, userId, workspaceId });
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
    } else {
      conversation = await AssistantConversation.create({
        workspaceId,
        userId,
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
      });
    }

    // 2. Save User Message
    const userMsg = await AssistantMessage.create({
      conversationId: conversation._id,
      role: 'user',
      content: message,
      context,
    });

    // 3. Fetch recent history for context
    const recentMessages = await AssistantMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10); // get last 10 messages

    // 4. Proxy to AI Service via streaming
    const aiServiceUrl = env.AI_SERVICE_URL;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush headers to establish SSE connection immediately

    try {
      const response = await axios.post(`${aiServiceUrl}/api/v1/copilot/chat`, {
        message,
        context,
        workspaceId,
        history: recentMessages.map(m => ({ role: m.role, content: m.content })),
      }, {
        responseType: 'stream',
        timeout: 60000, // 60s timeout for streaming
      });

      let fullAiContent = "";
      let toolCalls: any[] = [];

      response.data.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        // Forward the SSE chunk directly to the client
        res.write(text);
        
        // Very basic parsing to reconstruct final AI message to save to DB.
        // The AI service should ideally stream standard SSE like:
        // data: {"type": "content", "content": "hello"}
        // This is a naive accumulator if we need to save it. For robust setups, 
        // the client or AI service can handle the DB save, or we buffer it here.
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content') {
                fullAiContent += data.content;
              } else if (data.type === 'tool_call') {
                toolCalls.push(data.tool);
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      });

      response.data.on('end', async () => {
        res.end();
        // 5. Save AI Message
        if (fullAiContent) {
          await AssistantMessage.create({
            conversationId: conversation._id,
            role: 'assistant',
            content: fullAiContent,
            toolCalls,
          });
          // Update conversation timestamp
          await AssistantConversation.findByIdAndUpdate(conversation._id, { updatedAt: new Date() });
        }
      });

      response.data.on('error', (err: any) => {
        logger.error('Stream error from AI service:', err);
        res.write('data: {"type": "error", "content": "Stream interrupted"}\n\n');
        res.end();
      });

    } catch (err: any) {
      logger.error('Failed to proxy to AI service:', err.message);
      res.write('data: {"type": "error", "content": "AI Service unavailable"}\n\n');
      res.end();
    }

  } catch (error: any) {
    logger.error('Failed to chat with copilot:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.end();
    }
  }
};
