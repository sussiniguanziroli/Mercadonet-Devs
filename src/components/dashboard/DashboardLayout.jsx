import React from 'react';
import { Outlet } from 'react-router-dom';
import { ProSidebarProvider } from 'react-pro-sidebar';
import Sidebar from './components/Sidebar';

const DashboardLayout = () => {
  return (
    <ProSidebarProvider>
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </ProSidebarProvider>
  );
};

export default DashboardLayout;
