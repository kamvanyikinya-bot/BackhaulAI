import { Request, Response } from 'express';
import { ReputationService } from '../services/reputation.service';

export class ReputationController {
  static async getReputation(req: Request, res: Response) {
    try {
      const userId = req.params.userId || (req as any).user.id;
      const result = await ReputationService.getReputation(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { userId, stats } = req.body;
      const result = await ReputationService.update(userId, stats);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
