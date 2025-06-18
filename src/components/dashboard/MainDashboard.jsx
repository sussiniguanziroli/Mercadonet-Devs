// src/components/dashboard/MainDashboard.jsx

import React, { useState, useMemo, useCallback } from 'react';
import DashboardLayout from './DashboardLayout';
import Menu from '../header/Menu';
import Footer from '../footer/Footer';
import Header from '../header/Header';
import { Box, Paper, ThemeProvider, createTheme } from '@mui/material';
import { esES } from '@mui/material/locale';

const MainDashboard = () => {
  const [mode, setMode] = useState('dark');

  const toggleTheme = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const dashboardTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            // Light Mode Palette
            ? {
                primary: { main: '#1976d2' },
                background: { default: '#f4f6f8', paper: '#f5f5f5' },
                text: { primary: '#333333', secondary: '#555555' },
              }
            // Dark Mode Palette (Updated)
            : {
                primary: { main: '#66bb6a' },
                // Very dark blue for the area behind the dashboard
                background: { default: '#111827', paper: '#1f2937' },
                text: { primary: '#ffffff', secondary: '#aebac9' },
                divider: 'rgba(255, 255, 255, 0.12)',
              }),
        },
        typography: {
          fontFamily: 'Inter, sans-serif', // Ensure Inter font is used
        },
      }, esES),
    [mode]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#131923' // Keep original background color for the outer box
      }}
    >
      <Header />
      <Menu />

      <Box component="main" sx={{ py: 3, px: 3, flex: 1 }}>
        {/* The ThemeProvider still wraps the dashboard, so only it and its
            children will be affected by the theme toggle. */}
        <ThemeProvider theme={dashboardTheme}>
          <Paper elevation={8} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <DashboardLayout toggleTheme={toggleTheme} />
          </Paper>
        </ThemeProvider>
      </Box>

      <Box component="footer" sx={{ mt: 'auto' }}>
         <Footer />
      </Box>
    </Box>
  );
};

export default MainDashboard;