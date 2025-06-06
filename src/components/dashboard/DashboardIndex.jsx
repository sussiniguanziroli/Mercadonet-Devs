import DashboardLayout from './DashboardLayout';
import DashboardRoutes from './routes/DashboardRoutes';
import { Outlet } from 'react-router-dom';

const DashboardWrapper = () => (
  <DashboardLayout>
    <DashboardRoutes />
  </DashboardLayout>
);

export default DashboardWrapper;