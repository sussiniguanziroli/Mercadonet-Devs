import React, { useState, useEffect } from 'react';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowWidth;
};

const ProductsCarousel = ({ productos }) => {
    const windowWidth = useWindowWidth();

    const getVisibleSlides = () => {
        if (windowWidth > 1440) {
            return 4;
        }
        if (windowWidth > 1024) {
            return 3;
        }
        if (windowWidth > 600) {
            return 2;
        }
        return 1;
    };
    
    const visibleSlides = getVisibleSlides();

    if (!productos || productos.length === 0) {
        return null;
    }

    return (
        <div className="products-carousel">
            <CarouselProvider
                naturalSlideWidth={100}
                naturalSlideHeight={100}
                totalSlides={productos.length}
                visibleSlides={visibleSlides}
                step={visibleSlides}
                infinite={false}
            >
                <Slider>
                    {productos.map((producto, index) => {
                        const imageUrl = producto.imagenURL || producto.url;
                        const title = producto.titulo || 'Producto sin título';
                        const price = producto.precio || '';

                        return (
                            <Slide index={index} key={index}>
                                <div className="product-item">
                                   <div className="product-image-wrapper">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="product-image"
                                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/eee/ccc?text=Image+Not+Found"; }}
                                        />
                                    </div>
                                    <div className="product-info">
                                        <p className="product-title">{title}</p>
                                        {price && <p className="product-price">{price}</p>}
                                    </div>
                                </div>
                            </Slide>
                        );
                    })}
                </Slider>
                 {productos.length > visibleSlides && (
                    <>
                        <ButtonBack className="product-carousel-button back"><FaArrowLeft /></ButtonBack>
                        <ButtonNext className="product-carousel-button next"><FaArrowRight /></ButtonNext>
                    </>
                )}
                <DotGroup />
            </CarouselProvider>
        </div>
    );
};

export default ProductsCarousel;

