import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const UserBilling = () => {
    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: { xs: 2, sm: 3, md: 4 }, 
                backgroundColor: 'rgba(40,40,40,0.7)', 
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'text.primary'
            }}
        >
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                Facturación
            </Typography>
            <Box>
                <Typography variant="body1" color="text.secondary">
                    Consulta tu historial de pagos y gestiona tus métodos de pago.
                </Typography>
                <Typography variant="body2" sx={{mt: 2, color: 'grey.500'}}>
                    (Información de facturación, historial de pagos, etc., irá aquí)
                </Typography>
                {/* Example: Payment history, manage payment methods. */}
            </Box>
        </Paper>
    );
};

export default UserBilling;