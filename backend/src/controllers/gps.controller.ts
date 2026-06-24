import { Request, Response } from 'express';
import { GPSService } from '../services/gps.service';

export class GPSController {
  static async postLocation(req: Request, res: Response) {
    try {
      const data = req.body; // trip_id, lat, lng, speed, heading
      const result = await GPSService.recordLocation(data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLatest(req: Request, res: Response) {
    try {
      const { tripId } = req.params;
      const result = await GPSService.getLatest(tripId as string);
      if (!result) {
        return res.status(404).json({ message: 'No location data found' });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
