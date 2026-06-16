import { DbService } from './db.service';

export interface GPSLocation {
  id?: number;
  trip_id: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
}

export class GPSService {
  static async recordLocation(location: GPSLocation) {
    const sql = `
      INSERT INTO gps_locations (trip_id, lat, lng, speed, heading)
      VALUES (
        ${DbService.sanitize(location.trip_id)},
        ${location.lat},
        ${location.lng},
        ${location.speed || 0},
        ${location.heading || 0}
      )
    `;
    await DbService.query(sql);
    
    // Also update trucks table current_lat/lng if we can find the truck associated with this trip
    const tripSql = `SELECT truck_id FROM trips WHERE id = ${DbService.sanitize(location.trip_id)}`;
    const tripResult = await DbService.query(tripSql);
    if (tripResult && tripResult.length > 0) {
      const truckId = tripResult[0].truck_id;
      await DbService.query(`
        UPDATE trucks 
        SET current_lat = ${location.lat}, 
            current_lng = ${location.lng} 
        WHERE id = ${DbService.sanitize(truckId)}
      `);
    }
    
    return { success: true };
  }

  static async getLatest(tripId: string): Promise<GPSLocation | null> {
    const sql = `SELECT * FROM gps_locations WHERE trip_id = ${DbService.sanitize(tripId)} ORDER BY timestamp DESC LIMIT 1`;
    const result = await DbService.query(sql);
    if (!result || result.length === 0) return null;
    return result[0];
  }
}
