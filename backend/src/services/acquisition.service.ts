import { DbService } from './db.service';
import { v4 as uuidv4 } from 'uuid';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  city?: string;
  type: 'driver' | 'shipper' | 'fleet';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source: string;
  notes?: string;
  created_at: string;
}

export class AcquisitionService {
  static async createLead(data: Partial<Lead>): Promise<Lead> {
    const id = uuidv4();
    const sql = `
      INSERT INTO leads (id, name, email, phone, company, city, type, status, source, notes)
      VALUES (
        ${DbService.sanitize(id)},
        ${DbService.sanitize(data.name || '')},
        ${DbService.sanitize(data.email || null)},
        ${DbService.sanitize(data.phone || null)},
        ${DbService.sanitize(data.company || null)},
        ${DbService.sanitize(data.city || null)},
        ${DbService.sanitize(data.type || 'driver')},
        ${DbService.sanitize(data.status || 'new')},
        ${DbService.sanitize(data.source || 'website')},
        ${DbService.sanitize(data.notes || null)}
      )
    `;
    await DbService.query(sql);
    const result = await DbService.query(`SELECT * FROM leads WHERE id = ${DbService.sanitize(id)}`);
    return result[0];
  }

  static async getStats() {
    const totalLeads = await DbService.query('SELECT count(*) as count FROM leads');
    const byType = await DbService.query('SELECT type, count(*) as count FROM leads GROUP BY type');
    const byStatus = await DbService.query('SELECT status, count(*) as count FROM leads GROUP BY status');
    
    return {
      total: totalLeads[0].count,
      by_type: byType,
      by_status: byStatus
    };
  }

  static async logOutreach(leadId: string, data: any) {
    const id = uuidv4();
    const sql = `
      INSERT INTO outreach_logs (id, lead_id, agent_id, channel, status, content, metadata)
      VALUES (
        ${DbService.sanitize(id)},
        ${DbService.sanitize(leadId)},
        ${DbService.sanitize(data.agent_id || 'system')},
        ${DbService.sanitize(data.channel)},
        ${DbService.sanitize(data.status)},
        ${DbService.sanitize(data.content || '')},
        ${DbService.sanitize(JSON.stringify(data.metadata || {}))}
      )
    `;
    await DbService.query(sql);
    
    // Also update lead status if needed
    if (data.status === 'delivered' || data.status === 'sent') {
       await DbService.query(`UPDATE leads SET status = 'contacted', updated_at = CURRENT_TIMESTAMP WHERE id = ${DbService.sanitize(leadId)} AND status = 'new'`);
    }
    
    return { id, success: true };
  }
}
