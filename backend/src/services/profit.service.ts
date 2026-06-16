export class ProfitService {
  private static COMMISSION_RATE = 0.15;
  private static COST_PER_KM = 1.20;

  static calculateTripProfit(distanceKm: number, revenue: number) {
    const cost = distanceKm * this.COST_PER_KM;
    const commission = revenue * this.COMMISSION_RATE;
    const netProfit = revenue - cost - commission;
    
    return {
      grossRevenue: revenue,
      operationalCost: cost,
      commission,
      netProfit,
      profitMargin: (netProfit / revenue) * 100
    };
  }

  static calculateReturnImpact(forwardProfit: any, returnProfit: any) {
    const totalRevenue = forwardProfit.grossRevenue + returnProfit.grossRevenue;
    const totalCost = forwardProfit.operationalCost + returnProfit.operationalCost;
    const totalCommission = forwardProfit.commission + returnProfit.commission;
    const totalNetProfit = totalRevenue - totalCost - totalCommission;

    return {
      totalNetProfit,
      additionalProfit: totalNetProfit - forwardProfit.netProfit,
      improvementPct: ((totalNetProfit - forwardProfit.netProfit) / forwardProfit.netProfit) * 100
    };
  }
}
