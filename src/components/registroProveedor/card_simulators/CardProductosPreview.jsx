// src/components/registroProveedor/card_simulators/CardProductosPreview.jsx

import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaImage, FaImages, FaBoxOpen } from "react-icons/fa";
import { CarouselProvider, Slider, Slide } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

const CardProductosPreview = ({ proveedor }) => {
    const {
        nombre = '',
        ubicacionDetalle = '',
        logoPreview = null,
        carrusel = [],
        descripcion = '',
        marcas = [],
        servicios = [],
        galeriaProductos = []
    } = proveedor || {};

    const nombreMostrado = nombre.trim() || 'Nombre Empresa';
    const ubicacionMostrada = ubicacionDetalle.trim() || 'Ubicación';
    const tieneCarrusel = Array.isArray(carrusel) && carrusel.length > 0 && carrusel.some(c => typeof c === 'string');
    const tieneLogo = logoPreview && typeof logoPreview === 'string';
    const tieneGaleria = Array.isArray(galeriaProductos) && galeriaProductos.length > 0;

    return (
        <div className="proveedor-item-desktop simulator card-productos-preview">

            {/* Carrusel */}
            <div className="carousel-box">
                <CarouselProvider
                    naturalSlideWidth={100} naturalSlideHeight={100}
                    totalSlides={tieneCarrusel ? carrusel.length : 1}
                    className="carousel-frame" infinite={tieneCarrusel && carrusel.length > 1}
                >
                    <Slider>
                        {tieneCarrusel ? (
                            carrusel.map((imgSrc, index) => (
                                <Slide className="carousel-slide" key={index} index={index}>
                                    <img className="carousel-image" src={imgSrc} alt={`Multimedia ${index + 1}`} onError={(e) => e.target.style.display = 'none'} />
                                </Slide>
                            ))
                        ) : (
                            <Slide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder"><FaImages /><span>Tu Multimedia</span></div>
                            </Slide>
                        )}
                    </Slider>
                </CarouselProvider>
            </div>

            {/* Info principal */}
            <div className="info-box">
                <div className="titles-box">
                    <div className="small-logo-box">
                        {tieneLogo ? (
                            <img className="small-logo" src={logoPreview} alt="Logo" />
                        ) : (
                            <div className="logo-placeholder"><FaImage /><span>Logo</span></div>
                        )}
                    </div>
                    <h3>{nombreMostrado}</h3>
                    <img className="verificado" src="https://i.ibb.co/MkjBH00V/Verificado-HD-removebg-preview.png" alt="Verificado" />
                    <p><IoLocationOutline /> {ubicacionMostrada}</p>
                </div>

                {/* Galería de productos */}
                <div className="product-gallery-preview-section">
                    <h4>Galería de Productos</h4>
                    {tieneGaleria ? (
                        <div className="product-gallery-items">
                            {galeriaProductos.slice(0, 4).map((producto, index) => (
                                <div key={index} className="product-gallery-item">
                                    <div className="product-gallery-img-container">
                                        {producto.imagenPreview ? (
                                            <img src={producto.imagenPreview} alt={producto.titulo || 'Producto'} />
                                        ) : (
                                            <div className="product-gallery-img-placeholder"><FaBoxOpen /></div>
                                        )}
                                    </div>
                                    <p className='product-gallery-title' title={producto.titulo}>{producto.titulo || 'Título...'}</p>
                                    <p className='product-gallery-price'>{producto.precio || 'Precio...'}</p>
                                </div>
                            ))}
                            {galeriaProductos.length > 4 && <div className='product-gallery-more'>...</div>}
                        </div>
                    ) : (
                        <p className='placeholder-text small'>(Aquí verás tus productos destacados)</p>
                    )}
                </div>

                {/* Descripción, marcas y servicios */}
                <div className="texts-box">
                    {descripcion && <p className="description">{descripcion}</p>}
                    {Array.isArray(marcas) && marcas.length > 0 && (
                        <div className="marcas alineado-auto">
                            <h4>Marcas:</h4>
                            {marcas.slice(0, 5).map((m, i) => <p key={i}>{m}</p>)}
                            {marcas.length > 5 && <p>...</p>}
                        </div>
                    )}
                    {Array.isArray(servicios) && servicios.length > 0 && (
                        <div className="extras alineado-auto">
                            <h4>Servicios:</h4>
                            {servicios.slice(0, 4).map((s, i) => (
                                <p key={i} className="tag-extra">{s}</p>
                            ))}
                            {servicios.length > 4 && <p>...</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardProductosPreview;
