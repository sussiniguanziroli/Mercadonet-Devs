import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { FaArrowLeft, FaArrowRight, FaImage, FaImages } from "react-icons/fa";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import RegisterTags from '../assetsRegistro/RegisterTags';


const CardHistoriaPreview = ({ proveedor }) => {
    const {
        selectedServices = [], // Usado por RegisterTags
        tipoRegistro = '',     // Usado por RegisterTags
        tipoProveedor = [],    // Usado por RegisterTags
        nombre = '',
        ubicacionDetalle = '',
        logoPreview = null,    // URL para el logo (puede ser blob: o https:)
        carrusel = [],         // Array de objetos: { url, fileType, mimeType }
        descripcion = '',
        marca = [],
        extras = [],
        // Campos de contacto, si se necesitaran en la preview
        // sitioWeb = '', whatsapp = '', telefono = '', email = ''
    } = proveedor || {};

    const nombreMostrado = nombre.trim() || 'Nombre Empresa';
    const ubicacionMostrada = ubicacionDetalle.trim() || 'Ubicación';

    const tieneCarrusel = Array.isArray(carrusel) && carrusel.length > 0 && carrusel.some(item => item && typeof item.url === 'string');
    const tieneLogo = logoPreview && typeof logoPreview === 'string';

    return (
        <div className="card-historia-preview">
            <div className="carousel-box">
                <CarouselProvider
                    naturalSlideWidth={100}
                    naturalSlideHeight={100}
                    totalSlides={tieneCarrusel ? carrusel.length : 1}
                    className="carousel-frame"
                    infinite={tieneCarrusel && carrusel.length > 1}
                >
                    <Slider>
                        {tieneCarrusel ? (
                            carrusel.map((item, index) => (
                                <Slide className="carousel-slide" key={item.url ? `${item.url}-${index}` : index} index={index}>
                                    {item.fileType === 'image' ? (
                                        <img
                                            className="carousel-image"
                                            src={item.url}
                                            alt={`Multimedia ${index + 1}`}
                                            onError={(e) => { e.target.style.display = 'none'; /* Podría mostrar un placeholder aquí */ }}
                                        />
                                    ) : item.fileType === 'video' ? (
                                        <video
                                            className="carousel-image"
                                            src={item.url}
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; /* Podría mostrar un placeholder aquí */ }}
                                        >
                                            Tu navegador no soporta la etiqueta de video.
                                        </video>
                                    ) : (
                                        <div className="carousel-placeholder-item">
                                            <span>Formato no soportado</span>
                                        </div>
                                    )}
                                </Slide>
                            ))
                        ) : (
                            <Slide className="carousel-slide" index={0}>
                                <div className="carousel-placeholder">
                                    <FaImages />
                                    <span>Tu Multimedia</span>
                                </div>
                            </Slide>
                        )}
                    </Slider>
                    {tieneCarrusel && carrusel.length > 1 && (
                        <>
                            <ButtonBack className="carousel-button back"><FaArrowLeft /></ButtonBack>
                            <ButtonNext className="carousel-button next"><FaArrowRight /></ButtonNext>
                            <DotGroup className="carousel-dots" />
                        </>
                    )}
                </CarouselProvider>
            </div>

            <div className="info-box">
                <div className="titles-box">
                    <div className="small-logo-box">
                        {tieneLogo ? (
                            <img className="small-logo" src={logoPreview} alt="Logo" />
                        ) : (
                            <div className="logo-placeholder">
                                <FaImage />
                                <span>Logo</span>
                            </div>
                        )}
                    </div>
                    <h3>{nombreMostrado}</h3>
                    <img className="verificado" src="https://i.ibb.co/MkjBH00V/Verificado-HD-removebg-preview.png" alt="Verificado" />
                    <p><IoLocationOutline /> {ubicacionMostrada}</p>
                </div>

                <div className='tags-box'>
                    {/* RegisterTags consume varias props de proveedor */}
                    <RegisterTags proveedor={proveedor} />
                </div>

                <div className="texts-box">
                    {descripcion ? (
                        <p className="description">
                            {descripcion.length > 500
                                ? `${descripcion.substring(0, 500)}...`
                                : descripcion
                            }
                        </p>
                    ) : null}

                    {Array.isArray(marca) && marca.length > 0 && (
                        <div className="marcas alineado-auto"><h4>Marcas:</h4> {marca.slice(0, 5).map((m, i) => <p key={`${m}-${i}`}>{m}</p>)}{marca.length > 5 && <p>...</p>}</div>
                    )}
                    {Array.isArray(extras) && extras.length > 0 && (
                        <div className="extras alineado-auto">
                            <h4>Servicios/Extras:</h4>
                            {extras.slice(0, 2).map((e, i) => (
                                <p key={`${e}-${i}`} className="tag-extra">{e}</p>
                            ))}
                            {extras.length > 2 && (
                                <p className="tag-extra">...</p>
                            )}
                        </div>
                    )}
                    {!descripcion && (!marca || marca.length === 0) && (!extras || extras.length === 0) && (
                        <p className='placeholder-text'>(Aquí aparecerá tu descripción, marcas y servicios)</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardHistoriaPreview;