// src/components/proveedores/ProveedorPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { IoLocationOutline, IoGlobeOutline, IoArrowBack } from 'react-icons/io5';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaImage, FaImages, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

// Assuming these child components exist and are correctly imported
import Tags from '../proveedores/assets/Tags';
import ProductsCarousel from '../proveedores/assets/ProductsCarousel';
import Footer from '../footer/Footer';

// Import Firebase Firestore functions and the db instance
import { getDoc, doc } from "firebase/firestore";
// Adjust the path to your Firebase config file as necessary
// It's typically in a folder like 'src/firebase/config.js' or 'src/config/firebase.js'
import { db } from '../../firebase/config'; // IMPORTANT: Verify this path is correct

// This function will fetch data from Firebase
const fetchProveedorById = async (proveedorIdParam) => {
    if (!proveedorIdParam) {
        throw new Error("ID de proveedor no válido.");
    }
    // Assuming your collection is named 'proveedores'
    // If your collection has a different name, change 'proveedores' to the correct name.
    const proveedorDocRef = doc(db, "proveedores", proveedorIdParam);
    console.log(`Fetching document from Firestore: proveedores/${proveedorIdParam}`);

    const docSnap = await getDoc(proveedorDocRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        // Combine the document ID with its data
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        throw new Error(`Proveedor con ID ${proveedorIdParam} no encontrado.`);
    }
};

