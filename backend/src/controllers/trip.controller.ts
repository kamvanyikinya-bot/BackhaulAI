import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DbService } from '../services/db.service';
import { BookLoadSchema } from '../types/schemas';
import crypto from 'crypto';

export class TripController {
  static async bookLoad(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const data = BookLoadSchema.parse(req.body);
      const id = crypto.randomUUID();

      // Check if load is available
      const loads = DbService.query(`SELECT * FROM loads WHERE id = ${DbService.sanitize(data.loadId)} AND status = 'available'`);
      if (!loads || loads.length === 0) {
        return res.status(404).json({ error: 'Load not found or already booked' });
      }

      const load = loads[0];

      // Check if truck exists and belongs to user
      const trucks = DbService.query(`SELECT * FROM trucks WHERE id = ${DbService.sanitize(data.truckId)} AND owner_id = ${DbService.sanitize(req.user.id)}`);
      if (!trucks || trucks.length === 0) {
        return res.status(404).json({ error: 'Truck not found or unauthorized' });
      }

      // Create trip
      DbService.query(`
        INSERT INTO trips (id, load_id, truck_id, status)
        VALUES (
          ${DbService.sanitize(id)},
          ${DbService.sanitize(data.loadId)},
          ${DbService.sanitize(data.truckId)},
          'scheduled'
        )
      `);

      // Update load status
      DbService.query(`UPDATE loads SET status = 'booked' WHERE id = ${DbService.sanitize(data.loadId)}`);

      // Update truck status
      DbService.query(`UPDATE trucks SET status = 'busy' WHERE id = ${DbService.sanitize(data.truckId)}`);

      res.status(201).json({ id, message: 'Load booked and trip scheduled' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      let query = `
        SELECT t.*, l.origin, l.destination, l.price, tr.plate_number 
        FROM trips t
        JOIN loads l ON t.load_id = l.id
        JOIN trucks tr ON t.truck_id = tr.id
      `;

      if (req.user.role === 'driver' || req.user.role === 'fleet') {
        query += ` WHERE tr.owner_id = ${DbService.sanitize(req.user.id)}`;
      } else if (req.user.role === 'company') {
        query += ` WHERE l.owner_id = ${DbService.sanitize(req.user.id)}`;
      }

      const trips = DbService.query(query);
      res.json(trips);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const { status } = req.body;
      
      DbService.query(`UPDATE trips SET status = ${DbService.sanitize(status)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${DbService.sanitize(req.params.id)}`);

      // If delivered, mark load and truck as available
      if (status === 'delivered') {
        const trips = DbService.query(`SELECT load_id, truck_id FROM trips WHERE id = ${DbService.sanitize(req.params.id)}`);
        if (trips && trips.length > 0) {
          const { load_id, truck_id } = trips[0];
          DbService.query(`UPDATE loads SET status = 'delivered' WHERE id = ${DbService.sanitize(load_id)}`);
          DbService.query(`UPDATE trucks SET status = 'available' WHERE id = ${DbService.sanitize(truck_id)}`);
          
          // Create transaction for commission
          const loadValue = DbService.query(`SELECT price FROM loads WHERE id = ${DbService.sanitize(load_id)}`)[0].price;
          const commission = loadValue * 0.15;
          DbService.query(`
            INSERT INTO transactions (id, trip_id, amount, commission, status)
            VALUES (${DbService.sanitize(crypto.randomUUID())}, ${DbService.sanitize(req.params.id)}, ${loadValue}, ${commission}, 'pending')
          `);
        }
      }

      res.json({ message: 'Trip status updated successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
