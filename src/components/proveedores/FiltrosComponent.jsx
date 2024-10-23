import React, { useEffect, useState } from 'react'
import { IoClose } from "react-icons/io5";


const FiltrosComponent = ({ setIsMenuHidden, filtrosOpciones, isMenuHidden, setSelectedMarca, setSelectedTipo, setSelectedUbicacion, selectedTipo, selectedMarca, selectedUbicacion }) => {

    const handleTipoChange = (e) => {
        setSelectedTipo(e.target.value);
    };

    const handleMarcaChange = (e) => {
        setSelectedMarca(e.target.value);
    };

    const handleUbicacionChange = (e) => {
        setSelectedUbicacion(e.target.value);
    };




    return (
        <main className={`main-filters-component ${isMenuHidden ? 'hidden' : 'visible'}`}>
            <div className='closebtn-div'>
                <button onClick={() => setIsMenuHidden(true)}><IoClose />
                </button>
            </div>
            <section className='actual-filters-mobile'>
                {/* Filtro de Tipo */}
                <div className="filtro-tipos">
                    <div className='tipo-boton'>
                        <h3>Tipos de proveedores</h3>
                        <button onClick={() => setSelectedTipo('')}>Limpiar</button>
                    </div>
                    <ul className='filtro-tipos-checkboxes'>
                        {filtrosOpciones.tipo.map((tipo) => (
                            <li key={tipo}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={tipo}
                                        checked={selectedTipo === tipo}
                                        onChange={handleTipoChange}
                                    />
                                    {tipo}
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
                    <select
                        value={selectedMarca}
                        onChange={handleMarcaChange}
                    >
                        <option value="">Todo</option>
                        {filtrosOpciones.marca.map((marca) => (
                            <option key={marca} value={marca}>
                                {marca}
                            </option>
                        ))}
                    </select>
                </div>
                <button className='readyBtn' onClick={() => setIsMenuHidden(true)}><p>Hecho</p>
                </button>
            </section>
        </main>
    )
}

export default FiltrosComponent