import React, { useEffect, useRef, useState } from 'react'
import { useFiltersContext } from '../../context/FiltersContext';
import { FaStar } from 'react-icons/fa';
import { VscDebugRestart } from 'react-icons/vsc';

const FiltrosComponentDesktop = () => {
    const {
        searchTerm,
        proveedoresFiltrados,
        filtrosOpciones,
        updateFilters,
        selectedCategoria,
        selectedUbicacion,
        selectedMarca,
        checkedServices,
        selectedExtras,
        isLoading,
    } = useFiltersContext();


    const [inputValue, setInputValue] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(filtrosOpciones.marca || []);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setFilteredOptions(filtrosOpciones.marca || []);
    }, [filtrosOpciones.marca]);

    const handleCategoriaChange = (categoria) => {
        updateFilters("categoria", (prev) =>
            prev.includes(categoria)
                ? prev.filter((item) => item !== categoria)
                : [...prev, categoria]
        );
    };

    const handleMarcaInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        // Filtra las opciones del select
        const filtered = filtrosOpciones.marca.filter((marca) =>
            marca.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
        setDropdownOpen(true);
    };

    const handleMarcaSelect = (marca) => {
        setInputValue(marca); // Actualiza el input con la marca seleccionada
        updateFilters("marca", marca); // Actualiza la marca seleccionada en el contexto
        setDropdownOpen(false); // Cierra el desplegable
    };

    const handleMarcaInputFocus = () => {
        setDropdownOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleReset = () => {
        setInputValue(""); // Limpia el input
        setFilteredOptions(filtrosOpciones.marca); // Restaura todas las opciones
        setDropdownOpen(true); // Vuelve a abrir el menú desplegable
        updateFilters("marca", ""); // Limpia la marca seleccionada
    };

    const handleExtrasChange = (e) => {
        updateFilters("extras", e.target.value); // Actualiza los extras seleccionados
    };

    const handleUbicacionChange = (e) => {
        updateFilters("ubicacion", e.target.value); // Actualiza la ubicación seleccionada
    };

    const handleServicesChange = (servicio) => {
        updateFilters("servicio", (prevState) =>
            prevState.includes(servicio)
                ? prevState.filter((item) => item !== servicio) // Elimina el servicio si está activado
                : [...prevState, servicio] // Agrega el servicio si está desactivado
        );
    };

    const isFulfillmentActive =
        checkedServices.includes("Logística/Transporte") &&
        checkedServices.includes("Almacenamiento");

    

    return (
        <>
            {filtrosOpciones.servicios.length > 0 ? (
                <div className="filtros-desktop hiddenInMobile">
                    {/* Filtro de Servicios */}
                    <div className="filtro-servicios">
                        <h3>Proveedores de Servicios</h3>
                        <ul className="filtro-tipos-checkboxes">
                            {filtrosOpciones.servicios.map((servicio) => (
                                <li key={servicio}>
                                    <label className="switch-label">
                                        <input
                                            type="checkbox"
                                            className="hidden-checkbox"
                                            value={servicio}
                                            checked={checkedServices.includes(servicio)}
                                            onChange={() => handleServicesChange(servicio)}
                                        />
                                        <span className="custom-switch"></span>
                                        {servicio}
                                        {isFulfillmentActive && servicio === "Logística/Transporte" && (
                                            <span className="fulfillment-badge">
                                                <FaStar /> Fulfillment
                                            </span>
                                        )}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Filtro de Categorias */}
                    <div className="filtro-categorias">
                        <div className="tipo-boton">
                            <h3>Categoría del Proveedor</h3>
                            <button onClick={() => updateFilters("categoria", [])}>
                                Limpiar
                            </button>
                        </div>
                        <ul className="filtro-tipos-checkboxes">
                            {filtrosOpciones.categoria.map((categoria) => (
                                <li key={categoria}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={categoria}
                                            checked={selectedCategoria.includes(categoria)}
                                            onChange={() => handleCategoriaChange(categoria)}
                                        />
                                        {categoria}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Filtro de Ubicación */}
                    <div className="filtro-ubicacion">
                        <h3>Ubicación</h3>
                        <select
                            value={selectedUbicacion}
                            onChange={handleUbicacionChange}
                        >
                            <option value="">Todo</option>
                            {filtrosOpciones.ubicacion.map((ubicacion) => (
                                <option
                                    className="ubicacion-option"
                                    key={ubicacion}
                                    value={ubicacion}
                                >
                                    {ubicacion}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de Marca */}
                    <div className="filtro-marca">
                        <h3>Marca</h3>
                        <div className="combobox" ref={dropdownRef}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleMarcaInputChange}
                                placeholder="Buscar Ej: Adidas"
                                className="combobox-input"
                                onFocus={handleMarcaInputFocus}
                            />
                            {dropdownOpen && (
                                <ul className="combobox-dropdown">
                                    <button
                                        className="combobox-option"
                                        onClick={handleReset}
                                    >
                                        Todos
                                    </button>
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map((marca) => (
                                            <li
                                                key={marca}
                                                onClick={() => handleMarcaSelect(marca)}
                                                className="combobox-option"
                                            >
                                                {marca}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="combobox-option">Sin coincidencias</li>
                                    )}
                                </ul>
                            )}
                            <button onClick={handleReset}>
                                <VscDebugRestart size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Filtro de Servicios y Capacidades */}
                    <div className="filtro-ubicacion">
                        <h3>Servicios y Capacidades</h3>
                        <select
                            value={selectedExtras}
                            onChange={handleExtrasChange}
                        >
                            <option value="">Todo</option>
                            {filtrosOpciones.extras.map((extra) => (
                                <option
                                    className="ubicacion-option"
                                    key={extra}
                                    value={extra}
                                >
                                    {extra}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ) : (
                <div></div>
            )}
        </>
    );
};

export default FiltrosComponentDesktop;
