import { Router, Request, Response } from 'express';
import { QueueService } from '../services/queueService.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  try {
    const isDbAlive = QueueService.verifyDbHealth();
    if (isDbAlive) {
      res.json({ status: 'ok', db: 'ok' });
    } else {
      res.status(500).json({ status: 'error', db: 'failed' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'failed', error: (error as Error).message });
  }
});
