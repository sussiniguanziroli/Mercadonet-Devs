import React, { useState } from 'react'
import ProveedoresListContainer from './ProveedoresContainer';
import FiltrosComponent from './FiltrosComponent';
import HeaderCustomProveedores from './HeaderCustomProveedores';
import SearchBox from './SearchBox';
import NewsBanner from './NewsBanner';
import { db } from '../../firebase/config'
import { collection, query, getDocs } from "firebase/firestore";

const Proveedores = () => {

    const [isMenuHidden, setIsMenuHidden] = useState(true);
    const [proveedores, setProveedores] = useState([]);

    const [filtrosOpciones, setFiltrosOpciones] = useState({
        marca: [],
        tipo: [],
        ubicacion: []
    });

    // Estado de los filtros seleccionados
    const [filtros, setFiltros] = useState({
        tipos: [],
        ubicacion: '',
        marca: ''
    });


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
                const doc = await db.collection('filtros').doc('ToV01af3d4m6aVPZi3jf').get();
                if (doc.exists) {
                    const data = doc.data();
                    setFiltrosOpciones(data.opciones_filtros);
                } else {
                    console.log("El documento no existe");
                }
            } catch (error) {
                console.error("Error al obtener los filtros:", error);
            }
        };

        fetchFiltros();
    }, []);

    const openFilters = () => {
        setIsMenuHidden(false);
    }


    return (
        <div className='proveedores-desktop'>
            <HeaderCustomProveedores />
            <main className='main-proveedores'>
                <SearchBox />
                <div className='secondary-proveedores'>
                    
                    <section className='proveedores-filter-section'>
                        <NewsBanner/>

                        <div>
                            <button className='filterBtn hiddenInDesktop' onClick={openFilters}>Filtrar</button>
                            {/* Menu desplegable en mobile */}
                            <FiltrosComponent setIsMenuHidden={setIsMenuHidden} isMenuHidden={isMenuHidden} />
                        </div>
                    </section>
                    <div>
                        <ProveedoresListContainer />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Proveedores