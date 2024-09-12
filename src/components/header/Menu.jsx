import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { IoClose } from "react-icons/io5";

const Menu = () => {
    const [menu_class, setMenuClass] = useState('menu hidden');
    const [isMenuClicked, setIsMenuClicked] = useState(false);

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

    return (
        <div className="burger-god hiddenInDesktop">
            <nav className="nav-burger">
                <div className="burger-menu" onClick={updateMenu}>
                    <div className="burger-bar"></div>
                    <div className="burger-bar"></div>
                    <div className="burger-bar"></div>
                </div>
                <div className='burger-mobile'>
                    <div className='burger-mobile-logo'>
                        <img src="" alt="" />
                    </div>
                    <h2><span className="mercado">Mercado</span><span className="dot-net">.NET</span></h2>
                </div>
            </nav>

            <div className={menu_class}>
                <div className='menu-controls'>
                    <IoClose onClick={closeMenu} className='ioclose' />
                    <h2><span className="mercado">Mercado</span><span className="dot-net">.NET</span></h2>
                </div>
                <div className="burger-nav-menu">
                    <button className="provider-login-btn">Iniciar sesión Proveedor</button>
                    <button className="buyer-login-btn">Iniciar sesión Comprador</button>
                    <ul className="burger-nav-ul">
                        <li>
                            <NavLink onClick={closeMenu} to="" className="burger-nav-item" activeclassname="burger-active">
                                ¿Qué es Mercadonet?
                            </NavLink>
                        </li>
                        <li>
                            <NavLink onClick={closeMenu} to="" className="burger-nav-item" activeclassname="burger-active">
                                Proveedores
                            </NavLink>
                        </li>
                        <li>
                            <NavLink onClick={closeMenu} to="" className="burger-nav-item" activeclassname="burger-active">
                                Registros
                            </NavLink>
                        </li>
                        <li>
                            <NavLink onClick={closeMenu} to="" className="burger-nav-item" activeclassname="burger-active">
                                Ingresar
                            </NavLink>
                        </li>
                        <li>
                            <NavLink onClick={closeMenu} to="" className="burger-nav-item" activeclassname="burger-active">
                                Contacto
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
