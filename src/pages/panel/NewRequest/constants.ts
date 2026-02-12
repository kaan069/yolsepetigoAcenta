import { ServiceType, ServiceTypeLabels } from '../../../types';
import type { ServiceTypeValue } from '../../../types';

export const serviceTypeOptions = Object.entries(ServiceTypeLabels).map(([value, label]) => ({ value, label }));

export const towTruckVehicleTypes = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
  { value: 'motorcycle', label: 'Motosiklet' },
  { value: 'truck', label: 'Kamyon' },
  { value: 'bus', label: 'Otobus' },
];

export const problemTypeOptions = [
  { value: 'tire_change', label: 'Lastik Degisimi' },
  { value: 'battery_boost', label: 'Aku Takviye' },
  { value: 'fuel_delivery', label: 'Yakit Ikmali' },
  { value: 'lockout', label: 'Anahtar Kilitli Kaldi' },
  { value: 'minor_repair', label: 'Kucuk Onarim' },
];

export const timeSlotOptions = [
  { value: 'morning', label: 'Sabah (08:00-12:00)' },
  { value: 'afternoon', label: 'Ogle (12:00-17:00)' },
  { value: 'evening', label: 'Aksam (17:00-21:00)' },
];

export const NEEDS_DROPOFF: ServiceTypeValue[] = [ServiceType.TowTruck, ServiceType.HomeToHomeMoving, ServiceType.CityToCity];
