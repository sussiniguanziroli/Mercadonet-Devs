// src/components/proveedores/CardMobile.jsx
import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import Tags from './assets/Tags'; // Assuming Tags.jsx is in ./assets/
import { FaImage } from "react-icons/fa"; // For logo placeholder

const CardMobile = ({ proveedor }) => {
    if (!proveedor) {
        return null; // Or a loading/error state
    }

    const {
        nombre = 'Nombre no disponible',
        logo = '',
        ubicacionDetalle = 'Ubicación no especificada',
        descripcion = '',
        marca = [], // From 'marcasConfiguradas'
        extras = [], // From 'extrasConfigurados'
        // tipo, servicios, tipoRegistro are used by Tags component via the proveedor prop
    } = proveedor;

    const maxLength = 75;
    // Ensure descripcion is a string before accessing length or slice
    const safeDescripcion = typeof descripcion === 'string' ? descripcion : '';
    const truncatedDescription = safeDescripcion.length > maxLength
        ? safeDescripcion.slice(0, maxLength) + "...[ver más]"
        : safeDescripcion;

    return (
        <div className='proveedor-item hiddenInDesktop'>
            <div className='top-container'>
                <div className='titles-container'>
                    <div className='small-logo-box'>
                        {logo ? (
                            <img className='small-logo' src={logo} alt={nombre} />
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
                        <Tags proveedor={proveedor} /> {/* Pass the whole transformed proveedor object */}
                    </div>
                </div>
                {/* Consider where 'Ver Detalles' should navigate or what it should do */}
                <button>Ver Detalles</button>
            </div>

            <div className='texts-box'>
                {safeDescripcion && <p className='description'>{truncatedDescription}</p>}
                
                {Array.isArray(marca) && marca.length > 0 && (
                    <div className='marcas alineado-auto'>
                        <h4>Marcas:</h4>
                        {/* Limiting display for brevity, adjust as needed */}
                        {marca.slice(0, 5).map((m, i) => <p key={`${m}-${i}`}>{m}{i < marca.slice(0, 5).length - 1 && i < 4 ? ',' : ''}</p>)}
                        {marca.length > 5 && <p>...</p>}
                    </div>
                )}
                {Array.isArray(extras) && extras.length > 0 && (
                    <div className='extras alineado-auto'>
                        <h4>Servicios y Capacidades: </h4>
                        {extras.slice(0, 3).map((extra, index) => (
                            <p key={index} className='tag-extra'>{extra}</p>
                        ))}
                        {extras.length > 3 && <p className='tag-extra'>...</p>}
                    </div>
                )}
                {!safeDescripcion && (!marca || marca.length === 0) && (!extras || extras.length === 0) && (
                    <p className='placeholder-text'>(Información adicional no disponible)</p>
                )}
            </div>
        </div>
    );
};

export default CardMobile;