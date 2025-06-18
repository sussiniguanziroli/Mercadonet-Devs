// src/components/dashboard/pages/MiEmpresaProducts.jsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, CircularProgress, Alert } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { listenToProviderById } from '../../../services/firestoreService'; // Import the listener

const MiEmpresaProducts = () => {
  const { proveedorId } = useParams(); // Get the providerId from the URL
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();

  const [providerProducts, setProviderProducts] = useState([]); // State for products from Firestore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerName, setProviderName] = useState(''); // To display which company's products are being managed

  useEffect(() => {
    if (!proveedorId || loadingAuth || !currentUser) {
      if (!loadingAuth && !currentUser) {
        setError("Debes iniciar sesión para ver esta página.");
        setLoading(false);
      } else if (!proveedorId) {
        setError("ID de proveedor no especificado.");
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    // Use the listener to get real-time updates for the provider document
    // We fetch the whole provider doc to get the 'galeria' array (which represents products)
    const unsubscribe = listenToProviderById(
      proveedorId,
      (snapshotData) => {
        if (snapshotData) {
          const fetchedData = snapshotData.data;
          setProviderName(fetchedData.nombreProveedor || 'Tu Empresa');
          // Assuming 'galeria' field in provider document holds the product data
          // Each item in 'galeria' should have a unique ID for React keys if possible.
          // For now, using index or a generated ID.
          const mappedProducts = (fetchedData.galeria || []).map((item, index) => ({
            id: item.tempId || `prod-${index}`, // Use tempId if available, otherwise index
            name: item.titulo || `Producto ${index + 1}`,
            price: item.precio ? `ARS ${item.precio}` : 'Precio no definido',
            status: item.isActive === false ? 'Inactivo' : 'Activo', // Assuming a status field
            // ... other product fields you might add later (e.g., description, image URL)
            imageUrl: item.url || item.imagenURL || null, // Image URL for preview if needed in list
          }));
          setProviderProducts(mappedProducts);
          setLoading(false);
        } else {
          setError("Perfil de proveedor no encontrado o no tienes permiso para verlo.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore listener error for provider products:", err);
        setError("Error al cargar los productos: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Clean up listener
  }, [proveedorId, currentUser, loadingAuth]);


  const handleAddProduct = () => {
    console.log('Navigate to add product form for:', proveedorId);
    // TODO: Implement navigation to a specific product add form, perhaps a modal or a new route
    // navigate(`/dashboard/mi-empresa/${proveedorId}/productos/new`);
  };

  const handleEditProduct = (productId) => {
    console.log('Edit product:', productId, 'for provider:', proveedorId);
    // TODO: Implement navigation to a specific product edit form, passing productId
    // navigate(`/dashboard/mi-empresa/${proveedorId}/productos/${productId}/edit`);
  };

  const handleDeleteProduct = (productId) => {
    console.log('Delete product:', productId, 'for provider:', proveedorId);
    // TODO: Implement actual deletion logic in a service, with confirmation
    // e.g., deleteProductFromProvider(proveedorId, productId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando productos de {providerName || 'tu empresa'}...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button onClick={() => navigate('/dashboard/mi-empresa')}>Volver a Mis Empresas</Button>
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ color: 'text.primary' }}>
          Gestión de Productos para: {providerName}
        </Typography>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAddProduct}>
          Añadir Nuevo Producto
        </Button>
      </Box>

      {providerProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            Aún no tienes productos registrados para esta empresa.
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            ¡Haz clic en "Añadir Nuevo Producto" para empezar!
          </Typography>
        </Box>
      ) : (
        <List>
          {providerProducts.map((product, index) => (
            <React.Fragment key={product.id}>
              <ListItem>
                {product.imageUrl && (
                    <Box sx={{ width: 60, height: 60, borderRadius: '4px', overflow: 'hidden', mr: 2, flexShrink: 0 }}>
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                )}
                <ListItemText
                  primary={<Typography variant="h6" sx={{ color: 'text.primary' }}>{product.name}</Typography>}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">{product.price}</Typography>
                      <Typography variant="body2" color={product.status === 'Activo' ? 'success.main' : 'error.main'}>
                        Estado: {product.status}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditProduct(product.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteProduct(product.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < providerProducts.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MiEmpresaProducts;
