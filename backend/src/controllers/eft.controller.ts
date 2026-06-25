import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { EftService } from '../services/eft.service';
import { DbService } from '../services/db.service';

export class EftController {
  static async initiate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const { targetType, targetId, amount } = req.body;
      
      if (!targetType || !targetId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await EftService.initiatePayment(req.user.id, targetType, targetId, amount);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verify(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin only' });
      }
      
      const { paymentId } = req.params;
      if (!paymentId || typeof paymentId !== 'string') {
        return res.status(400).json({ error: 'Invalid payment ID' });
      }
      const result = await EftService.verifyPayment(paymentId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      
      const userId = req.user.role === 'admin' ? undefined : req.user.id;
      const payments = await EftService.listPayments(userId);
      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getBankDetails(req: AuthRequest, res: Response) {
    try {
      const details = await EftService.getBankDetails();
      res.json(details);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
