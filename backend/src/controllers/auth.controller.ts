import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DbService } from '../services/db.service';
import { SignupSchema, LoginSchema } from '../types/schemas';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'backhaul-secret-key';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const data = SignupSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const id = crypto.randomUUID();

      const existingUser = DbService.query(`SELECT id FROM users WHERE email = ${DbService.sanitize(data.email)}`);
      if (existingUser && existingUser.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      DbService.query(`
        INSERT INTO users (id, email, password, role, full_name, phone)
        VALUES (
          ${DbService.sanitize(id)},
          ${DbService.sanitize(data.email)},
          ${DbService.sanitize(hashedPassword)},
          ${DbService.sanitize(data.role)},
          ${DbService.sanitize(data.fullName)},
          ${DbService.sanitize(data.phone || null)}
        )
      `);

      const token = jwt.sign({ id, email: data.email, role: data.role }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: { id, email: data.email, role: data.role, fullName: data.fullName }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = LoginSchema.parse(req.body);
      const users = DbService.query(`SELECT * FROM users WHERE email = ${DbService.sanitize(data.email)}`);

      if (!users || users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
      const isValid = await bcrypt.compare(data.password, user.password);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
