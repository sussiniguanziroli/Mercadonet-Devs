import React, { useEffect, useState } from 'react'
import ProveedoresList from './ProveedoresList';
import FiltrosComponent from './FiltrosComponent';
import HeaderCustomProveedores from './HeaderCustomProveedores';
import SearchBox from './SearchBox';
import NewsBanner from './NewsBanner';
import { db } from '../../firebase/config'
import { collection, query, getDocs } from "firebase/firestore";

const Proveedores = () => {

    const [isMenuHidden, setIsMenuHidden] = useState(true);
    const [proveedores, setProveedores] = useState([]);
    const [selectedTipo, setSelectedTipo] = useState('');
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedUbicacion, setSelectedUbicacion] = useState('');

    const [filtrosOpciones, setFiltrosOpciones] = useState([]);


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

    //Obtener filtros desde firebase
    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const q = query(collection(db, 'filtros'));
                const snapshot = await getDocs(q);
                const opciones_filtros = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFiltrosOpciones(opciones_filtros);
            } catch (error) {
                console.error("Error obteniendo los proveedores: ", error);
            }
        };

        fetchFiltros();
    }, []);

    const openFilters = () => {
        setIsMenuHidden(false);
    }

    const filtrarProveedores = (proveedores, selectedMarca, selectedTipo, selectedUbicacion) => {
        return proveedores.filter(proveedor => {
            const cumpleTipo = !selectedTipo || proveedor.Tipo.includes(selectedTipo);
            const cumpleMarca = !selectedMarca || proveedor.marcas.includes(selectedMarca);
            const cumpleUbicacion = !selectedUbicacion || proveedor.contacto?.ubicacion === selectedUbicacion;

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

                        <div>
                            <button className='filterBtn hiddenInDesktop' onClick={openFilters}>Filtrar</button>
                            {/* Menu desplegable en mobile */}
                            <FiltrosComponent setIsMenuHidden={setIsMenuHidden} isMenuHidden={isMenuHidden}
                                filtrosOpciones={filtrosOpciones}
                                setSelectedMarca={setSelectedMarca}
                                setSelectedTipo={setSelectedTipo}
                                setSelectedUbicacion={setSelectedUbicacion} />
                        </div>
                        <ProveedoresList proveedores={proveedores}
                            filtrosOpciones={filtrosOpciones}
                            setSelectedMarca={setSelectedMarca}
                            setSelectedTipo={setSelectedTipo}
                            setSelectedUbicacion={setSelectedUbicacion} />

                    </section>


                </div>
            </main>
        </div>
    )
}

export default Proveedores