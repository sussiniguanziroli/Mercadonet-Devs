// src/components/dashboard/components/Sidebar.jsx

import React from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Home, AccountCircle, Business, MenuOutlined } from '@mui/icons-material';

const Sidebar = ({ collapsed, handleToggleSidebar }) => { 
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <ProSidebar 
      collapsed={collapsed}
      backgroundColor={theme.palette.background.paper}
      rootStyles={{
        // THIS IS THE FIX: Added a right border using the theme's divider color
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Menu
        menuItemStyles={{
          button: {
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: theme.palette.text.primary,
            },
          },
        }}
      >
        <MenuItem
          icon={<MenuOutlined />}
          onClick={handleToggleSidebar}
          style={{ textAlign: 'center', color: theme.palette.text.primary }}
        >
          {!collapsed && <h2>Admin</h2>}
        </MenuItem>

        <hr style={{ borderColor: theme.palette.divider, margin: '1rem 0' }}/>

        <MenuItem icon={<Home />} onClick={() => navigate('/dashboard')}>
          Inicio
        </MenuItem>
        <MenuItem icon={<AccountCircle />} onClick={() => navigate('/dashboard/perfil')}>
          Perfil
        </MenuItem>
        <MenuItem icon={<Business />} onClick={() => navigate('/dashboard/mi-empresa')}>
          Mi Empresa
        </MenuItem>
      </Menu>
    </ProSidebar>
  );
};

export default Sidebar;