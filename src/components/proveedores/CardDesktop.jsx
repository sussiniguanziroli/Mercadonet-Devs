import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'

const CardDesktop = ({proveedor}) => {
  return (
    <div> <div className='proveedor-item-desktop hiddenInMobile'>
    <div className='info-box'>
        <div className='title-img'>
            <img src={proveedor.imagen} alt={proveedor.name} />
            <div className='title-location'>
                <h2>{proveedor.nombre}</h2>
                <strong><IoLocationOutline className='icon' />
                    {proveedor.ubicacionDetalle}</strong>
            </div>
        </div>
        <p className='descripcion'>{proveedor.description}</p>
        <div className='proveedor-marcas'>
            <h4>Marcas:</h4>
            {proveedor.marca.map((marca) => <p>{marca},</p>)}
        </div>
    </div>
    <div className='buttons-box'>

    </div>
</div></div>
  )
}

export default CardDesktop