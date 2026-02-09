import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Person,
  Phone,
  DirectionsCar,
  LocationOn,
  MyLocation,
  Flag,
  Notes,
  Send,
  CheckCircle,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import type { TowTruckRequestForm as FormType, CreateRequestResponse, VehicleTypeValue } from '../types';
import { VehicleType, VehicleTypeLabels } from '../types';
import { sendOTP, verifyOTP, createTowTruckRequest } from '../api';

const initialFormState: FormType = {
  customerName: '',
  customerPhone: '',
  vehicleType: '',
  vehicleBrand: '',
  vehicleModel: '',
  vehiclePlate: '',
  pickupAddress: '',
  pickupLatitude: '',
  pickupLongitude: '',
  dropoffAddress: '',
  dropoffLatitude: '',
  dropoffLongitude: '',
  isVehicleOperational: true,
  hasKeys: true,
  additionalNotes: '',
};

const steps = [
  { label: 'Musteri Bilgileri', icon: <Person sx={{ fontSize: 18 }} /> },
  { label: 'Arac Bilgileri', icon: <DirectionsCar sx={{ fontSize: 18 }} /> },
  { label: 'Konum Bilgileri', icon: <LocationOn sx={{ fontSize: 18 }} /> },
  { label: 'Onay', icon: <Notes sx={{ fontSize: 18 }} /> },
];

