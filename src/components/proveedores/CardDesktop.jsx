// src/components/proveedores/CardDesktop.jsx
import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowRight, FaArrowLeft, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaImage, FaImages } from "react-icons/fa";
import { IoGlobeOutline } from "react-icons/io5";
import Tags from './assets/Tags'; // Assuming Tags.jsx is in ./assets/

const CardDesktop = ({ proveedor }) => {
    if (!proveedor) {
        return null;
    }

    const {
        nombre = 'Nombre no disponible',
        logo = '',
        carrusel = [], // Expects array of { url, fileType, mimeType }
        ubicacionDetalle = 'Ubicación no especificada',
        descripcion = '',
        marca = [],
        extras = [],
        contacto = {}
    } = proveedor;

    const tieneCarrusel = Array.isArray(carrusel) && carrusel.length > 0 && carrusel.some(item => item && typeof item.url === 'string');
    const tieneLogo = logo && typeof logo === 'string';

    // Determine total slides: logo first, then carousel items
    const totalSlides = 1 + (tieneCarrusel ? carrusel.length : 0);
    // If no carousel items and no logo, show a placeholder slide
    const effectiveTotalSlides = totalSlides > 1 ? totalSlides : (tieneLogo ? 1 : 1) ;


    return (
        <div className='proveedor-item-desktop hiddenInMobile'>
            <div className='carousel-box'>
                <CarouselProvider
                    naturalSlideWidth={100} // Adjust as needed for your aspect ratio
                    naturalSlideHeight={100}  // Adjust as needed
                    totalSlides={effectiveTotalSlides}
                    className="carousel-frame"
                    infinite={effectiveTotalSlides > 1}
                >
                    <Slider>
                        <Slide className='carousel-slide' index={0}>
                            {tieneLogo ? (
                                <img className='carousel-image' src={logo} alt={`${nombre} Logo`} />
                            ) : (
                                <div className="carousel-placeholder" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0'}}>
                                    <FaImage size={50} color="#ccc"/>
                                    <span>Logo del Proveedor</span>
                                </div>
                            )}
                        </Slide>
                        {tieneCarrusel && carrusel.map((item, index) => (
                            <Slide className='carousel-slide' key={item.url ? `${item.url}-${index}` : index} index={index + 1}>
                                {item.fileType === 'image' ? (
                                    <img
                                        className='carousel-image'
                                        src={item.url}
                                        alt={`Multimedia ${index + 1}`}
                                    />
                                ) : item.fileType === 'video' ? (
                                    <video
                                        className='carousel-image'
                                        src={item.url}
                                        controls
                                        muted
                                        loop
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    >
                                        Tu navegador no soporta la etiqueta de video.
                                    </video>
                                ) : (
                                    <div className="carousel-placeholder-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#e9e9e9'}}>
                                        <span>Formato no soportado</span>
                                    </div>
                                )}
                            </Slide>
                        ))}
                         {/* Placeholder if no logo and no carousel items */}
                        {!tieneLogo && !tieneCarrusel && (
                             <Slide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0'}}>
                                    <FaImages size={50} color="#ccc"/>
                                    <span>Multimedia del Proveedor</span>
                                </div>
                            </Slide>
                        )}
                    </Slider>
                    {effectiveTotalSlides > 1 && (
                        <>
                            <ButtonBack className="carousel-button back"><FaArrowLeft /></ButtonBack>
                            <ButtonNext className="carousel-button next"><FaArrowRight /></ButtonNext>
                            <DotGroup className='carousel-dots' />
                        </>
                    )}
                </CarouselProvider>
            </div>
            <div className='info-box'>
                <div className='titles-box'>
                    <div className='small-logo-box'>
                        {logo ? (
                            <img className='small-logo' src={logo} alt={nombre} />
                        ) : (
                             <div className="logo-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                <FaImage size={30} color="#ccc" />
                            </div>
                        )}
                    </div>
                    <h3>{nombre}</h3>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' alt="Verificado" />
                    <p><IoLocationOutline />{ubicacionDetalle}</p>
                </div>
                <div className='tags-box alineado-auto'>
                    <Tags proveedor={proveedor} />
                </div>
                <div className='texts-box'>
                    {descripcion && <p className='description'>{descripcion}</p>}
                    {Array.isArray(marca) && marca.length > 0 && (
                        <div className='marcas alineado-auto'>
                            <h4>Marcas:</h4>
                            {marca.map((m, i) => <p key={`${m}-${i}`}>{m}{i < marca.length - 1 ? ',' : ''}</p>)}
                        </div>
                    )}
                    {Array.isArray(extras) && extras.length > 0 && (
                        <div className='extras alineado-auto'>
                            <h4>Servicios y Capacidades: </h4>
                            {extras.map((extra, index) => (
                                <p key={index} className='tag-extra'>{extra}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className='buttons-box'>
                {contacto.sitioWeb && <a href={contacto.sitioWeb.startsWith('http') ? contacto.sitioWeb : `https://${contacto.sitioWeb}`} target="_blank" rel="noopener noreferrer"><IoGlobeOutline /> Sitio Web</a>}
                {contacto.whatsapp && <a href={`https://wa.me/${contacto.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> WhatsApp</a>}
                {contacto.telefono && <a href={`tel:${contacto.telefono}`}><FaPhoneAlt /> Teléfono</a>}
                {contacto.email && <a href={`mailto:${contacto.email}`}><FaEnvelope /> Email</a>}
            </div>
        </div>
    );
};

export default CardDesktop;