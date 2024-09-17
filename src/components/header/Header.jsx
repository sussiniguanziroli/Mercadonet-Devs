import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";


const Header = () => {

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
          if (window.scrollY > 50) {
            setScrolled(true); // Se activa cuando el usuario ha hecho scroll hacia abajo
          } else {
            setScrolled(false); // Se desactiva cuando el usuario vuelve hacia arriba
          }
        };
    
        window.addEventListener('scroll', handleScroll);
    
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);


  return (
    <header className={`header hiddenInMobile ${scrolled ? 'scrolled' : ''}`}>
        <img src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png" alt="logo white" />
        <div className='searchbox'>
            <input type="text" placeholder='Buscar' />
            <div>
            <FaSearch />
            </div>
        </div>
        <NavLink activeClassname='active' className='nav-link'>¿Qué es Mercadonet?</NavLink>
        <NavLink activeClassname='active' className='nav-link'>Proveedores</NavLink>
        <NavLink activeClassname='active' className='nav-link'>Registros</NavLink>
        <NavLink activeClassname='active' className='nav-link'>Ingresar</NavLink>
        <NavLink activeClassname='active' className='nav-link'>Contacto</NavLink>
    </header>
  )
}

export default Header