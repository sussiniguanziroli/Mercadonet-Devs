import react from 'react'
import '../src/css/main.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './components/inicio/Landing';
import Menu from './components/header/Menu';
import Footer from './components/footer/Footer';
import Proveedores from './components/proveedores/Proveedores';
import AdminPanel from './components/admin/AdminPanel';
import { FiltersProvider } from './context/FiltersContext';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import RegisterNavigator from './components/registros/RegisterNavigator';
import RegistrosProveedorNavigator from './components/registroProveedor/RegistrosProveedorNavigator';
import LandingRegistroProveedor from './components/registroProveedor/LandingRegistroProveedor';

function App() {


    return (

        <FiltersProvider>
            <BrowserRouter>
                <div className="app-container">
                    <Menu />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/proveedores" element={<Proveedores />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/registrarme" element={<RegisterNavigator/>} />
                        <Route path='/registrar-mi-empresa/flujo' element={<RegistrosProveedorNavigator />}/>
                        <Route path="/registrar-mi-empresa" element={<LandingRegistroProveedor />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </FiltersProvider>

    )
}

export default App
