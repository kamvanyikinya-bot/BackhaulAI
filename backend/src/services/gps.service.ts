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

  static async getLatest(tripId: string): Promise<any | null> {
    const sql = `
      SELECT g.*, l.dest_lat, l.dest_lng, l.destination 
      FROM gps_locations g
      JOIN trips t ON g.trip_id = t.id
      JOIN loads l ON t.load_id = l.id
      WHERE g.trip_id = ${DbService.sanitize(tripId)} 
      ORDER BY g.timestamp DESC 
      LIMIT 1
    `;
    const result = await DbService.query(sql);
    if (!result || result.length === 0) return null;
    
    const latest = result[0];
    if (latest.dest_lat && latest.dest_lng) {
      const distance = this.calculateDistance(latest.lat, latest.lng, latest.dest_lat, latest.dest_lng);
      const avgSpeed = latest.speed > 20 ? latest.speed : 60; // Use current speed or default to 60km/h
      const hoursRemaining = distance / avgSpeed;
      const eta = new Date(Date.now() + hoursRemaining * 3600000);
      
      latest.distance_remaining_km = Math.round(distance * 10) / 10;
      latest.eta = eta.toISOString();
      latest.estimated_hours = Math.round(hoursRemaining * 10) / 10;
    }
    
    return latest;
  }

  static async getBatchLatest(tripIds: string[]): Promise<any[]> {
    if (tripIds.length === 0) return [];
    
    const ids = tripIds.map(id => DbService.sanitize(id)).join(',');
    const sql = `
      SELECT g.*, l.dest_lat, l.dest_lng, l.destination, t.id as trip_id
      FROM gps_locations g
      JOIN (
        SELECT trip_id, MAX(timestamp) as max_ts
        FROM gps_locations
        WHERE trip_id IN (${ids})
        GROUP BY trip_id
      ) latest ON g.trip_id = latest.trip_id AND g.timestamp = latest.max_ts
      JOIN trips t ON g.trip_id = t.id
      JOIN loads l ON t.load_id = l.id
    `;
    const results = await DbService.query(sql);
    
    return results.map((latest: any) => {
      if (latest.dest_lat && latest.dest_lng) {
        const distance = this.calculateDistance(latest.lat, latest.lng, latest.dest_lat, latest.dest_lng);
        const avgSpeed = latest.speed > 20 ? latest.speed : 60;
        const hoursRemaining = distance / avgSpeed;
        const eta = new Date(Date.now() + hoursRemaining * 3600000);
        
        latest.distance_remaining_km = Math.round(distance * 10) / 10;
        latest.eta = eta.toISOString();
        latest.estimated_hours = Math.round(hoursRemaining * 10) / 10;
      }
      return latest;
    });
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
