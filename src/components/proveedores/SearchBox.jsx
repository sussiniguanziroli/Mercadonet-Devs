import React, { useEffect, useRef, useState } from 'react';
import { FaSearch } from "react-icons/fa";
import { useFiltersContext } from '../../context/FiltersContext';

const SearchBox = () => {
    const {
        searchTerm,
        setSearchTerm,
        proveedoresFiltrados,
        filtrosOpciones,
        updateFilters,
        isLoading,
        proveedores
    } = useFiltersContext();

    const inputRef = useRef(null);
    const searchBoxRef = useRef(null);
    const [tempSearchTerm, setTempSearchTerm] = useState(searchTerm || "");
    const [suggestions, setSuggestions] = useState([]);


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

    // Manejar clic fuera del input para cerrar el menú de sugerencias
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!searchBoxRef.current.contains(event.target)) {
                // Opcional: limpiar sugerencias aquí si se necesita
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <main className='main-search hiddenInDesktop'>
            <div className='search-box' ref={searchBoxRef}>
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
            </div>

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
        </main>
    );
};

export default SearchBox;
