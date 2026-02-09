import { useState } from 'react';
import {
  Typography, Card, CardContent, Box, TextField, Button, Alert,
  MenuItem, IconButton, Tooltip,
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { createInsuranceRequest } from '../../api';
import { ServiceType, ServiceTypeLabels } from '../../types';
import type { ServiceTypeValue, InsuranceRequestCreatePayload, InsuranceRequestCreateResponse } from '../../types';

const serviceTypeOptions = Object.entries(ServiceTypeLabels).map(([value, label]) => ({ value, label }));

export default function NewRequestPage() {
  const [form, setForm] = useState<InsuranceRequestCreatePayload>({
    service_type: ServiceType.TowTruck as ServiceTypeValue,
    insured_name: '',
    insured_phone: '',
    insured_plate: '',
    policy_number: '',
    external_reference: '',
    pickup_address: '',
    pickup_latitude: 0,
    pickup_longitude: 0,
    dropoff_address: '',
    dropoff_latitude: 0,
    dropoff_longitude: 0,
    estimated_km: 0,
    service_details: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<InsuranceRequestCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (field: keyof InsuranceRequestCreatePayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = ['pickup_latitude', 'pickup_longitude', 'dropoff_latitude', 'dropoff_longitude', 'estimated_km'].includes(field)
      ? Number(e.target.value) || 0
      : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.insured_name || !form.insured_phone || !form.policy_number || !form.pickup_address || !form.pickup_latitude || !form.pickup_longitude) {
      setError('Lutfen zorunlu alanlari doldurun');
      return;
    }

    setLoading(true);
    try {
      const payload: InsuranceRequestCreatePayload = {
        service_type: form.service_type,
        insured_name: form.insured_name,
        insured_phone: form.insured_phone,
        policy_number: form.policy_number,
        pickup_address: form.pickup_address,
        pickup_latitude: form.pickup_latitude,
        pickup_longitude: form.pickup_longitude,
      };
      if (form.insured_plate) payload.insured_plate = form.insured_plate;
      if (form.external_reference) payload.external_reference = form.external_reference;
      if (form.dropoff_address) payload.dropoff_address = form.dropoff_address;
      if (form.dropoff_latitude) payload.dropoff_latitude = form.dropoff_latitude;
      if (form.dropoff_longitude) payload.dropoff_longitude = form.dropoff_longitude;
      if (form.estimated_km) payload.estimated_km = form.estimated_km;
      if (form.service_details) payload.service_details = form.service_details;

      const response = await createInsuranceRequest(payload);
      setSuccess(response);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Talep olusturulurken hata olustu');
      } else {
        setError('Bir hata olustu. Lutfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setForm({
      service_type: ServiceType.TowTruck as ServiceTypeValue,
      insured_name: '',
      insured_phone: '',
      insured_plate: '',
      policy_number: '',
      external_reference: '',
      pickup_address: '',
      pickup_latitude: 0,
      pickup_longitude: 0,
      dropoff_address: '',
      dropoff_latitude: 0,
      dropoff_longitude: 0,
      estimated_km: 0,
      service_details: '',
    });
  };

  const copyTrackingUrl = () => {
    if (success?.tracking_url) {
      navigator.clipboard.writeText(success.tracking_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
              Talep Olusturuldu!
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Talep ID: <strong>#{success.request_id}</strong>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {success.tracking_url}
              </Typography>
              <Tooltip title={copied ? 'Kopyalandi!' : 'Kopyala'}>
                <IconButton size="small" onClick={copyTrackingUrl}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" component={Link} to={`/panel/requests/${success.request_id}`}>
                Detay Gor
              </Button>
              <Button variant="outlined" onClick={resetForm}>
                Yeni Talep Olustur
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Yeni Talep Olustur</Typography>
        <Typography sx={{ fontSize: 14, color: '#64748b' }}>Sigortali icin yeni hizmet talebi olusturun</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>Hizmet Bilgileri</Typography>

            <TextField
              select fullWidth label="Hizmet Tipi *" value={form.service_type}
              onChange={handleChange('service_type')} sx={{ mb: 2 }}
            >
              {serviceTypeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>

            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, mt: 1 }}>Sigortali Bilgileri</Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField fullWidth label="Sigortali Adi *" value={form.insured_name} onChange={handleChange('insured_name')} />
              <TextField fullWidth label="Sigortali Telefon *" value={form.insured_phone} onChange={handleChange('insured_phone')} />
              <TextField fullWidth label="Plaka" value={form.insured_plate} onChange={handleChange('insured_plate')} />
              <TextField fullWidth label="Police Numarasi *" value={form.policy_number} onChange={handleChange('policy_number')} />
              <TextField fullWidth label="Harici Referans" value={form.external_reference} onChange={handleChange('external_reference')} sx={{ gridColumn: { sm: '1 / -1' } }} />
            </Box>

            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, mt: 1 }}>Alis Konumu</Typography>

            <TextField fullWidth label="Alis Adresi *" value={form.pickup_address} onChange={handleChange('pickup_address')} sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField fullWidth label="Enlem *" type="number" value={form.pickup_latitude || ''} onChange={handleChange('pickup_latitude')} />
              <TextField fullWidth label="Boylam *" type="number" value={form.pickup_longitude || ''} onChange={handleChange('pickup_longitude')} />
            </Box>

            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, mt: 1 }}>Birakis Konumu (opsiyonel)</Typography>

            <TextField fullWidth label="Birakis Adresi" value={form.dropoff_address} onChange={handleChange('dropoff_address')} sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField fullWidth label="Enlem" type="number" value={form.dropoff_latitude || ''} onChange={handleChange('dropoff_latitude')} />
              <TextField fullWidth label="Boylam" type="number" value={form.dropoff_longitude || ''} onChange={handleChange('dropoff_longitude')} />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <TextField fullWidth label="Tahmini KM" type="number" value={form.estimated_km || ''} onChange={handleChange('estimated_km')} />
              <TextField fullWidth label="Hizmet Detaylari" value={form.service_details} onChange={handleChange('service_details')} multiline rows={2} sx={{ gridColumn: { sm: '1 / -1' } }} />
            </Box>

            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Olusturuluyor...' : 'Talep Olustur'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
