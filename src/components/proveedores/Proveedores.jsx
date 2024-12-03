import React, { useEffect, useState } from 'react'
import ProveedoresList from './ProveedoresList';
import FiltrosComponent from './FiltrosComponent';
import HeaderCustomProveedores from './HeaderCustomProveedores';
import NewsBanner from './NewsBanner';

import filtersIcons from '../proveedores/filtersIcons.json';
import { MdTune } from "react-icons/md";
import NewsCarousel from './NewsCarousel';
import { useFiltersContext } from '../../context/FiltersContext';
import PillFilter from './PillFilter';




const Proveedores = () => {
    const {
        searchTerm,
        proveedoresFiltrados,
        filtrosOpciones,
        updateFilters,
        selectedCategoria,
        selectedUbicacion,
        selectedMarca,
        checkedServices,
        selectedExtras,
        isLoading,
    } = useFiltersContext();

    const [isMenuHidden, setIsMenuHidden] = useState(true);

    const openFilters = () => {
        setIsMenuHidden(false);
    }



    const handleCategoriaClick = (categoria) => {

        updateFilters("categoria", (prevSelectedCategorias) => {
            if (prevSelectedCategorias.includes(categoria)) {

                return prevSelectedCategorias.filter((cat) => cat !== categoria);
            } else {

                return [...prevSelectedCategorias, categoria];
            }
        });
    };




    return (
        <div className='proveedores-desktop'>
            <HeaderCustomProveedores />
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
                            />
                        </div>
                        <ProveedoresList />

                    </section>


                </div>
            </main>
        </div>
    )
}

export default Proveedores