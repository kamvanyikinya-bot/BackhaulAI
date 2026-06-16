import { Request, Response } from 'express';
import { ReturnTripService } from '../services/return-trip.service';
import { MatchReturnSchema } from '../types/schemas';

export class DiscoveryController {
  static async getMatches(req: Request, res: Response) {
    try {
      const validated = MatchReturnSchema.parse(req.body);
      const matches = await ReturnTripService.findMatches(validated.tripId);
      res.json({
        success: true,
        matches
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || error });
    }
  }

  static async getStats(req: Request, res: Response) {
    // In a real app, this would query the DB for real KPI data
    // Here we'll return some realistic looking stats based on the business plan
    res.json({
      success: true,
      stats: {
        emptyMilesReduced: '42%',
        moneySaved: 'R485,000',
        utilisationRate: '78%',
        activeTrips: 12
      }
    });
  }
}
