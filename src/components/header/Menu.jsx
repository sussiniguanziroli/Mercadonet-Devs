// src/components/header/Menu.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoClose } from "react-icons/io5";
// import { HiSearch } from "react-icons/hi"; // Not used in current JSX for search
// import ProveedorIcon from '../../assets/ProveedorIcon'; // Not used in current JSX for "Soy Proveedor" in slide-out
import { useAuth } from '../../context/AuthContext'; // Import useAuth

const Menu = () => {
    const [menu_class, setMenuClass] = useState('menu slide-left hidden');
    const [isMenuClicked, setIsMenuClicked] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    const { currentUser, logout, loadingAuth } = useAuth(); // Use the auth context
    const navigate = useNavigate();

    const updateMenu = () => {
        setIsMenuClicked(prev => !prev);
    };

    const closeMenu = () => {
        setIsMenuClicked(false);
    };

    useEffect(() => {
        if (isMenuClicked) {
            setMenuClass('menu slide-right visible');
            document.body.classList.add('no-scroll');
        } else {
            setMenuClass('menu slide-left hidden');
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isMenuClicked]);

    useEffect(() => {
        const handleScroll = () => {
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

    const handleLogout = async () => {
        closeMenu(); // Close menu first
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };
    
    return (
        <div className="burger-god hiddenInDesktop">
            <nav className={`nav-burger ${isSticky ? 'sticky' : ''}`}>
                <div className="burger-menu" onClick={updateMenu} aria-label="Abrir menú" role="button" tabIndex="0">
                    <div className="burger-bar"></div>
                    <div className="burger-bar"></div>
                    <div className="burger-bar"></div>
                </div>
                <div className='burger-mobile'>
                    <NavLink to="/" className='burger-mobile-logo' aria-label="Inicio">
                        <img src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png" alt="logo white" />
                    </NavLink>
                </div>
            </nav>

            <div className={menu_class}>
                <div className='menu-controls'>
                    <IoClose onClick={closeMenu} className='ioclose' aria-label="Cerrar menú" role="button" tabIndex="0" />
                    <img src="https://i.ibb.co/DY81r0L/Logo-Mercadonet-Desplegable.png" alt="logo blue" />
                </div>
                <div className="burger-nav-menu">
                    {loadingAuth ? (
                        <p style={{padding: '10px 20px'}}>Cargando...</p>
                    ) : currentUser ? (
                        <>
                            <div style={{padding: '10px 20px', fontWeight: 'bold', borderBottom: '1px solid #eee'}}>
                                {currentUser.displayName || currentUser.email}
                            </div>
                            {/* Example: Link to a future dashboard or profile page */}
                            {/* <NavLink onClick={closeMenu} to="/dashboard" className="burger-nav-item" activeclassname="burger-active">Mi Panel</NavLink> */}
                            <button onClick={handleLogout} className="burger-nav-item" style={{background: 'none', border: 'none', padding: '10px 20px', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1em'}}>
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Removed separate Proveedor/Comprador login buttons, directing to general login/register */}
                            <NavLink onClick={closeMenu} to="/registrarme" className="burger-nav-item" activeclassname="burger-active">
                                Ingresar / Registrarse
                            </NavLink>
                        </>
                    )}
                    <hr style={{margin: '10px 0'}}/>
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
                            <NavLink onClick={closeMenu} to="/productos" className="burger-nav-item" activeclassname="burger-active"> {/* Assuming /productos route */}
                                Productos
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
