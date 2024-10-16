import React from 'react'

const Proveedor = ({proveedor}) => {
  return (
    <div className='proveedor-item'>
        <img src={proveedor.image} alt={proveedor.name} />
        <h2>{proveedor.name}</h2>
        <p>{proveedor.descripcion}</p>
    </div>
  )
}

export default Proveedor