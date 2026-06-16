import { Request, Response } from 'express';
import { KYCService } from '../services/kyc.service';
import { z } from 'zod';

const kycSubmitSchema = z.object({
  idNumber: z.string().min(1),
  selfieUrl: z.string().url(),
  addressProofUrl: z.string().url(),
  licenseUrl: z.string().url(),
});

export class KYCController {
  static async submit(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = kycSubmitSchema.parse(req.body);
      const result = await KYCService.submit(userId, data);
      res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      const userId = (req.params as any).userId || (req as any).user.id;
      const result = await KYCService.getStatus(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const reviewerId = (req as any).user.id;
      const { kycId, status, reason } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const result = await KYCService.verify(kycId, reviewerId, status, reason);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
