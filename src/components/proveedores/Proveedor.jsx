import React from 'react'

const Proveedor = ({ proveedor }) => {

    const maxLength = 75;
    const truncatedDescription = proveedor.descripcion.length > maxLength 
    ? proveedor.descripcion.slice(0, maxLength) + "...[ver más]" 
    : proveedor.descripcion;

    return (
        <div className='proveedor-item'>
            <img src={proveedor.imagen} alt={proveedor.name} />
            <h2>{proveedor.nombre}</h2>
            <strong>{proveedor.ubicacionDetalle}</strong>
            <p className='descripcion'>{truncatedDescription}</p>
            <div className='proveedor-marcas'>
                <h4>Marcas:</h4>
                {proveedor.marca.map((marca)=> <p>{marca},</p>)}
            </div>
            <button>Ver Detalles</button>
        </div>
    )
}

export default Proveedor