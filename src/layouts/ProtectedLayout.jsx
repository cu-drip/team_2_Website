import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import UnauthorizedProvider from '../components/UnauthorizedProvider';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Navbar from '../components/Navbar';

function useInlineParam() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.has('inline') && (params.get('inline') === null || params.get('inline') === '' || params.get('inline') === 'true');
}

export default function ProtectedLayout() {
  const { accessToken, loading } = useAuth();
  const inline = useInlineParam();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" size={60} thickness={4} />
      </Box>
    );
  }

  if (!accessToken) return <UnauthorizedProvider />;

  return (
    <>
      {!inline && <Navbar />}
      <Outlet />
    </>
  );
} 