import type { User, DashboardStats, ReturnTripSuggestion } from '../types';

export const mockUser: User = {
  id: 'user-1', email: 'john@translogix.co.za', name: 'John Mokoena',
  companyName: 'TransLogix SA', role: 'company', phone: '+27 82 555 0123',
  kycStatus: 'verified', reputation: 4.8, tripsCompleted: 342, memberSince: '2022-03-15',
};

export const mockDashboardStats: DashboardStats = {
  activeTrips: 1, availableLoads: 6, totalEarnings: 985000,
  thisMonthEarnings: 44000, rating: 4.8, emptyMilesReduced: 42, utilisationRate: 78,
};

export const mockReturnLoads: ReturnTripSuggestion[] = [
  { id: 'r1', title: 'Retail Goods - DBN to JHB', from: 'Durban Harbour', to: 'Crown Mines, JHB', distance: 590, weight: 8000, revenue: 18500, matchScore: 96, reason: "You're delivering to Durban. This load goes back to Johannesburg — your home base. Zero deadhead.", pickupDate: '03 Jun 2025' },
  { id: 'r2', title: 'Auto Parts - DBN to PTA', from: 'DBN North Depot', to: 'Pretoria West', distance: 615, weight: 4500, revenue: 16000, matchScore: 88, reason: 'Slight detour (+25 km) from your return route, but pays well.', pickupDate: '03 Jun 2025' },
  { id: 'r3', title: 'Machinery - DBN to SPR', from: 'DBN Industrial', to: 'Springs, GP', distance: 550, weight: 12000, revenue: 14000, matchScore: 75, reason: 'Shorter return route. Lower revenue but guaranteed load — better than driving empty.', pickupDate: '04 Jun 2025' },
];

export const mockOpportunities = [
  { id: 'o1', type: 'return_trip', title: 'Durban → JHB: Retail Backhaul', description: 'Available return load matching your active trip. 12 pallets of mixed retail goods.', expectedProfit: 18500, matchQuality: 96, route: 'Durban Harbour → Crown Mines, JHB', action: 'Book Now', reason: "You're already headed to Durban. This goes back to JHB." },
  { id: 'o2', type: 'profitable_corridor', title: 'JHB ↔ DBN: High Demand', description: '42 loads this week. Round trips earn 2x your one-way rate.', expectedProfit: 40500, matchQuality: 92, route: 'Johannesburg ↔ Durban', action: 'View Corridor', reason: 'Your most profitable route. Avg round trip R40,500 vs R22,000 one-way.' },
  { id: 'o3', type: 'load_to_haul', title: 'Cape Town → JHB: Refrigerated Load', description: 'Temperature-controlled citrus. 12 pallets, 2-4°C.', expectedProfit: 62000, matchQuality: 78, route: 'Tzaneen → Cape Town', action: 'View Details', reason: 'Premium refrigerated load. Higher than average pay.' },
];

export const mockNotifications = [
  { id: 'n1', title: 'New Return Load Match', message: 'Retail Goods from Durban to Johannesburg — 96% match score.', time: '2 hours ago', read: false },
  { id: 'n2', title: 'Trip Completed', message: 'JHB→DBN delivered. Payment of R22,000 released.', time: '5 hours ago', read: false },
  { id: 'n3', title: 'Savings Update', message: 'You saved R48,500 this month by avoiding empty trips.', time: '1 day ago', read: true },
];

export const mockSubscriptionPlans = [
  { id: 'starter', name: 'Starter', price: 3500, desc: 'For small fleet owners and independent operators', features: ['AI return trip matching', 'GPS tracking', 'Browse and book loads', 'Basic load matching', 'Standard support', 'Up to 5 loads/month'], highlighted: false },
  { id: 'pro', name: 'Pro', price: 9500, desc: 'For growing logistics businesses', features: ['Everything in Starter', 'Unlimited loads', 'Priority load matching', 'AI return trip optimisation', 'Advanced analytics', 'KYC verification', 'Premium support'], highlighted: true },
  { id: 'business', name: 'Business', price: 20000, desc: 'For established logistics companies', features: ['Everything in Pro', 'Dedicated account manager', 'Custom API integration', 'Fleet-wide analytics', '24/7 priority support', 'Multi-user access', 'SLA guarantees'], highlighted: false },
  { id: 'enterprise', name: 'Enterprise', price: 35000, desc: 'For large fleet operators', features: ['Everything in Business', 'White-label options', 'Advanced AI tools', 'Demand prediction', 'Pricing intelligence', 'Route optimisation', 'Dedicated infrastructure'], highlighted: false },
  { id: 'enterprise-plus', name: 'Enterprise+', price: 65000, desc: 'For enterprise logistics groups', features: ['Everything in Enterprise', 'Full white-label', 'Custom AI model training', 'Dedicated support team', '99.9% uptime SLA', 'Priority feature access', 'Executive account management'], highlighted: false },
];

export const mockUserSubscription = {
  id: 'sub-1', userId: 'user-1', planId: 'pro', planName: 'Pro',
  price: 9500, billingCycle: 'monthly' as const,
  startDate: '2025-01-15', nextBillingDate: '2025-07-15',
  status: 'active' as const, autoRenew: true,
  paymentMethod: 'EFT',
};