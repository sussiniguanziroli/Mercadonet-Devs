// src/components/proveedores/CardDesktopV2.jsx
import React, { useState, useEffect, useRef } from 'react';
import { IoLocationOutline, IoGlobeOutline } from 'react-icons/io5';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowRight, FaArrowLeft, FaImage, FaImages, FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import Tags from './assets/Tags'; 
import ProductsCarousel from './assets/ProductsCarousel'; 

const CardDesktopV2 = ({ proveedor }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownTogglerRef = useRef(null); // Ref for the button that toggles the dropdown
    const dropdownMenuRef = useRef(null); // Ref for the dropdown menu itself

    if (!proveedor) {
        return null;
    }

    const {
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

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsDropdownOpen(prev => !prev);
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the dropdown menu AND outside the toggle button
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
    }, [isDropdownOpen]); // Only re-run if isDropdownOpen changes


    return (
        <div className='proveedor-item-desktop-v2 hiddenInMobile'>  
            <div
                className='contact-dropdown-button'
                onClick={toggleDropdown}
                ref={dropdownTogglerRef} // Assign ref to the button
                role="button" // For accessibility
                tabIndex={0} // For accessibility
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDropdown(e);}} // For accessibility
            >
                <p>Contactar al Proveedor </p><IoIosArrowDown/>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className='contact-dropdown-menu' ref={dropdownMenuRef}> {/* Assign ref to the menu */}
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
                        <Slide className='carousel-slide' index={0}>
                            {tieneLogo ? (
                                <img className='carousel-image' src={logoUrl} alt={`${nombre} Logo`} />
                            ) : (
                                <div className="carousel-placeholder"> {/* Removed inline styles */}
                                    <FaImage size={50} /> {/* Removed color prop */}
                                    <span>Logo del Proveedor</span>
                                </div>
                            )}
                        </Slide>
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
                                        className='carousel-image' // Same class for consistent styling
                                        src={item.url}
                                        controls
                                        muted
                                        loop
                                    >
                                        Tu navegador no soporta la etiqueta de video.
                                    </video>
                                ) : (
                                    <div className="carousel-placeholder-item"> {/* Removed inline styles */}
                                        <span>Formato no soportado</span>
                                    </div>
                                )}
                            </Slide>
                        ))}
                        {!tieneLogo && !tieneCarruselPrincipal && (
                            <Slide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder"> {/* Removed inline styles */}
                                    <FaImages size={50} /> {/* Removed color prop */}
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
                            <div className="logo-placeholder"> {/* Removed inline styles */}
                                <FaImage size={30} /> {/* Removed color prop */}
                            </div>
                        )}
                    </div>
                    <h3>{nombre}</h3>
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
                        <div className="no-products-placeholder"> {/* Added class, removed inline styles */}
                            <p>(No hay productos destacados para mostrar)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardDesktopV2;