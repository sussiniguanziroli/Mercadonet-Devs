import React from 'react'

const Proveedor = ({proveedor}) => {
  return (
    <div className='proveedor-item'>
        <img src={proveedor.imagen} alt={proveedor.name} />
        <h2>{proveedor.nombre}</h2>
        <p>{proveedor.descripcion}</p>
    </div>
  )
}

export default Proveedor