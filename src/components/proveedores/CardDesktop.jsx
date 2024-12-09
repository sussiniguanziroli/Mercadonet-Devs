import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

const CardDesktop = ({ proveedor }) => {
    return (
        <div className='proveedor-item-desktop hiddenInMobile'>
            <div className='carousel-box'>
                <CarouselProvider
                    naturalSlideWidth={5}
                    naturalSlideHeight={5}
                    totalSlides={2}
                    className="carousel-frame"
                >
                    <Slider>
                        <Slide className='carousel-slide' index={0}>
                            <img className='carousel-image' src={proveedor.logo} alt="Slide 1" />
                        </Slide>
                        <Slide className='carousel-slide' index={1}>
                            <iframe title="Publicidad" src={proveedor.carousel} frameBorder="0"></iframe>
                        </Slide>
                    </Slider>
                    <ButtonBack className="carousel-button back"><FaArrowLeft />
                    </ButtonBack>
                    <ButtonNext className="carousel-button next"><FaArrowRight />
                    </ButtonNext>
                    <DotGroup className='carousel-dots' />
                </CarouselProvider>
            </div>
            <div className='info-box'>
                <div className='titles-box'>
                    <img className='small-logo' src={proveedor.logo} alt={proveedor.nombre} />
                    <h3>{proveedor.nombre}</h3>
                    <p><IoLocationOutline />{proveedor.ubicacionDetalle}</p>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' />
                </div>
                <div className='tags-box alineado-auto'>
                    {proveedor.tags?.includes('Distribuidor Oficial') && (
                        <img
                            className='tag-distroficial'
                            src='https://i.imgur.com/RIN3TB0.png'
                            alt='Distribuidor Oficial'
                        />
                    )}
                    {proveedor.tags?.includes('Mayorista') && (
                        <img
                            className='tag-mayorista'
                            src='https://i.imgur.com/DiAnzfH.png'
                            alt='Mayorista'
                        />
                    )}
                    {proveedor.tags?.includes('Fabricante') && (
                        <img
                            className='tag-fabricante'
                            src='https://i.imgur.com/nscxZFG.png'
                            alt='Fabricante'
                        />
                    )}
                </div>
                <div className='texts-box'>
                    <p className='description'>{proveedor.descripcion}</p>
                    <div className='marcas alineado-auto'>
                        <h4>Marcas:</h4>
                        {proveedor.marca.map((marca) => <p>{marca},</p>)}
                    </div>
                    {proveedor.extras && proveedor.extras.length > 0 && (
                        <div className='extras alineado-auto'>
                            <h4>Servicios y Capacidades</h4>
                            {proveedor.extras.map((extra, index) => (
                                <p key={index} className='tag-extra'>{extra},</p>
                            ))}
                        </div>
                    )}

                </div>
            </div>
            <div className='buttons-box'>
                <button>Sitio Web</button>
                <button>WhatsApp</button>
                <button>Teléfono</button>
                <button>Email</button>
            </div>
        </div>
    )
}

export default CardDesktop

//<div className='title-img'>
//<img src={proveedor.imagen} alt={proveedor.name} />
//<div className='title-location'>
//<h2>{proveedor.nombre}</h2>
//<strong><IoLocationOutline className='icon' />
// {proveedor.ubicacionDetalle}</strong>
//</div>
//</div>
//<p className='descripcion'>{proveedor.description}</p>
