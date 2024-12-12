import React from 'react'

const Tags = ({proveedor}) => {
  return (
    <>
    {proveedor.tipo?.includes('Servicios') && (
        <img
            className='tag-distroficial'
            src='https://luisgarcia-d.com/wp-content/uploads/2022/05/Pagina-1-1568x474.png'
            alt='Servicios'
        />
    )}
    {proveedor.tipo?.includes('Distribuidor Oficial') && (
        <img
            className='tag-distroficial'
            src='https://i.imgur.com/RIN3TB0.png'
            alt='Distribuidor Oficial'
        />
    )}
    {proveedor.tipo?.includes('Mayorista') && (
        <img
            className='tag-mayorista'
            src='https://i.imgur.com/DiAnzfH.png'
            alt='Mayorista'
        />
    )}
    {proveedor.tipo?.includes('Fabricante') && (
        <img
            className='tag-fabricante'
            src='https://i.imgur.com/nscxZFG.png'
            alt='Fabricante'
        />
    )}
    {proveedor.servicios?.includes('Logistica/Transporte') && (
        <img
            className='tag-distroficial'
            src='https://i.ibb.co/Ln4BbrK/Logistica-Transporte.png'
            alt='Servicio Logistica'
        />
    )}
    {proveedor.servicios?.includes('Importacion') && (
        <img
            className='tag-distroficial'
            src='https://i.ibb.co/0jGtnnQ/Importacion.png'
            alt='Servicio Importacion'
        />
    )}
    {proveedor.servicios?.includes('Exportacion') && (
        <img
            className='tag-distroficial'
            src='https://i.ibb.co/x31CDjS/Exportaci-n.png'
            alt='Servicio Exportacion'
        />
    )}
    {proveedor.servicios?.includes('Dropshipping') && (
        <img
            className='tag-distroficial'
            src='https://i.ibb.co/x8cFyrC/Dropshipping.png'
            alt='Servicio Dropshipping'
        />
    )}
    {proveedor.servicios?.includes('Almacenamiento') && (
        <img
            className='tag-distroficial'
            src='https://i.ibb.co/x8cFyrC/Dropshipping.png'
            alt='Servicio Almacenamiento'
        />
    )}
    </>
  )
}

export default Tags