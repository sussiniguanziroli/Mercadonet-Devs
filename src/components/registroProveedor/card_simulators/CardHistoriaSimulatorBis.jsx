import React from 'react';
import { IoLocationOutline, IoGlobeOutline } from 'react-icons/io5';
import { FaArrowLeft, FaArrowRight, FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

const CardHistoriaSimulatorBis = ({ proveedor }) => {
    const {
        nombre = '',
        ubicacionDetalle = '',
        logoPreview,
        carrusel = [],
        descripcion = '',
        marca = [],
        extras = [],
        categorias = [],
        sitioWeb = '',
        whatsapp = '',
        telefono = '',
        email = ''
    } = proveedor || {};

    const nombreMostrado = nombre.trim() || 'Nombre de tu empresa';
    const ubicacionMostrada = ubicacionDetalle.trim() || 'Ubicación de tu empresa';
    const tieneCarrusel = carrusel && carrusel.length > 0;
    const logoURL = logoPreview || 'https://via.placeholder.com/60';

    return (
        <div className="proveedor-item-desktop simulator">
            {/* Carrusel */}
            <div className="carousel-box">
                <CarouselProvider
                    naturalSlideWidth={5}
                    naturalSlideHeight={5}
                    totalSlides={tieneCarrusel ? carrusel.length : 2}
                    className="carousel-frame"
                >
                    <Slider>
                        {tieneCarrusel ? (
                            carrusel.map((img, index) => (
                                <Slide className="carousel-slide" key={index} index={index}>
                                    <img 
                                        className="carousel-image" 
                                        src={typeof img === "string" ? img : URL.createObjectURL(img)} 
                                        alt={`Multimedia ${index + 1}`} 
                                    />
                                </Slide>
                            ))
                        ) : (
                            <>
                                <Slide className="carousel-slide" index={0}>
                                    <img 
                                        className="carousel-image" 
                                        src="https://i.ibb.co/67Kwtv1b/image-7.png" 
                                        alt="Ejemplo de slide" 
                                    />
                                </Slide>
                                <Slide className="carousel-slide" index={1}>
                                    <div className="carousel-placeholder">Tu Multimedia</div>
                                </Slide>
                            </>
                        )}
                    </Slider>
                    <ButtonBack className="carousel-button back">
                        <FaArrowLeft />
                    </ButtonBack>
                    <ButtonNext className="carousel-button next">
                        <FaArrowRight />
                    </ButtonNext>
                    <DotGroup className="carousel-dots" />
                </CarouselProvider>
            </div>

            {/* Info-box */}
            <div className="info-box">
                <div className="titles-box">
                    <div className="small-logo-box">
                        <img 
                            className="small-logo" 
                            src={logoURL} 
                            alt="Logo de la empresa" 
                        />
                    </div>
                    <h3>{nombreMostrado}</h3>
                    <img 
                        className="verificado" 
                        src="https://i.ibb.co/MkjBH00V/Verificado-HD-removebg-preview.png" 
                        alt="Verificado" 
                    />
                    <p><IoLocationOutline /> {ubicacionMostrada}</p>
                </div>

                {/* Categorías / Tags */}
                <div className="tags-box alineado-auto">
                    {categorias?.map((cat, i) => (
                        <span key={i} className="tag-extra">{cat}</span>
                    ))}
                </div>

                {/* Descripción, marcas y extras */}
                <div className="texts-box">
                    {descripcion && (
                        <p className="description">{descripcion}</p>
                    )}

                    {marca?.length > 0 && (
                        <div className="marcas alineado-auto">
                            <h4>Marcas:</h4>
                            {marca.map((m, i) => <p key={i}>{m}</p>)}
                        </div>
                    )}

                    {extras?.length > 0 && (
                        <div className="extras alineado-auto">
                            <h4>Servicios y Capacidades: </h4>
                            {extras.map((e, i) => (
                                <p key={i} className="tag-extra">{e}</p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botones de contacto */}
                <div className="buttons-box">
                    {sitioWeb && (
                        <a href={sitioWeb} target="_blank" rel="noreferrer">
                            <IoGlobeOutline /> Sitio Web
                        </a>
                    )}
                    {whatsapp && (
                        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
                            <FaWhatsapp /> WhatsApp
                        </a>
                    )}
                    {telefono && (
                        <a href={`tel:${telefono}`}>
                            <FaPhoneAlt /> Teléfono
                        </a>
                    )}
                    {email && (
                        <a href={`mailto:${email}`}>
                            <FaEnvelope /> Email
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardHistoriaSimulatorBis;

