import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service';

export class SubscriptionController {
  static async getPlans(req: Request, res: Response) {
    try {
      const plans = await SubscriptionService.getPlans();
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      const userId = req.params.userId || (req as any).user.id;
      const result = await SubscriptionService.getUserSubscription(userId);
      res.json(result || { message: 'No active subscription' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async upgrade(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { planId } = req.body;
      
      // In an EFT-only system, paid plans start as 'pending' until verified.
      // Free plan can be activated immediately.
      const status = planId === 'free' ? 'active' : 'pending';
      
      const result = await SubscriptionService.upgrade(userId, planId, status);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await SubscriptionService.cancel(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
