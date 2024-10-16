import React, { useEffect, useState } from 'react'
import Proveedor from './Proveedor'

const ProveedoresList = ({ proveedores, filtros, setFiltros, filtrosOpciones }) => {

    const [filtrosMarca, setFiltrosMarca] = useState([]);
    const [filtrosTipo, setFitrosTipo] = useState([]);
    const [filtrosUbicacion, setFiltrosUbicacion] = useState([]);


    const [selectedMarca, setSelectedMarca] = useState('');
    const [searchedMarca, setSearchedMarca] = useState('');
    const [selectedTipo, setSelectedTipo] = useState('');
    const [selectedUbicacion, setSelectedUbicacion] = useState('');


    useEffect(() => {

        const filtrosTempTipo = filtrosOpciones.filter(filtro => filtro.tipo);
        setFitrosTipo(filtrosTempTipo);
        const filtrosTempUbicacion = filtrosOpciones.filter(filtro => filtro.ubicacion);
        setFiltrosUbicacion(filtrosTempUbicacion);
        const filtrosTempMarca = filtrosOpciones.filter(filtro => filtro.marca);
        setFiltrosMarca(filtrosTempMarca);


    }, [filtrosOpciones])


    return (
        <main className='proveedores-list-container'>
            <div className='filtros-desktop hiddenInMobile'>
                FiltrosDesktop
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