import { Typography } from '@mui/material';

export default function SectionLabel({ children }: { children: string }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5, mt: 1 }}>
      {children}
    </Typography>
  );
}
