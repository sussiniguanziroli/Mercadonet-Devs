// src/components/dashboard/pages/MiEmpresaCardCustomization.jsx

import React from 'react';
import { Box, Typography, Paper, Button, TextField, Grid } from '@mui/material';

const MiEmpresaCardCustomization = () => {
  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 4 }}>
        Personalizar Mi Card de Empresa
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', mt: 3, mb: 2 }}>
        Información General
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <TextField label="Nombre de la Empresa" defaultValue="Construcciones Pérez S.R.L." fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Descripción Corta" defaultValue="Líderes en construcción y remodelaciones en la región." fullWidth multiline rows={4} />
        </Grid>
        {/* Add more general info fields here */}
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', mt: 3, mb: 2 }}>
        Contacto y Redes
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <TextField label="Sitio Web" defaultValue="https://www.construccionesperez.com" fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="WhatsApp" defaultValue="+54 9 379 412-3456" fullWidth />
        </Grid>
        {/* Add more contact fields here */}
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', mt: 3, mb: 2 }}>
        Gestión de Medios (Logo, Carrusel, Galería)
      </Typography>
      <Box mb={4}>
        <Typography variant="body1" sx={{ color: 'text.primary' }}>Logo de la Empresa:</Typography>
        <Button variant="outlined" sx={{ mt: 1 }}>Subir o Cambiar Logo</Button>
        {/* Placeholder for actual image preview and upload functionality */}
        <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <Typography variant="body2" color="text.secondary">Vista previa del logo</Typography>
        </Box>
      </Box>
      <Box mb={4}>
        <Typography variant="body1" sx={{ color: 'text.primary' }}>Carrusel de Imágenes/Videos:</Typography>
        <Button variant="outlined" sx={{ mt: 1 }}>Añadir Medios al Carrusel</Button>
        {/* Placeholder for carousel management UI */}
        <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', display: 'flex', flexWrap: 'wrap', gap: 2, minHeight: 120 }}>
            <Typography variant="body2" color="text.secondary">Gestionar elementos del carrusel aquí</Typography>
        </Box>
      </Box>
      {/* Similar sections for 'Galería' if tipoB */}

      {/* Add more sections for Services/Products Offered, Brands, Extras based on provider type */}

      <Grid item xs={12} sx={{ mt: 4, textAlign: 'right' }}>
        <Button variant="contained" color="primary" sx={{ mr: 2 }}>
          Guardar Cambios
        </Button>
        <Button variant="outlined" color="secondary">
          Cancelar
        </Button>
      </Grid>
    </Paper>
  );
};

export default MiEmpresaCardCustomization;
