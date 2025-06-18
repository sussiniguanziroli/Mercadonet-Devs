// src/components/dashboard/pages/MiEmpresaOverview.jsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BusinessCenter, Store, Assessment, AddCircleOutline, Edit, LocalMall, Visibility } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { fetchProvidersByUserId } from '../../../services/firestoreService'; // Import the new service function

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
  const { currentUser, loadingAuth, userProviders, isProveedor } = useAuth();
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [error, setError] = useState(null);
  const [providersList, setProvidersList] = useState([]); // State to hold the fetched providers

  useEffect(() => {
    const loadProviders = async () => {
      if (loadingAuth || !currentUser) {
        setLoadingProviders(true); // Still loading auth or no user logged in
        return;
      }
      
      setLoadingProviders(true);
      setError(null);
      try {
        // userProviders from AuthContext should already be loaded.
        // We can just use it directly after AuthContext has populated it.
        // If AuthContext needs more time, this effect will re-run.
        if (isProveedor && userProviders.length > 0) {
            setProvidersList(userProviders);
        } else {
            setProvidersList([]); // No providers found
        }
      } catch (err) {
        console.error("Error loading providers in MiEmpresaOverview:", err);
        setError("Error al cargar la lista de tus empresas.");
        setProvidersList([]);
      } finally {
        setLoadingProviders(false);
      }
    };

    loadProviders();
  }, [loadingAuth, currentUser, userProviders, isProveedor]); // Depend on userProviders from context

  if (loadingAuth || loadingProviders) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando tus empresas...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // If no providers found and auth is done, show registration prompt
  if (!isProveedor || providersList.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: '8px' }}>
        <Typography variant="h5" sx={{ color: 'text.primary', mb: 2 }}>Aún no has registrado ninguna empresa.</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          ¡Empieza a gestionar tus negocios ahora mismo!
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddCircleOutline />} onClick={() => navigate('/registrar-mi-empresa/flujo')}>
          Registrar Nueva Empresa / Card
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 4 }}>
        Mis Empresas / Cards Registradas
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Placeholder for overall business statistics */}
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<BusinessCenter sx={{ fontSize: 40, color: 'primary.main' }} />}
            title="Total de Empresas"
            value={providersList.length}
          />
        </Grid>
        {/* Add more aggregate stats here */}
      </Grid>

      <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ color: 'text.primary' }}>
                Listado de Mis Negocios
            </Typography>
            <Button variant="contained" color="primary" startIcon={<AddCircleOutline />} onClick={() => navigate('/registrar-mi-empresa/flujo')}>
                Añadir Nueva Empresa
            </Button>
        </Box>

        <Grid container spacing={3}>
          {providersList.map((provider) => (
            <Grid item xs={12} sm={6} md={4} key={provider.id}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '8px' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  {provider.data.logo?.url && (
                    <img src={provider.data.logo.url} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10, objectFit: 'cover' }} />
                  )}
                  <Typography variant="h6" sx={{ color: 'text.primary', flexGrow: 1 }}>
                    {provider.data.nombreProveedor || 'Empresa Sin Nombre'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tipo de Card: {provider.data.cardType === 'tipoA' ? 'Historia' : 'Productos'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Ubicación: {provider.data.ciudad || 'N/A'}, {provider.data.provincia || 'N/A'}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Edit />}
                    onClick={() => navigate(`/dashboard/mi-empresa/${provider.id}/personalizar-card`)}
                  >
                    Personalizar Card
                  </Button>
                  {provider.data.cardType === 'tipoB' && ( // Only show "Gestionar Productos" for TipoB
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<LocalMall />}
                      onClick={() => navigate(`/dashboard/mi-empresa/${provider.id}/productos`)}
                    >
                      Gestionar Productos
                    </Button>
                  )}
                   <Button
                    variant="text"
                    color="primary"
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/proveedor/${provider.id}`)} // Link to public page
                  >
                    Ver Página Pública
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default MiEmpresaOverview;
