import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { useFiltersContext } from '../../context/FiltersContext';
import ProveedorIcon from '../../assets/ProveedorIcon';
import { BsPersonFill } from 'react-icons/bs';

const HeaderCustomProveedores = () => {
    const {
        searchTerm,
        proveedores,
        updateFilters,
    } = useFiltersContext();

    const [scrolled, setScrolled] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const inputRef = useRef(null);
    const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm || "");
    const searchBoxRef = useRef(null);

    // Función para filtrar proveedores según el término de búsqueda
    const filtrarProveedores = (proveedores, searchTerm) => {
        return proveedores.filter((proveedor) => {
            const cumpleSearchTerm =
                !searchTerm ||
                proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            return cumpleSearchTerm;
        });
    };

    // Actualizar sugerencias cuando cambie el término de búsqueda temporal
    useEffect(() => {
        if (tempSearchTerm) {
            const proveedoresFiltrados = filtrarProveedores(
                proveedores,
                tempSearchTerm.toLowerCase()
            );
            setSuggestions(proveedoresFiltrados.slice(0, 5)); // Limitar sugerencias
        } else {
            setSuggestions([]);
        }
    }, [tempSearchTerm]);

    // Manejar clic en una sugerencia
    const handleSuggestionClick = (suggestion) => {
        const updatedSearchTerm = suggestion.nombre;
        setTempSearchTerm(updatedSearchTerm);
        updateFilters("search", updatedSearchTerm);
        clearSuggestions();
    };

    // Manejar clic en el botón de búsqueda
    const handleSearchClick = () => {
        updateFilters("search", tempSearchTerm.toLowerCase());
        clearSuggestions();
    };

    // Limpiar sugerencias
    const clearSuggestions = () => {
        setSuggestions([]);
    };

    // Manejar el enfoque del input
    const handleFocus = () => {
        setSuggestions(
            filtrarProveedores(proveedores, tempSearchTerm.toLowerCase()).slice(0, 3)
        );
    };

    // Cerrar sugerencias al hacer clic fuera del input
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!searchBoxRef.current.contains(event.target)) {
                setTimeout(() => setSuggestions([]), 0);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    // Manejar el scroll para actualizar la clase del header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 120);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    console.log(suggestions)

    return (
        <header className={`header hiddenInMobile ${scrolled ? "scrolled" : ""}`}>
            <img
                src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png"
                alt="logo white"
            />
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
                    <button onClick={handleSearchClick}>
                        <FaSearch className="search-icon" />
                    </button>
                </section>

                <div className="suggestions-list-box">
                    {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onMouseDown={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.nombre} -
                                    {/* Verificar si tiene categoria, si no usar tipo */}
                                    {suggestion.categoria && suggestion.categoria.length > 0
                                        ? suggestion.categoria.join(", ")
                                        : suggestion.tipo || "No especificado"}
                                    {" - "}
                                    {suggestion.ubicacion}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

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
    );
};

export default HeaderCustomProveedores;
