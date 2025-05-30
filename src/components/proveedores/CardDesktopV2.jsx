// src/components/proveedores/CardDesktopV2.jsx
import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowRight, FaArrowLeft, FaImage, FaImages } from "react-icons/fa";
import Tags from './assets/Tags';
import ProductsCarousel from './assets/ProductsCarousel';

const CardDesktopV2 = ({ proveedor }) => {
    if (!proveedor) {
        return null;
    }

    const {
        nombre = 'Nombre no disponible',
        logo, // Is an object: { url: "...", ... } or null
        carrusel = [], // Is an array of objects: [{ url: "...", fileType: "image", ... }, ...]
        ubicacionDetalle = 'Ubicación no especificada',
        galeria = [], // This is `proveedor.galeria` from context, which comes from Firestore
    } = proveedor;

    const logoUrl = logo?.url;
    const tieneLogo = !!logoUrl;

    const validCarruselItems = Array.isArray(carrusel) ? carrusel.filter(item => item && typeof item.url === 'string') : [];
    const tieneCarruselPrincipal = validCarruselItems.length > 0;

    const totalSlidesPrincipal = 1 + (tieneCarruselPrincipal ? validCarruselItems.length : 0);
    const effectiveTotalSlidesPrincipal = totalSlidesPrincipal > 1 ? totalSlidesPrincipal : (tieneLogo ? 1 : 1);

    // The 'galeria' prop is passed to ProductsCarousel.
    // It's an array of objects, each having 'url' and/or 'imagenURL', 'titulo', 'precio'.
    const validProductos = Array.isArray(galeria) ? galeria.filter(p => p && (p.url || p.imagenURL)) : [];


    return (
        <div className='proveedor-item-desktop-v2 hiddenInMobile'>
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
                                <div className="carousel-placeholder" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0'}}>
                                    <FaImage size={50} color="#ccc"/>
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
                        {!tieneLogo && !tieneCarruselPrincipal && (
                             <Slide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0'}}>
                                    <FaImages size={50} color="#ccc"/>
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
                            <div className="logo-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                <FaImage size={30} color="#ccc" />
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
                        // ProductsCarousel will receive items from 'proveedor.galeria'
                        // It needs to access 'producto.url' or 'producto.imagenURL' for the image src
                        <ProductsCarousel productos={validProductos} />
                    ) : (
                        <div style={{textAlign: 'center', padding: '20px', color: '#777', width: '100%'}}>
                            <p>(No hay productos destacados para mostrar)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardDesktopV2;