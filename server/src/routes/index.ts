import { Router } from 'express';
import { healthRouter } from './health.js';
import { queueRouter } from './queueRoutes.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(queueRouter);
