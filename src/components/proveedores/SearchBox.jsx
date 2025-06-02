import React, { useEffect, useRef, useState } from 'react';
import { FaSearch } from "react-icons/fa";
import { useFiltersContext } from '../../context/FiltersContext';

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

const SearchBox = () => {
    const {
        searchTerm: globalSearchTerm,
        allProveedores,
        updateFilters,
    } = useFiltersContext();

    const inputRef = useRef(null);
    const searchBoxRef = useRef(null);
    const [inputValue, setInputValue] = useState(globalSearchTerm || "");
    const [suggestions, setSuggestions] = useState([]);
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

    const handleSuggestionClick = (suggestion) => {
        const updatedSearchTerm = suggestion.nombre;
        setInputValue(updatedSearchTerm);
        updateFilters("search", updatedSearchTerm);
        setSuggestions([]);
    };

    const handleSearch = () => {
        updateFilters("search", inputValue.toLowerCase());
        setSuggestions([]);
        inputRef.current?.blur();
    };
    
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputFocus = () => {
        if (inputValue && allProveedores.length > 0) {
            const ranked = getRankedSuggestions(allProveedores, inputValue);
            setSuggestions(ranked.slice(0, 3));
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

    useEffect(() => {
        const handleClickOutside = (event) => {
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
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [suggestions]);

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
        <main className='main-search hiddenInDesktop'>
            <div className='search-box' ref={searchBoxRef}>
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
            </div>

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
        </main>
    );
};

export default SearchBox;