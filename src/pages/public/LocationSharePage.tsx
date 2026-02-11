import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { MyLocation, CheckCircle } from '@mui/icons-material';

type Status = 'idle' | 'locating' | 'submitting' | 'success' | 'error';

const WS_BASE = 'wss://api.yolsepetigo.com';

export default function LocationSharePage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const sendViaWebSocket = (latitude: number, longitude: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_BASE}/ws/location-share/${token}/`);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('timeout'));
      }, 10000);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          action: 'share_location',
          latitude,
          longitude,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'location_received') {
            clearTimeout(timeout);
            ws.close();
            resolve();
          } else if (data.type === 'error') {
            clearTimeout(timeout);
            ws.close();
            reject(new Error(data.message || 'Hata olustu'));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('ws_error'));
      };

      ws.onclose = (e) => {
        clearTimeout(timeout);
        // 1000 = normal close, resolve zaten cagrilmis olabilir
        if (e.code !== 1000) {
          reject(new Error('ws_closed'));
        }
      };
    });
  };

  const handleShare = async () => {
    if (!token) {
      setErrorMsg('Gecersiz link');
      setStatus('error');
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg('Tarayiciniz konum desteklemiyor');
      setStatus('error');
      return;
    }

    setStatus('locating');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatus('submitting');
        try {
          await sendViaWebSocket(latitude, longitude);
          setStatus('success');
        } catch {
          setErrorMsg('Konum gonderilemedi. Lutfen tekrar deneyin.');
          setStatus('error');
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setErrorMsg('Konum izni reddedildi. Lutfen tarayici ayarlarindan konum iznini verin.');
            break;
          case err.POSITION_UNAVAILABLE:
            setErrorMsg('Konum bilgisi alinamadi.');
            break;
          case err.TIMEOUT:
            setErrorMsg('Konum istegi zaman asimina ugradi.');
            break;
          default:
            setErrorMsg('Konum alinirken hata olustu.');
        }
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 3 }}>
        <Typography sx={{ color: '#ef4444', fontSize: 16 }}>Gecersiz link</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 3,
    }}>
      <Box sx={{
        maxWidth: 400, width: '100%', textAlign: 'center',
        bgcolor: 'white', borderRadius: 3, p: 4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {/* Logo / Baslik */}
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
          Yol Sepeti Go
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#64748b', mb: 4 }}>
          Konumunuzu paylasin
        </Typography>

        {status === 'success' ? (
          <Box>
            <CheckCircle sx={{ fontSize: 56, color: '#10b981', mb: 2 }} />
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#065f46', mb: 1 }}>
              Konumunuz iletildi
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#64748b' }}>
              Tesekkurler! Bu sayfayi kapatabilirsiniz.
            </Typography>
          </Box>
        ) : (
          <Box>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <Typography sx={{ fontSize: 14, color: '#475569', mb: 3, lineHeight: 1.6 }}>
              Cekici hizmetinin size ulasabilmesi icin konumunuzu paylasmaniz gerekmektedir.
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleShare}
              disabled={status === 'locating' || status === 'submitting'}
              startIcon={
                status === 'locating' || status === 'submitting'
                  ? <CircularProgress size={20} sx={{ color: 'white' }} />
                  : <MyLocation />
              }
              sx={{
                py: 1.5, borderRadius: 2, fontSize: 16, fontWeight: 600,
                bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' },
                textTransform: 'none',
              }}
            >
              {status === 'locating'
                ? 'Konum aliniyor...'
                : status === 'submitting'
                  ? 'Gonderiliyor...'
                  : status === 'error'
                    ? 'Tekrar Dene'
                    : 'Konumumu Paylas'}
            </Button>

            <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 2 }}>
              Butona bastiginizda tarayiciniz konum izni isteyecektir
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
