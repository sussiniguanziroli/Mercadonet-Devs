// src/components/dashboard/pages/MiEmpresaOverview.jsx

import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BusinessCenter, Store, Assessment, Edit, LocalMall } from '@mui/icons-material';

const StatCard = ({ icon, title, value }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      bgcolor: 'background.paper',
      borderRadius: '8px'
    }}
  >
    {icon}
    <Box>
      <Typography variant="h6" sx={{ color: 'text.primary' }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{value}</Typography>
    </Box>
  </Paper>
);

const MiEmpresaOverview = () => {
  const navigate = useNavigate();
  // In a real app, this would check if the current user has a registered company
  const hasCompany = true; // Placeholder for now

  if (!hasCompany) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: '8px' }}>
        <Typography variant="h5" sx={{ color: 'text.primary', mb: 2 }}>Aún no has registrado una empresa.</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/registrar-mi-empresa')}>
          Registrar mi Empresa Ahora
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 4 }}>
        Visión General de Mi Empresa
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<BusinessCenter sx={{ fontSize: 40, color: 'primary.main' }} />}
            title="Visitas al Perfil"
            value="5,123"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<Store sx={{ fontSize: 40, color: 'secondary.main' }} />}
            title="Productos Publicados"
            value="45"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<Assessment sx={{ fontSize: 40, color: 'info.main' }} />}
            title="Ingresos Estimados (Último Mes)"
            value="$15,000 ARS"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
        <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Edit />}
              onClick={() => navigate('/dashboard/mi-empresa/personalizar-card')}
            >
              Personalizar Mi Card
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LocalMall />}
              onClick={() => navigate('/dashboard/mi-empresa/productos')}
            >
              Gestionar Productos
            </Button>
          </Grid>
          {/* Add more quick actions here */}
        </Grid>
      </Paper>
    </Box>
  );
};

export default MiEmpresaOverview;