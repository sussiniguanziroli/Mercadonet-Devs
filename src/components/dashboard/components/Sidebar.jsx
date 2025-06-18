// src/components/dashboard/components/Sidebar.jsx

import React from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Home, AccountCircle, Business, MenuOutlined, AttachMoney, Edit, LocalMall } from '@mui/icons-material';
import { Typography, Box } from '@mui/material'; // Import Box and Typography for subtitles

const Sidebar = ({ collapsed, handleToggleSidebar }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <ProSidebar
      collapsed={collapsed}
      backgroundColor={theme.palette.background.paper}
      rootStyles={{
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
          // Style for sub-menu items to visually differentiate them
          subMenuContent: {
            backgroundColor: theme.palette.background.default, // Slightly different background for sub-menus
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

        {/* Home as the lander */}
        <MenuItem icon={<Home />} onClick={() => navigate('/dashboard')}>
          Inicio
        </MenuItem>

        {/* Perfil Personal Section */}
        {/* Use Box and Typography for subtitles within the sidebar */}
        <Box sx={{ ml: 2, mt: 3, mb: 1, display: 'flex', alignItems: 'center', pl: collapsed ? 0 : 2 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 'bold' }}>
                {!collapsed && "PERFIL PERSONAL"}
            </Typography>
        </Box>
        <MenuItem icon={<AccountCircle />} onClick={() => navigate('/dashboard/perfil-personal')}>
          Mi Perfil
        </MenuItem>
        <MenuItem icon={<AttachMoney />} onClick={() => navigate('/dashboard/perfil-personal/financiero')}>
          Info Financiera Personal
        </MenuItem>

        {/* Mi Empresa Section */}
        <Box sx={{ ml: 2, mt: 3, mb: 1, display: 'flex', alignItems: 'center', pl: collapsed ? 0 : 2 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 'bold' }}>
                {!collapsed && "MI EMPRESA"}
            </Typography>
        </Box>
        <MenuItem icon={<Business />} onClick={() => navigate('/dashboard/mi-empresa')}>
          Visión General
        </MenuItem>
        <MenuItem icon={<Edit />} onClick={() => navigate('/dashboard/mi-empresa/personalizar-card')}>
          Personalizar Mi Card
        </MenuItem>
        <MenuItem icon={<LocalMall />} onClick={() => navigate('/dashboard/mi-empresa/productos')}>
          Productos
        </MenuItem>
      </Menu>
    </ProSidebar>
  );
};

export default Sidebar;
