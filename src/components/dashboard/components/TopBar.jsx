// src/components/dashboard/components/TopBar.jsx

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const getTitleFromPathname = (pathname) => {
  switch (pathname) {
    case '/dashboard':
      return 'Inicio';
    case '/dashboard/perfil-personal':
      return 'Mi Perfil';
    case '/dashboard/perfil-personal/financiero':
      return 'Información Financiera Personal';
    case '/dashboard/mi-empresa':
      return 'Visión General de Mi Empresa';
    case '/dashboard/mi-empresa/personalizar-card':
      return 'Personalizar Mi Card';
    case '/dashboard/mi-empresa/productos':
      return 'Gestión de Productos';
    default:
      // Fallback for potentially new or dynamic routes
      if (pathname.startsWith('/dashboard/')) {
        const parts = pathname.split('/');
        // Try to get the last part and format it
        if (parts.length > 2) {
          const lastPart = parts[parts.length - 1];
          return lastPart.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
      }
      return 'Dashboard';
  }
};

const TopBar = ({ toggleTheme }) => {
  const theme = useTheme();
  const location = useLocation();
  const pageTitle = getTitleFromPathname(location.pathname);

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar>
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, color: theme.palette.text.primary }}
        >
          {pageTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {theme.palette.mode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
          </Typography>
          <IconButton
            sx={{ ml: 1, color: 'text.primary' }}
            onClick={toggleTheme}
          >
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;