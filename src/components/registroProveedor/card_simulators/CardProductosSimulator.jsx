import React from 'react';
import { IoLocationOutline } from 'react-icons/io5';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

const CardProductosSimulator = ({data}) => {
    // Solo extraemos nombre y ubicación (con placeholders)
    const {
        nombre = '',
        ubicacionDetalle = ''
    } = data;

    const nombreMostrado = nombre.trim() || 'Nombre de tu empresa';
    const ubicacionMostrada = ubicacionDetalle.trim() || 'Ubicación de tu empresa';

    return (
        <div className="proveedor-item-desktop simulatorProductos">
            {/* Carrusel estático (simulado) */}
            <div className="carousel-box">
                <CarouselProvider
                    naturalSlideWidth={5}
                    naturalSlideHeight={5}
                    totalSlides={2}
                    className="carousel-frame"
                >
                    <Slider>
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

            {/* Info-box estático (con nombre y ubicación dinámicos) */}
            <div className="info-box">
                <div className="titles-box">
                    {/* Logo estático */}
                    <div className="small-logo-box">
                        <img
                            className="small-logo"
                            src="https://i.ibb.co/qYy7GL6s/image-9.png"
                            alt="Logo de la empresa"
                        />
                    </div>
                    {/* Nombre dinámico */}
                    <h3>{nombreMostrado}</h3>
                    {/* Ícono de verificado estático */}
                    <img
                        className="verificado"
                        src="https://i.ibb.co/MkjBH00V/Verificado-HD-removebg-preview.png"
                        alt="Verificado"
                    />
                    {/* Ubicación dinámica */}
                    <p><IoLocationOutline /> {ubicacionMostrada}</p>
                </div>
            </div>
        </div>
    )
}

export default CardProductosSimulator