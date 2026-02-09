// Arac tipi
export const VehicleType = {
  Car: 'car',
  Motorcycle: 'motorcycle',
  SUV: 'suv',
  Commercial: 'commercial',
  Minibus: 'minibus',
  Truck: 'truck',
  Tractor: 'tractor',
} as const;

export type VehicleTypeValue = typeof VehicleType[keyof typeof VehicleType];

// Arac tipi etiketleri
export const VehicleTypeLabels: Record<VehicleTypeValue, string> = {
  [VehicleType.Car]: 'Otomobil',
  [VehicleType.Motorcycle]: 'Motosiklet',
  [VehicleType.SUV]: 'Arazi Araci / SUV',
  [VehicleType.Commercial]: 'Ticari Arac',
  [VehicleType.Minibus]: 'Minibus',
  [VehicleType.Truck]: 'Kamyon / TIR',
  [VehicleType.Tractor]: 'Traktor',
};

// Konum tipi
export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

// Cekici talep formu
export interface TowTruckRequestForm {
  // Musteri bilgileri
  customerName: string;
  customerPhone: string;

  // Arac bilgileri
  vehicleType: VehicleTypeValue | '';
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePlate: string;

  // Konum bilgileri
  pickupAddress: string;
  pickupLatitude: string;
  pickupLongitude: string;
  dropoffAddress: string;
  dropoffLatitude: string;
  dropoffLongitude: string;

  // Ek bilgiler
  isVehicleOperational: boolean;
  hasKeys: boolean;
  additionalNotes: string;
}

// API Response
export interface CreateRequestResponse {
  id: number;
  message: string;
  status: string;
  tracking_token: string;
  tracking_url: string;
  websocket_url: string;
}

// API Error
export interface ApiError {
  error: string;
  errorCode?: string;
  details?: Record<string, string[]>;
}

// ==========================================
// Insurance / Acenta Panel Types
// ==========================================

// Hizmet tipi
export const ServiceType = {
  TowTruck: 'towTruck',
  Crane: 'crane',
  RoadAssistance: 'roadAssistance',
  HomeToHomeMoving: 'homeToHomeMoving',
  CityToCity: 'cityToCity',
} as const;

export type ServiceTypeValue = (typeof ServiceType)[keyof typeof ServiceType];

export const ServiceTypeLabels: Record<ServiceTypeValue, string> = {
  [ServiceType.TowTruck]: 'Cekici',
  [ServiceType.Crane]: 'Vinc',
  [ServiceType.RoadAssistance]: 'Yol Yardimi',
  [ServiceType.HomeToHomeMoving]: 'Evden Eve Nakliyat',
  [ServiceType.CityToCity]: 'Sehirler Arasi',
};

// Talep durumu
export const RequestStatus = {
  Pending: 'pending',
  AwaitingApproval: 'awaiting_approval',
  AwaitingPayment: 'awaiting_payment',
  InProgress: 'in_progress',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;

export type RequestStatusValue = (typeof RequestStatus)[keyof typeof RequestStatus];

export const RequestStatusLabels: Record<RequestStatusValue, string> = {
  [RequestStatus.Pending]: 'Beklemede',
  [RequestStatus.AwaitingApproval]: 'Onay Bekleniyor',
  [RequestStatus.AwaitingPayment]: 'Odeme Bekleniyor',
  [RequestStatus.InProgress]: 'Devam Ediyor',
  [RequestStatus.Completed]: 'Tamamlandi',
  [RequestStatus.Cancelled]: 'Iptal Edildi',
};

export const RequestStatusColors: Record<RequestStatusValue, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'default',
  awaiting_approval: 'warning',
  awaiting_payment: 'info',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'error',
};

// --- Auth ---

export interface RegisterPayload {
  name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  password: string;
  tax_number: string;
  tax_office: string;
  company_address: string;
  webhook_url?: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  status: 'pending_approval';
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  contact_person: string;
  contact_email: string;
  api_key: string;
  webhook_url: string | null;
  is_approved: boolean;
  is_active: boolean;
  message: string;
}

// --- Profil (GET /me/) ---

export interface CompanyProfile {
  company: {
    id: number;
    name: string;
    contact_person: string;
    contact_email: string;
    contact_phone: string;
    tax_number: string;
    tax_office: string;
    company_address: string;
  };
  api: {
    api_key: string;
    webhook_url: string | null;
    rate_limit_per_minute: number;
  };
  status: {
    is_approved: boolean;
    is_active: boolean;
    approved_at: string | null;
    created_at: string;
  };
  statistics: {
    total_requests: number;
    pending_requests: number;
    in_progress_requests: number;
    completed_requests: number;
    cancelled_requests: number;
  };
}

// --- Talepler ---

export interface InsuranceRequestCreatePayload {
  service_type: ServiceTypeValue;
  insured_name: string;
  insured_phone: string;
  insured_plate?: string;
  policy_number: string;
  external_reference?: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_address?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  estimated_km?: number;
  service_details?: string;
}

export interface InsuranceRequestCreateResponse {
  request_id: number;
  status: 'pending';
  tracking_token: string;
  tracking_url: string;
  created_at: string;
}

export interface InsuranceRequestSummary {
  request_id: number;
  status: RequestStatusValue;
  service_type: ServiceTypeValue;
  insured_name: string;
  policy_number: string;
  created_at: string;
}

export interface InsuranceRequestListResponse {
  count: number;
  page: number;
  page_size: number;
  results: InsuranceRequestSummary[];
}

export interface InsuranceRequestDetail {
  request_id: number;
  status: RequestStatusValue;
  service_type: ServiceTypeValue;
  insured_name: string;
  insured_phone: string;
  insured_plate: string | null;
  policy_number: string;
  tracking_url: string;
  driver: {
    name: string | null;
    phone: string | null;
  } | null;
  pricing: {
    estimated_price: string | null;
    currency: string;
  } | null;
  timeline: {
    created_at: string;
    accepted_at: string | null;
    completed_at: string | null;
  };
}

export interface CancelRequestResponse {
  request_id: number;
  status: 'cancelled';
  message: string;
}

// --- Fiyatlandirma ---

export interface PricingEstimatePayload {
  service_type: ServiceTypeValue;
  vehicle_type?: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  estimated_km?: number;
}

export interface PricingEstimateResponse {
  service_type: ServiceTypeValue;
  estimated_price: string | null;
  currency: 'TRY';
  message: string;
  breakdown: {
    base_price: string;
    commission: string;
    tax: string;
    total: string;
  } | null;
}
