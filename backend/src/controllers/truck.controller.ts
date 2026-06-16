import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DbService } from '../services/db.service';
import { CreateTruckSchema } from '../types/schemas';
import crypto from 'crypto';

export class TruckController {
  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const data = CreateTruckSchema.parse(req.body);
      const id = crypto.randomUUID();

      DbService.query(`
        INSERT INTO trucks (id, owner_id, plate_number, capacity, type, gps_device_id)
        VALUES (
          ${DbService.sanitize(id)},
          ${DbService.sanitize(req.user.id)},
          ${DbService.sanitize(data.plateNumber)},
          ${DbService.sanitize(data.capacity)},
          ${DbService.sanitize(data.type)},
          ${DbService.sanitize(data.gpsDeviceId || null)}
        )
      `);

      res.status(201).json({ id, message: 'Truck registered successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const trucks = DbService.query(`SELECT * FROM trucks WHERE owner_id = ${DbService.sanitize(req.user.id)}`);
      res.json(trucks);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const { status, currentLat, currentLng } = req.body;
      
      DbService.query(`
        UPDATE trucks 
        SET status = ${DbService.sanitize(status)},
            current_lat = ${DbService.sanitize(currentLat || null)},
            current_lng = ${DbService.sanitize(currentLng || null)},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${DbService.sanitize(req.params.id)} AND owner_id = ${DbService.sanitize(req.user.id)}
      `);

      res.json({ message: 'Truck status updated successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
