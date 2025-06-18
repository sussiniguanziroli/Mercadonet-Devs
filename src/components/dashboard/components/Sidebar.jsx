// src/components/dashboard/components/Sidebar.jsx

import React, { useState, useEffect } from 'react'; // Import useEffect
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar'; // Removed SubMenu as we're using direct items/typography
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Home, AccountCircle, Business, MenuOutlined, AttachMoney, Edit, LocalMall } from '@mui/icons-material';
import { Typography, Box } from '@mui/material';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth

const Sidebar = ({ collapsed, handleToggleSidebar }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { userProviders, loadingAuth } = useAuth(); // Get userProviders from AuthContext

  // State to hold the default/first provider ID for direct links
  const [defaultProviderId, setDefaultProviderId] = useState(null);

  useEffect(() => {
    if (!loadingAuth && userProviders.length > 0) {
      // If the user has at least one provider, set the first one as default
      // In a more complex app, you might persist a 'last selected' provider ID
      setDefaultProviderId(userProviders[0].id);
    } else if (!loadingAuth && userProviders.length === 0) {
      // If no providers, clear the default
      setDefaultProviderId(null);
    }
  }, [userProviders, loadingAuth]); // Re-run when userProviders or loadingAuth changes

  const handleNavigateToCompanySection = (pathSuffix) => {
    if (defaultProviderId) {
      // If a default provider is available, navigate directly to that provider's specific page
      navigate(`/dashboard/mi-empresa/${defaultProviderId}/${pathSuffix}`);
    } else {
      // If no default provider (or multiple), navigate to the overview to make a selection
      // Or if the pathSuffix is 'overview' itself, just go there
      if (pathSuffix === '') { // This is the "Visión General" link
        navigate('/dashboard/mi-empresa');
      } else {
        // If no provider selected and user clicks a specific customization/product link,
        // direct them to the overview page and maybe show a message.
        // For now, we'll just navigate to the overview.
        navigate('/dashboard/mi-empresa');
        // Optionally, you could add a notification here:
        // notify("Selecciona una empresa para personalizar su card/productos.");
      }
    }
  };


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
          subMenuContent: {
            backgroundColor: theme.palette.background.default,
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
        <MenuItem
            icon={<Edit />}
            onClick={() => handleNavigateToCompanySection('personalizar-card')}
            disabled={!defaultProviderId} // Disable if no default provider is set
        >
          Personalizar Mi Card
        </MenuItem>
        <MenuItem
            icon={<LocalMall />}
            onClick={() => handleNavigateToCompanySection('productos')}
            disabled={!defaultProviderId} // Disable if no default provider is set
        >
          Productos
        </MenuItem>
      </Menu>
    </ProSidebar>
  );
};

export default Sidebar;
