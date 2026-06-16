import { DbService } from './db.service';
import { v4 as uuidv4 } from 'uuid';

export interface KYCVerification {
  id: string;
  user_id: string;
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  documents: any[];
  reviewer_id?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export class KYCService {
  static async submit(userId: string, data: { idNumber: string; selfieUrl: string; addressProofUrl: string; licenseUrl: string }) {
    const id = uuidv4();
    const documents = JSON.stringify([
      { type: 'id_number', value: data.idNumber.replace(/.(?=.{4})/g, '*') },
      { type: 'selfie', url: data.selfieUrl },
      { type: 'address_proof', url: data.addressProofUrl },
      { type: 'driver_license', url: data.licenseUrl }
    ]);

    const sql = `
      INSERT INTO kyc_verifications (id, user_id, status, documents)
      VALUES (
        ${DbService.sanitize(id)},
        ${DbService.sanitize(userId)},
        'pending',
        ${DbService.sanitize(documents)}
      )
    `;
    
    await DbService.query(sql);
    
    // Update user kyc_status as well
    await DbService.query(`UPDATE users SET kyc_status = 'pending' WHERE id = ${DbService.sanitize(userId)}`);
    
    return { id, status: 'pending' };
  }

  static async getStatus(userId: string): Promise<KYCVerification> {
    const sql = `SELECT * FROM kyc_verifications WHERE user_id = ${DbService.sanitize(userId)} ORDER BY created_at DESC LIMIT 1`;
    const result = await DbService.query(sql);
    
    if (!result || result.length === 0) {
      return { user_id: userId, status: 'not_submitted', id: '', documents: [] };
    }
    
    const kyc = result[0];
    return {
      ...kyc,
      documents: JSON.parse(kyc.documents || '[]')
    };
  }

  static async verify(kycId: string, reviewerId: string, status: 'approved' | 'rejected', reason?: string) {
    const sql = `
      UPDATE kyc_verifications 
      SET status = ${DbService.sanitize(status)},
          reviewer_id = ${DbService.sanitize(reviewerId)},
          rejection_reason = ${DbService.sanitize(reason || null)},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${DbService.sanitize(kycId)}
    `;
    await DbService.query(sql);

    // Get user_id for this verification to update user table
    const kycResult = await DbService.query(`SELECT user_id FROM kyc_verifications WHERE id = ${DbService.sanitize(kycId)}`);
    if (kycResult && kycResult.length > 0) {
      const userId = kycResult[0].user_id;
      const userStatus = status === 'approved' ? 'verified' : 'rejected';
      await DbService.query(`UPDATE users SET kyc_status = ${DbService.sanitize(userStatus)} WHERE id = ${DbService.sanitize(userId)}`);
    }

    return { id: kycId, status };
  }
}
