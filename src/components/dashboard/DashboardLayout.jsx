// src/components/dashboard/DashboardLayout.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { Box } from '@mui/material';

// Accept toggleTheme function as a prop
const DashboardLayout = ({ toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    // This Box is now the main container for the dashboard's internal UI
    <Box sx={{ display: 'flex', minHeight: '70vh' }}>
      <Sidebar
        collapsed={collapsed}
        handleToggleSidebar={handleToggleSidebar}
      />

      {/* This new Box will contain the TopBar and the page content (Outlet) */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Pass the toggleTheme function to the TopBar */}
        <TopBar toggleTheme={toggleTheme} />

        {/* This Box holds the actual page content with padding */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            overflowY: 'auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
