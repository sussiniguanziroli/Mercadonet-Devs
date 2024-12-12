import React from 'react'
import { IoLocationOutline } from 'react-icons/io5'
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowRight, FaArrowLeft, FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { IoGlobeOutline } from "react-icons/io5";
import Tags from './assets/Tags';
import ProductsCarousel from './assets/ProductsCarousel';

const CardDesktopV2 = ({ proveedor }) => {

    const productos = [
        { titulo: "Conjunto Sommier", precio: "$80.000 - $160.000", imagen: "https://dcdn.mitiendanube.com/stores/001/365/853/products/pagina-web1-76c2d6c8884195030f16783915187385-1024-1024.jpg" },
        { titulo: "Samsung A15-A30", precio: "$100.000 c/u", imagen: "https://peruimporta.com/wp-content/uploads/2024/06/samsung-a15-5G-65x65-1.jpg" },
        { titulo: "Smart TV BGH", precio: "$120mil - $250mil", imagen: "https://arbghprod.vtexassets.com/arquivos/ids/163265/BGH-Android-TV_43.jpg?v=638445734763300000" },
        { titulo: "Mountain Bike", precio: "$70.000 x10u", imagen: "https://http2.mlstatic.com/D_NQ_NP_682156-MLU77775260580_072024-O.webp" },
        { titulo: "Notebook EXO", precio: "$120.000", imagen: "https://www.oscarbarbieri.com/pub/media/catalog/product/cache/7baadf0dec41407c7702efdbff940ecb/e/x/exo_t56.jpg" },
    ];

    return (
        <div className='proveedor-item-desktop-v2 hiddenInMobile'>
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
                            <iframe title="Publicidad" src={proveedor.carousel} frameborder="0"></iframe>
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
                    <div className='small-logo-box'>
                        <img className='small-logo' src={proveedor.logo} alt={proveedor.nombre} />
                    </div>
                    <h3>{proveedor.nombre}</h3>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' />
                    <div className='tags-box alineado-auto'>
                        <Tags proveedor={proveedor} />
                    </div>
                    <p><IoLocationOutline />{proveedor.ubicacionDetalle}</p>

                </div>
                <div className='products-box'>
                    <ProductsCarousel productos={productos} />

                </div>
            </div>
        </div>
    )
}

export default CardDesktopV2