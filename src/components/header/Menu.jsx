import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { IoClose } from "react-icons/io5";
import { HiSearch } from "react-icons/hi";
import ProveedorIcon from '../../assets/ProveedorIcon';

const Menu = () => {
    const [menu_class, setMenuClass] = useState('menu slide-left hidden');
    const [isMenuClicked, setIsMenuClicked] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    const updateMenu = () => {
        if (!isMenuClicked) {
            setMenuClass('menu slide-right visible');
        } else {
            setMenuClass('menu slide-left hidden');
        }
        setIsMenuClicked(!isMenuClicked);
    };

    const closeMenu = () => {
        setMenuClass('menu slide-left hidden');
        setIsMenuClicked(false);
    };

    useEffect(() => {
        if (isMenuClicked) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isMenuClicked]);

    useEffect(() => {
        const handleScroll = () => {
          // Detectar si el usuario está desplazándose hacia abajo
          if (window.scrollY > lastScrollY && window.scrollY > 100) {
            setIsSticky(true);
          } else {
            setIsSticky(false);
          }
          setLastScrollY(window.scrollY);
        };
    
        window.addEventListener('scroll', handleScroll);
    
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, [lastScrollY]);

    

    return (
        <div className="burger-god hiddenInDesktop">
            <nav className={`nav-burger ${isSticky ? 'sticky' : ''}`}>
                <div className="burger-menu" onClick={updateMenu}>
                    <div className="burger-bar"></div>
                    <div className="burger-bar"></div>
                    <div className="burger-bar"></div>
                </div>
                <div className='burger-mobile'>
                    <div className='burger-mobile-logo'>
                        <img src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png" alt="logo white" />
                    </div>
                </div>
            </nav>

            <div className={menu_class}>
                <div className='menu-controls'>
                    <IoClose onClick={closeMenu} className='ioclose' />
                    <img src="https://i.ibb.co/DY81r0L/Logo-Mercadonet-Desplegable.png" alt="logo blue" />
                </div>
                <div className="burger-nav-menu">
                    <button className="provider-login-btn">Iniciar sesión Proveedor</button>
                    <button className="buyer-login-btn">Iniciar sesión Comprador</button>
                    <ul className="burger-nav-ul">
                        <li>
                            <NavLink onClick={closeMenu} to="/" className="burger-nav-item" activeclassname="burger-active">
                                ¿Qué es Mercadonet?
                            </NavLink>
                        </li>
                        <li>
                            <NavLink onClick={closeMenu} to="/proveedores" className="burger-nav-item" activeclassname="burger-active">
                                Proveedores
                            </NavLink>
                        </li>
                        <li>
                            <NavLink onClick={closeMenu} to="/registrarme" className="burger-nav-item" activeclassname="burger-active">
                                Registros
                            </NavLink>
                        </li>
                        <li>
                            <NavLink onClick={closeMenu} to="/registrarme" className="burger-nav-item" activeclassname="burger-active">
                                Ingresar
                            </NavLink>
                        </li>
                        <li>
                            <NavLink onClick={closeMenu} to="/registrar-mi-empresa" className="burger-nav-item" activeclassname="burger-active">
                             Soy Proveedor
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>

            {isMenuClicked && <div className="overlay" onClick={closeMenu}></div>}
        </div>
    );
};

export default Menu;
