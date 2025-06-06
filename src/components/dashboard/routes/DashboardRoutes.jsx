import { Routes, Route } from 'react-router-dom';
import Perfil from '../pages/Perfil';
import MiEmpresa from '../pages/MiEmpresa';
import Home from '../pages/Home';

const DashboardRoutes = () => (
  <Routes>
    <Route index element={<Home />} />
    <Route path="perfil" element={<Perfil />} />
    <Route path="mi-empresa" element={<MiEmpresa />} />
  </Routes>
);

export default DashboardRoutes;
