import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { FaImage, FaImages, FaBoxOpen } from "react-icons/fa";

// --- Imports para Carrusel Principal (Superior) ---
import { CarouselProvider, Slider as PureSlider, Slide as PureSlide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

// --- Imports para Carrusel de Productos (Inferior) ---
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

const CardProductosPreview = ({ proveedor }) => {
    const {
        nombre = '',
        ubicacionDetalle = '',
        logoPreview = null,
        carrusel = [], // Para el carrusel superior (pure-react-carousel)
        descripcion = '', // No usado en este preview específico, pero podría estar
        marcas = [],     // No usado en este preview específico, pero podría estar
        servicios = [],  // No usado en este preview específico, pero podría estar
        galeriaProductos = [] // Para el carrusel inferior (react-slick)
    } = proveedor || {};

    const nombreMostrado = nombre.trim() || 'Nombre Empresa';
    const ubicacionMostrada = ubicacionDetalle.trim() || 'Ubicación';
    const tieneCarruselPrincipal = Array.isArray(carrusel) && carrusel.length > 0 && carrusel.some(c => typeof c === 'string');
    const tieneLogo = logoPreview && typeof logoPreview === 'string';
    // Aseguramos que galeriaProductos sea siempre un array para evitar errores
    const productosValidos = Array.isArray(galeriaProductos) ? galeriaProductos.filter(p => p.titulo || p.precio || p.imagenPreview) : [];
    const tieneGaleria = productosValidos.length > 0;

    // --- Settings para React-Slick (Galería de Productos) ---
    // Ajustamos slidesToShow para el preview, puedes modificarlo
    const productCarouselSettings = {
        dots: true,
        infinite: productosValidos.length > 3, // Solo infinito si hay más slides que las visibles
        speed: 500,
        slidesToShow: 3, // Mostrar 3 en el preview por defecto
        slidesToScroll: 1,
        responsive: [
             {
                 breakpoint: 1024, // Ajustar breakpoints si es necesario para el preview
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
                    dots: false // Ocultar dots en móvil si prefieres
                },
            },
        ],
    };

    return (
        // Conservamos la clase base
        <div className="card-productos-preview">

            {/* Carrusel Principal (Superior - pure-react-carousel) - Sin cambios */}
            <div className="carousel-box">
                <CarouselProvider
                    naturalSlideWidth={100} naturalSlideHeight={100} // Ajusta el aspect ratio si es necesario
                    totalSlides={tieneCarruselPrincipal ? carrusel.length : 1}
                    className="carousel-frame"
                    infinite={tieneCarruselPrincipal && carrusel.length > 1}
                >
                    <PureSlider>
                        {tieneCarruselPrincipal ? (
                            carrusel.map((imgSrc, index) => (
                                <PureSlide className="carousel-slide" key={index} index={index}>
                                    <img className="carousel-image" src={imgSrc} alt={`Multimedia ${index + 1}`} onError={(e) => e.target.style.display = 'none'} />
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
                    {/* Mantenemos el icono verificado si es parte del diseño */}
                    <img className="verificado" src="https://i.ibb.co/MkjBH00V/Verificado-HD-removebg-preview.png" alt="Verificado" />
                    <p><IoLocationOutline /> {ubicacionMostrada}</p>
                </div>

                {/* --- Galería de Productos con React-Slick --- */}
                <div className="product-gallery-preview-section">
                    <h4>Galería de Productos</h4>
                    {tieneGaleria ? (
                        // Usamos la clase del componente original ProductsCarousel para los estilos
                        <div className="products-carousel">
                            <Slider {...productCarouselSettings}>
                                {productosValidos.map((producto, index) => (
                                    // Usamos la estructura y clases de ProductsCarousel para cada slide
                                    <div key={index} className="product-item">
                                        <div className="product-image-container"> {/* Contenedor para manejar el aspect ratio o placeholder */}
                                            {producto.imagenPreview ? (
                                                <img
                                                    src={producto.imagenPreview}
                                                    alt={producto.titulo || `Producto ${index + 1}`}
                                                    className="product-image" // Clase de ProductsCarousel
                                                    // Opcional: añadir onError para manejar imágenes rotas en preview
                                                    onError={(e) => {
                                                        e.target.onerror = null; // prevent infinite loop
                                                        // Puedes ocultarlo o mostrar un placeholder específico
                                                        e.target.style.display = 'none';
                                                        // O mostrar un placeholder dentro del contenedor
                                                        const placeholder = e.target.nextElementSibling;
                                                        if (placeholder) placeholder.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null }
                                            {/* Placeholder si no hay imagenPreview o si la imagen falla */}
                                            { (!producto.imagenPreview) && (
                                                 <div className="product-gallery-img-placeholder" style={{display: 'flex'}}><FaBoxOpen /></div>
                                            )}
                                             {/* Placeholder oculto para mostrar en caso de error de imagen */}
                                              { producto.imagenPreview && (
                                                 <div className="product-gallery-img-placeholder" style={{display: 'none'}}><FaBoxOpen /><span>Error</span></div>
                                            )}

                                        </div>
                                        <p className="product-title" title={producto.titulo}>{producto.titulo || 'Título...'}</p> {/* Clase de ProductsCarousel */}
                                        <p className="product-price">{producto.precio || 'Precio...'}</p>      {/* Clase de ProductsCarousel */}
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