const ProveedorPage = () => {
    const { proveedorId } = useParams(); // This gets the ':proveedorId' from the URL
    const [proveedor, setProveedor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProveedorData = async () => {
            if (!proveedorId) {
                setError("No se proporcionó ID de proveedor.");
                setLoading(false);
                console.warn("ProveedorPage: proveedorId is undefined or null.");
                return;
            }
            console.log(`ProveedorPage: Attempting to load data for proveedorId: ${proveedorId}`);
            setLoading(true);
            setError(null);
            try {
                // Call the new Firebase fetch function
                const data = await fetchProveedorById(proveedorId);
                setProveedor(data);
                console.log(`ProveedorPage: Data loaded successfully for ${proveedorId}`, data);
            } catch (err) {
                setError(err.message || "Error al cargar los datos del proveedor.");
                console.error(`ProveedorPage: Error fetching proveedor data for ID ${proveedorId}:`, err);
            } finally {
                setLoading(false);
            }
        };

        loadProveedorData();
    }, [proveedorId]); // Re-run effect if proveedorId changes

    if (loading) {
        return <div className="proveedor-page-status">Cargando perfil del proveedor...</div>;
    }

    if (error) {
        return (
            <div className="proveedor-page-status proveedor-page-error">
                <p>Error: {error}</p>
                <NavLink to="/proveedores" className="button-like">Volver a Proveedores</NavLink>
            </div>
        );
    }

    if (!proveedor) {
        return (
            <div className="proveedor-page-status">
                <p>Proveedor no encontrado o datos no disponibles.</p>
                <NavLink to="/proveedores" className="button-like">Volver a Proveedores</NavLink>
            </div>
        );
    }

    // Destructure with default values to prevent errors if fields are missing
    const {
        nombre = 'Nombre no disponible',
        logo,
        carrusel = [],
        ubicacionDetalle = '',
        ciudad = '',
        provincia = '',
        descripcionGeneral = 'No hay descripción disponible.',
        marcasConfiguradas = [],
        extrasConfigurados = [],
        contacto = {},
        galeria = [] // This is for the products/services gallery
    } = proveedor;

    const logoUrl = logo?.url;
    const tieneLogo = !!logoUrl;

    const fullUbicacion = [ubicacionDetalle, ciudad, provincia].filter(Boolean).join(', ');

    const validCarruselItems = Array.isArray(carrusel) ? carrusel.filter(item => item && typeof item.url === 'string') : [];
    const tieneCarrusel = validCarruselItems.length > 0;
    
    let mainCarouselSlides = [];
    if (tieneLogo) {
        mainCarouselSlides.push({ type: 'logo', url: logoUrl, alt: `${nombre} Logo` });
    }
    if (tieneCarrusel) {
        validCarruselItems.forEach(item => mainCarouselSlides.push({type: 'carrusel', ...item}));
    }
    const effectiveTotalSlides = mainCarouselSlides.length > 0 ? mainCarouselSlides.length : 1;

    const validProductos = Array.isArray(galeria) ? galeria.filter(p => p && (p.url || p.imagenURL)) : [];

    // Basic styling (consider moving to a CSS file)
    // This style block is the same as before, just included for completeness
    const styles = `
        .proveedor-page-container { padding: 20px; max-width: 1200px; margin: 40px auto; font-family: 'Inter', sans-serif; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .proveedor-page-breadcrumb { margin-bottom: 20px; font-size: 0.9em; color: #555; }
        .proveedor-page-breadcrumb a { color: #007bff; text-decoration: none; }
        .proveedor-page-breadcrumb a:hover { text-decoration: underline; }
        .proveedor-page-header { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .proveedor-page-header img.logo { width: 120px; height: 120px; object-fit: contain; margin-bottom:15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .proveedor-page-header h1 { margin: 0 0 10px 0; font-size: 2.2em; color: #333; }
        .proveedor-page-header .location { display: flex; align-items: center; color: #555; font-size: 1em; margin-bottom: 15px; }
        .proveedor-page-header .location svg { margin-right: 8px; }
        .proveedor-page-header .tags-container { margin-top: 10px; }
        .proveedor-page-main-visual .carousel-frame-page { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #fff; }
        .proveedor-page-main-visual .carousel-slide .carousel-image { width: 100%; height: 400px; object-fit: cover; } /* Default for images */
        .proveedor-page-main-visual .carousel-slide .carousel-image-logo { width: 100%; height: 400px; object-fit: contain; padding:20px; background-color: #f8f9fa; } /* Specific for logo */
        .proveedor-page-main-visual .carousel-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; background-color: #f0f0f0; color: #aaa; }
        .carousel-button { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.4); color:white; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; z-index:10; display:flex; align-items:center; justify-content:center; transition: background-color 0.3s; }
        .carousel-button:hover { background:rgba(0,0,0,0.6); }
        .carousel-button.back { left:15px; }
        .carousel-button.next { right:15px; }
        .carousel-dots { text-align:center; margin-top:10px; }
        .carousel-dots .carousel__dot { width:10px; height:10px; border-radius:50%; background-color:#ccc; margin: 0 5px; border:none; padding:0; }
        .carousel-dots .carousel__dot--selected { background-color:#007bff; }
        .section-title { font-size: 1.6em; color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #007bff; display: inline-block; }
        .proveedor-page-section { background-color: #fff; padding: 25px; margin-bottom: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .proveedor-page-descripcion p { white-space: pre-line; line-height: 1.7; color: #444; }
        .marcas-list, .extras-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .marcas-list span, .extras-list li { background: #e9ecef; padding: 8px 15px; border-radius: 20px; font-size: 0.9em; color: #333; }
        .extras-list { list-style: none; padding-left: 0; }
        .contact-links { display: flex; flex-direction: column; gap: 12px; }
        .contact-links a { text-decoration: none; color: #007bff; display: flex; align-items: center; padding: 10px 15px; border-radius: 5px; transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; border: 1px solid transparent; }
        .contact-links a:hover { background-color: #e9ecef; color: #0056b3; border-color: #ddd; }
        .contact-links a svg { margin-right: 10px; font-size: 1.2em; }
        .proveedor-page-status { text-align: center; padding: 50px 20px; font-size: 1.2em; color: #555; }
        .proveedor-page-error p { color: #dc3545; }
        .button-like { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; transition: background-color 0.3s; }
        .button-like:hover { background-color: #0056b3; }

        @media (max-width: 768px) {
            .proveedor-page-header { flex-direction: column; align-items: center; text-align: center; }
            .proveedor-page-header img.logo { margin-right: 0; margin-bottom: 15px; }
            .proveedor-page-header h1 { font-size: 1.8em; }
            .proveedor-page-main-visual .carousel-slide .carousel-image,
            .proveedor-page-main-visual .carousel-slide .carousel-image-logo,
            .proveedor-page-main-visual .carousel-placeholder { height: 250px; }
            .section-title { font-size: 1.4em; }
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="proveedor-page-container">
                <nav className="proveedor-page-breadcrumb">
                    <NavLink to="/"><IoArrowBack /> Volver a Inicio</NavLink> / <NavLink to="/proveedores">Proveedores</NavLink> / <span>{nombre}</span>
                </nav>
                
                <header className="proveedor-page-header">
                    {tieneLogo && (
                        <img src={logoUrl} alt={`${nombre} Logo`} className="logo" />
                    )}
                    <h1>{nombre}</h1>
                    {fullUbicacion && (
                        <p className="location">
                            <IoLocationOutline />
                            {fullUbicacion}
                        </p>
                    )}
                    <div className="tags-container">
                        <Tags proveedor={proveedor} />
                    </div>
                    {proveedor.planSeleccionado?.tag && (
                        <span style={{fontSize: '0.9em', fontWeight:'bold', color: '#fff', backgroundColor: '#28a745', padding: '3px 8px', borderRadius: '4px', marginTop: '10px'}}>
                            {proveedor.planSeleccionado.tag}
                        </span>
                    )}
                </header>

                <main className="proveedor-page-content">
                    <section className="proveedor-page-main-visual proveedor-page-section">
                        <h2 className="section-title">Galería Principal</h2>
                        <CarouselProvider
                            naturalSlideWidth={16}
                            naturalSlideHeight={9}
                            totalSlides={effectiveTotalSlides}
                            infinite={effectiveTotalSlides > 1}
                            className="carousel-frame-page"
                        >
                            <Slider>
                                {mainCarouselSlides.length > 0 ? mainCarouselSlides.map((slide, index) => (
                                    <Slide key={index} index={index}>
                                        {slide.type === 'logo' ? (
                                            <img className='carousel-image-logo' src={slide.url} alt={slide.alt} />
                                        ) : slide.fileType === 'image' ? (
                                            <img className='carousel-image' src={slide.url} alt={slide.alt || `Imagen ${index + 1}`} />
                                        ) : slide.fileType === 'video' ? (
                                            <video className='carousel-image' src={slide.url} controls muted loop>
                                                Tu navegador no soporta la etiqueta de video.
                                            </video>
                                        ) : ( 
                                            <div className="carousel-placeholder">
                                                <FaImage size={50} />
                                                <span>Contenido multimedia</span>
                                            </div>
                                        )}
                                    </Slide>
                                )) : (
                                    <Slide index={0}>
                                        <div className="carousel-placeholder">
                                            <FaImages size={60} />
                                            <span>No hay multimedia principal disponible</span>
                                        </div>
                                    </Slide>
                                )}
                            </Slider>
                            {effectiveTotalSlides > 1 && (
                                <>
                                    <ButtonBack className="carousel-button back"><FaArrowLeft /></ButtonBack>
                                    <ButtonNext className="carousel-button next"><FaArrowRight /></ButtonNext>
                                    <DotGroup className='carousel-dots' />
                                </>
                            )}
                        </CarouselProvider>
                    </section>

                    <section className="proveedor-page-descripcion proveedor-page-section">
                        <h2 className="section-title">Sobre Nosotros</h2>
                        <p>{descripcionGeneral}</p>
                    </section>

                    {Array.isArray(marcasConfiguradas) && marcasConfiguradas.length > 0 && (
                        <section className="proveedor-page-marcas proveedor-page-section">
                            <h2 className="section-title">Marcas que Trabajamos</h2>
                            <div className="marcas-list">
                                {marcasConfiguradas.map((marca, i) => (
                                    <span key={`${marca}-${i}`}>{marca}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {Array.isArray(extrasConfigurados) && extrasConfigurados.length > 0 && (
                         <section className="proveedor-page-extras proveedor-page-section">
                            <h2 className="section-title">Servicios y Capacidades Adicionales</h2>
                            <ul className="extras-list">
                                {extrasConfigurados.map((extra, index) => (
                                    <li key={index}>{extra}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                    
                    {validProductos.length > 0 && (
                        <section className="proveedor-page-productos-destacados proveedor-page-section">
                            <h2 className="section-title">Productos Destacados</h2>
                            <ProductsCarousel productos={validProductos} />
                        </section>
                    )}

                    <section className="proveedor-page-contacto proveedor-page-section">
                        <h2 className="section-title">Información de Contacto</h2>
                        <div className="contact-links">
                            {contacto.sitioWeb && <a href={contacto.sitioWeb.startsWith('http') ? contacto.sitioWeb : `https://${contacto.sitioWeb}`} target="_blank" rel="noopener noreferrer"><IoGlobeOutline /> Visitar Sitio Web</a>}
                            {contacto.whatsapp && <a href={`https://wa.me/${contacto.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> Chatear por WhatsApp</a>}
                            {contacto.telefono && <a href={`tel:${contacto.telefono}`}><FaPhoneAlt /> Llamar ({contacto.telefono})</a>}
                            {contacto.email && <a href={`mailto:${contacto.email}`}><FaEnvelope /> Enviar Email</a>}
                            {!(contacto.sitioWeb || contacto.whatsapp || contacto.telefono || contacto.email) && <p>No hay información de contacto específica disponible.</p>}
                        </div>
                    </section>
                </main>
            </div>
            <Footer/>
        </>
    );
};

export default ProveedorPage;