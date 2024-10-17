import react from 'react'
import '../src/css/main.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './components/inicio/Landing';
import Menu from './components/header/Menu';
import Footer from './components/footer/Footer';
import Proveedores from './components/proveedores/Proveedores';
import AdminPanel from './components/admin/AdminPanel';


function App() {
  

  return (
      <>
      <BrowserRouter>
        <Menu />
        
        <Routes>
            <Route path="/" element={<Landing/>}/>
            <Route path='/proveedores' element={<Proveedores />}/>
            <Route path='/admin' element={<AdminPanel/>} />
        </Routes>
        <Footer />
      </BrowserRouter>
      </>
      )
}

export default App
