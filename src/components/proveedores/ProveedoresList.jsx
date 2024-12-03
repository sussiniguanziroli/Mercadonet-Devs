import React, { useEffect, useRef, useState } from 'react'
import Proveedor from './Proveedor'
import { ScaleLoader } from 'react-spinners';
import { NavLink } from 'react-router-dom';
import FiltrosComponentDesktop from './FiltrosComponentDesktop';
import { useFiltersContext } from '../../context/FiltersContext';
import PillFilter from './PillFilter';


const ProveedoresList = ({ }) => {

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
    } = useFiltersContext();





    return (
        <>
            <section className='proveedores-page-header hiddenInMobile'>
                <NavLink to='/'><p>Home / Proveedores</p></NavLink>
                <>
                    {proveedoresFiltrados.length > 0 ? (
                        proveedoresFiltrados.length === 1 ? (
                            <p className='texto-proveedores-encontrados'>{proveedoresFiltrados.length} proveedor encontrado.</p>
                        ) : (
                            <p className='texto-proveedores-encontrados'>{proveedoresFiltrados.length} proveedores encontrados.</p>
                        )
                    ) : (selectedUbicacion || selectedMarca || selectedCategoria.length > 0 || searchTerm ? (
                        <div className='no-criteria'>
                            <p>No se ha encontrado ningún proveedor.</p>
                        </div>
                    ) : null)}
                </>
            </section>

            <main className='proveedores-list-container'>
                <FiltrosComponentDesktop />
                <div className='proveedores-list'>
                    <>
                        <PillFilter />
                        {proveedoresFiltrados.length > 0 ? (


                            <div className='proveedores-list-grid'>
                                {proveedoresFiltrados.map((proveedor) =>

                                    <Proveedor proveedor={proveedor} key={proveedor.id} />

                                )}
                            </div>


                        ) : selectedUbicacion || selectedMarca || selectedCategoria.length > 0 || searchTerm ? (
                            <div className='no-criteria'><p>No se ha encontrado ningun proveedor.</p></div>
                        ) : (
                            <div className='loader'>
                                <div className='hiddenInMobile'>
                                    <ScaleLoader
                                        color="#FF7F00"
                                        height={100}
                                        margin={7}
                                        radius={8}
                                        width={15}
                                    />
                                </div>
                                <div className='hiddenInDesktop'>
                                    <ScaleLoader
                                        color="#FF7F00"
                                        height={50}
                                        margin={2}
                                        radius={8}
                                        width={7}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                </div>

            </main>

        </>
    )
}

export default ProveedoresList