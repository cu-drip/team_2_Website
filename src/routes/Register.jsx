import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { register } from '../constants';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      
      if (response.data) {
        // Registration successful, but we need to login to get the token
        // For now, we'll redirect to login page
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Registration successful! Please sign in with your new account.' 
          }
        });
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'divider',
          boxShadow: 8,
          minWidth: { xs: '90vw', sm: 450 },
          maxWidth: 550,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              mb: 1,
            }}
          >
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join Drip Competition and start your tournament journey
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              fullWidth
              size="large"
              autoComplete="given-name"
            />
            <TextField
              label="Last Name"
              value={formData.surname}
              onChange={handleChange('surname')}
              required
              fullWidth
              size="large"
              autoComplete="family-name"
            />
          </Box>

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            required
            fullWidth
            size="large"
            autoComplete="email"
          />

          <TextField
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange('phoneNumber')}
            required
            fullWidth
            size="large"
            autoComplete="tel"
          />

          <TextField
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            required
            fullWidth
            size="large"
            autoComplete="new-password"
            helperText="Password must be at least 6 characters long"
          />

          <TextField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
            fullWidth
            size="large"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !formData.name || !formData.surname || !formData.email || !formData.phoneNumber || !formData.password || !formData.confirmPassword}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              mt: 2,
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Creating Account...
              </Box>
            ) : (
              'Create Account'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                href="/login"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 