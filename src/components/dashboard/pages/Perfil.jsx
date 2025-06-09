// src/components/dashboard/pages/Perfil.jsx

import React from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar } from '@mui/material';

const Perfil = () => {
  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
        Mi Perfil
      </Typography>
      
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
          <Avatar 
            sx={{ width: 120, height: 120, m: 'auto', mb: 2 }}
            // Placeholder avatar
            src="https://placehold.co/120x120/66bb6a/ffffff?text=JP"
          />
          <Button variant="outlined" size="small">Cambiar Foto</Button>
        </Grid>

        <Grid item xs={12} sm={9}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Nombre"
                defaultValue="Juan"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Apellido"
                defaultValue="Pérez"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Correo Electrónico"
                defaultValue="juan.perez@example.com"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Número de Teléfono"
                defaultValue="+54 9 379 412-3456"
                fullWidth
                disabled
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Perfil;