import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useCustomNavigate } from '../components/useCustomNavigate';

export default function Home() {
  const customNavigate = useCustomNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: { xs: 1, sm: 2 },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 5 },
          textAlign: 'center',
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'divider',
          boxShadow: 6,
          minWidth: { xs: '90vw', sm: 340 },
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" sx={{ color: 'primary.main', mb: { xs: 2, sm: 3 }, fontWeight: 700, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
          Drip Competition
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ py: 1.5, fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}
          onClick={() => customNavigate('/profile')}
        >
          Профиль
        </Button>
      </Paper>
    </Box>
  );
} 