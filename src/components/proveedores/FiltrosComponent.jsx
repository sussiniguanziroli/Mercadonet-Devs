import React, { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5'; // Asegúrate de importar correctamente IoClose
import { useFiltersContext } from '../../context/FiltersContext';
import { VscDebugRestart } from 'react-icons/vsc';
import { FaStar } from 'react-icons/fa';

const FiltrosComponent = ({ isMenuHidden, setIsMenuHidden }) => {
    const {
        filtrosOpciones,
        selectedCategoria,
        selectedUbicacion,
        updateFilters,
        selectedExtras,
        checkedServices,
    } = useFiltersContext();

    const [inputValue, setInputValue] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(filtrosOpciones.marca || []);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleCategoriaChange = (categoria) => {
        const newCategorias = selectedCategoria.includes(categoria)
            ? selectedCategoria.filter((item) => item !== categoria)
            : [...selectedCategoria, categoria];

        updateFilters("categoria", newCategorias);
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
        updateFilters("ubicacion", e.target.value);
    };

    const clearCategorias = () => {
        updateFilters("categoria", []);
    };

    const handleServicesChange = (servicio) => {
        updateFilters("servicio", (prevState) =>
            prevState.includes(servicio)
                ? prevState.filter((item) => item !== servicio) // Elimina el servicio si está activado
                : [...prevState, servicio] // Agrega el servicio si está desactivado
        );
    };

    const handleResetFilters = () => {
        updateFilters("pproductos", []);
        updateFilters("servicio", []);
        updateFilters("extras", '');
        updateFilters("ubicacion", "");
        updateFilters("marca", "");
        updateFilters("categoria", []);
    };

    const isFulfillmentActive =
        checkedServices.includes("Logística/Transporte") &&
        checkedServices.includes("Almacenamiento");

    return (
        <main className={`main-filters-component ${isMenuHidden ? 'hidden' : 'visible'}`}>
            <div className='closebtn-div'>
                <button onClick={() => setIsMenuHidden(true)}>
                    <IoClose />
                </button>
            </div>
            <div className='utils-box'>
                <p>FILTRAR</p>
                <button onClick={handleResetFilters}>RESTABLECER</button>
            </div>
            <section className='actual-filters-mobile'>
                <div className="filtro-servicios">
                    {/* Proveedores de SERVICIOS */}
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
                {/* Filtro de Categoría */}
                <div className="filtro-tipos">
                    <div className='tipo-boton'>
                        <h3>Categoría del Proveedor</h3>
                        <button onClick={clearCategorias}>Limpiar</button>
                    </div>
                    <ul className='filtro-tipos-checkboxes'>
                        {filtrosOpciones.categoria.map((categoria) => (
                            <li key={categoria}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={categoria}
                                        checked={selectedCategoria.includes(categoria)}
                                        onChange={() => handleCategoriaChange(categoria)}
                                        className="hidden-checkbox"
                                    />
                                    <span className='custom-checkbox'></span>
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
                            <option key={ubicacion} value={ubicacion}>
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

                <button className='readyBtn' onClick={() => setIsMenuHidden(true)}>
                    <p>Hecho</p>
                </button>
            </section>
        </main>
    );
};

export default FiltrosComponent;
