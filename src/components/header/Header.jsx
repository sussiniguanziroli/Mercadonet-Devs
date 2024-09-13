import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";


const Header = () => {
  return (
    <header className='hiddenInMobile header'>
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