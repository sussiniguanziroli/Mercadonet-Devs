// src/components/dashboard/pages/MiPerfilPersonal.jsx

import React from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar } from '@mui/material';
import { useAuth } from '../../../context/AuthContext'; // Assuming AuthContext provides currentUser

const MiPerfilPersonal = () => {
  const { currentUser } = useAuth(); // Get current user from AuthContext

  // Placeholder data for demonstration
  const userData = {
    name: currentUser?.displayName || 'Juan',
    lastName: 'Pérez',
    email: currentUser?.email || 'juan.perez@example.com',
    phone: '+54 9 379 412-3456',
    avatarUrl: currentUser?.photoURL || "https://placehold.co/120x120/66bb6a/ffffff?text=JP"
  };

  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 4 }}>
        Mi Perfil Personal
      </Typography>

      <Grid container spacing={4} alignItems="center">
        {/* Avatar Section */}
        <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{ width: 120, height: 120, m: 'auto', mb: 2, border: `2px solid ${theme => theme.palette.primary.main}` }}
            src={userData.avatarUrl}
            alt="User Avatar"
          />
          <Button variant="outlined" size="small">Cambiar Foto</Button>
        </Grid>

        {/* Personal Information Fields */}
        <Grid item xs={12} sm={9}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                defaultValue={userData.name}
                fullWidth
                disabled // Will be made editable in future
                sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'text.primary' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido"
                defaultValue={userData.lastName}
                fullWidth
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'text.primary' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Correo Electrónico"
                defaultValue={userData.email}
                fullWidth
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'text.primary' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Número de Teléfono"
                defaultValue={userData.phone}
                fullWidth
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'text.primary' } }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Save Changes Button */}
        <Grid item xs={12} sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MiPerfilPersonal;
