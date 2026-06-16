import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DbService } from '../services/db.service';
import { CreateLoadSchema } from '../types/schemas';
import crypto from 'crypto';

export class LoadController {
  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const data = CreateLoadSchema.parse(req.body);
      const id = crypto.randomUUID();

      DbService.query(`
        INSERT INTO loads (
          id, owner_id, origin, destination, weight, type, 
          pickup_window_start, pickup_window_end, 
          delivery_window_start, delivery_window_end, 
          price, origin_lat, origin_lng, dest_lat, dest_lng, distance_km
        )
        VALUES (
          ${DbService.sanitize(id)},
          ${DbService.sanitize(req.user.id)},
          ${DbService.sanitize(data.origin)},
          ${DbService.sanitize(data.destination)},
          ${DbService.sanitize(data.weight)},
          ${DbService.sanitize(data.type)},
          ${DbService.sanitize(data.pickupWindowStart)},
          ${DbService.sanitize(data.pickupWindowEnd)},
          ${DbService.sanitize(data.deliveryWindowStart)},
          ${DbService.sanitize(data.deliveryWindowEnd)},
          ${DbService.sanitize(data.price)},
          ${DbService.sanitize(data.originLat || null)},
          ${DbService.sanitize(data.originLng || null)},
          ${DbService.sanitize(data.destLat || null)},
          ${DbService.sanitize(data.destLng || null)},
          ${DbService.sanitize(data.distanceKm || null)}
        )
      `);

      res.status(201).json({ id, message: 'Load created successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const status = req.query.status || 'available';
      const loads = DbService.query(`SELECT * FROM loads WHERE status = ${DbService.sanitize(status)} ORDER BY created_at DESC`);
      res.json(loads);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const loads = DbService.query(`SELECT * FROM loads WHERE id = ${DbService.sanitize(req.params.id)}`);
      if (!loads || loads.length === 0) {
        return res.status(404).json({ error: 'Load not found' });
      }
      res.json(loads[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      // Only owner or admin can delete
      const loads = DbService.query(`SELECT owner_id FROM loads WHERE id = ${DbService.sanitize(req.params.id)}`);
      if (!loads || loads.length === 0) {
        return res.status(404).json({ error: 'Load not found' });
      }

      if (loads[0].owner_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      DbService.query(`DELETE FROM loads WHERE id = ${DbService.sanitize(req.params.id)}`);
      res.json({ message: 'Load deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
