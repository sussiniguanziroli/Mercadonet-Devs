// src/components/proveedores/CardMobile.jsx
import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import Tags from './assets/Tags';
import { FaImage } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

const CardMobile = ({ proveedor }) => {
    if (!proveedor) {
        return null;
    }

    const {
        nombre = 'Nombre no disponible',
        logo, // Is an object: { url: "...", ... } or null
        ubicacionDetalle = 'Ubicación no especificada',
        descripcionGeneral, // Corrected field name from context/Firestore
        marcasConfiguradas, // Corrected field name
        extrasConfigurados, // Corrected field name
        // tipoProveedor, serviciosClaveParaTags, tipoRegistro are used by Tags component via the proveedor prop
        id
    } = proveedor;

    const logoUrl = logo?.url; // Access .url property
    const tieneLogo = !!logoUrl;

    const maxLength = 75;
    const safeDescripcion = typeof descripcionGeneral === 'string' ? descripcionGeneral : '';
    const truncatedDescription = safeDescripcion.length > maxLength
        ? safeDescripcion.slice(0, maxLength) + "...[ver más]"
        : safeDescripcion;

    const proveedorPageLink = id ? `/proveedor/${id}` : '#';

    return (
        <div className='proveedor-item hiddenInDesktop'>
            <div className='top-container'>
                <div className='titles-container'>
                    <div className='small-logo-box'>
                        {tieneLogo ? (
                            <img className='small-logo' src={logoUrl} alt={nombre} />
                        ) : (
                            <div className="logo-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                <FaImage size={24} color="#ccc" />
                            </div>
                        )}
                    </div>
                    <h2>{nombre}</h2>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' alt="Verificado" />
                    <p><IoLocationOutline />{ubicacionDetalle}</p>
                    <div className='tags-box alineado-auto'>
                        <Tags proveedor={proveedor} />
                    </div>
                </div>
                <NavLink to={proveedorPageLink} className="details-button-link" style={{ textDecoration: 'none' }}>
                    <button className="ver-detalles-btn">Ver Detalles</button>
                </NavLink>
            </div>

            <div className='texts-box'>
                {safeDescripcion && <p className='description'>{truncatedDescription}</p>}

                {Array.isArray(marcasConfiguradas) && marcasConfiguradas.length > 0 && (
                    <div className='marcas alineado-auto'>
                        <h4>Marcas:</h4>
                        {marcasConfiguradas.slice(0, 5).map((m, i) => <p key={`${m}-${i}`}>{m}{i < marcasConfiguradas.slice(0, 5).length - 1 && i < 4 ? ',' : ''}</p>)}
                        {marcasConfiguradas.length > 5 && <p>...</p>}
                    </div>
                )}
                {Array.isArray(extrasConfigurados) && extrasConfigurados.length > 0 && (
                    <div className='extras alineado-auto'>
                        <h4>Servicios y Capacidades: </h4>
                        {extrasConfigurados.slice(0, 3).map((extra, index) => (
                            <p key={index} className='tag-extra'>{extra}</p>
                        ))}
                        {extrasConfigurados.length > 3 && <p className='tag-extra'>...</p>}
                    </div>
                )}
                {!safeDescripcion && (!marcasConfiguradas || marcasConfiguradas.length === 0) && (!extrasConfigurados || extrasConfigurados.length === 0) && (
                    <p className='placeholder-text'>(Información adicional no disponible)</p>
                )}
            </div>
        </div>
    );
};

export default CardMobile;
