import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { BsPersonFill } from 'react-icons/bs';
import { useFiltersContext } from '../../context/FiltersContext';
import ProveedorIcon from '../../assets/ProveedorIcon';
import { useAuth } from '../../context/AuthContext';

const HighlightMatch = ({ text, highlight }) => {
    if (!highlight || typeof text !== 'string') {
        return <>{text}</>;
    }
    const lowerText = text.toLowerCase();
    const lowerHighlight = highlight.toLowerCase();
    const startIndex = lowerText.indexOf(lowerHighlight);

    if (startIndex === -1) {
        return <>{text}</>;
    }

    const endIndex = startIndex + highlight.length;
    return (
        <>
            {text.substring(0, startIndex)}
            <strong>{text.substring(startIndex, endIndex)}</strong>
            {text.substring(endIndex)}
        </>
    );
};

const getRankedSuggestions = (proveedores, term) => {
    if (!term) return [];

    const lowerTerm = term.toLowerCase();

    const ranked = proveedores.map(proveedor => {
        let score = 0;

        const checkField = (fieldValue, baseScore, prefixBonus) => {
            if (fieldValue && typeof fieldValue === 'string') {
                const lowerFieldValue = fieldValue.toLowerCase();
                if (lowerFieldValue.startsWith(lowerTerm)) {
                    return baseScore + prefixBonus;
                } else if (lowerFieldValue.includes(lowerTerm)) {
                    return baseScore;
                }
            }
            return 0;
        };
        
        let maxScoreForProvider = 0;

        maxScoreForProvider = Math.max(maxScoreForProvider, checkField(proveedor.nombre, 70, 30));
        maxScoreForProvider = Math.max(maxScoreForProvider, checkField(proveedor.categoriaPrincipal, 50, 25));
        
        (proveedor.marcasConfiguradas || []).forEach(marca => {
            maxScoreForProvider = Math.max(maxScoreForProvider, checkField(marca, 40, 20));
        });
        maxScoreForProvider = Math.max(maxScoreForProvider, checkField(proveedor.ciudad, 30, 15));
        maxScoreForProvider = Math.max(maxScoreForProvider, checkField(proveedor.provincia, 30, 15));

        (proveedor.categoriasAdicionales || []).forEach(cat => {
            maxScoreForProvider = Math.max(maxScoreForProvider, checkField(cat, 20, 10));
        });
        
        const tipoProvArray = Array.isArray(proveedor.tipoProveedor) ? proveedor.tipoProveedor : (typeof proveedor.tipoProveedor === 'string' ? [proveedor.tipoProveedor] : []);
        tipoProvArray.forEach(tipo => {
            maxScoreForProvider = Math.max(maxScoreForProvider, checkField(tipo, 20, 10));
        });

        (proveedor.serviciosClaveParaTags || []).forEach(servicio => {
            maxScoreForProvider = Math.max(maxScoreForProvider, checkField(servicio, 15, 10));
        });
        
        return { ...proveedor, score: maxScoreForProvider };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);

    return ranked;
};


const HeaderCustomProveedores = () => {
    const {
        searchTerm: globalSearchTerm,
        allProveedores,
        updateFilters,
    } = useFiltersContext();

    const { currentUser, logout, loadingAuth } = useAuth();
    const navigate = useNavigate();

    const [scrolled, setScrolled] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState(globalSearchTerm || "");
    const searchBoxRef = useRef(null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    const DEBOUNCE_DELAY = 250; 
    const [debouncedInputValue, setDebouncedInputValue] = useState(inputValue);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedInputValue(inputValue);
        }, DEBOUNCE_DELAY);
        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, DEBOUNCE_DELAY]);

    useEffect(() => {
        setInputValue(globalSearchTerm || "");
    }, [globalSearchTerm]);

    useEffect(() => {
        if (debouncedInputValue && allProveedores.length > 0) {
            const ranked = getRankedSuggestions(allProveedores, debouncedInputValue);
            setSuggestions(ranked.slice(0, 5));
        } else {
            setSuggestions([]);
            if (debouncedInputValue === "") {
                updateFilters("search", "");
            }
        }
    }, [debouncedInputValue, allProveedores, updateFilters]);

    useEffect(() => {
        const handleClickOutsideDropdown = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        const handleClickOutsideSearch = (event) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
                const isSuggestionClick = suggestions.some(s => {
                    const targetText = event.target?.textContent || "";
                    return targetText.includes(s.nombre);
                });
                if (!isSuggestionClick) {
                    setSuggestions([]);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutsideDropdown);
        document.addEventListener("mousedown", handleClickOutsideSearch);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideDropdown);
            document.removeEventListener("mousedown", handleClickOutsideSearch);
        };
    }, [suggestions]);

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
        setInputValue(updatedSearchTerm);
        updateFilters("search", updatedSearchTerm);
        setSuggestions([]);
    };

    const handleSearch = () => {
        updateFilters("search", inputValue.toLowerCase());
        setSuggestions([]);
    };
    
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputFocus = () => {
        if (inputValue && allProveedores.length > 0) {
            const ranked = getRankedSuggestions(allProveedores, inputValue);
            setSuggestions(ranked.slice(0, 5));
        } else if (!inputValue) {
            setSuggestions([]);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
            inputRef.current?.blur();
        }
    };

    const handleLogout = async () => {
        setIsProfileDropdownOpen(false);
        try {
            await logout();
            navigate('/');
        } catch (error) {
        }
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(prev => !prev);
    };
    
    const navigateToProfile = () => {
        setIsProfileDropdownOpen(false);
        navigate('/dashboard'); 
    };

    const formatSuggestionCategory = (suggestion) => {
        if (suggestion.categoriaPrincipal) return suggestion.categoriaPrincipal;
        if (suggestion.categoriasAdicionales && suggestion.categoriasAdicionales.length > 0) return suggestion.categoriasAdicionales.join(", ");
        const tipoProv = Array.isArray(suggestion.tipoProveedor) ? suggestion.tipoProveedor.join(", ") : suggestion.tipoProveedor;
        if (tipoProv) return tipoProv;
        return "No especificado";
    };

    const formatSuggestionLocation = (suggestion) => {
        if (suggestion.ciudad && suggestion.provincia) return `${suggestion.ciudad}, ${suggestion.provincia}`;
        if (suggestion.ciudad) return suggestion.ciudad;
        if (suggestion.provincia) return suggestion.provincia;
        return "Ubicación no especificada";
    }

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
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onKeyPress={handleKeyPress}
                        aria-label="Buscar proveedores"
                        ref={inputRef}
                    />
                    <button onClick={handleSearch} aria-label="Buscar">
                        <FaSearch className="search-icon" />
                    </button>
                </section>

                {suggestions.length > 0 && (
                    <div className="suggestions-list-box">
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    onMouseDown={() => handleSuggestionClick(suggestion)}
                                >
                                    <HighlightMatch text={suggestion.nombre} highlight={debouncedInputValue} />
                                    {" - "}
                                    <HighlightMatch text={formatSuggestionCategory(suggestion)} highlight={debouncedInputValue} />
                                    {" - "}
                                    <HighlightMatch text={formatSuggestionLocation(suggestion)} highlight={debouncedInputValue} />
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