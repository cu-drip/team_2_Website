import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useCustomNavigate } from './useCustomNavigate';

export default function UnauthorizedProvider() {
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
        <LockOutlinedIcon sx={{ fontSize: { xs: 40, sm: 60 }, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" sx={{ color: 'primary.main', mb: { xs: 1, sm: 2 }, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Доступ запрещён
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
          Для просмотра этой страницы требуется авторизация.<br/>
          Пожалуйста, войдите в систему или обновите страницу.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ py: 1.5, fontWeight: 600, mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' } }}
          onClick={() => window.location.reload()}
        >
          Обновить страницу
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          fullWidth
          sx={{ py: 1.5, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}
          onClick={() => customNavigate('/')}
        >
          На главную
        </Button>
      </Paper>
    </Box>
  );
} 