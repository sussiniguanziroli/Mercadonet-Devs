import React, { useEffect, useRef } from 'react'
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import imagenes from './json/slider.json'


const Flickl = () => {
    const flickityRef = useRef(null);

    useEffect(() => {
        new Flickity(flickityRef.current, {
            cellAlign: 'center', // Centrar las imágenes
            contain: true,
            pageDots: false,
            prevNextButtons: false,
            wrapAround: true,
        })
    }, []);

    return (
        <main className='flickl'>
            <div className='main-carousel' ref={flickityRef}>
                {imagenes.map((imagen) => <div key={imagen.id} className='carousel-cell'>
                    <img className='carousel-image' src={imagen.imagen} alt={imagen.id} />
                </div>)}
            </div>
        </main>
    )
}

export default Flickl