// src/components/proveedores/FiltrosComponentDesktop.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useFiltersContext } from '../../context/FiltersContext';
import { FaStar } from 'react-icons/fa';
import { VscDebugRestart } from 'react-icons/vsc';

const FiltrosComponentDesktop = () => {
    const {
        filtrosOpciones,
        updateFilters,
        selectedCategoria,
        selectedUbicacion,
        selectedMarca, 
        checkedServices,
        selectedExtras,
        isLoading, 
        selectedPProductos // For Tipo de Proveedor filter
    } = useFiltersContext();

    const [inputMarcaValue, setInputMarcaValue] = useState(selectedMarca || "");
    const [filteredMarcaOptions, setFilteredMarcaOptions] = useState([]);
    const [isMarcaDropdownOpen, setIsMarcaDropdownOpen] = useState(false);
    const marcaDropdownRef = useRef(null);

    useEffect(() => {
        setInputMarcaValue(selectedMarca || "");
    }, [selectedMarca]);

    useEffect(() => {
        const marcasOpt = Array.isArray(filtrosOpciones.marcas) ? filtrosOpciones.marcas : [];
        if (inputMarcaValue) {
            setFilteredMarcaOptions(
                marcasOpt.filter((marca) =>
                    typeof marca === 'string' && marca.toLowerCase().includes(inputMarcaValue.toLowerCase())
                )
            );
        } else {
            setFilteredMarcaOptions(marcasOpt);
        }
    }, [inputMarcaValue, filtrosOpciones.marcas]);

    const handleCategoriaChange = (categoria) => {
        updateFilters("categoria", (prev) =>
            Array.isArray(prev) && prev.includes(categoria)
                ? prev.filter((item) => item !== categoria)
                : [...(Array.isArray(prev) ? prev : []), categoria]
        );
    };

    const handleMarcaInputChange = (e) => {
        const value = e.target.value;
        setInputMarcaValue(value);
        setIsMarcaDropdownOpen(true);
    };

    const handleMarcaSelect = (marca) => {
        setInputMarcaValue(marca); 
        updateFilters("marca", marca); 
        setIsMarcaDropdownOpen(false); 
    };
    
    const handleMarcaInputFocus = () => {
        const marcasOpt = Array.isArray(filtrosOpciones.marcas) ? filtrosOpciones.marcas : [];
        setFilteredMarcaOptions(
            marcasOpt.filter((m) =>
                typeof m === 'string' && m.toLowerCase().includes(inputMarcaValue.toLowerCase())
            )
        );
        setIsMarcaDropdownOpen(true);
    };

    const handleMarcaReset = () => {
        setInputMarcaValue(""); 
        updateFilters("marca", ""); 
        setFilteredMarcaOptions(Array.isArray(filtrosOpciones.marcas) ? filtrosOpciones.marcas : []);
        setIsMarcaDropdownOpen(false); 
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (marcaDropdownRef.current && !marcaDropdownRef.current.contains(event.target)) {
                setIsMarcaDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleExtrasChange = (e) => {
        updateFilters("extras", e.target.value);
    };

    const handleUbicacionChange = (e) => {
        updateFilters("ubicacion", e.target.value);
    };

    const handleServicesChange = (servicio) => {
        updateFilters("servicio", (prevState) =>
            Array.isArray(prevState) && prevState.includes(servicio)
                ? prevState.filter((item) => item !== servicio)
                : [...(Array.isArray(prevState) ? prevState : []), servicio]
        );
    };

    const handlePProductosChange = (tipoProveedor) => {
        updateFilters("pproductos", (prev) =>
            Array.isArray(prev) && prev.includes(tipoProveedor)
                ? prev.filter((item) => item !== tipoProveedor)
                : [...(Array.isArray(prev) ? prev : []), tipoProveedor]
        );
    };

    const isFulfillmentActive =
        Array.isArray(checkedServices) &&
        checkedServices.includes("Logística/Transporte") &&
        checkedServices.includes("Almacenamiento");

    if (isLoading) { 
        return <div className="filtros-desktop hiddenInMobile" style={{padding: '20px', textAlign: 'center'}}><p>Cargando filtros...</p></div>;
    }
    
    const anyFilterOptionsAvailable = 
        filtrosOpciones.servicios?.length > 0 || 
        filtrosOpciones.categorias?.length > 0 || 
        filtrosOpciones.ubicaciones?.length > 0 || 
        filtrosOpciones.marcas?.length > 0 || 
        filtrosOpciones.extras?.length > 0 ||
        filtrosOpciones.pproductos?.length > 0;

    return (
        <>
            {anyFilterOptionsAvailable ? (
                <div className="filtros-desktop hiddenInMobile">
                    

                    {/* Filtro de Servicios (Switches) */}
                    {Array.isArray(filtrosOpciones.servicios) && filtrosOpciones.servicios.length > 0 && (
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
                                                checked={Array.isArray(checkedServices) && checkedServices.includes(servicio)}
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
                    )}

                    {/* Filtro de Categorias */}
                    {Array.isArray(filtrosOpciones.categorias) && filtrosOpciones.categorias.length > 0 && (
                        <div className="filtro-categorias">
                            <div className="tipo-boton">
                                <h3>Categoría del Proveedor</h3>
                                <button onClick={() => updateFilters("categoria", [])}>
                                    Limpiar
                                </button>
                            </div>
                            <ul className="filtro-tipos-checkboxes">
                                {filtrosOpciones.categorias.map((categoria) => (
                                    <li key={categoria}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                value={categoria}
                                                checked={Array.isArray(selectedCategoria) && selectedCategoria.includes(categoria)}
                                                onChange={() => handleCategoriaChange(categoria)}
                                            />
                                            {categoria}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Filtro de Ubicación */}
                    {Array.isArray(filtrosOpciones.ubicaciones) && filtrosOpciones.ubicaciones.length > 0 && (
                        <div className="filtro-ubicacion">
                            <h3>Ubicación (Provincia)</h3>
                            <select
                                value={selectedUbicacion}
                                onChange={handleUbicacionChange}
                            >
                                <option value="">Todas</option>
                                {filtrosOpciones.ubicaciones.map((ubicacion) => (
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
                    )}

                    {/* Filtro de Marca */}
                    {Array.isArray(filtrosOpciones.marcas) && filtrosOpciones.marcas.length > 0 && (
                        <div className="filtro-marca">
                            <h3>Marca</h3>
                            <div className="combobox" ref={marcaDropdownRef}>
                                <input
                                    type="text"
                                    value={inputMarcaValue}
                                    onChange={handleMarcaInputChange}
                                    placeholder="Buscar Ej: Adidas"
                                    className="combobox-input"
                                    onFocus={handleMarcaInputFocus}
                                />
                                {isMarcaDropdownOpen && (
                                    <ul className="combobox-dropdown">
                                        <button
                                            className="combobox-option combobox-option-reset"
                                            onClick={handleMarcaReset}
                                        >
                                            Todas las marcas
                                        </button>
                                        {filteredMarcaOptions.length > 0 ? (
                                            filteredMarcaOptions.map((marca) => (
                                                <li
                                                    key={marca}
                                                    onClick={() => handleMarcaSelect(marca)}
                                                    className="combobox-option"
                                                >
                                                    {marca}
                                                </li>
                                            ))
                                        ) : (
                                            inputMarcaValue && <li className="combobox-option no-match">Sin coincidencias</li>
                                        )}
                                    </ul>
                                )}
                                <button onClick={handleMarcaReset} className="reset-marca-btn" title="Limpiar filtro de marca">
                                    <VscDebugRestart size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filtro de Servicios y Capacidades */}
                    {Array.isArray(filtrosOpciones.extras) && filtrosOpciones.extras.length > 0 && (
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
                    )}
                </div>
            ) : (
                 !isLoading && <div className="filtros-desktop hiddenInMobile" style={{padding: '20px', textAlign: 'center'}}><p>No hay opciones de filtro disponibles en este momento.</p></div>
            )}
        </>
    );
};

export default FiltrosComponentDesktop;