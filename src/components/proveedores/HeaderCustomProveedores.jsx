import React from 'react'
import { NavLink } from 'react-router-dom'

const HeaderCustomProveedores = () => {
    return (
        <header className='proveedores-header hiddenInMobile'>
            <img src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png" alt="logo white" />
            <nav>
                <NavLink activeClassname='active' to='/' className='nav-link'>¿Qué es Mercadonet?</NavLink>
                <NavLink activeClassname='active' to='/proveedores' className='nav-link'>Proveedores</NavLink>
                <NavLink activeClassname='active' className='nav-link'>Registros</NavLink>
                <NavLink activeClassname='active' className='nav-link'>Ingresar</NavLink>
                <NavLink activeClassname='active' className='nav-link'>Contacto</NavLink>
            </nav>
        </header>
    )
}

export default HeaderCustomProveedores