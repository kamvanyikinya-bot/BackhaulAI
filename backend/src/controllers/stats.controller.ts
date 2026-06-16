import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DbService } from '../services/db.service';

export class StatsController {
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      let stats: any = {};

      if (req.user.role === 'admin') {
        stats.totalUsers = DbService.query(`SELECT COUNT(*) as count FROM users`)[0].count;
        stats.totalLoads = DbService.query(`SELECT COUNT(*) as count FROM loads`)[0].count;
        stats.totalTrips = DbService.query(`SELECT COUNT(*) as count FROM trips`)[0].count;
        stats.totalGMV = DbService.query(`SELECT SUM(amount) as sum FROM transactions WHERE status = 'completed'`)[0].sum || 0;
        stats.totalCommission = DbService.query(`SELECT SUM(commission) as sum FROM transactions WHERE status = 'completed'`)[0].sum || 0;
      } else if (req.user.role === 'company') {
        stats.activeLoads = DbService.query(`SELECT COUNT(*) as count FROM loads WHERE owner_id = ${DbService.sanitize(req.user.id)} AND status = 'available'`)[0].count;
        stats.bookedLoads = DbService.query(`SELECT COUNT(*) as count FROM loads WHERE owner_id = ${DbService.sanitize(req.user.id)} AND status = 'booked'`)[0].count;
        stats.completedTrips = DbService.query(`SELECT COUNT(*) as count FROM trips t JOIN loads l ON t.load_id = l.id WHERE l.owner_id = ${DbService.sanitize(req.user.id)} AND t.status = 'delivered'`)[0].count;
      } else {
        stats.activeTrips = DbService.query(`SELECT COUNT(*) as count FROM trips t JOIN trucks tr ON t.truck_id = tr.id WHERE tr.owner_id = ${DbService.sanitize(req.user.id)} AND t.status IN ('scheduled', 'in-transit')`)[0].count;
        stats.completedTrips = DbService.query(`SELECT COUNT(*) as count FROM trips t JOIN trucks tr ON t.truck_id = tr.id WHERE tr.owner_id = ${DbService.sanitize(req.user.id)} AND t.status = 'delivered'`)[0].count;
        stats.totalEarnings = DbService.query(`SELECT SUM(amount - commission) as sum FROM transactions tr JOIN trips t ON tr.trip_id = t.id JOIN trucks tru ON t.truck_id = tru.id WHERE tru.owner_id = ${DbService.sanitize(req.user.id)} AND tr.status = 'completed'`)[0].sum || 0;
      }

      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
