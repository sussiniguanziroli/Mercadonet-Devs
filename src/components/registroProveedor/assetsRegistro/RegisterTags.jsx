import React from 'react';

const tipoTags = {
    'Distribuidores Oficiales': {
        src: 'https://i.imgur.com/RIN3TB0.png',
        alt: 'Distribuidores Oficiales',
        className: 'tag-distroficial'
    },
    'Mayoristas': {
        src: 'https://i.imgur.com/DiAnzfH.png',
        alt: 'Mayoristas',
        className: 'tag-mayorista'
    },
    'Fabricantes': {
        src: 'https://i.imgur.com/nscxZFG.png',
        alt: 'Fabricantes',
        className: 'tag-fabricante'
    }
};

const servicioTags = {
    'Servicios': {
        src: 'https://luisgarcia-d.com/wp-content/uploads/2022/05/Pagina-1-1568x474.png',
        alt: 'Servicios',
        className: 'tag-distroficial'
    },
    'Logística/Transporte': {
        src: 'https://i.ibb.co/Ln4BbrK/Logistica-Transporte.png',
        alt: 'Servicio Logistica',
        className: 'tag-distroficial'
    },
    'Importación': {
        src: 'https://i.ibb.co/0jGtnnQ/Importacion.png',
        alt: 'Servicio Importacion',
        className: 'tag-distroficial'
    },
    'Exportación': {
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
        src: 'https://i.ibb.co/HqtcGPt/Almacenamiento.png', // mismo que Dropshipping
        alt: 'Servicio Almacenamiento',
        className: 'tag-distroficial'
    }
};

const RegisterTags = ({ proveedor }) => {
    if (!proveedor?.tipoRegistro) return null;


    
    const { tipoRegistro, tipoProveedor, selectedServices } = proveedor;

    // Si es "Productos", mapeamos tipoProveedor
    if (tipoRegistro === 'productos') {
        return (
            <>
                {tipoProveedor?.map((tipo) => (
                    tipoTags[tipo] && (
                        <img
                            key={tipo}
                            className={tipoTags[tipo].className}
                            src={tipoTags[tipo].src}
                            alt={tipoTags[tipo].alt}
                        />
                    )
                ))}
            </>
        );
    }

    // Si es "Servicios", mapeamos servicios
    if (tipoRegistro === 'servicios') {
        return (
            <>
                {/* Mostrar siempre la tag "Servicios" */}
                {servicioTags['Servicios'] && (
                    <img
                        key="Servicios"
                        className={servicioTags['Servicios'].className}
                        src={servicioTags['Servicios'].src}
                        alt={servicioTags['Servicios'].alt}
                    />
                )}

                {selectedServices?.map((servicio) => (
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
        );
    }

    // Si no cumple con ninguno, no hace nada
    return null;
};

export default RegisterTags;
