import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { FaImage, FaImages, FaBoxOpen } from "react-icons/fa";

// --- Imports para Carrusel Principal (Superior) ---
import { CarouselProvider, Slider as PureSlider, Slide as PureSlide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

// --- Imports para Carrusel de Productos (Inferior) ---
import Slider from "react-slick"; // Renombrado para evitar conflicto con PureSlider si es necesario, aunque aquí se usa directamente.
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import RegisterTags from '../assetsRegistro/RegisterTags';

const CardProductosPreview = ({ proveedor }) => {
    const {
        tipoProveedor = [],
        tipoRegistro = '',
        nombre = '',
        ubicacionDetalle = '',
        logoPreview = null,
        carrusel = [], // AHORA: Array de objetos { url, fileType, mimeType }
        descripcion = '',
        marcas = [],
        servicios = [],
        galeriaProductos = []
    } = proveedor || {};

    const nombreMostrado = nombre.trim() || 'Nombre Empresa';
    const ubicacionMostrada = ubicacionDetalle.trim() || 'Ubicación';
    
    // --- LÓGICA PARA CARRUSEL PRINCIPAL ACTUALIZADA ---
    const tieneCarruselPrincipal = Array.isArray(carrusel) && carrusel.length > 0 && carrusel.some(item => item && typeof item.url === 'string');
    
    const tieneLogo = logoPreview && typeof logoPreview === 'string';
    const productosValidos = Array.isArray(galeriaProductos) ? galeriaProductos.filter(p => p.titulo || p.precio || p.imagenPreview) : [];
    const tieneGaleria = productosValidos.length > 0;

    const productCarouselSettings = {
        dots: true,
        infinite: productosValidos.length > 3,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
             {
                 breakpoint: 1024,
                 settings: {
                     slidesToShow: 3,
                     infinite: productosValidos.length > 3,
                 },
             },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    infinite: productosValidos.length > 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    infinite: productosValidos.length > 1,
                    dots: false 
                },
            },
        ],
    };

    return (
        <div className="card-productos-preview">

            {/* --- CARRUSEL PRINCIPAL (SUPERIOR - pure-react-carousel) - MODIFICADO --- */}
            <div className="carousel-box">
                <CarouselProvider
                    naturalSlideWidth={100} naturalSlideHeight={100} 
                    totalSlides={tieneCarruselPrincipal ? carrusel.length : 1}
                    className="carousel-frame"
                    infinite={tieneCarruselPrincipal && carrusel.length > 1}
                >
                    <PureSlider>
                        {tieneCarruselPrincipal ? (
                            carrusel.map((item, index) => ( // item es ahora { url, fileType, mimeType }
                                <PureSlide className="carousel-slide" key={item.url ? item.url + '-' + index : index} index={index}>
                                    {item.fileType === 'image' ? (
                                        <img 
                                            className="carousel-image" // Clase unificada para img/video
                                            src={item.url} 
                                            alt={`Multimedia ${index + 1}`} 
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : item.fileType === 'video' ? (
                                        <video 
                                            className="carousel-image" // Clase unificada para img/video
                                            src={item.url} 
                                            controls 
                                            autoPlay 
                                            muted 
                                            loop
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        >
                                            
                                            Tu navegador no soporta la etiqueta de video.
                                        </video>
                                    ) : (
                                        // Fallback si el tipo no es reconocido
                                        <div className="carousel-placeholder-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#eee'}}>
                                            <span>Formato no soportado</span>
                                        </div>
                                    )}
                                </PureSlide>
                            ))
                        ) : (
                            <PureSlide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder"><FaImages /><span>Tu Multimedia</span></div>
                            </PureSlide>
                        )}
                    </PureSlider>
                    {tieneCarruselPrincipal && carrusel.length > 1 && (
                        <>
                            <ButtonBack className="carousel-button back"><FaArrowLeft /></ButtonBack>
                            <ButtonNext className="carousel-button next"><FaArrowRight /></ButtonNext>
                            <DotGroup className="carousel-dots" />
                        </>
                    )}
                </CarouselProvider>
            </div>

            {/* Info principal - Sin cambios */}
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

                <div className='tags-box'>
                    <RegisterTags proveedor={proveedor} />
                </div>

                {/* Galería de Productos con React-Slick - Sin cambios en su lógica interna de datos */}
                <div className="product-gallery-preview-section">
                    <h4>Galería de Productos</h4>
                    {tieneGaleria ? (
                        <div className="products-carousel">
                            <Slider {...productCarouselSettings}>
                                {productosValidos.map((producto, index) => (
                                    <div key={index} className="product-item">
                                        <div className="product-image-container">
                                            {producto.imagenPreview ? (
                                                <img
                                                    src={producto.imagenPreview}
                                                    alt={producto.titulo || `Producto ${index + 1}`}
                                                    className="product-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.style.display = 'none';
                                                        const placeholder = e.target.parentElement.querySelector('.product-gallery-img-placeholder-error');
                                                        if (placeholder) placeholder.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null }
                                            {(!producto.imagenPreview) && (
                                                <div className="product-gallery-img-placeholder" style={{display: 'flex'}}><FaBoxOpen /></div>
                                            )}
                                            {/* Placeholder oculto para mostrar en caso de error de imagen, si la imagen existía */}
                                            { producto.imagenPreview && (
                                                <div className="product-gallery-img-placeholder-error" style={{display: 'none'}}><FaBoxOpen /><span>Error</span></div>
                                            )}
                                        </div>
                                        <p className="product-title" title={producto.titulo}>{producto.titulo || 'Título...'}</p>
                                        <p className="product-price">{producto.precio || 'Precio...'}</p>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    ) : (
                        <p className='placeholder-text small'>(Aquí verás tus productos destacados)</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardProductosPreview;