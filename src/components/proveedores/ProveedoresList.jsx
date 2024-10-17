import React, { useEffect, useState } from 'react'
import Proveedor from './Proveedor'

const ProveedoresList = ({ proveedores,filtrosOpciones, setSelectedMarca, setSelectedTipo, setSelectedUbicacion }) => {

    console.log('proveedores', proveedores)

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
        <main className='proveedores-list-container'>
            <div className='filtros-desktop hiddenInMobile'>
                {/* ACA IRIAN ESOS FILTROS DESKTOP */}
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

            </div>
            <div className='proveedores-list'>


                {proveedores.map((proveedor =>

                    <Proveedor proveedor={proveedor} key={proveedor.id} />

                ))}


            </div>



        </main>
    )
}

export default ProveedoresList