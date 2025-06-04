// src/components/proveedores/CardDesktop.jsx
import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowRight, FaArrowLeft, FaWhatsapp, FaPhoneAlt, FaEnvelope, FaImage, FaImages } from "react-icons/fa";
import { IoGlobeOutline } from "react-icons/io5";
import Tags from './assets/Tags';
import { NavLink } from 'react-router-dom';

const CardDesktop = ({ proveedor }) => {
    if (!proveedor) {
        return null;
    }

    const {
        nombre = 'Nombre no disponible',
        logo, // Is an object: { url: "...", ... } or null
        carrusel = [], // Is an array of objects: [{ url: "...", fileType: "image", ... }, ...]
        ubicacionDetalle = 'Ubicación no especificada',
        descripcionGeneral, // Use this field name
        marcasConfiguradas, // Use this field name
        extrasConfigurados, // Use this field name
        contacto = {},
        id
    } = proveedor;

    const maxLength = 700;

    const truncatedDescription = descripcionGeneral?.length > maxLength
        ? descripcionGeneral.substring(0, maxLength) + '...'
        : descripcionGeneral || 'Descripción no disponible';

    const proveedorPageLink = id ? `/proveedor/${id}` : '#';

    const logoUrl = logo?.url;
    const tieneLogo = !!logoUrl;

    const validCarruselItems = Array.isArray(carrusel) ? carrusel.filter(item => item && typeof item.url === 'string') : [];
    const tieneCarrusel = validCarruselItems.length > 0;

    const totalSlides = 1 + (tieneCarrusel ? validCarruselItems.length : 0);
    const effectiveTotalSlides = totalSlides > 1 ? totalSlides : (tieneLogo ? 1 : 1);

    return (
        <div className='proveedor-item-desktop hiddenInMobile'>
            <div className='carousel-box'>
                <CarouselProvider
                    naturalSlideWidth={100}
                    naturalSlideHeight={100}
                    totalSlides={effectiveTotalSlides}
                    className="carousel-frame"
                    infinite={effectiveTotalSlides > 1}
                >
                    <Slider>
                        {tieneCarrusel && validCarruselItems.map((item, index) => (
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
                                    <div className="carousel-placeholder-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#e9e9e9' }}>
                                        <span>Formato no soportado</span>
                                    </div>
                                )}
                            </Slide>
                        ))}
                        {!tieneLogo && !tieneCarrusel && (
                            <Slide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0' }}>
                                    <FaImages size={50} color="#ccc" />
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
                        {tieneLogo ? (
                            <img className='small-logo' src={logoUrl} alt={nombre} />
                        ) : (
                            <div className="logo-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                <FaImage size={30} color="#ccc" />
                            </div>
                        )}
                    </div>
                    <NavLink to={proveedorPageLink} className="proveedor-name-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3>{nombre}</h3>
                    </NavLink>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' alt="Verificado" />
                    <p><IoLocationOutline />{ubicacionDetalle}</p>
                </div>
                <div className='tags-box alineado-auto'>
                    <Tags proveedor={proveedor} />
                </div>
                <div className='texts-box'>
                    {descripcionGeneral && <p className='description'>{truncatedDescription}</p>}
                    {Array.isArray(marcasConfiguradas) && marcasConfiguradas.length > 0 && (
                        <div className='marcas alineado-auto'>
                            <h4>Marcas:</h4>
                            <p>
                                {marcasConfiguradas.slice(0, 8).join(', ')}
                                {marcasConfiguradas.length > 8 && ` +${marcasConfiguradas.length - 8}`}
                            </p>
                        </div>
                    )}
                    {Array.isArray(extrasConfigurados) && extrasConfigurados.length > 0 && (
                        <div className='extras alineado-auto'>
                            <h4>Servicios y Capacidades:</h4>
                            {extrasConfigurados.slice(0, 3).map((extra, index) => (
                                <p key={index} className='tag-extra'>{extra}</p>
                            ))}
                            {extrasConfigurados.length > 3 && (
                                <p className='tag-extra'>+{extrasConfigurados.length - 3} más</p>
                            )}
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