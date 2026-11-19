import { db } from '../db/index.js';

export class QueueService {
  /**
   * Health check database verification
   */
  static verifyDbHealth(): boolean {
    const result = db.prepare('SELECT 1 as alive').get() as { alive: number } | undefined;
    return !!result && result.alive === 1;
  }
}
