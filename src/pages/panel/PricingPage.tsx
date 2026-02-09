import { useState } from 'react';
import {
Typography, Card, CardContent, Box, TextField, Button, Alert, MenuItem,
} from '@mui/material';
import { ServiceType, ServiceTypeLabels } from '../../types';
import { estimatePrice } from '../../api';
import type { ServiceTypeValue, PricingEstimatePayload, PricingEstimateResponse } from '../../types';

const serviceTypeOptions = Object.entries(ServiceTypeLabels).map(([value, label]) => ({ value, label }));

export default function PricingPage() {
  const [form, setForm] = useState<PricingEstimatePayload>({
    service_type: ServiceType.TowTruck as ServiceTypeValue,
    vehicle_type: 'sedan',
    pickup_latitude: 0,
    pickup_longitude: 0,
    dropoff_latitude: 0,
    dropoff_longitude: 0,
    estimated_km: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PricingEstimateResponse | null>(null);

  const handleChange = (field: keyof PricingEstimatePayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = ['pickup_latitude', 'pickup_longitude', 'dropoff_latitude', 'dropoff_longitude', 'estimated_km'].includes(field)
      ? Number(e.target.value) || 0
      : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!form.pickup_latitude || !form.pickup_longitude) {
      setError('Alis konumu zorunludur');
      return;
    }

    setLoading(true);
    try {
      const payload: PricingEstimatePayload = {
        service_type: form.service_type,
        pickup_latitude: form.pickup_latitude,
        pickup_longitude: form.pickup_longitude,
      };
      if (form.vehicle_type) payload.vehicle_type = form.vehicle_type;
      if (form.dropoff_latitude) payload.dropoff_latitude = form.dropoff_latitude;
      if (form.dropoff_longitude) payload.dropoff_longitude = form.dropoff_longitude;
      if (form.estimated_km) payload.estimated_km = form.estimated_km;

      const data = await estimatePrice(payload);
      setResult(data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Fiyat hesaplanirken hata olustu');
      } else {
        setError('Bir hata olustu. Lutfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Fiyat Hesapla</Typography>
        <Typography sx={{ fontSize: 14, color: '#64748b' }}>Hizmet icin tahmini fiyat hesaplayin</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                select fullWidth label="Hizmet Tipi" value={form.service_type}
                onChange={handleChange('service_type')}
              >
                {serviceTypeOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth label="Arac Tipi" value={form.vehicle_type} onChange={handleChange('vehicle_type')} />
            </Box>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Alis Konumu</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField fullWidth label="Enlem *" type="number" value={form.pickup_latitude || ''} onChange={handleChange('pickup_latitude')} />
              <TextField fullWidth label="Boylam *" type="number" value={form.pickup_longitude || ''} onChange={handleChange('pickup_longitude')} />
            </Box>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Birakis Konumu (opsiyonel)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField fullWidth label="Enlem" type="number" value={form.dropoff_latitude || ''} onChange={handleChange('dropoff_latitude')} />
              <TextField fullWidth label="Boylam" type="number" value={form.dropoff_longitude || ''} onChange={handleChange('dropoff_longitude')} />
            </Box>

            <TextField fullWidth label="Tahmini KM" type="number" value={form.estimated_km || ''} onChange={handleChange('estimated_km')} sx={{ mb: 3 }} />

            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Hesaplaniyor...' : 'Fiyat Hesapla'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Sonuc</Typography>

            {result.estimated_price ? (
              <>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {result.estimated_price} {result.currency}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {result.message}
                </Typography>
                {result.breakdown && (
                  <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2">Taban Fiyat</Typography>
                      <Typography variant="body2">{result.breakdown.base_price} TRY</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2">Komisyon</Typography>
                      <Typography variant="body2">{result.breakdown.commission} TRY</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2">Vergi</Typography>
                      <Typography variant="body2">{result.breakdown.tax} TRY</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Toplam</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{result.breakdown.total} TRY</Typography>
                    </Box>
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="info">{result.message}</Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
