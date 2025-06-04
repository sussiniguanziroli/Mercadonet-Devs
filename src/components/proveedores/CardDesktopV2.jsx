// src/components/proveedores/CardDesktopV2.jsx
import React, { useState, useEffect, useRef } from 'react';
import { IoLocationOutline, IoGlobeOutline } from 'react-icons/io5';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowRight, FaArrowLeft, FaImage, FaImages, FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import Tags from './assets/Tags';
import ProductsCarousel from './assets/ProductsCarousel';
import { NavLink } from 'react-router-dom'; // Import NavLink

const CardDesktopV2 = ({ proveedor }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownTogglerRef = useRef(null);
    const dropdownMenuRef = useRef(null);

    if (!proveedor) {
        return null;
    }

    const {
        id, // Assuming this is the ID for the route
        nombre = 'Nombre no disponible',
        logo,
        carrusel = [],
        ubicacionDetalle = 'Ubicación no especificada',
        galeria = [],
        contacto = {}
    } = proveedor;


    const logoUrl = logo?.url;
    const tieneLogo = !!logoUrl;

    const validCarruselItems = Array.isArray(carrusel) ? carrusel.filter(item => item && typeof item.url === 'string') : [];
    const tieneCarruselPrincipal = validCarruselItems.length > 0;

    const totalSlidesPrincipal = 1 + (tieneCarruselPrincipal ? validCarruselItems.length : 0);
    const effectiveTotalSlidesPrincipal = totalSlidesPrincipal > 1 ? totalSlidesPrincipal : (tieneLogo ? 1 : 1);

    const validProductos = Array.isArray(galeria) ? galeria.filter(p => p && (p.url || p.imagenURL)) : [];

    // Construct the link to the provider's page
    const proveedorPageLink = id ? `/proveedor/${id}` : '#'; 

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsDropdownOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownMenuRef.current &&
                !dropdownMenuRef.current.contains(event.target) &&
                dropdownTogglerRef.current &&
                !dropdownTogglerRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };
        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);


    return (
        <div className='proveedor-item-desktop-v2 hiddenInMobile'>
            <div
                className='contact-dropdown-button'
                onClick={toggleDropdown}
                ref={dropdownTogglerRef}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDropdown(e);}}
            >
                <p>Contactar al Proveedor </p><IoIosArrowDown/>
            </div>

            {isDropdownOpen && (
                <div className='contact-dropdown-menu' ref={dropdownMenuRef}>
                    {contacto.sitioWeb && (
                        <a
                            href={contacto.sitioWeb.startsWith('http') ? contacto.sitioWeb : `https://${contacto.sitioWeb}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='contact-dropdown-item'
                        >
                            <IoGlobeOutline className='contact-dropdown-item-icon' /> Sitio Web
                        </a>
                    )}
                    {contacto.whatsapp && (
                        <a
                            href={`https://wa.me/${contacto.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='contact-dropdown-item'
                        >
                            <FaWhatsapp className='contact-dropdown-item-icon' /> WhatsApp
                        </a>
                    )}
                    {contacto.telefono && (
                        <a
                            href={`tel:${contacto.telefono}`}
                            className='contact-dropdown-item'
                        >
                            <FaPhoneAlt className='contact-dropdown-item-icon' /> Teléfono
                        </a>
                    )}
                    {contacto.email && (
                        <a
                            href={`mailto:${contacto.email}`}
                            className='contact-dropdown-item'
                        >
                            <FaEnvelope className='contact-dropdown-item-icon' /> Email
                        </a>
                    )}
                    {!(contacto.sitioWeb || contacto.whatsapp || contacto.telefono || contacto.email) && (
                        <div className='contact-dropdown-item contact-dropdown-item-empty'>
                            No hay información de contacto
                        </div>
                    )}
                </div>
            )}

            <div className='carousel-box'>
                <CarouselProvider
                    naturalSlideWidth={100}
                    naturalSlideHeight={100}
                    totalSlides={effectiveTotalSlidesPrincipal}
                    className="carousel-frame"
                    infinite={effectiveTotalSlidesPrincipal > 1}
                >
                    <Slider>

                        {tieneCarruselPrincipal && validCarruselItems.map((item, index) => (
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
                                    >
                                        Tu navegador no soporta la etiqueta de video.
                                    </video>
                                ) : (
                                    <div className="carousel-placeholder-item">
                                        <span>Formato no soportado</span>
                                    </div>
                                )}
                            </Slide>
                        ))}
                        {!tieneLogo && !tieneCarruselPrincipal && (
                            <Slide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder">
                                    <FaImages size={50} />
                                    <span>Multimedia del Proveedor</span>
                                </div>
                            </Slide>
                        )}
                    </Slider>
                    {effectiveTotalSlidesPrincipal > 1 && (
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
                            <div className="logo-placeholder">
                                <FaImage size={30} />
                            </div>
                        )}
                    </div>
                    {/* MODIFIED: Wrap nombre in NavLink */}
                    <NavLink to={proveedorPageLink} className="proveedor-name-link" style={{textDecoration: 'none', color: 'inherit'}}>
                        <h3>{nombre}</h3>
                    </NavLink>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' alt="Verificado" />
                    <div className='tags-box alineado-auto'>
                        <Tags proveedor={proveedor} />
                    </div>
                    <p><IoLocationOutline />{ubicacionDetalle}</p>
                </div>
                <div className='products-box'>
                    {validProductos.length > 0 ? (
                        <ProductsCarousel productos={validProductos} />
                    ) : (
                        <div className="no-products-placeholder">
                            <p>(No hay productos destacados para mostrar)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardDesktopV2;