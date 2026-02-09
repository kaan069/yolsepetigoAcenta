import axios from 'axios';
import {
  TowTruckRequestForm,
  CreateRequestResponse,
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  CompanyProfile,
  InsuranceRequestCreatePayload,
  InsuranceRequestCreateResponse,
  InsuranceRequestListResponse,
  InsuranceRequestDetail,
  CancelRequestResponse,
  PricingEstimatePayload,
  PricingEstimateResponse,
} from './types';

const API_BASE_URL = 'https://api.yolpaketi.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * OTP kodu gonder
 */
export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/api/otp/send/', {
    phoneNumber: phoneNumber,
  });
  return response.data;
};

/**
 * OTP kodunu dogrula
 */
export const verifyOTP = async (phoneNumber: string, code: string): Promise<{ success: boolean; message: string; verificationToken?: string }> => {
  const response = await api.post('/api/otp/verify/', {
    phoneNumber: phoneNumber,
    otpCode: code,
  });
  return response.data;
};

/**
 * Cekici talebi olustur
 */
export const createTowTruckRequest = async (form: TowTruckRequestForm, verificationToken: string): Promise<CreateRequestResponse> => {
  // Backend'in beklediği formata dönüştür
  const payload = {
    requestedServiceType: 'tow_truck',
    towTruckDetails: {
      vehicleType: form.vehicleType,
    },
    question_answers: [],
    pickupLocation: {
      address: form.pickupAddress,
      latitude: form.pickupLatitude,
      longitude: form.pickupLongitude,
    },
    dropoffLocation: {
      address: form.dropoffAddress,
      latitude: form.dropoffLatitude,
      longitude: form.dropoffLongitude,
    },
    routeInfo: null,
    estimatedPrice: '0',
    estimatedKm: 0,
    createdAt: new Date().toISOString(),
  };

  const response = await api.post('/requests/create/tow-truck/', payload, {
    headers: {
      'X-Verification-Token': verificationToken,
    },
  });
  return response.data;
};

export default api;

// ==========================================
// Insurance / Acenta API
// ==========================================

const insuranceApi = axios.create({
  baseURL: 'https://api.yolsepetigo.com/insurance',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getApiKey = (): string => {
  const key = localStorage.getItem('apiKey');
  if (!key) throw new Error('API key bulunamadi');
  return key;
};

// --- Auth ---

export const registerCompany = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await insuranceApi.post('/register/', payload);
  return response.data;
};

export const loginCompany = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await insuranceApi.post('/login/', payload);
  return response.data;
};

// --- Profil ---

export const getProfile = async (): Promise<CompanyProfile> => {
  const response = await insuranceApi.get('/me/', {
    headers: { 'X-API-Key': getApiKey() },
  });
  return response.data;
};

export const updateWebhook = async (webhook_url: string): Promise<{ message: string; webhook_url: string }> => {
  const response = await insuranceApi.put('/me/', { webhook_url }, {
    headers: { 'X-API-Key': getApiKey() },
  });
  return response.data;
};

// --- Talepler ---

export const createInsuranceRequest = async (payload: InsuranceRequestCreatePayload): Promise<InsuranceRequestCreateResponse> => {
  const response = await insuranceApi.post('/requests/create/', payload, {
    headers: { 'X-API-Key': getApiKey() },
  });
  return response.data;
};

export const listInsuranceRequests = async (params?: { status?: string; page?: number; page_size?: number }): Promise<InsuranceRequestListResponse> => {
  const response = await insuranceApi.get('/requests/', {
    params,
    headers: { 'X-API-Key': getApiKey() },
  });
  return response.data;
};

export const getInsuranceRequest = async (requestId: number): Promise<InsuranceRequestDetail> => {
  const response = await insuranceApi.get(`/requests/${requestId}/`, {
    headers: { 'X-API-Key': getApiKey() },
  });
  return response.data;
};

export const cancelInsuranceRequest = async (requestId: number): Promise<CancelRequestResponse> => {
  const response = await insuranceApi.post(`/requests/${requestId}/cancel/`, {}, {
    headers: { 'X-API-Key': getApiKey() },
  });
  return response.data;
};

// --- Fiyatlandirma ---

export const estimatePrice = async (payload: PricingEstimatePayload): Promise<PricingEstimateResponse> => {
  const response = await insuranceApi.post('/pricing/estimate/', payload, {
    headers: { 'X-API-Key': getApiKey() },
  });
  return response.data;
};
