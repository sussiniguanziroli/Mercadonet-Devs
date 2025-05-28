// src/components/proveedores/FiltrosComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useFiltersContext } from '../../context/FiltersContext';
import { VscDebugRestart } from 'react-icons/vsc';
import { FaFilter, FaStar } from 'react-icons/fa';
import { MdFilterAltOff } from "react-icons/md";

const FiltrosComponent = ({ isMenuHidden, setIsMenuHidden }) => {
    const {
        filtrosOpciones, // This will have: { ubicaciones, categorias, marcas, servicios, extras, pproductos }
        selectedCategoria,
        selectedUbicacion,
        selectedMarca,
        updateFilters,
        selectedExtras,
        checkedServices,
        isLoading, 
        selectedPProductos 
    } = useFiltersContext();

    const [showMoreCategorias, setShowMoreCategorias] = useState(false);
    const [inputMarcaValue, setInputMarcaValue] = useState(selectedMarca || "");
    const [filteredMarcaOptions, setFilteredMarcaOptions] = useState([]);
    const [isMarcaDropdownOpen, setIsMarcaDropdownOpen] = useState(false);
    const marcaDropdownRef = useRef(null);

    const visibleCountCategorias = 6;

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
        const newCategorias = Array.isArray(selectedCategoria) && selectedCategoria.includes(categoria)
            ? selectedCategoria.filter((item) => item !== categoria)
            : [...(Array.isArray(selectedCategoria) ? selectedCategoria : []), categoria];
        updateFilters("categoria", newCategorias);
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

    const clearCategorias = () => {
        updateFilters("categoria", []);
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

    const handleResetFilters = () => {
        updateFilters("pproductos", []);
        updateFilters("servicio", []);
        updateFilters("extras", '');
        updateFilters("ubicacion", "");
        handleMarcaReset(); 
        updateFilters("categoria", []);
    };

    const isFulfillmentActive =
        Array.isArray(checkedServices) &&
        checkedServices.includes("Logística/Transporte") &&
        checkedServices.includes("Almacenamiento");

    if (isLoading) {
        return (
            <main className={`main-filters-component ${isMenuHidden ? 'hidden' : 'visible'}`}>
                <div className='closebtn-div'>
                    <button onClick={() => setIsMenuHidden(true)} aria-label="Cerrar filtros"><IoClose /></button>
                </div>
                <p style={{padding: '20px', textAlign: 'center'}}>Cargando filtros...</p>
            </main>
        );
    }

    const anyFilterOptionsAvailable = 
        filtrosOpciones.servicios?.length > 0 || 
        filtrosOpciones.categorias?.length > 0 || 
        filtrosOpciones.ubicaciones?.length > 0 || 
        filtrosOpciones.marcas?.length > 0 || 
        filtrosOpciones.extras?.length > 0 ||
        filtrosOpciones.pproductos?.length > 0;

    return (
        <main className={`main-filters-component ${isMenuHidden ? 'hidden' : 'visible'}`}>
            <div className='closebtn-div'>
                <button onClick={() => setIsMenuHidden(true)} aria-label="Cerrar filtros">
                    <IoClose />
                </button>
            </div>
            <div className='utils-box'>
                <p><FaFilter /> Filtrar</p>
                <button onClick={handleResetFilters}><MdFilterAltOff /> Restablecer</button>
            </div>
            <section className='actual-filters-mobile'>
                

                {/* Proveedores de SERVICIOS */}
                {Array.isArray(filtrosOpciones.servicios) && filtrosOpciones.servicios.length > 0 ? (
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
                ) : !isLoading && <p className='filter-placeholder'>Opciones de servicios no disponibles.</p>}
                
                {/* Filtro de Categoría */}
                {Array.isArray(filtrosOpciones.categorias) && filtrosOpciones.categorias.length > 0 ? (
                    <div className="filtro-tipos">
                        <div className="tipo-boton">
                            <h3>Categoría del Proveedor</h3>
                            <button onClick={clearCategorias}>Limpiar</button>
                        </div>
                        <ul className={`filtro-tipos-checkboxes ${showMoreCategorias ? 'expanded' : ''}`}>
                            {filtrosOpciones.categorias.slice(0, showMoreCategorias ? filtrosOpciones.categorias.length : visibleCountCategorias).map((categoria) => (
                                <li key={categoria}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={categoria}
                                            checked={Array.isArray(selectedCategoria) && selectedCategoria.includes(categoria)}
                                            onChange={() => handleCategoriaChange(categoria)}
                                            className="hidden-checkbox"
                                        />
                                        <span className="custom-checkbox"></span>
                                        {categoria}
                                    </label>
                                </li>
                            ))}
                        </ul>
                        {filtrosOpciones.categorias.length > visibleCountCategorias && (
                            <button
                                className="toggle-more-btn"
                                onClick={() => setShowMoreCategorias((prev) => !prev)}
                            >
                                {showMoreCategorias ? 'Mostrar menos -' : `Mostrar más (${filtrosOpciones.categorias.length - visibleCountCategorias}) +`}
                            </button>
                        )}
                    </div>
                ) : !isLoading && <p className='filter-placeholder'>Opciones de categoría no disponibles.</p>}

                 {Array.isArray(filtrosOpciones.ubicaciones) && filtrosOpciones.ubicaciones.length > 0 ? (
                    <div className="filtro-ubicacion">
                        <h3>Ubicación (Provincia)</h3>
                        <select value={selectedUbicacion} onChange={handleUbicacionChange}>
                            <option value="">Todas</option>
                            {filtrosOpciones.ubicaciones.map((ubicacion) => (
                                <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                            ))}
                        </select>
                    </div>
                ) : !isLoading && <p className='filter-placeholder'>Opciones de ubicación no disponibles.</p>}

                {Array.isArray(filtrosOpciones.marcas) && filtrosOpciones.marcas.length > 0 ? (
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
                                    <button className="combobox-option combobox-option-reset" onClick={handleMarcaReset}>
                                        Todas las marcas
                                    </button>
                                    {filteredMarcaOptions.length > 0 ? (
                                        filteredMarcaOptions.map((marca) => (
                                            <li key={marca} onClick={() => handleMarcaSelect(marca)} className="combobox-option">
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
                ) : !isLoading && <p className='filter-placeholder'>Opciones de marca no disponibles.</p>}

                {Array.isArray(filtrosOpciones.extras) && filtrosOpciones.extras.length > 0 ? (
                    <div className="filtro-ubicacion"> 
                        <h3>Servicios y Capacidades</h3>
                        <select value={selectedExtras} onChange={handleExtrasChange}>
                            <option value="">Todo</option>
                            {filtrosOpciones.extras.map((extra) => (
                                <option className="ubicacion-option" key={extra} value={extra}>
                                    {extra}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : !isLoading && <p className='filter-placeholder'>Opciones de servicios/capacidades no disponibles.</p>}
                
                {!anyFilterOptionsAvailable && !isLoading && (
                    <p style={{padding: '20px', textAlign: 'center'}}>No hay filtros disponibles en este momento.</p>
                )}

                <button className='readyBtn' onClick={() => setIsMenuHidden(true)}>
                    <p>Hecho</p>
                </button>
            </section>
        </main>
    );
};

export default FiltrosComponent;
