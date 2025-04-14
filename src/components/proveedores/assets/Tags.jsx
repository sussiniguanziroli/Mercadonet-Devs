import React from 'react'

const tipoTags = {
  'Servicios': {
    src: 'https://luisgarcia-d.com/wp-content/uploads/2022/05/Pagina-1-1568x474.png',
    alt: 'Servicios',
    className: 'tag-distroficial'
  },
  'Distribuidor Oficial': {
    src: 'https://i.imgur.com/RIN3TB0.png',
    alt: 'Distribuidor Oficial',
    className: 'tag-distroficial'
  },
  'Mayorista': {
    src: 'https://i.imgur.com/DiAnzfH.png',
    alt: 'Mayorista',
    className: 'tag-mayorista'
  },
  'Fabricante': {
    src: 'https://i.imgur.com/nscxZFG.png',
    alt: 'Fabricante',
    className: 'tag-fabricante'
  }
}

const servicioTags = {
  'Logistica/Transporte': {
    src: 'https://i.ibb.co/Ln4BbrK/Logistica-Transporte.png',
    alt: 'Servicio Logistica',
    className: 'tag-distroficial'
  },
  'Importacion': {
    src: 'https://i.ibb.co/0jGtnnQ/Importacion.png',
    alt: 'Servicio Importacion',
    className: 'tag-distroficial'
  },
  'Exportacion': {
    src: 'https://i.ibb.co/x31CDjS/Exportaci-n.png',
    alt: 'Servicio Exportacion',
    className: 'tag-distroficial'
  },
  'Dropshipping': {
    src: 'https://i.ibb.co/x8cFyrC/Dropshipping.png',
    alt: 'Servicio Dropshipping',
    className: 'tag-distroficial'
  },
  'Almacenamiento': {
    src: 'https://i.ibb.co/x8cFyrC/Dropshipping.png', // mismo que Dropshipping
    alt: 'Servicio Almacenamiento',
    className: 'tag-distroficial'
  }
}

const Tags = ({ proveedor }) => {
  return (
    <>
      {proveedor.tipo?.map((tipo) => (
        tipoTags[tipo] && (
          <img
            key={tipo}
            className={tipoTags[tipo].className}
            src={tipoTags[tipo].src}
            alt={tipoTags[tipo].alt}
          />
        )
      ))}
      {proveedor.servicios?.map((servicio) => (
        servicioTags[servicio] && (
          <img
            key={servicio}
            className={servicioTags[servicio].className}
            src={servicioTags[servicio].src}
            alt={servicioTags[servicio].alt}
          />
        )
      ))}
    </>
  )
}

export default Tags
