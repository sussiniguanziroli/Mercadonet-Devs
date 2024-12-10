import React, { useEffect, useRef, useState } from 'react'
import Proveedor from './Proveedor'
import { ScaleLoader } from 'react-spinners';
import { NavLink } from 'react-router-dom';
import FiltrosComponentDesktop from './FiltrosComponentDesktop';
import { useFiltersContext } from '../../context/FiltersContext';
import PillFilter from './PillFilter';
import CardMobile from './CardMobile';
import CardDesktop from './CardDesktop';
import SkeletonLoader from './assets/SkeletonLoader';
import { Skeleton, Box } from '@mui/material';
import SkeletonFilterLoader from './assets/SkeletonFilterLoader';
import SkeletonMobileCardLoader from './assets/SkeletonMobileCardLoader';



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
                {filtrosOpciones.pproductos.length > 0 ? (
                    <FiltrosComponentDesktop />
                ) : (
                    <div className='skeleton-filter-loader hiddenInMobile'>
                        <SkeletonFilterLoader />
                    </div>
                )}

                <div className='proveedores-list'>
                    <>
                        {filtrosOpciones.pproductos.length > 0 ? (
                            <PillFilter />
                        ) : (
                            <div></div>
                        )}
                        {proveedoresFiltrados.length > 0 ? (

                            <Proveedor />

                        ) : selectedUbicacion || selectedMarca || selectedCategoria.length > 0 || searchTerm ? (
                            <div className='no-criteria'><p>No se ha encontrado ningun proveedor.</p></div>
                        ) : (
                            <div className='loader'>
                                <div className='loader-box hiddenInMobile'>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            maxWidth: '2400px',
                                            margin: '0 auto',
                                            padding: '0 16px',
                                        }}
                                    >
                                        <SkeletonLoader />
                                    </Box>
                                </div>
                                <div className='mobile-loader-box hiddenInDesktop'>
                                   <SkeletonMobileCardLoader />
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