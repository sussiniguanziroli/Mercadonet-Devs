import React, { useEffect, useState } from 'react'

const FiltrosComponent = ({ setIsMenuHidden, filtrosOpciones, isMenuHidden, setSelectedMarca, setSelectedTipo, setSelectedUbicacion }) => {

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
            <div>
                <button onClick={() => setIsMenuHidden(true)}>X</button>
            </div>
            <section className='actual-filters-mobile'>
                <h3>Filtrar por tipo</h3>
                <select onChange={handleTipoChange}>
                    <option value="">Todos los tipos</option>
                    {filtrosOpciones.map(filtro => (
                        filtro.tipo && filtro.tipo.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))
                    ))}
                </select>

                <h3>Filtrar por marca</h3>
                <select onChange={handleMarcaChange}>
                    <option value="">Todas las marcas</option>
                    {filtrosOpciones.map(filtro => (
                        filtro.marca && filtro.marca.map(marca => (
                            <option key={marca} value={marca}>{marca}</option>
                        ))
                    ))}
                </select>

                <h3>Filtrar por ubicación</h3>
                <select onChange={handleUbicacionChange}>
                    <option value="">Todas las ubicaciones</option>
                    {filtrosOpciones.map(filtro => (
                        filtro.ubicacion && filtro.ubicacion.map(ubicacion => (
                            <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                        ))
                    ))}
                </select>
            </section>
        </main>
    )
}

export default FiltrosComponent