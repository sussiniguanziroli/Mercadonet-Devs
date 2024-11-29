import React, { useEffect, useState } from 'react'
import Proveedor from './Proveedor'
import { ScaleLoader } from 'react-spinners';
import { NavLink } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ProveedoresList = ({ proveedores, filtrosOpciones, setSelectedMarca, setSelectedCategoria, setSelectedUbicacion, selectedCategoria, selectedMarca, selectedUbicacion, searchTerm, checkedServices, setCheckedServices, selectedExtras, setSelectedExtras }) => {

    const [inputValue, setInputValue] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(filtrosOpciones.marca || []);

    useEffect(() => {
        setFilteredOptions(filtrosOpciones.marca || []);
    }, [filtrosOpciones.marca]);

    const handleCategoriaChange = (categoria) => {
        setSelectedCategoria((prev) =>
            prev.includes(categoria)
                ? prev.filter((item) => item !== categoria)
                : [...prev, categoria]
        );
    };

    const handleMarcaChange = (e) => {
        const value = e.target.value;
        setInputValue(value); // Actualiza el valor del input
        setSelectedMarca(value); // Actualiza el estado superior con la marca seleccionada

        // Filtra las opciones basándose en lo que se escribe en el input
        const filtered = filtrosOpciones.marca.filter((marca) =>
            marca.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
    };

    const handleExtrasChange = (e) => {
        setSelectedExtras(e.target.value);
    };


    const handleUbicacionChange = (e) => {
        setSelectedUbicacion(e.target.value);
    };

    const handleServicesChange = (servicio) => {
        setCheckedServices((prevState) =>
            prevState.includes(servicio)
                ? prevState.filter((item) => item !== servicio) // Elimina el servicio si está activado
                : [...prevState, servicio] // Agrega el servicio si está desactivado
        );
    };

    const isFulfillmentActive = checkedServices.includes('Logística/Transporte') && checkedServices.includes('Almacenamiento');



    return (
        <>
            <section className='proveedores-page-header hiddenInMobile'>
                <NavLink to='/'><p>Home / Proveedores</p></NavLink>
                <>
                    {proveedores.length > 0 ? (
                        proveedores.length === 1 ? (
                            <p className='texto-proveedores-encontrados'>{proveedores.length} proveedor encontrado.</p>
                        ) : (
                            <p className='texto-proveedores-encontrados'>{proveedores.length} proveedores encontrados.</p>
                        )
                    ) : (selectedUbicacion || selectedMarca || selectedCategoria.length > 0 || searchTerm ? (
                        <div className='no-criteria'>
                            <p>No se ha encontrado ningún proveedor.</p>
                        </div>
                    ) : null)}
                </>
            </section>

            <main className='proveedores-list-container'>
                <div className='filtros-desktop hiddenInMobile'>
                    {/* ACA IRIAN ESOS FILTROS DESKTOP */}
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
                                            onChange={() => handleServicesChange(servicio)}
                                        />
                                        <span className="custom-switch"></span>
                                        {servicio}
                                        {isFulfillmentActive && (servicio === 'Logística/Transporte') && (
                                            <span className="fulfillment-badge"><FaStar />
                                                Fulfillment</span>
                                        )}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Filtro de Categorias */}
                    <div className="filtro-categorias">
                        <div className='tipo-boton'>
                            <h3>Categoría del Proveedor</h3>
                            <button onClick={() => setSelectedCategoria('')}>Limpiar</button>
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
                                <option className='ubicacion-option' key={ubicacion} value={ubicacion}>
                                    {ubicacion}
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* Filtro de Marca */}
                    <div className="filtro-marca">
                        <h3>Marca</h3>
                        <div className='combobox'>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={handleMarcaChange}
                                placeholder="Buscar Ej: Adidas"
                                className="combobox-input"
                            />
                            <select value={inputValue} onChange={handleMarcaChange}>
                                <option value=""></option>
                                {filteredOptions.map((marca) => (
                                    <option key={marca} value={marca}>
                                        {marca}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filtro de Ubicación */}
                    <div className="filtro-ubicacion">
                        <h3>Servicios y Capacidades</h3>
                        <select
                            value={selectedExtras}
                            onChange={handleExtrasChange}
                        >
                            <option value="">Todo</option>
                            {filtrosOpciones.extras.map((extra) => (
                                <option className='ubicacion-option' key={extra} value={extra}>
                                    {extra}
                                </option>
                            ))}
                        </select>
                    </div>


                </div>
                <div className='proveedores-list'>
                    {proveedores.length > 0 ? (


                        <div className='proveedores-list-grid'>
                            {proveedores.map((proveedor) =>

                                <Proveedor proveedor={proveedor} key={proveedor.id} />

                            )}
                        </div>


                    ) : selectedUbicacion || selectedMarca || selectedCategoria.length > 0 || searchTerm ? (
                        <div className='no-criteria'><p>No se ha encontrado ningun proveedor.</p></div>
                    ) : (
                        <div className='loader'>
                            <div className='hiddenInMobile'>
                                <ScaleLoader
                                    color="#FF7F00"
                                    height={200}
                                    margin={7}
                                    radius={8}
                                    width={30}
                                />
                            </div>
                            <div className='hiddenInDesktop'>
                                <ScaleLoader
                                    color="#FF7F00"
                                    height={50}
                                    margin={2}
                                    radius={8}
                                    width={7}
                                />
                            </div>
                        </div>
                    )}





                </div>



            </main>
        </>
    )
}

export default ProveedoresList