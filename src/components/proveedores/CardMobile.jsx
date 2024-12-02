import React from 'react'
import { IoLocationOutline } from 'react-icons/io5';

const CardMobile = ({proveedor}) => {

    const maxLength = 75;
    const truncatedDescription = proveedor.descripcion.length > maxLength
        ? proveedor.descripcion.slice(0, maxLength) + "...[ver más]"
        : proveedor.descripcion;

    const marcasLimitadas = proveedor.marca.slice(0, 5);




  return (
   
   <div className='proveedor-item hiddenInDesktop'>
   <img src={proveedor.imagen} alt={proveedor.name} />
   <div className='titulos'>
       <h2>{proveedor.nombre}</h2>
       <strong><IoLocationOutline className='icon' />
           {proveedor.ubicacionDetalle}</strong>
       <p className='descripcion'>{truncatedDescription}</p>
       <div className='proveedor-marcas'>
           <h4>Marcas:</h4>
           {marcasLimitadas.map((marcas) => <p>{marcas},</p>)}
       </div>
   </div>


   <button>Ver Detalles</button>
</div>
  )
}

export default CardMobile