import React, { useEffect, useRef, useState } from 'react'
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BarLoader } from 'react-spinners';


const NewsBanner = () => {
    
    const flickityRefMobile = useRef(null);
    const [bannersMobile, setBannersMobile] = useState([]);
    const [imagesLoaded, setImagesLoaded] = useState({ desktop: 0, mobile: 0 });
    const [isLoading, setIsLoading] = useState(true);


    
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
        const fetchData = async () => {
            await fetchBannersMobile();
            setIsLoading(false); 
        };

        fetchData();
    }, []);

    const initializeFlickity = () => {


        const flktyMobile = new Flickity(flickityRefMobile.current, {
            cellAlign: 'center',
            contain: true,
            pageDots: false,
            prevNextButtons: false,
            wrapAround: true,
            autoPlay: 2900,
        });

        
        
        flktyMobile.resize();
    };

    const handleImageLoad = (type) => {
        setImagesLoaded((prev) => {
            const newCount = { ...prev, [type]: prev[type] + 1 };
            // Verificar si todas las imágenes han sido cargadas
            if ( newCount.mobile === bannersMobile.length) {
                initializeFlickity();
            }
            return newCount;
        });
    };




    return (
        <main className='hiddenInDesktop'>
            {isLoading ? (
                <div className='banners-loading hiddenInDesktop'><BarLoader
                    color="#fff"
                    width={200}
                /></div>
            ) : (
                <>
                    {/* MOBILE */}
                    < aside className='news-banner bannerMobile hiddenInDesktop' >
                        <div className='main-carousel' ref={flickityRefMobile}>
                            {bannersMobile.map((banner) => <div key={banner.name} className='carousel-cell'>
                                <img className='carousel-image' src={banner.img} alt={banner.name} onLoad={() => handleImageLoad('mobile')} />
                            </div>)}
                        </div>
                    </aside >

                    
                </>
            )
            }
        </main>


    )
}

export default NewsBanner