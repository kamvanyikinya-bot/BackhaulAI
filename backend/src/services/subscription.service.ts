import { DbService } from './db.service';
import { v4 as uuidv4 } from 'uuid';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  auto_renew: boolean;
  expires_at: string;
  created_at: string;
}

export class SubscriptionService {
  static async getPlans(): Promise<SubscriptionPlan[]> {
    const result = await DbService.query('SELECT * FROM subscription_plans');
    return result.map((plan: any) => ({
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }));
  }

  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const sql = `SELECT * FROM user_subscriptions WHERE user_id = ${DbService.sanitize(userId)} ORDER BY created_at DESC LIMIT 1`;
    const result = await DbService.query(sql);
    if (!result || result.length === 0) return null;
    return result[0];
  }

  static async upgrade(userId: string, planId: string, status: 'active' | 'pending' = 'active') {
    const id = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

    // Check if user already has a subscription
    const current = await this.getUserSubscription(userId);
    if (current) {
      const sql = `
        UPDATE user_subscriptions 
        SET plan_id = ${DbService.sanitize(planId)},
            status = ${DbService.sanitize(status)},
            expires_at = ${DbService.sanitize(expiresAt.toISOString())},
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${DbService.sanitize(userId)}
      `;
      await DbService.query(sql);
      return { id: current.id, plan_id: planId, status };
    } else {
      const sql = `
        INSERT INTO user_subscriptions (id, user_id, plan_id, status, expires_at)
        VALUES (
          ${DbService.sanitize(id)},
          ${DbService.sanitize(userId)},
          ${DbService.sanitize(planId)},
          ${DbService.sanitize(status)},
          ${DbService.sanitize(expiresAt.toISOString())}
        )
      `;
      await DbService.query(sql);
      return { id, plan_id: planId, status };
    }
  }

  static async cancel(userId: string) {
    const sql = `
      UPDATE user_subscriptions 
      SET auto_renew = 0,
          status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${DbService.sanitize(userId)}
    `;
    await DbService.query(sql);
    return { success: true };
  }
}
