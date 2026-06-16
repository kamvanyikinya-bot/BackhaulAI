import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DbService } from '../services/db.service';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const users = DbService.query(`SELECT id, email, role, full_name, phone, kyc_status, reputation_score, onboarding_step, onboarding_completed FROM users WHERE id = ${DbService.sanitize(req.user.id)}`);
      
      if (!users || users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(users[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const { fullName, phone } = req.body;
      
      DbService.query(`
        UPDATE users 
        SET full_name = ${DbService.sanitize(fullName)}, 
            phone = ${DbService.sanitize(phone)},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${DbService.sanitize(req.user.id)}
      `);

      res.json({ message: 'Profile updated successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async submitKYC(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      // In a real app, we'd handle file uploads here
      DbService.query(`
        UPDATE users 
        SET kyc_status = 'pending',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${DbService.sanitize(req.user.id)}
      `);

      res.json({ message: 'KYC documents submitted for review' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
