import React from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { useNavigate } from 'react-router-dom';
import { Home, AccountCircle, Business } from '@mui/icons-material';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <ProSidebar>
      <Menu iconShape="circle">
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
