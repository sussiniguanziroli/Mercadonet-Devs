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
                totalSlides={3}
                className="carousel-frame"
            >
                <Slider>
                    <Slide index={0}>
                        <img className='carousel-image' src="https://www.solidbackgrounds.com/images/1920x1080/1920x1080-yellow-solid-color-background.jpg" alt="Slide 1" />
                    </Slide>
                    <Slide index={1}>
                        <img className='carousel-image' src="https://www.solidbackgrounds.com/images/7680x4320/7680x4320-bisque-solid-color-background.jpg" alt="Slide 2" />
                    </Slide>
                    <Slide index={2}>
                        <img className='carousel-image' src="https://www.solidbackgrounds.com/images/1280x800/1280x800-indigo-dye-solid-color-background.jpg" alt="Slide 3" />
                    </Slide>
                </Slider>
                <ButtonBack className="carousel-button back"><FaArrowLeft />
                </ButtonBack>
                <ButtonNext className="carousel-button next"><FaArrowRight />
                </ButtonNext>
            </CarouselProvider>
        </div>


    );
};

export default NewsCarousel;