export default function TowTruckRequestForm() {
  const [form, setForm] = useState<FormType>(initialFormState);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateRequestResponse | null>(null);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string>('');

  const handleChange = (field: keyof FormType, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSendOTP = async () => {
    if (!form.customerPhone || form.customerPhone.length < 10) {
      setError('Gecerli bir telefon numarasi girin');
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const fullPhone = form.customerPhone.startsWith('+90')
        ? form.customerPhone
        : '+90' + form.customerPhone.replace(/^0/, '');

      await sendOTP(fullPhone);
      setOtpSent(true);
      handleChange('customerPhone', fullPhone);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'OTP gonderilemedi');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('6 haneli dogrulama kodunu girin');
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const response = await verifyOTP(form.customerPhone, otpCode);
      if (response.verificationToken) {
        setVerificationToken(response.verificationToken);
        setOtpVerified(true);
      } else {
        setError(response.message || 'Dogrulama basarisiz');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Dogrulama basarisiz');
    } finally {
      setOtpLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!form.customerName && otpVerified;
      case 1:
        return !!form.vehicleType && !!form.vehicleBrand && !!form.vehicleModel && !!form.vehiclePlate;
      case 2:
        return !!form.pickupAddress && !!form.pickupLatitude && !!form.pickupLongitude &&
               !!form.dropoffAddress && !!form.dropoffLatitude && !!form.dropoffLongitude;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError(null);
    } else {
      setError('Lutfen tum zorunlu alanlari doldurun');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!verificationToken) {
      setError('Telefon dogrulamasi gerekli');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createTowTruckRequest(form, verificationToken);
      setSuccess(response);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Talep olusturulamadi';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialFormState);
    setActiveStep(0);
    setSuccess(null);
    setError(null);
    setOtpSent(false);
    setOtpCode('');
    setOtpVerified(false);
    setVerificationToken('');
  };

  // Basarili sonuc ekrani
  if (success) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'visible' }}>
        <CardContent sx={{ textAlign: 'center', py: 8, px: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#0f172a', mb: 1 }}>
            Talep Basariyla Olusturuldu!
          </Typography>
          <Typography sx={{ fontSize: 15, color: '#64748b', mb: 3 }}>
            Talep ID: <strong>#{success.id}</strong>
          </Typography>
          <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, mb: 4, maxWidth: 480, mx: 'auto' }}>
            <Typography sx={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, mb: 0.5 }}>Takip Linki</Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 14, color: '#334155', wordBreak: 'break-all' }}>
              https://yolsepetigo.com{success.tracking_url}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleReset}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              fontWeight: 600,
              borderRadius: 2.5,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: 15,
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              '&:hover': { boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)' },
            }}
          >
            Yeni Talep Olustur
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'visible' }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        {/* Custom Stepper */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, mb: 4 }}>
          {steps.map((step, index) => (
            <Box
              key={step.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: index <= activeStep
                    ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                    : '#f1f5f9',
                  color: index <= activeStep ? 'white' : '#94a3b8',
                  transition: 'all 0.3s ease',
                  boxShadow: index === activeStep ? '0 4px 12px rgba(14, 165, 233, 0.3)' : 'none',
                }}
              >
                {step.icon}
              </Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: index === activeStep ? 600 : 400,
                  color: index <= activeStep ? '#0f172a' : '#94a3b8',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {step.label}
              </Typography>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: { xs: 16, sm: 32 },
                    height: 2,
                    bgcolor: index < activeStep ? '#0ea5e9' : '#e2e8f0',
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2, border: '1px solid #fecaca', bgcolor: '#fef2f2' }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Step 0: Musteri Bilgileri */}
        {activeStep === 0 && (
          <Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Musteri Adi Soyadi *"
                  value={form.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Telefon Numarasi *"
                  value={form.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  placeholder="5XX XXX XX XX"
                  disabled={otpVerified}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: '#94a3b8', fontSize: 20 }} />
                          <Typography sx={{ ml: 0.5, color: '#64748b', fontSize: 14 }}>+90</Typography>
                        </InputAdornment>
                      ),
                      endAdornment: !otpVerified && (
                        <InputAdornment position="end">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleSendOTP}
                            disabled={otpLoading || otpSent}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: 12,
                              borderColor: '#0ea5e9',
                              color: '#0ea5e9',
                              '&:hover': { borderColor: '#0284c7', bgcolor: '#f0f9ff' },
                            }}
                          >
                            {otpLoading ? <CircularProgress size={18} /> : otpSent ? 'Gonderildi' : 'Kod Gonder'}
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              {otpSent && !otpVerified && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dogrulama Kodu"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6 haneli kod"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={handleVerifyOTP}
                              disabled={otpLoading || otpCode.length !== 6}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: 12,
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                              }}
                            >
                              {otpLoading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Dogrula'}
                            </Button>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              )}
              {otpVerified && (
                <Grid item xs={12}>
                  <Alert
                    severity="success"
                    icon={<CheckCircle sx={{ fontSize: 20 }} />}
                    sx={{ borderRadius: 2, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4' }}
                  >
                    Telefon numarasi dogrulandi
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Step 1: Arac Bilgileri */}
        {activeStep === 1 && (
          <Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Arac Tipi *</InputLabel>
                  <Select
                    value={form.vehicleType}
                    label="Arac Tipi *"
                    onChange={(e) => handleChange('vehicleType', e.target.value)}
                  >
                    {Object.entries(VehicleTypeLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Marka *"
                  value={form.vehicleBrand}
                  onChange={(e) => handleChange('vehicleBrand', e.target.value)}
                  placeholder="Ornek: Toyota"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model *"
                  value={form.vehicleModel}
                  onChange={(e) => handleChange('vehicleModel', e.target.value)}
                  placeholder="Ornek: Corolla"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Plaka *"
                  value={form.vehiclePlate}
                  onChange={(e) => handleChange('vehiclePlate', e.target.value.toUpperCase())}
                  placeholder="34 ABC 123"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.isVehicleOperational}
                        onChange={(e) => handleChange('isVehicleOperational', e.target.checked)}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0ea5e9' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0ea5e9' } }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#334155' }}>Arac calisir durumda</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.hasKeys}
                        onChange={(e) => handleChange('hasKeys', e.target.checked)}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#0ea5e9' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0ea5e9' } }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#334155' }}>Anahtar mevcut</Typography>}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 2: Konum Bilgileri */}
        {activeStep === 2 && (
          <Box>
            {/* Alis Konumu */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MyLocation sx={{ fontSize: 16, color: '#10b981' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5 }}>Alis Konumu</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Alis Adresi *"
                    value={form.pickupAddress}
                    onChange={(e) => handleChange('pickupAddress', e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Tam adres yazin..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Enlem (Latitude) *"
                    value={form.pickupLatitude}
                    onChange={(e) => handleChange('pickupLatitude', e.target.value)}
                    placeholder="Ornek: 41.0082"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Boylam (Longitude) *"
                    value={form.pickupLongitude}
                    onChange={(e) => handleChange('pickupLongitude', e.target.value)}
                    placeholder="Ornek: 28.9784"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />

            {/* Birakis Konumu */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Flag sx={{ fontSize: 16, color: '#ef4444' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5 }}>Birakis Konumu</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Birakis Adresi *"
                    value={form.dropoffAddress}
                    onChange={(e) => handleChange('dropoffAddress', e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Tam adres yazin..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Enlem (Latitude) *"
                    value={form.dropoffLatitude}
                    onChange={(e) => handleChange('dropoffLatitude', e.target.value)}
                    placeholder="Ornek: 40.9876"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Boylam (Longitude) *"
                    value={form.dropoffLongitude}
                    onChange={(e) => handleChange('dropoffLongitude', e.target.value)}
                    placeholder="Ornek: 29.0345"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Step 3: Onay */}
        {activeStep === 3 && (
          <Box>
            <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2.5, p: 3, mb: 3 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Musteri</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{form.customerName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Telefon</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{form.customerPhone}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: '#e2e8f0' }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Arac</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                    {form.vehicleBrand} {form.vehicleModel} - {form.vehiclePlate}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Arac Tipi</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                    {form.vehicleType && VehicleTypeLabels[form.vehicleType as VehicleTypeValue]}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ borderColor: '#e2e8f0' }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Alis Adresi</Typography>
                  <Typography sx={{ fontSize: 14, color: '#334155' }}>{form.pickupAddress}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Birakis Adresi</Typography>
                  <Typography sx={{ fontSize: 14, color: '#334155' }}>{form.dropoffAddress}</Typography>
                </Grid>
              </Grid>
            </Box>

            <TextField
              fullWidth
              label="Ek Notlar (Opsiyonel)"
              value={form.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              multiline
              rows={3}
              placeholder="Ozel durumlar, talimatlar..."
            />
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
              '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' },
            }}
          >
            Geri
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <Send sx={{ fontSize: 18 }} />}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                px: 4,
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)' },
              }}
            >
              {loading ? 'Gonderiliyor...' : 'Talebi Olustur'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)' },
              }}
            >
              Devam Et
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
