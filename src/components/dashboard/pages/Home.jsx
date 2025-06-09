// src/components/dashboard/pages/Home.jsx

import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { Person, BusinessCenter, BarChart } from '@mui/icons-material';

const StatCard = ({ icon, title, value }) => (
  <Paper 
    elevation={3} 
    sx={{ 
      p: 3, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      // Use theme colors for the card background
      bgcolor: 'background.paper' 
    }}
  >
    {icon}
    <Box>
      <Typography variant="h6" sx={{ color: 'text.primary' }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{value}</Typography>
    </Box>
  </Paper>
);

const Home = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
        ¡Bienvenido de nuevo!
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        Aquí tienes un resumen de tu actividad reciente.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard 
            icon={<Person sx={{ fontSize: 40, color: 'primary.main' }} />}
            title="Perfil Completado"
            value="80%"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            icon={<BusinessCenter sx={{ fontSize: 40, color: 'secondary.main' }} />}
            title="Visitas a tu Empresa"
            value="1,234"
          />
        </Grid>
        <Grid item xs={12} md={4}>
           <StatCard 
            icon={<BarChart sx={{ fontSize: 40, color: 'text.secondary' }} />}
            title="Nuevos Contactos"
            value="56"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
