// src/components/proveedores/CardMobileV2.jsx
import React from 'react';
import Slider from 'react-slick';
import { IoLocationOutline } from 'react-icons/io5';
import Tags from './assets/Tags';
import { FaImage } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

const CardMobileV2 = ({ proveedor }) => {
    if (!proveedor) {
        return null;
    }

    const {
        nombre = 'Nombre no disponible',
        logo, // Is an object: { url: "...", ... } or null
        ubicacionDetalle = 'Ubicación no especificada',
        galeria = [], // This is `proveedor.galeria` from context/Firestore
        // Each item is an object: { url: "...", imagenURL: "...", titulo: "...", precio: "..." }
        id
    } = proveedor;

    const logoUrl = logo?.url; // Access .url property
    const tieneLogo = !!logoUrl;
    const proveedorPageLink = id ? `/proveedor/${id}` : '#';

    // Filter for valid products to display in the carousel
    const validProductos = Array.isArray(galeria) ? galeria.filter(p => p && (p.url || p.imagenURL)) : [];

    const settings = {
        dots: true,
        infinite: validProductos.length > 2,
        speed: 500,
        slidesToShow: Math.min(3, validProductos.length || 1),
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: Math.min(2, validProductos.length || 1),
                }
            },
            {
                breakpoint: 380,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    return (
        <div className='proveedor-item-v2 hiddenInDesktop'>
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

            {validProductos.length > 0 ? (
                <div className='carousel-box '>
                    <Slider {...settings}>
                        {validProductos.map((producto, index) => (
                            // Use a unique key, e.g., from producto.url or index if nothing else is available
                            <div className="product-card" key={producto.url || producto.imagenURL || index}>
                                <div className="image-wrapper">
                                    <img
                                        src={producto.url || producto.imagenURL} // Use .url or fallback to .imagenURL
                                        alt={producto.titulo || `Producto ${index + 1}`}
                                        className="product-image"
                                        onError={(e) => e.target.src = 'https://placehold.co/100x100/eee/ccc?text=Img'}
                                    />
                                </div>
                                <div className="product-details">
                                    <h4>{producto.titulo || 'Producto'}</h4>
                                    <p>{producto.precio || ''}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                    <p>(No hay productos destacados para mostrar)</p>
                </div>
            )}
        </div>
    );
};

export default CardMobileV2;
