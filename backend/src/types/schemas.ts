import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['driver', 'fleet', 'company', 'admin']),
  fullName: z.string().min(1),
  phone: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const CreateLoadSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  weight: z.number().positive(),
  type: z.string().min(1),
  pickupWindowStart: z.string(),
  pickupWindowEnd: z.string(),
  deliveryWindowStart: z.string(),
  deliveryWindowEnd: z.string(),
  price: z.number().positive(),
  originLat: z.number().optional(),
  originLng: z.number().optional(),
  destLat: z.number().optional(),
  destLng: z.number().optional(),
  distanceKm: z.number().optional()
});

export const CreateTruckSchema = z.object({
  plateNumber: z.string().min(1),
  capacity: z.number().positive(),
  type: z.string().min(1),
  gpsDeviceId: z.string().optional()
});

export const MatchReturnSchema = z.object({
  tripId: z.string().min(1)
});

export const BookLoadSchema = z.object({
  loadId: z.string().min(1),
  truckId: z.string().min(1)
});
