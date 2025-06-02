// src/components/proveedores/ProveedorPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom'; // Added NavLink for breadcrumbs or other links
import { IoLocationOutline, IoGlobeOutline, IoArrowBack } from 'react-icons/io5';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaImage, FaImages, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

// Assuming these child components exist and are correctly imported
// Make sure the paths are correct relative to this file.
// If they are in an 'assets' subfolder within 'proveedores', the path might be './assets/Tags'
import Tags from '../proveedores/assets/Tags';
import ProductsCarousel from '../proveedores/assets/ProductsCarousel';
// import HeaderCustomProveedores from './HeaderCustomProveedores'; // Optional
import Footer from '../footer/Footer'; // Optional

// --- Mock Data and Fetching ---
// This mock data should reflect the structure you provided, especially the 'id' field.
const MOCK_PROVEEDOR_DATA = {
    id: "gHiGTRzvjePKUNZTHoirIj5DRew1", // Using 'id' as the identifier
    nombre: "Prueba Productos Inc.", // Using 'nombre' as it appears in your object
    antiguedad: "5 años",
    apellidoContactoPersona: "Sussini",
    cardType: "tipoB", // or "cardProductos" depending on the provider
    carrusel: [
        { fileType: "image", url: "https://firebasestorage.googleapis.com/v0/b/mercadonet-net.firebasestorage.app/o/temp_registrations%2FgHiGTRzvjePKUNZTHoirIj5DRew1%2Fproveedores%2FtipoB%2Fcarrusel%2F1748622810905-1998001_1985_Corolla_GTS_liftback-640x418.jpg?alt=media&token=03ee4060-012e-4df0-8d39-b91dc19b83b3" },
        { fileType: "image", url: "https://firebasestorage.googleapis.com/v0/b/mercadonet-net.firebasestorage.app/o/temp_registrations%2FgHiGTRzvjePKUNZTHoirIj5DRew1%2Fproveedores%2FtipoB%2Fcarrusel%2F1748622810906-audi-sport-quattro-s1-e2-1985_3.jpg?alt=media&token=184158a1-1223-4a44-98a6-47686f2bdb2f" },
        { fileType: "image", url: "https://firebasestorage.googleapis.com/v0/b/mercadonet-net.firebasestorage.app/o/temp_registrations%2FgHiGTRzvjePKUNZTHoirIj5DRew1%2Fproveedores%2FtipoB%2Fcarrusel%2F1748622810906-Audi-WRC-Car.jpg?alt=media&token=23605649-e741-4581-80f9-6c36a36ea713" },
    ],
    categoriaPrincipal: "Automotriz y Repuestos",
    categoriasAdicionales: ["Construcción y Ferretería", "Maquinaria y Equipos Industriales", "Tecnología y Electrónica"],
    ciudad: "Corrientes",
    provincia: "Rio Negro",
    ubicacionDetalle: "Av. Siempreviva 742", // More specific address if available, otherwise construct from ciudad/provincia
    contacto: {
        email: "sussiniguanziroli@gmail.com",
        sitioWeb: "www.mercadonet.com",
        telefono: "+5493791234567",
        whatsapp: "5493791234567" // Numbers should be E.164 or similar for wa.me links
    },
    descripcionGeneral: "Somos Prueba Productos Inc., un proveedor líder en la industria automotriz y de repuestos con más de 5 años de experiencia. Ofrecemos una amplia gama de productos de alta calidad y servicios especializados como dropshipping y asesoramiento técnico. Nuestro compromiso es brindar soluciones integrales y personalizadas a nuestros clientes en Corrientes, Rio Negro y todo el país. Trabajamos con marcas reconocidas y nos esforzamos por mantenernos a la vanguardia de la tecnología y las tendencias del mercado.",
    estadoCuenta: "pendienteRevision",
    extrasConfigurados: ["Dropshipping", "Asesoramiento Técnico", "Envíos a todo el país", "Garantía Extendida"],
    galeria: [ // This is for products/services gallery
        { url: "https://firebasestorage.googleapis.com/v0/b/mercadonet-net.firebasestorage.app/o/temp_registrations%2FgHiGTRzvjePKUNZTHoirIj5DRew1%2Fproveedores%2FtipoB%2Fgaleria%2F1748622830238-grass_image001_copy_Z2uCG5c.jpg?alt=media&token=adaa57d4-0136-456d-b439-faa392ff5eb7", precio: "$233", titulo: "Motor Clásico 280ZX" },
        { url: "https://firebasestorage.googleapis.com/v0/b/mercadonet-net.firebasestorage.app/o/temp_registrations%2FgHiGTRzvjePKUNZTHoirIj5DRew1%2Fproveedores%2FtipoB%2Fgaleria%2F1748622844345-d985f57bf604a8d2e3654ed5c5187b71.jpg?alt=media&token=4e5703bc-5a30-4340-966f-79c5a9f24640", precio: "$344", titulo: "Kit de Suspensión R32" },
        { url: "https://firebasestorage.googleapis.com/v0/b/mercadonet-net.firebasestorage.app/o/temp_registrations%2FgHiGTRzvjePKUNZTHoirIj5DRew1%2Fproveedores%2FtipoB%2Fgaleria%2F1748622849086-00_Title_850306P-Rohrl-1-rkT.jpg?alt=media&token=71358000-6561-4f72-83af-a0b6a6094eca", precio: "$120", titulo: "Filtro de Aire Audi Sport" },
    ],
    logo: { url: "https://firebasestorage.googleapis.com/v0/b/mercadonet-net.firebasestorage.app/o/temp_registrations%2FgHiGTRzvjePKUNZTHoirIj5DRew1%2Fproveedores%2FtipoB%2Flogos%2F1748622801627-Me5BhaI9kXDG5XMLzPTuo0p5OtcL_7MFuKCOJaVUgJk.jpg?alt=media&token=8862efbe-96f3-4d72-9d2e-fd5781841b96" },
    marcasConfiguradas: ["Toyota", "Bosch", "Audi", "Nissan"],
    nombreContactoPersona: "Patricio",
    pais: "Argentina",
    planSeleccionado: { name: "Pro", tag: "Más Vendido" },
    rolContactoPersona: "Dueño y Senior",
    serviciosClaveParaTags: ["Automotriz", "Repuestos", "Mayorista"], // Used by Tags component
    tipoProveedor: ["Distribuidores Oficiales", "Mayoristas"], // Used by Tags component
    tipoRegistro: "productos", // Used by Tags component
};

