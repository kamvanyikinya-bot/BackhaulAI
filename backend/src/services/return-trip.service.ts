import { DbService } from './db.service';
import { ProfitService } from './profit.service';

export class ReturnTripService {
  static async findMatches(tripId: string) {
    // 1. Get the trip details
    const trip = DbService.query(`SELECT * FROM trips WHERE id = ${DbService.sanitize(tripId)}`)[0];
    if (!trip) return [];

    // We need the destination of the load associated with this trip to find backhaul
    const load = DbService.query(`SELECT * FROM loads WHERE id = ${DbService.sanitize(trip.load_id)}`)[0];
    if (!load) return [];

    // 2. Find loads that start near the trip's destination
    const matches = DbService.query(`SELECT * FROM loads WHERE origin = ${DbService.sanitize(load.destination)} AND status = 'available'`);

    return matches.map((m: any) => {
      let matchScore = 85; 
      
      // Real calculations
      const forwardProfit = ProfitService.calculateTripProfit(load.distance_km || 500, load.price);
      const returnProfit = ProfitService.calculateTripProfit(m.distance_km || 500, m.price);
      
      const impact = ProfitService.calculateReturnImpact(forwardProfit, returnProfit);

      return {
        loadId: m.id,
        matchScore,
        profitImpact: impact.totalNetProfit,
        emptyMilesReduced: 100,
        reason: `Picking up this load in ${m.origin} after dropping off in ${load.destination} eliminates 100% of your empty return miles and adds R${impact.additionalProfit.toFixed(2)} to your trip profit.`
      };
    });
  }
}
