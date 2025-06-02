// src/components/proveedores/assets/Tags.jsx
import React from 'react';

// Using keys consistent with RegisterTags.jsx and likely your Firestore /filtros options
const tipoTagsDisplay = {
    'Distribuidores Oficiales': {
        src: 'https://i.ibb.co/XrbvST97/Etiqueta-DISTRIBUIDOR.png',
        alt: 'Distribuidores Oficiales',
        className: 'tag-distroficial'
    },
    'Mayoristas': {
        src: 'https://i.ibb.co/gqV60ZQ/Etiqueta-MAYORISTA.png',
        alt: 'Mayoristas',
        className: 'tag-mayorista'
    },
    'Fabricantes': {
        src: 'https://i.ibb.co/84z5tTts/Etiqueta-FABRICANTE.png',
        alt: 'Fabricantes',
        className: 'tag-fabricante'
    }
    // Add other tipo tags if they exist and are distinct from servicio tags
};

const servicioTagsDisplay = {
    // Generic "Servicios" tag, to be shown if tipoRegistro is 'servicios'
    'ServiciosGeneral': { 
        src: 'https://luisgarcia-d.com/wp-content/uploads/2022/05/Pagina-1-1568x474.png',
        alt: 'Servicios',
        className: 'tag-distroficial' // Or a more generic class
    },
    'Logística/Transporte': { // With accent, matching RegisterTags.jsx
        src: 'https://i.ibb.co/DHYhgTdM/Logistica-Transporte.png',
        alt: 'Servicio Logistica',
        className: 'tag-distroficial'
    },
    'Importación': { // With accent
        src: 'https://i.ibb.co/1YNxxXFT/Importacion.png',
        alt: 'Servicio Importacion',
        className: 'tag-distroficial'
    },
    'Exportación': { // With accent
        src: 'https://i.ibb.co/gLLkMP63/Exportaci-n.png',
        alt: 'Servicio Exportacion',
        className: 'tag-distroficial'
    },
    'Dropshipping': {
        src: 'https://i.ibb.co/Cp7LPYLM/Dropshipping.png',
        alt: 'Servicio Dropshipping',
        className: 'tag-distroficial'
    },
    'Almacenamiento': {
        src: 'https://i.ibb.co/DHLrYzcC/Almacenamiento.png',
        alt: 'Servicio Almacenamiento',
        className: 'tag-distroficial'
    }
};

const Tags = ({ proveedor }) => {
    // console.log("Tags.jsx received proveedor:", JSON.stringify(proveedor, null, 2)); 
    if (!proveedor) {
        return null;
    }

    // proveedor.tipoProveedor is an array of strings (from data.tipoProveedor via FiltersContext)
    // proveedor.serviciosClaveParaTags is an array of strings (from data.serviciosClaveParaTags via FiltersContext)

    return (
        <>
            {/* Render tags based on tipoProveedor if tipoRegistro is 'productos' */}
            {proveedor.tipoRegistro === 'productos' && proveedor.tipoProveedor?.map((tipoItem) => (
                tipoTagsDisplay[tipoItem] && (
                    <img
                        key={`tipo-${tipoItem}`}
                        className={tipoTagsDisplay[tipoItem].className}
                        src={tipoTagsDisplay[tipoItem].src}
                        alt={tipoTagsDisplay[tipoItem].alt}
                    />
                )
            ))}

            {/* Render generic "Servicios" tag and specific service tags if tipoRegistro is 'servicios' */}
            {proveedor.tipoRegistro === 'servicios' && (
                <>
                    {/* Always show the generic "Servicios" tag if it's a service provider */}
                    {servicioTagsDisplay['ServiciosGeneral'] && (
                         <img
                            key="ServiciosGeneralTag"
                            className={servicioTagsDisplay['ServiciosGeneral'].className}
                            src={servicioTagsDisplay['ServiciosGeneral'].src}
                            alt={servicioTagsDisplay['ServiciosGeneral'].alt}
                        />
                    )}
                    {/* Then map over the specific services */}
                    {proveedor.serviciosClaveParaTags?.map((servicioItem) => (
                        servicioTagsDisplay[servicioItem] && (
                            <img
                                key={`servicio-${servicioItem}`}
                                className={servicioTagsDisplay[servicioItem].className}
                                src={servicioTagsDisplay[servicioItem].src}
                                alt={servicioTagsDisplay[servicioItem].alt}
                            />
                        )
                    ))}
                </>
            )}
        </>
    );
};

export default Tags;