import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";
import { BsPersonFill } from "react-icons/bs";
import ProveedorIcon from '../../assets/ProveedorIcon';



const Header = () => {

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 120) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    return (
        <header className={`header hiddenInMobile ${scrolled ? 'scrolled' : ''}`}>

            <img
                src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png"
                alt="Logo Mercadonet"
            />

            <div className='search-box'>
                <section className='search-section' >
                    <input
                        type="text"
                        placeholder='Buscar'
                    />
                    <button><FaSearch className='search-icon' /></button>
                </section>
            </div>
            <div className='nav-container'>
                <NavLink activeClassname='active' to='/' className='nav-link'>¿Qué es Mercadonet?</NavLink>
                <NavLink activeClassname='active' to='/proveedores' className='nav-link'>Proveedores</NavLink>
                <NavLink activeClassname='active' className='nav-link'>Productos</NavLink>
                <NavLink to='/registrarme' activeClassname='active' className='nav-link'><BsPersonFill size={16} /> Ingresar</NavLink>

                <button className="soy-proveedor">
                    <NavLink
                        to='/registrar-mi-empresa'
                        className='nav-extra'
                    >
                        <ProveedorIcon />
                        Soy Proveedor
                    </NavLink>
                </button>

            </div>
        </header>
    )
}

export default Header