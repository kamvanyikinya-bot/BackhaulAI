import { DbService } from './db.service';
import crypto from 'crypto';

export class EftService {
  static async generateReference(userId: string): Promise<string> {
    const config = await DbService.query(`SELECT value FROM config WHERE key = 'payment_reference_prefix'`);
    const prefix = config.length > 0 ? config[0].value : 'BH-';
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${random}${timestamp}`;
  }

  static async getBankDetails() {
    const details: any = {};
    const keys = ['bank_name', 'account_holder', 'account_number', 'branch_code'];
    for (const key of keys) {
      const res = await DbService.query(`SELECT value FROM config WHERE key = ${DbService.sanitize(key)}`);
      details[key] = res.length > 0 ? res[0].value : null;
    }
    return details;
  }

  static async initiatePayment(userId: string, targetType: 'subscription' | 'commission', targetId: string, amount: number) {
    const id = crypto.randomUUID();
    const referenceNumber = await this.generateReference(userId);
    
    await DbService.query(`
      INSERT INTO eft_payments (id, user_id, target_type, target_id, reference_number, amount, status)
      VALUES (
        ${DbService.sanitize(id)},
        ${DbService.sanitize(userId)},
        ${DbService.sanitize(targetType)},
        ${DbService.sanitize(targetId)},
        ${DbService.sanitize(referenceNumber)},
        ${amount},
        'pending'
      )
    `);

    return {
      paymentId: id,
      referenceNumber,
      amount,
      bankDetails: await this.getBankDetails()
    };
  }

  static async verifyPayment(paymentId: string) {
    const payments = await DbService.query(`SELECT * FROM eft_payments WHERE id = ${DbService.sanitize(paymentId)}`);
    if (payments.length === 0) throw new Error('Payment not found');
    
    const payment = payments[0];
    await DbService.query(`UPDATE eft_payments SET status = 'verified', updated_at = CURRENT_TIMESTAMP WHERE id = ${DbService.sanitize(paymentId)}`);
    
    if (payment.target_type === 'subscription') {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      await DbService.query(`
        UPDATE user_subscriptions 
        SET status = 'active', expires_at = ${DbService.sanitize(expiresAt.toISOString())}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${DbService.sanitize(payment.target_id)}
      `);
    } else if (payment.target_type === 'commission') {
      await DbService.query(`UPDATE transactions SET status = 'completed' WHERE id = ${DbService.sanitize(payment.target_id)}`);
    }

    return { success: true };
  }

  static async listPayments(userId?: string) {
    let query = `SELECT * FROM eft_payments`;
    if (userId) {
      query += ` WHERE user_id = ${DbService.sanitize(userId)}`;
    }
    query += ` ORDER BY created_at DESC`;
    return await DbService.query(query);
  }
}
