import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const ProviderMessages = () => {
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
                Mensajes del Proveedor
            </Typography>
            <Box>
                <Typography variant="body1" color="text.secondary">
                    Revisa y responde las consultas de los compradores.
                </Typography>
                <Typography variant="body2" sx={{mt: 2, color: 'grey.500'}}>
                    (Interfaz de chat o listado de mensajes irá aquí)
                </Typography>
                {/* Example: List of conversations, chat interface. */}
            </Box>
        </Paper>
    );
};

export default ProviderMessages;
