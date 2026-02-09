import { Box, Typography, Container, Chip } from '@mui/material';
import { LocalShipping, AccessTime, GpsFixed, Security } from '@mui/icons-material';
import TowTruckRequestForm from '../../components/TowTruckRequestForm';

export default function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 6, md: 8 },
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
            <Chip
              icon={<LocalShipping sx={{ fontSize: 16, color: '#0ea5e9 !important' }} />}
              label="7/24 Yol Yardim Hizmeti"
              sx={{
                mb: 3,
                bgcolor: 'rgba(14, 165, 233, 0.1)',
                color: '#0ea5e9',
                fontWeight: 600,
                fontSize: 12,
                border: '1px solid rgba(14, 165, 233, 0.2)',
                '& .MuiChip-icon': { color: '#0ea5e9' },
              }}
            />
            <Typography
              sx={{
                fontSize: { xs: 32, md: 44 },
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.2,
                mb: 2,
                letterSpacing: -1,
              }}
            >
              Cekici Ihtiyaciniz mi Var?{' '}
              <Box component="span" sx={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Hemen Talep Olusturun
              </Box>
            </Typography>
            <Typography sx={{ fontSize: { xs: 15, md: 17 }, color: '#94a3b8', maxWidth: 520, mx: 'auto', lineHeight: 1.6 }}>
              YolSepetiGO ile dakikalar icinde cekici, vinc veya yol yardim hizmeti talep edin. Anlik takip ile aracinisin nerede oldugunu bilin.
            </Typography>

            {/* Feature Pills */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4, flexWrap: 'wrap' }}>
              {[
                { icon: <AccessTime sx={{ fontSize: 18 }} />, text: 'Hizli Cevap' },
                { icon: <GpsFixed sx={{ fontSize: 18 }} />, text: 'Anlik Takip' },
                { icon: <Security sx={{ fontSize: 18 }} />, text: 'Guvenli Hizmet' },
              ].map((item) => (
                <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: '#0ea5e9' }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Form Section */}
      <Container maxWidth="md" sx={{ mt: -3, mb: 6, position: 'relative', zIndex: 2 }}>
        <TowTruckRequestForm />
      </Container>
    </Box>
  );
}
