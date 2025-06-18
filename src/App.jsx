import react from "react";
import "../src/css/main.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./components/inicio/Landing";
import Menu from "./components/header/Menu";
import Footer from "./components/footer/Footer";
import Proveedores from "./components/proveedores/Proveedores";
import { FiltersProvider } from "./context/FiltersContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import RegisterNavigator from "./components/registros/RegisterNavigator";
import RegistrosProveedorNavigator from "./components/registroProveedor/RegistrosProveedorNavigator";
import LandingRegistroProveedor from "./components/registroProveedor/LandingRegistroProveedor";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ProductosLanding from "./components/productos/ProductosLanding";
import ProveedorPage from "./components/proveedorPage/ProveedorPage";
import MainDashboard from "./components/dashboard/MainDashboard";
import Home from "./components/dashboard/pages/Home";
import Perfil from "./components/dashboard/pages/Perfil";
import MiEmpresa from "./components/dashboard/pages/MiEmpresa";
import MiPerfilPersonal from "./components/dashboard/pages/MiPerfilPersonal";
import InfoFinancieraPersonal from "./components/dashboard/pages/InfoFinancieraPersonal";
import MiEmpresaOverview from "./components/dashboard/pages/MiEmpresaOverview";
import MiEmpresaCardCustomization from "./components/dashboard/pages/MiEmpresaCardCustomization";
import MiEmpresaProducts from "./components/dashboard/pages/MiEmpresaProducts";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FiltersProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="app-container">
              <Menu />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/registrarme" element={<RegisterNavigator />} />
                <Route
                  path="/registrar-mi-empresa"
                  element={<LandingRegistroProveedor />}
                />

                <Route
                  path="/registrar-mi-empresa/flujo"
                  element={
                    <ProtectedRoute>
                      <RegistrosProveedorNavigator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/proveedor/:proveedorId"
                  element={<ProveedorPage />}
                />

                {/* UPDATED DASHBOARD ROUTES */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainDashboard />
                    </ProtectedRoute>
                  }
                >
                  {/* Dashboard Landing Page */}
                  <Route index element={<Home />} />

                  {/* Perfil Personal Section */}
                  <Route
                    path="perfil-personal"
                    element={<MiPerfilPersonal />}
                  />
                  <Route
                    path="perfil-personal/financiero"
                    element={<InfoFinancieraPersonal />}
                  />

                  {/* Mi Empresa Section */}
                  <Route path="mi-empresa" element={<MiEmpresaOverview />} />
                  <Route
                    path="mi-empresa/personalizar-card"
                    element={<MiEmpresaCardCustomization />}
                  />
                  <Route
                    path="mi-empresa/productos"
                    element={<MiEmpresaProducts />}
                  />
                </Route>

                <Route path="/productos" element={<ProductosLanding />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </FiltersProvider>
    </ThemeProvider>
  );
}

export default App;
