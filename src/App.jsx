import react from 'react'
import '../src/css/main.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './components/inicio/Landing';
import Menu from './components/header/Menu';
import Footer from './components/footer/Footer';
import Proveedores from './components/proveedores/Proveedores';
import { FiltersProvider } from './context/FiltersContext';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import RegisterNavigator from './components/registros/RegisterNavigator';
import RegistrosProveedorNavigator from './components/registroProveedor/RegistrosProveedorNavigator';
import LandingRegistroProveedor from './components/registroProveedor/LandingRegistroProveedor';
import { AuthProvider } from './context/AuthContext';

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
                                <Route path='/registrar-mi-empresa/flujo' element={<RegistrosProveedorNavigator />} />
                                <Route path="/registrar-mi-empresa" element={<LandingRegistroProveedor />} />
                            </Routes>
                        </div>
                    </BrowserRouter>
                </AuthProvider>
            </FiltersProvider>
        </ThemeProvider>

    )
}

export default App
