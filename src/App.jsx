import react from 'react'
import '../src/css/main.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';
import Landing from './components/inicio/Landing';
import Menu from './components/header/Menu';
import Footer from './components/footer/Footer';

function App() {
  

  return (
      <>
      <BrowserRouter>
        <Menu />
        <Header />
        <Routes>
            <Route path="/" element={<Landing/>}/>
        </Routes>
        <Footer />
      </BrowserRouter>
      </>
      )
}

export default App
