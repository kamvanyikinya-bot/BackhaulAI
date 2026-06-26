import { Request, Response } from 'express';
import { AcquisitionService } from '../services/acquisition.service';

export class AcquisitionController {
  static async createLead(req: Request, res: Response) {
    try {
      const lead = await AcquisitionService.createLead(req.body);
      res.status(201).json(lead);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await AcquisitionService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async logOutreach(req: Request, res: Response) {
    try {
      const { lead_id, ...data } = req.body;
      const result = await AcquisitionService.logOutreach(lead_id, data);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