// Replace this with your actual Firebase fetching logic
// Example: import { getDoc, doc } from 'firebase/firestore';
// import { db } from '../../firebase-config'; // Adjust path to your Firebase config
const fetchProveedorByIdSimulated = (proveedorIdParam) => {
    console.log("Simulating fetch for proveedor with ID:", proveedorIdParam);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Ensure the mock data ID matches the parameter
            if (proveedorIdParam === MOCK_PROVEEDOR_DATA.id) {
                resolve(MOCK_PROVEEDOR_DATA);
            } else {
                // Simulate finding another provider if you have more mock data
                // For now, just reject if not the main mock ID
                console.warn(`Mock data for ID ${proveedorIdParam} not found. Serving default mock or error.`);
                reject(new Error(`Proveedor con ID ${proveedorIdParam} no encontrado en datos de prueba.`));
            }
        }, 500); // Simulate network delay
    });
};
// --- End of Mock Data ---


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
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Replace with your actual Firebase call:
                // const docRef = doc(db, "proveedores", proveedorId); // Assuming 'proveedores' collection
                // const docSnap = await getDoc(docRef);
                // if (docSnap.exists()) {
                //     setProveedor({ id: docSnap.id, ...docSnap.data() });
                // } else {
                //     setError("Proveedor no encontrado.");
                // }
                const data = await fetchProveedorByIdSimulated(proveedorId);
                setProveedor(data);
            } catch (err) {
                setError(err.message || "Error al cargar los datos del proveedor.");
                console.error("Error fetching proveedor data:", err);
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
                <p>Proveedor no encontrado.</p>
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
    
    // For the main carousel, decide what to show: logo first, then carrusel items.
    // If no logo but carrusel exists, show carrusel. If neither, show placeholder.
    let mainCarouselSlides = [];
    if (tieneLogo) {
        mainCarouselSlides.push({ type: 'logo', url: logoUrl, alt: `${nombre} Logo` });
    }
    if (tieneCarrusel) {
        validCarruselItems.forEach(item => mainCarouselSlides.push({type: 'carrusel', ...item}));
    }
    const effectiveTotalSlides = mainCarouselSlides.length > 0 ? mainCarouselSlides.length : 1; // At least one slide for placeholder

    const validProductos = Array.isArray(galeria) ? galeria.filter(p => p && (p.url || p.imagenURL)) : [];


    // Basic styling (consider moving to a CSS file)
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
            {/* <HeaderCustomProveedores /> */}
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
                     {/* Assuming Tags component takes the full proveedor object */}
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
                                        ) : ( // Fallback for other types or if carrusel item is malformed
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
                            {/* Ensure ProductsCarousel can handle the 'galeria' items directly */}
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