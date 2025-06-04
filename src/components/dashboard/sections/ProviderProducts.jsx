import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const ProviderProducts = () => {
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
                Mis Productos
            </Typography>
            <Box>
                <Typography variant="body1" color="text.secondary">
                    Esta sección te permitirá administrar los productos que ofreces.
                </Typography>
                <Typography variant="body2" sx={{mt: 2, color: 'grey.500'}}>
                    (Contenido del formulario/listado de productos irá aquí)
                </Typography>
                {/* Example: Listing of products, add new product button, etc. */}
            </Box>
        </Paper>
    );
};

export default ProviderProducts;
