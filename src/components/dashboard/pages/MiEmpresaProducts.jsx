// src/components/dashboard/pages/MiEmpresaProducts.jsx

import React from 'react';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const MiEmpresaProducts = () => {
  // Placeholder for product data
  const products = [
    { id: '1', name: 'Ladrillos Cerámicos 12x18x33', price: 'ARS 150/unidad', status: 'Activo' },
    { id: '2', name: 'Cemento Portland 50kg', price: 'ARS 5,000/bolsa', status: 'Activo' },
    { id: '3', name: 'Arena Lavada x m³', price: 'ARS 8,000/m³', status: 'Inactivo' },
    { id: '4', name: 'Grifería Monocomando Cocina', price: 'ARS 25,000', status: 'Activo' },
  ];

  const handleEditProduct = (productId) => {
    console.log('Edit product:', productId);
    // Navigate to a product edit form or open a modal
  };

  const handleDeleteProduct = (productId) => {
    console.log('Delete product:', productId);
    // Implement deletion logic, perhaps with a confirmation dialog
  };

  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ color: 'text.primary' }}>
          Gestión de Productos
        </Typography>
        <Button variant="contained" color="primary" startIcon={<Add />}>
          Añadir Nuevo Producto
        </Button>
      </Box>

      {products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            Aún no tienes productos registrados.
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            ¡Haz clic en "Añadir Nuevo Producto" para empezar!
          </Typography>
        </Box>
      ) : (
        <List>
          {products.map((product, index) => (
            <React.Fragment key={product.id}>
              <ListItem>
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
              {index < products.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MiEmpresaProducts;