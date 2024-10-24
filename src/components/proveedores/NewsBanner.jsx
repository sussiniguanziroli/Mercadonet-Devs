import React, { useEffect, useRef, useState } from 'react'
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BarLoader } from 'react-spinners';


const NewsBanner = () => {
    const flickityRef = useRef(null);
    const flickityRefMobile = useRef(null);
    const [bannersDesktop, setBannersDesktop] = useState([]);
    const [bannersMobile, setBannersMobile] = useState([]);

    // Función para traer la colección "bannersDesktop"
    const fetchBannersDesktop = async () => {
        const docRef = doc(db, 'banners', 'MImKl6eI8mBBiLaSAbQ5');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setBannersDesktop(docSnap.data().bannersDesktop);
        } else {
            console.log("No se encontraron banners desktop");
        }
    };

    // Función para traer la colección "bannersMobile"
    const fetchBannersMobile = async () => {
        const docRef = doc(db, 'banners', 'piiyYFE6gNKmgNOUeF1o');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setBannersMobile(docSnap.data().bannersMobile);
        } else {
            console.log("No se encontraron banners móviles");
        }
    };

    // Llamada a las funciones cuando el componente se monta
    useEffect(() => {
        fetchBannersDesktop();
        fetchBannersMobile();
    }, []);



    useEffect(() => {
        setTimeout(() => {
            new Flickity(flickityRef.current, {
                cellAlign: 'center', // Centrar las imágenes
                contain: true,
                pageDots: true,
                prevNextButtons: true,
                wrapAround: true,
                autoPlay: 2900,
            })
        }, 1000);
    }, [bannersDesktop]);

    useEffect(() => {
        setTimeout(() => {
            new Flickity(flickityRefMobile.current, {
                cellAlign: 'center', // Centrar las imágenes
                contain: true,
                pageDots: false,
                prevNextButtons: false,
                wrapAround: true,
                autoPlay: 2900,
            })
        }, 1000);
    }, [bannersMobile]);
    return (
        <>
            {bannersDesktop.length == 0 || bannersMobile.length == 0 ? (
                <div className='banners-loading'><BarLoader
                    color="#fff"
                    width={200}
                /></div>
            ) : (
                <>
                    {/* MOBILE */}
                    < aside className='news-banner bannerMobile hiddenInDesktop' >
                        <div className='main-carousel' ref={flickityRefMobile}>
                            {bannersMobile.map((banner) => <div key={banner.name} className='carousel-cell'>
                                <img className='carousel-image' src={banner.img} alt={banner.name} />
                            </div>)}
                        </div>
                    </aside >

                    {/* DESKTOP */}
                    < aside className='news-banner hiddenInMobile' >
                        <div className='main-carousel' ref={flickityRef}>
                            {bannersDesktop.map((banner) => <div key={banner.name} className='carousel-cell'>
                                <img className='carousel-image' src={banner.img} alt={banner.name} />
                            </div>)}
                        </div>
                    </aside >
                </>
            )
            }
        </>


    )
}

export default NewsBanner