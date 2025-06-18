// src/components/dashboard/pages/InfoFinancieraPersonal.jsx

import React from 'react';
import { Box, Typography, Paper, Grid, TextField, Button } from '@mui/material';

const InfoFinancieraPersonal = () => {
  // Placeholder for personal financial data
  const financialData = {
    bankName: 'Banco Ejemplo S.A.',
    accountNumber: '1234-5678-9012345678',
    taxId: '20-12345678-0', // CUIT/CUIL equivalent
    paymentPreference: 'Transferencia Bancaria'
  };

  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 4 }}>
        Información Financiera Personal
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Nombre del Banco"
            defaultValue={financialData.bankName}
            fullWidth
            disabled // Will be made editable in future
            sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'text.primary' } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Número de Cuenta"
            defaultValue={financialData.accountNumber}
            fullWidth
            disabled
            sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'text.primary' } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Identificación Fiscal (CUIT/CUIL)"
            defaultValue={financialData.taxId}
            fullWidth
            disabled
            sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'text.primary' } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Preferencia de Pago"
            defaultValue={financialData.paymentPreference}
            fullWidth
            disabled
            sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'text.primary' } }}
          />
        </Grid>
        {/* More fields can be added here as needed for financial info */}

        <Grid item xs={12} sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default InfoFinancieraPersonal;
