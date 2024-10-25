import React from 'react'
import { IoLocationOutline } from "react-icons/io5";


const Proveedor = ({ proveedor }) => {

    const maxLength = 75;
    const truncatedDescription = proveedor.descripcion.length > maxLength
        ? proveedor.descripcion.slice(0, maxLength) + "...[ver más]"
        : proveedor.descripcion;

    return (
        <>
            {/* CARDS MOBILE */}
            <div className='proveedor-item hiddenInDesktop'>
                <img src={proveedor.imagen} alt={proveedor.name} />
                <div>
                    <h2>{proveedor.nombre}</h2>
                    <strong><IoLocationOutline className='icon' />
                        {proveedor.ubicacionDetalle}</strong>
                    
                </div>
                <p className='descripcion'>{truncatedDescription}</p>
                <div className='proveedor-marcas'>
                    <h4>Marcas:</h4>
                    {proveedor.marca.map((marca) => <p>{marca},</p>)}
                </div>
                <button>Ver Detalles</button>
            </div>

            {/* CARDS DESKTOP */}
            <div className='proveedor-item-desktop hiddenInMobile'>
                <div className='info-box'>
                    <div className='title-img'>
                        <img src={proveedor.imagen} alt={proveedor.name} />
                        <div className='title-location'>
                            <h2>{proveedor.nombre}</h2>
                            <strong><IoLocationOutline className='icon' />
                                {proveedor.ubicacionDetalle}</strong>
                        </div>
                    </div>
                    <p className='descripcion'>{truncatedDescription}</p>
                    <div className='proveedor-marcas'>
                        <h4>Marcas:</h4>
                        {proveedor.marca.map((marca) => <p>{marca},</p>)}
                    </div>
                </div>
                <div className='buttons-box'>

                </div>
            </div>
        </>
    )
}

export default Proveedor