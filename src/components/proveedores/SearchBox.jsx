import React, { useEffect, useRef, useState } from 'react'
import { FaSearch } from "react-icons/fa";

const SearchBox = ({ searchTerm, proveedores, setSearchTerm, filtrosOpciones, setSelectedMarca, setSelectedTipo, setSelectedUbicacion, selectedTipo, selectedMarca, selectedUbicacion }) => {

    const [suggestions, setSuggestions] = useState([]);
    const inputRef = useRef(null);
    const [tempSearchTerm, setTempSearchTerm] = useState('');
    const searchBoxRef = useRef(null);

    const [filtrosUbicacion, setFiltrosUbicacion] = useState([]);
    const [filtrosTipo, setFiltrosTipo] = useState([]);

    console.log('filtros opciones', filtrosOpciones);

    useEffect(() => {
        const determinarFiltros = () => {
            setFiltrosUbicacion(filtrosOpciones.ubicacion);
            setFiltrosTipo(filtrosOpciones.tipo);
        };
        determinarFiltros();

    }, [filtrosOpciones])

    console.log('filtros ubicacion', filtrosUbicacion);
    console.log('filtro tipo', filtrosTipo);



    const filtrarProveedores = (proveedores, searchTerm) => {
        return proveedores.filter(proveedor => {
            
            const cumpleSearchTerm = !searchTerm || proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase());

            return cumpleSearchTerm;
        });
    };

    useEffect(() => {
        if (tempSearchTerm) {
            const proveedoresFiltrados = filtrarProveedores(proveedores, tempSearchTerm.toLowerCase(), selectedMarca, selectedTipo, selectedUbicacion);
            setSuggestions(proveedoresFiltrados.slice(0, 5)); // Limitar sugerencias a 3
        } else {
            setSuggestions([]);
        }
    }, [tempSearchTerm, selectedMarca, selectedTipo, selectedUbicacion]);

   
    const handleSuggestionClick = (suggestions) => {
        setTempSearchTerm(suggestions.nombre);
        setSearchTerm(suggestions.nombre.toLowerCase());
        clearSuggestions();
    };

    const handleSearchClick = () => {
        setSearchTerm(tempSearchTerm.toLowerCase());
        clearSuggestions();
    };

    const clearSuggestions = () => {
        setSuggestions([]);
    };

    const handleFocus = () => {
        setSuggestions(filtrarProveedores(proveedores, tempSearchTerm.toLowerCase()).slice(0, 3));
    };

    // Manejar clic fuera del input para cerrar el menú de sugerencias
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                !searchBoxRef.current.contains(event.target)
            ) {
                setTimeout(() => setSuggestions([]), 0); // Ocultar sugerencias con un pequeño retraso
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);
   




return (
    <main className='main-search hiddenInMobile'>
        <div className='search-box' ref={searchBoxRef} >
            <h1>El directorio B2B líder de Argentina</h1>
            <section className='search-section' >
                <input
                    type="text"
                    placeholder='Buscá tu proveedor'
                    value={tempSearchTerm}
                    onChange={(e) => setTempSearchTerm(e.target.value)}
                    onFocus={handleFocus}
                    aria-label="Buscar proveedores"
                    ref={inputRef}
                />
                <button onClick={() => handleSearchClick()}><FaSearch className='search-icon' /></button>
            </section>
        </div>

        <div className='suggestions-list-box'>
            {/* Desplegable de sugerencias */}
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                        <li key={index} onMouseDown={() => handleSuggestionClick(suggestion)}>
                            {suggestion.nombre} - {suggestion.tipo.join(", ")} - {suggestion.ubicacion}
                        </li>
                    ))}
                </ul>
            )}
        </div>

    </main>
)
}

export default SearchBox