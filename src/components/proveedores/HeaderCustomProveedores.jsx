// src/components/header/HeaderCustomProveedores.jsx
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle } from "react-icons/fa"; // FaUserCircle as default
import { BsPersonFill } from 'react-icons/bs';
import { useFiltersContext } from '../../context/FiltersContext';
import ProveedorIcon from '../../assets/ProveedorIcon';
import { useAuth } from '../../context/AuthContext';

const HeaderCustomProveedores = () => {
    const {
        searchTerm,
        proveedores,
        updateFilters,
    } = useFiltersContext();

    const { currentUser, logout, loadingAuth } = useAuth();
    const navigate = useNavigate();

    const [scrolled, setScrolled] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const inputRef = useRef(null);
    const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm || "");
    const searchBoxRef = useRef(null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    const filtrarProveedores = (proveedores, term) => {
        if (!term) return [];
        return proveedores.filter((proveedor) =>
            proveedor.nombre.toLowerCase().includes(term.toLowerCase())
        );
    };

    useEffect(() => {
        if (tempSearchTerm) {
            const proveedoresFiltrados = filtrarProveedores(
                proveedores,
                tempSearchTerm
            );
            setSuggestions(proveedoresFiltrados.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    }, [tempSearchTerm, proveedores]);

    useEffect(() => {
        const handleClickOutsideDropdown = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        const handleClickOutsideSearch = (event) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutsideDropdown);
        document.addEventListener("mousedown", handleClickOutsideSearch);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideDropdown);
            document.removeEventListener("mousedown", handleClickOutsideSearch);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 120);
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleSuggestionClick = (suggestion) => {
        const updatedSearchTerm = suggestion.nombre;
        setTempSearchTerm(updatedSearchTerm);
        updateFilters("search", updatedSearchTerm);
        setSuggestions([]);
    };

    const handleSearchClick = () => {
        updateFilters("search", tempSearchTerm.toLowerCase());
        setSuggestions([]);
    };

    const handleFocus = () => {
        if (tempSearchTerm) {
            setSuggestions(
                filtrarProveedores(proveedores, tempSearchTerm).slice(0, 5)
            );
        }
    };

    const handleLogout = async () => {
        setIsProfileDropdownOpen(false);
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
        navigate('/perfil'); 
    };

    return (
        <header className={`header hiddenInMobile ${scrolled ? "scrolled" : ""}`}>
            <div className='logo-container'>
                <NavLink to="/" aria-label="Inicio">
                    <img
                        src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png"
                        alt="Logo Mercadonet"
                    />
                </NavLink>
            </div>
             
            <div className="search-box" ref={searchBoxRef}>
                <section className="search-section">
                    <input
                        type="text"
                        placeholder="Buscá tu proveedor"
                        value={tempSearchTerm}
                        onChange={(e) => setTempSearchTerm(e.target.value)}
                        onFocus={handleFocus}
                        aria-label="Buscar proveedores"
                        ref={inputRef}
                    />
                    <button onClick={handleSearchClick} aria-label="Buscar">
                        <FaSearch className="search-icon" />
                    </button>
                </section>

                {suggestions.length > 0 && (
                    <div className="suggestions-list-box">
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={suggestion.id || index}
                                    onMouseDown={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.nombre} -
                                    {suggestion.categoria && suggestion.categoria.length > 0
                                        ? suggestion.categoria.join(", ")
                                        : suggestion.tipoProveedor || "No especificado"}
                                    {" - "}
                                    {suggestion.ciudad || suggestion.provincia || "Ubicación no especificada"}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
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
                                <img src={currentUser.photoURL} alt="Perfil" style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px' }} />
                            ) : (
                                <FaUserCircle size={28} style={{ marginRight: '8px', color: '#fff' }} />
                            )}
                        </button>
                        {isProfileDropdownOpen && (
                            <div className="profile-dropdown" style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 100,
                                width: '220px',
                                overflow: 'hidden'
                            }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                                     <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>{currentUser.displayName || currentUser.email}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>{currentUser.email}</p>
                                </div>
                                <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                                    <li>
                                        <button onClick={navigateToProfile} style={{ width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#333' }}>
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

export default HeaderCustomProveedores;
