import React, { useEffect, useRef } from 'react'
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import bannersMobile from '../proveedores/bannersMobile.json'
import bannersDesktop from '../proveedores/bannersDesktop.json'

const NewsBanner = () => {
    const flickityRef = useRef(null);
    const flickityRefMobile = useRef(null);

    useEffect(() => {
        new Flickity(flickityRef.current, {
            cellAlign: 'center', // Centrar las imágenes
            contain: true,
            pageDots: true,
            prevNextButtons: true,
            wrapAround: true,
            autoPlay: 2900,
        })
    }, []);

    useEffect(() => {
        new Flickity(flickityRefMobile.current, {
            cellAlign: 'center', // Centrar las imágenes
            contain: true,
            pageDots: false,
            prevNextButtons: true,
            wrapAround: true,
            autoPlay: 2900,
        })
    }, []);
    return (
        <>
            {/* MOBILE */}
            <aside className='news-banner bannerMobile hiddenInDesktop'>
                <div className='main-carousel' ref={flickityRefMobile}>
                    {bannersMobile.map((banner) => <div key={banner.name} className='carousel-cell'>
                        <img className='carousel-image' src={banner.img} alt={banner.name} />
                    </div>)}
                </div>
            </aside>

            {/* DESKTOP */}
            <aside className='news-banner hiddenInMobile'>
                <div className='main-carousel' ref={flickityRef}>
                    {bannersDesktop.map((banner) => <div key={banner.name} className='carousel-cell'>
                        <img className='carousel-image' src={banner.img} alt={banner.name} />
                    </div>)}
                </div>
            </aside>
        </>
    )
}

export default NewsBanner