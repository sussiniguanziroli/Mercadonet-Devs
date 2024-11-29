import React, { useEffect, useState } from 'react'
import ProveedoresList from './ProveedoresList';
import FiltrosComponent from './FiltrosComponent';
import HeaderCustomProveedores from './HeaderCustomProveedores';
import NewsBanner from './NewsBanner';
import { db } from '../../firebase/config'
import { collection, query, getDocs } from "firebase/firestore";
import filtersIcons from '../proveedores/filtersIcons.json';
import { MdTune } from "react-icons/md";
import NewsCarousel from './NewsCarousel';





const Proveedores = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuHidden, setIsMenuHidden] = useState(true);
    const [proveedores, setProveedores] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedUbicacion, setSelectedUbicacion] = useState('');
    const [checkedServices, setCheckedServices] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState('');

    const [filtrosOpciones, setFiltrosOpciones] = useState({
        ubicacion: [],
        categoria: [],
        marca: [],
        servicios: [],
        extras: [],
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

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const q = query(collection(db, 'filtros'));
                const snapshot = await getDocs(q);

                let ubicacion = [];
                let categoria = [];
                let marca = [];
                let servicios = [];
                let extras = [];

                snapshot.docs.forEach(doc => {
                    const data = doc.data();

                    if (data.ubicacion) ubicacion = data.ubicacion;
                    if (data.categoria) categoria = data.categoria;
                    if (data.marca) marca = data.marca;
                    if (data.servicios) servicios = data.servicios;
                    if (data.extras) extras = data.extras;
                });

                setFiltrosOpciones({
                    ubicacion,
                    categoria,
                    marca,
                    servicios,
                    extras
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

    const filtrarProveedores = (proveedores, searchTerm, selectedMarca, selectedCategoria, selectedUbicacion) => {
        return proveedores.filter((proveedor) => {
            const cumpleCategorias =
                !selectedCategoria.length ||
                selectedCategoria.some((categoria) => proveedor.categoria.includes(categoria));

            const cumpleMarca = !selectedMarca || proveedor.marca.includes(selectedMarca);
            const cumpleUbicacion = !selectedUbicacion || proveedor.ubicacion === selectedUbicacion;
            const cumpleSearchTerm = !searchTerm || proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase());

            return cumpleCategorias && cumpleMarca && cumpleUbicacion && cumpleSearchTerm;
        });
    };

    const handleCategoriaClick = (categoria) => {
        setSelectedCategoria((prevSelectedCategorias) => {
            if (prevSelectedCategorias.includes(categoria)) {

                return prevSelectedCategorias.filter((cat) => cat !== categoria);
            } else {

                return [...prevSelectedCategorias, categoria];
            }
        });
    };


    // Filtrar los proveedores basados en los filtros seleccionados
    const proveedoresFiltrados = filtrarProveedores(proveedores, searchTerm, selectedMarca, selectedCategoria, selectedUbicacion)


    return (
        <div className='proveedores-desktop'>
            <HeaderCustomProveedores
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
                proveedores={proveedores}
                filtrosOpciones={filtrosOpciones}
                setSelectedMarca={setSelectedMarca}
                setSelectedCategoria={setSelectedCategoria}
                setSelectedUbicacion={setSelectedUbicacion} />
            <main className='main-proveedores'>

                <NewsCarousel />

                <div className='secondary-proveedores'>

                    <section className='proveedores-filter-section'>
                        <NewsBanner />

                        <div className='mobile-thumb-filters hiddenInDesktop'>
                            <div className="mobile-thumb-filters-btns-container">
                                {filtersIcons.map((filterIcon) => (
                                    <div
                                        key={filterIcon.filtro}
                                        className={`thumbFilter ${selectedCategoria.includes(filterIcon.filtro) ? "active" : ""}`}
                                        onClick={() => handleCategoriaClick(filterIcon.filtro)}
                                    >
                                        <div className="thumbFilter-icon">
                                            <img src={filterIcon.icon} alt={filterIcon.name} />
                                        </div>
                                        <p>{filterIcon.name}</p>
                                    </div>
                                ))}
                            </div>

                            <button className='filterBtn' onClick={openFilters}><MdTune className='icon' /> Filtrar</button>
                            {/* Menu desplegable en mobile */}
                            <FiltrosComponent setIsMenuHidden={setIsMenuHidden} isMenuHidden={isMenuHidden}
                                selectedCategoria={selectedCategoria}
                                filtrosOpciones={filtrosOpciones}
                                setSelectedMarca={setSelectedMarca}
                                setSelectedCategoria={setSelectedCategoria}
                                setSelectedUbicacion={setSelectedUbicacion}
                            />
                        </div>
                        <ProveedoresList
                            searchTerm={searchTerm}
                            proveedores={proveedoresFiltrados}
                            filtrosOpciones={filtrosOpciones}
                            setSelectedMarca={setSelectedMarca}
                            setSelectedCategoria={setSelectedCategoria}
                            setSelectedUbicacion={setSelectedUbicacion}
                            selectedCategoria={selectedCategoria}
                            selectedUbicacion={selectedUbicacion}
                            selectedMarca={selectedMarca}
                            setCheckedServices={setCheckedServices}
                            checkedServices={checkedServices}
                            setSelectedExtras={setSelectedExtras}
                            selectedExtras={selectedExtras}
                        />

                    </section>


                </div>
            </main>
        </div>
    )
}

export default Proveedores