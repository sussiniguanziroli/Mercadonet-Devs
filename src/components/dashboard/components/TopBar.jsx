// src/components/dashboard/components/TopBar.jsx

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const getTitleFromPathname = (pathname) => {
  switch (pathname) {
    case '/dashboard':
      return 'Inicio';
    case '/dashboard/perfil':
      return 'Mi Perfil';
    case '/dashboard/mi-empresa':
      return 'Mi Empresa';
    default:
      if (pathname.startsWith('/dashboard/')) {
        const routeName = pathname.split('/')[2];
        return routeName.charAt(0).toUpperCase() + routeName.slice(1);
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
          {/* THIS IS THE FIX: The icon's color is now explicitly set from the theme */}
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