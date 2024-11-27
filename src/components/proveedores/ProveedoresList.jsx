import React, { useState } from 'react'
import Proveedor from './Proveedor'
import { ScaleLoader } from 'react-spinners';
import { NavLink } from 'react-router-dom';

const ProveedoresList = ({ proveedores, filtrosOpciones, setSelectedMarca, setSelectedCategoria, setSelectedUbicacion, selectedCategoria, selectedMarca, selectedUbicacion, searchTerm }) => {


    const handleCategoriaChange = (categoria) => {
        setSelectedCategoria((prev) =>
            prev.includes(categoria)
                ? prev.filter((item) => item !== categoria)
                : [...prev, categoria]
        );
    };

    const handleMarcaChange = (e) => {
        setSelectedMarca(e.target.value);
    };

    const handleUbicacionChange = (e) => {
        setSelectedUbicacion(e.target.value);
    };




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
                    {/* Filtro de Tipo */}
                    <div className="filtro-tipos">
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
                        <select
                            value={selectedMarca}
                            onChange={handleMarcaChange}
                        >
                            <option value="">Todas</option>
                            {filtrosOpciones.marca.map((marca) => (
                                <option className='marca-option' key={marca} value={marca}>
                                    {marca}
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