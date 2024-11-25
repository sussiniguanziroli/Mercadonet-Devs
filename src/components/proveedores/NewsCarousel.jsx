import React from 'react';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";




const NewsCarousel = () => {
    return (
        <div className="carousel-background hiddenInMobile">
            
            <CarouselProvider
                naturalSlideWidth={100}
                naturalSlideHeight={40}
                totalSlides={4}
                className="carousel-frame"
            >
                <Slider>
                    <Slide index={0}>
                        <img className='carousel-image' src="https://http2.mlstatic.com/D_NQ_639672-MLA80622004552_112024-OO.webp" alt="Slide 1" />
                    </Slide>
                    <Slide index={1}>
                        <img className='carousel-image' src="https://http2.mlstatic.com/D_NQ_656264-MLA80939003907_112024-OO.webp" alt="Slide 2" />
                    </Slide>
                    <Slide index={2}>
                        <img className='carousel-image' src="https://http2.mlstatic.com/D_NQ_657991-MLA80886869747_112024-OO.webp" alt="Slide 3" />
                    </Slide>
                    <Slide index={3}>
                        <img className='carousel-image' src="https://http2.mlstatic.com/D_NQ_966444-MLA80886866275_112024-OO.webp" alt="Slide 4" />
                    </Slide>                    
                </Slider>
                <ButtonBack className="carousel-button back"><FaArrowLeft />
                </ButtonBack>
                <ButtonNext className="carousel-button next"><FaArrowRight />
                </ButtonNext>
            </CarouselProvider>
            <div className="gradient-overlay"></div>
        </div>


    );
};

export default NewsCarousel;
