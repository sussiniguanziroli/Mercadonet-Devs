import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Grid, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BusinessCenter, AddCircleOutline, Edit, LocalMall, Visibility, Delete } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { deleteProvider } from '../../../services/providerService';

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
  const [providersList, setProvidersList] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    setLoadingProviders(true);
    if (!loadingAuth && currentUser) {
        setProvidersList(userProviders);
        setLoadingProviders(false);
    } else if (!loadingAuth && !currentUser) {
        setLoadingProviders(false);
    }
  }, [loadingAuth, currentUser, userProviders]);

  const handleDeleteClick = (providerId) => {
    setDeleting(providerId);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
        await deleteProvider(deleting);
        setProvidersList(prev => prev.filter(p => p.id !== deleting));
    } catch (err) {
        setError("Falló la eliminación del perfil de proveedor. Por favor, intenta de nuevo.");
    } finally {
        setOpenConfirm(false);
        setDeleting(null);
    }
  };

  if (loadingAuth || loadingProviders) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando tus empresas...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

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
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<BusinessCenter sx={{ fontSize: 40, color: 'primary.main' }} />}
            title="Total de Empresas"
            value={providersList.length}
          />
        </Grid>
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
                  <Button variant="outlined" fullWidth startIcon={<Edit />} onClick={() => navigate(`/dashboard/mi-empresa/${provider.id}/personalizar-card`)}>
                    Personalizar Card
                  </Button>
                  {provider.data.cardType === 'tipoB' && (
                    <Button variant="outlined" fullWidth startIcon={<LocalMall />} onClick={() => navigate(`/dashboard/mi-empresa/${provider.id}/productos`)}>
                      Gestionar Productos
                    </Button>
                  )}
                   <Button variant="text" color="primary" fullWidth startIcon={<Visibility />} onClick={() => navigate(`/proveedor/${provider.id}`)}>
                    Ver Página Pública
                  </Button>
                  <Button variant="text" color="error" fullWidth startIcon={<Delete />} onClick={() => handleDeleteClick(provider.id)}>
                    Eliminar
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
            <DialogContentText>
                ¿Estás seguro de que quieres eliminar este proveedor? Esta acción es permanente y eliminará todos los datos y archivos multimedia asociados.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} color="error" disabled={deleting === null}>
                {deleting ? 'Eliminar' : <CircularProgress size={20} />}
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MiEmpresaOverview;
