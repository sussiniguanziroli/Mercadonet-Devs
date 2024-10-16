import React, { useEffect, useState } from 'react'

const FiltrosComponent = ({ setIsMenuHidden, isMenuHidden, filtros, setFiltros, filtrosOpciones }) => {

    const [filtrosMarca, setFiltrosMarca] = useState([]);
    const [filtrosTipo, setFitrosTipo] = useState([]);
    const [filtrosUbicacion, setFiltrosUbicacion] = useState([]);


    const [selectedMarca, setSelectedMarca] = useState([]);
    const [searchedMarca, setSearchedMarca] = useState([]);
    const [selectedTipo, setSelectedTipo] = useState([]);
    const [selectedUbicacion, setSelectedUbicacion] = useState([]);


    useEffect(() => {

        const filtrosTempTipo = filtrosOpciones.filter(filtro => filtro.tipo);
        setFitrosTipo(filtrosTempTipo);
        const filtrosTempUbicacion = filtrosOpciones.filter(filtro => filtro.ubicacion);
        setFiltrosUbicacion(filtrosTempUbicacion);
        const filtrosTempMarca = filtrosOpciones.filter(filtro => filtro.marca);
        setFiltrosMarca(filtrosTempMarca);


    }, [filtrosOpciones])



    return (
        <main className={`main-filters-component ${isMenuHidden ? 'hidden' : 'visible'}`}>
            <button onClick={() => setIsMenuHidden(true)}>X</button>
            <p>Soy el menu de prueba</p>



        </main>
    )
}

export default FiltrosComponent