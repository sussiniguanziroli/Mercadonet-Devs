import React, { useEffect, useState } from 'react'
import ProveedoresList from './ProveedoresList';
import FiltrosComponent from './FiltrosComponent';
import HeaderCustomProveedores from './HeaderCustomProveedores';
import SearchBox from './SearchBox';
import NewsBanner from './NewsBanner';
import { db } from '../../firebase/config'
import { collection, query, getDocs } from "firebase/firestore";
import filtersIcons from '../proveedores/filtersIcons.json'
import { MdTune } from "react-icons/md";





const Proveedores = () => {

    const [isMenuHidden, setIsMenuHidden] = useState(true);
    const [proveedores, setProveedores] = useState([]);
    const [selectedTipo, setSelectedTipo] = useState('');
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedUbicacion, setSelectedUbicacion] = useState('');

    const [filtrosOpciones, setFiltrosOpciones] = useState({
        ubicacion: [],
        tipo: [],
        marca: []
    });



    console.log("filtros opciones", filtrosOpciones)


    // Obtener proveedores desde Firebase
    useEffect(() => {
        const obtenerProveedores = async () => {
            try {
                const q = query(collection(db, 'proveedores'));
                const snapshot = await getDocs(q);
                const proveedoresFirebase = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProveedores(proveedoresFirebase);
            } catch (error) {
                console.error("Error obteniendo los proveedores: ", error);
            }
        };

        obtenerProveedores();
    }, []);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const q = query(collection(db, 'filtros'));
                const snapshot = await getDocs(q);

                // Creamos objetos vacíos para cada filtro
                let ubicacion = [];
                let tipo = [];
                let marca = [];

                // Iteramos sobre los documentos obtenidos desde Firebase
                snapshot.docs.forEach(doc => {
                    const data = doc.data();

                    // Llenamos los arrays correspondientes según el contenido
                    if (data.ubicacion) ubicacion = data.ubicacion;
                    if (data.tipo) tipo = data.tipo;
                    if (data.marca) marca = data.marca;
                });

                // Establecemos el estado con los tres arrays
                setFiltrosOpciones({
                    ubicacion,
                    tipo,
                    marca
                });
            } catch (error) {
                console.error("Error obteniendo los filtros: ", error);
            }
        };

        fetchFiltros();
    }, []);

    const openFilters = () => {
        setIsMenuHidden(false);
    }

    const filtrarProveedores = (proveedores, selectedMarca, selectedTipo, selectedUbicacion) => {
        return proveedores.filter(proveedor => {
            const cumpleTipo = !selectedTipo || proveedor.tipo.includes(selectedTipo);
            const cumpleMarca = !selectedMarca || proveedor.marca.includes(selectedMarca);
            const cumpleUbicacion = !selectedUbicacion || proveedor.ubicacion === selectedUbicacion;

            return cumpleTipo && cumpleMarca && cumpleUbicacion;
        });
    };


    // Filtrar los proveedores basados en los filtros seleccionados
    const proveedoresFiltrados = filtrarProveedores(proveedores, selectedMarca, selectedTipo, selectedUbicacion)


    return (
        <div className='proveedores-desktop'>
            <HeaderCustomProveedores />
            <main className='main-proveedores'>
                <SearchBox />
                <div className='secondary-proveedores'>

                    <section className='proveedores-filter-section'>
                        <NewsBanner />

                        <div className='mobile-thumb-filters hiddenInDesktop'>
                            <div className='mobile-thumb-filters-btns-container'>
                                {filtersIcons.map((filterIcon => <div className='thumbFilter' onClick={() => setSelectedTipo(filterIcon.name)}>
                                    <div className='thumbFilter-icon'>
                                        <img src={filterIcon.icon} alt={filterIcon.name} />
                                    </div>
                                    <p>{filterIcon.name}</p>
                                </div>))}
                            </div>
                            <button className='filterBtn' onClick={openFilters}><MdTune className='icon' /> Filtrar</button>
                            {/* Menu desplegable en mobile */}
                            <FiltrosComponent setIsMenuHidden={setIsMenuHidden} isMenuHidden={isMenuHidden}
                                filtrosOpciones={filtrosOpciones}
                                setSelectedMarca={setSelectedMarca}
                                setSelectedTipo={setSelectedTipo}
                                setSelectedUbicacion={setSelectedUbicacion}
                            />
                        </div>
                        <ProveedoresList proveedores={proveedoresFiltrados}
                            filtrosOpciones={filtrosOpciones}
                            setSelectedMarca={setSelectedMarca}
                            setSelectedTipo={setSelectedTipo}
                            setSelectedUbicacion={setSelectedUbicacion}
                            selectedTipo={selectedTipo}
                            selectedUbicacion={selectedUbicacion}
                            selectedMarca={selectedMarca} />

                    </section>


                </div>
            </main>
        </div>
    )
}

export default Proveedores