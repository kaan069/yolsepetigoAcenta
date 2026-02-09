import { useState, useEffect } from 'react';
import {
  Typography, Card, CardContent, Box, CircularProgress, Alert,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  IconButton, Tooltip,
} from '@mui/material';
import { ArrowBack, ContentCopy, Person, DirectionsCar, AttachMoney, Schedule } from '@mui/icons-material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getInsuranceRequest, cancelInsuranceRequest } from '../../api';
import { ServiceTypeLabels, RequestStatusLabels, RequestStatusColors } from '../../types';
import type { InsuranceRequestDetail } from '../../types';

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<InsuranceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const data = await getInsuranceRequest(Number(id));
        setRequest(data);
      } catch {
        setError('Talep detaylari yuklenirken hata olustu');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await cancelInsuranceRequest(Number(id));
      const data = await getInsuranceRequest(Number(id));
      setRequest(data);
      setCancelDialogOpen(false);
    } catch {
      setError('Talep iptal edilirken hata olustu');
    } finally {
      setCancelling(false);
    }
  };

  const copyTrackingUrl = () => {
    if (request?.tracking_url) {
      navigator.clipboard.writeText(request.tracking_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canCancel = request?.status === 'pending' || request?.status === 'awaiting_approval';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Box>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error || 'Talep bulunamadi'}</Alert>
        <Button component={Link} to="/panel/requests" sx={{ mt: 2 }} startIcon={<ArrowBack />}>
          Geri Don
        </Button>
      </Box>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('tr-TR');
  };

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <Box sx={{ display: 'flex', py: 1.2, borderBottom: '1px solid #f1f5f9' }}>
      <Typography sx={{ width: 160, flexShrink: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#0f172a' }}>{value || '-'}</Typography>
    </Box>
  );

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{title}</Typography>
    </Box>
  );

  return (
    <Box>
      <Button component={Link} to="/panel/requests" startIcon={<ArrowBack />} sx={{ mb: 2, color: '#64748b', fontWeight: 500 }}>
        Taleplere Don
      </Button>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
          Talep #{request.request_id}
        </Typography>
        <Chip
          label={RequestStatusLabels[request.status] || request.status}
          color={RequestStatusColors[request.status] || 'default'}
          sx={{ fontSize: 12, fontWeight: 600 }}
        />
        <Chip label={ServiceTypeLabels[request.service_type] || request.service_type} variant="outlined" sx={{ fontSize: 12, borderColor: '#e2e8f0', color: '#64748b' }} />
        {canCancel && (
          <Button variant="outlined" color="error" size="small" onClick={() => setCancelDialogOpen(true)}
            sx={{ ml: 'auto', borderRadius: 2, fontWeight: 600 }}
          >
            Iptal Et
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader icon={<Person sx={{ fontSize: 18 }} />} title="Sigortali Bilgileri" />
            <InfoRow label="Ad Soyad" value={request.insured_name} />
            <InfoRow label="Telefon" value={request.insured_phone} />
            <InfoRow label="Plaka" value={request.insured_plate} />
            <InfoRow label="Police No" value={request.policy_number} />
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader icon={<DirectionsCar sx={{ fontSize: 18 }} />} title="Sofor Bilgileri" />
            {request.driver?.name ? (
              <>
                <InfoRow label="Ad Soyad" value={request.driver.name} />
                <InfoRow label="Telefon" value={request.driver.phone} />
              </>
            ) : (
              <Typography sx={{ py: 3, textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>Henuz sofor atanmadi</Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader icon={<AttachMoney sx={{ fontSize: 18 }} />} title="Fiyat Bilgisi" />
            {request.pricing?.estimated_price ? (
              <>
                <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#0ea5e9', mb: 0.5 }}>
                  {request.pricing.estimated_price} {request.pricing.currency}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Tahmini fiyat</Typography>
              </>
            ) : (
              <Typography sx={{ py: 3, textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>Henuz fiyat belirlenmedi</Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader icon={<Schedule sx={{ fontSize: 18 }} />} title="Zaman Cizelgesi" />
            <InfoRow label="Olusturulma" value={formatDate(request.timeline.created_at)} />
            <InfoRow label="Kabul Edilme" value={formatDate(request.timeline.accepted_at)} />
            <InfoRow label="Tamamlanma" value={formatDate(request.timeline.completed_at)} />
          </CardContent>
        </Card>
      </Box>

      {request.tracking_url && (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography sx={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Takip Linki:</Typography>
            <Box sx={{ flex: 1, bgcolor: '#f8fafc', borderRadius: 1.5, px: 2, py: 1 }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#334155', wordBreak: 'break-all' }}>
                {request.tracking_url}
              </Typography>
            </Box>
            <Tooltip title={copied ? 'Kopyalandi!' : 'Kopyala'}>
              <IconButton size="small" onClick={copyTrackingUrl} sx={{ color: '#64748b' }}>
                <ContentCopy sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </CardContent>
        </Card>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Talebi Iptal Et</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 14 }}>
            #{request.request_id} numarali talebi iptal etmek istediginize emin misiniz? Bu islem geri alinamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling} sx={{ color: '#64748b' }}>Vazgec</Button>
          <Button onClick={handleCancel} color="error" variant="contained" disabled={cancelling} sx={{ borderRadius: 2 }}>
            {cancelling ? 'Iptal ediliyor...' : 'Iptal Et'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
