export type UserRole = 'driver' | 'fleet_owner' | 'company' | 'broker';
export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: string; email: string; name: string; companyName?: string;
  role: UserRole; phone?: string; kycStatus: KYCStatus;
  reputation: number; tripsCompleted: number; memberSince: string;
}

export interface AuthState { user: User | null; token: string | null; isLoading: boolean; }

export type LoadStatus = 'available' | 'booked' | 'in_transit' | 'delivered' | 'cancelled';
export type LoadType = 'full_truckload' | 'less_than_truckload' | 'hazardous' | 'refrigerated' | 'oversized';

export interface Location { address: string; city: string; province: string; lat: number; lng: number; }

export interface Load {
  id: string; title: string; description: string; type: LoadType; status: LoadStatus;
  pickup: Location; delivery: Location; pickupEarliest: string; deliveryLatest: string;
  dimensions: { weight: number; volume: number; pallets: number };
  distance: number; estimatedRevenue: number; postedByName: string; postedByReputation: number;
  createdAt: string; bids: number;
}

export type TripStatus = 'pending' | 'accepted' | 'en_route_to_pickup' | 'loading' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';

export interface ReturnTripSuggestion {
  id: string; title: string; from: string; to: string; distance: number; weight: number;
  revenue: number; matchScore: number; reason: string; pickupDate: string;
}

export interface DashboardStats {
  activeTrips: number; availableLoads: number; totalEarnings: number;
  thisMonthEarnings: number; rating: number; emptyMilesReduced: number;
  utilisationRate: number;
}