// src/components/registroProveedor/card_simulators/CardHistoriaPreview.jsx
// (Versión ajustada con placeholders)

import React from 'react';
import { IoLocationOutline, IoGlobeOutline } from 'react-icons/io5';
import { FaArrowLeft, FaArrowRight, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaImage, FaImages } from "react-icons/fa"; // Iconos añadidos
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';


const CardHistoriaPreview = ({ proveedor }) => {
    const {
        nombre = '', ubicacionDetalle = '',
        logoPreview = null, // Puede ser null, blob URL o https URL
        carrusel = [],      // Array de URLs (blob o https)
        descripcion = '', marca = [], extras = [],
        sitioWeb = '', whatsapp = '', telefono = '', email = ''
    } = proveedor || {};

    const nombreMostrado = nombre.trim() || 'Nombre Empresa'; // Placeholder más corto
    const ubicacionMostrada = ubicacionDetalle.trim() || 'Ubicación';
    // El carrusel tiene contenido si es un array con al menos una URL válida
    const tieneCarrusel = Array.isArray(carrusel) && carrusel.length > 0 && carrusel.some(c => typeof c === 'string');
    const tieneLogo = logoPreview && typeof logoPreview === 'string'; // Verifica que sea un string (URL blob o https)

    return (
        <div className="proveedor-item-simulator simulator card-historia-preview">
            {/* --- Carrusel: Muestra preview o placeholder --- */}
            <div className="carousel-box">
                <CarouselProvider
                    naturalSlideWidth={100}
                    naturalSlideHeight={100} // Para hacerlo cuadrado, ajusta si prefieres otro aspect-ratio
                    totalSlides={tieneCarrusel ? carrusel.length : 1} // Siempre 1 slide mínimo (el placeholder)
                    className="carousel-frame"
                    infinite={tieneCarrusel && carrusel.length > 1}
                >
                    <Slider>
                        {tieneCarrusel ? (
                            carrusel.map((imgSrc, index) => (
                                <Slide className="carousel-slide" key={index} index={index}>
                                    <img
                                        className="carousel-image"
                                        src={imgSrc} // Asumimos que el padre pasa URLs válidas
                                        alt={`Multimedia ${index + 1}`}
                                        onError={(e) => e.target.style.display = 'none'} // Oculta si la URL falla
                                    />
                                </Slide>
                            ))
                        ) : (
                            // Placeholder explícito si no hay carrusel
                            <Slide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder">
                                    <FaImages /> {/* Icono */}
                                    <span>Tu Multimedia</span>
                                </div>
                            </Slide>
                        )}
                    </Slider>
                    {/* Botones/Dots solo si hay carrusel real con más de 1 imagen */}
                    {tieneCarrusel && carrusel.length > 1 && (
                        <>
                            <ButtonBack className="carousel-button back"><FaArrowLeft /></ButtonBack>
                            <ButtonNext className="carousel-button next"><FaArrowRight /></ButtonNext>
                            <DotGroup className="carousel-dots" />
                        </>
                    )}
                </CarouselProvider>
            </div>

            {/* --- Info Box --- */}
            <div className="info-box">
                <div className="titles-box">
                    {/* --- Logo: Muestra preview o placeholder --- */}
                    <div className="small-logo-box">
                        {tieneLogo ? (
                            <img className="small-logo" src={logoPreview} alt="Logo" />
                        ) : (
                            <div className="logo-placeholder">
                                <FaImage /> {/* Icono */}
                                <span>Logo</span>
                            </div>
                        )}
                    </div>
                    <h3>{nombreMostrado}</h3>
                    <img className="verificado" src="https://i.ibb.co/MkjBH00V/Verificado-HD-removebg-preview.png" alt="Verificado" />
                    <p><IoLocationOutline /> {ubicacionMostrada}</p>
                </div>


                {/* --- Textos (Descripción, Marcas, Extras) --- */}
                <div className="texts-box">
                    {/* Muestra placeholder si no hay descripción en pasos avanzados, o nada en paso 1 */}
                    {descripcion ? (
                        <p className="description">{descripcion}</p>
                    ) : (
                        // Opcional: Mostrar placeholder solo si estamos en paso 2+ y no hay desc
                        // (Necesitaría saber el paso actual aquí, es más simple no mostrar nada)
                        null
                    )}

                    {Array.isArray(marca) && marca.length > 0 && (
                        <div className="marcas alineado-auto"><h4>Marcas:</h4> {marca.slice(0, 5).map((m, i) => <p key={i}>{m}</p>)}{marca.length > 5 && <p>...</p>}</div>
                    )}
                    {Array.isArray(extras) && extras.length > 0 && (
                        <div className="extras alineado-auto"><h4>Servicios/Extras:</h4> {extras.slice(0, 4).map((e, i) => (<p key={i} className="tag-extra">{e}</p>))}{extras.length > 4 && <p className="tag-extra">...</p>}</div>
                    )}
                    {/* Placeholder si no hay descripción/marcas/extras? Podría añadirse */}
                    {!descripcion && (!marca || marca.length === 0) && (!extras || extras.length === 0) && (
                        <p className='placeholder-text'>(Aquí aparecerá tu descripción, marcas y servicios)</p>
                    )}
                </div>


            </div>
        </div>
    );
};

export default CardHistoriaPreview;