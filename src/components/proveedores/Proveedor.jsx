import React, { useEffect, useState } from 'react'
import CardDesktop from './CardDesktop';
import CardMobile from './CardMobile';
import CardMobileV2 from './CardMobileV2';
import CardDesktopV2 from './CardDesktopV2';
import { useFiltersContext } from '../../context/FiltersContext';


const Proveedor = ({ }) => {
    const { proveedoresFiltrados } = useFiltersContext();

    return (
        <>
            <div className='proveedores-list-grid'>
                {proveedoresFiltrados.map((proveedor) => {
                    // Decidimos si mostrar CardProductos o CardHistoria
                    const CardComponent =
                        proveedor.cardType === "cardProductos" ? CardMobileV2 : CardMobile;

                    return <CardComponent key={proveedor.id} proveedor={proveedor} />;
                })}
            </div>

            <div className='proveedores-list-list'>
                {proveedoresFiltrados.map((proveedor) => {
                    // Decidimos si mostrar CardProductos o CardHistoria
                    const CardComponent =
                        proveedor.cardType === "cardProductos" ? CardDesktopV2 : CardDesktop;

                    return <CardComponent key={proveedor.id} proveedor={proveedor} />;
                })}
            </div>
        </>

    )
}

export default Proveedor