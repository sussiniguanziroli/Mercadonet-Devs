// src/components/header/Header.jsx
import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle } from "react-icons/fa"; // FaUserCircle as default
import { BsPersonFill } from "react-icons/bs";
import ProveedorIcon from '../../assets/ProveedorIcon';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const { currentUser, logout, loadingAuth } = useAuth();
    const navigate = useNavigate();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    console.log(currentUser)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 120);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        setIsProfileDropdownOpen(false); // Close dropdown on logout
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(prev => !prev);
    };

    const navigateToProfile = () => {
        setIsProfileDropdownOpen(false);
        navigate('/dashboard/perfil'); // Placeholder for profile page
    };

    return (
        <header className={`header hiddenInMobile ${scrolled ? 'scrolled' : ''}`}>
            <NavLink to="/" aria-label="Inicio" className='logo-container'> {/* Added className for consistency */}
                <img
                    src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png"
                    alt="Logo Mercadonet"
                />
            </NavLink>

            <div className='search-box'>
                <section className='search-section'>
                    <input
                        type="text"
                        placeholder='Buscar'
                    />
                    <button aria-label="Buscar"><FaSearch className='search-icon' /></button>
                </section>
            </div>

            <div className='nav-container'>
                <NavLink activeclassname='active' to='/' className='nav-link'>¿Qué es Mercadonet?</NavLink>
                <NavLink activeclassname='active' to='/proveedores' className='nav-link'>Proveedores</NavLink>
                <NavLink activeclassname='active' to='/productos' className='nav-link'>Productos</NavLink>

                {loadingAuth ? (
                    <span className='nav-link'>Cargando...</span>
                ) : currentUser ? (
                    <div className='profile-section' ref={profileDropdownRef} style={{ position: 'relative' }}>
                        <button onClick={toggleProfileDropdown} className='profile-button' style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                            {currentUser.photoURL ? (
                                <img referrerPolicy="no-referrer" src={currentUser.photoURL} alt="Perfil" style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px' }} />
                            ) : (
                                <FaUserCircle size={28} style={{ marginRight: '8px', color: '#fff' }} />
                            )}
                            
                        </button>
                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown" style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)', // Position below the button
                                right: 0,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 100,
                                width: '220px',
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{currentUser.displayName || currentUser.email}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>{currentUser.email}</p>
                                </div>
                                <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                                    <li>
                                        <button onClick={navigateToProfile} style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            Ver Perfil
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#d9534f' }}>
                                            Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <NavLink to='/registrarme' activeclassname='active' className='nav-link'>
                        <BsPersonFill size={16} /> Ingresar
                    </NavLink>
                )}

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
    );
};

export default Header;
