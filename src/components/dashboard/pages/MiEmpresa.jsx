// src/components/dashboard/pages/MiEmpresa.jsx

import React from 'react';
import { Box, Typography, Paper, Grid, TextField, Button } from '@mui/material';

const MiEmpresa = () => {
  // A check to ensure this component only renders for users with a company.
  // In a real app, this logic would come from your auth context.
  const hasCompany = true; 

  if (!hasCompany) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography variant="h5" sx={{ color: 'text.primary' }}>Aún no has registrado una empresa.</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Registrar mi Empresa Ahora
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
        Información de la Empresa
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField 
            label="Nombre de la Empresa"
            defaultValue="Construcciones Pérez S.R.L."
            fullWidth
            disabled
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label="CUIT"
            defaultValue="30-12345678-9"
            fullWidth
            disabled
          />
        </Grid>
        <Grid item xs={12} md={6}>
           <TextField 
            label="Industria"
            defaultValue="Construcción"
            fullWidth
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            label="Descripción Corta"
            defaultValue="Líderes en construcción y remodelaciones en la región."
            fullWidth
            multiline
            rows={4}
            disabled
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 2, textAlign: 'right' }}>
          <Button variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MiEmpresa;
