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
                naturalSlideHeight={100}
                totalSlides={4}
                className="carousel-frame"
            >
                <Slider>
                    <Slide className='carousel-slide' index={0}>
                        <img className='carousel-image' src="https://i.ibb.co/tptKK79Y/1-El-Alibaba-Argentino.png" alt="Slide 1" />
                    </Slide>
                    <Slide className='carousel-slide' index={1}>
                        <img className='carousel-image' src="https://i.ibb.co/rR98BxT5/2-Import-directo-sin-riesgos.png" alt="Slide 2" />
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
