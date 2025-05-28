// src/components/proveedores/CardMobileV2.jsx
import React from 'react';
import Slider from 'react-slick';
import { IoLocationOutline } from 'react-icons/io5';
import Tags from './assets/Tags'; // Assuming Tags.jsx is in ./assets/
import { FaImage } from "react-icons/fa";

const CardMobileV2 = ({ proveedor }) => {
    if (!proveedor) {
        return null;
    }

    const {
        nombre = 'Nombre no disponible',
        logo = '',
        ubicacionDetalle = 'Ubicación no especificada',
        productos = [], // Expects array from proveedor.galeriaProductos
        // tipo, servicios, tipoRegistro are used by Tags component via the proveedor prop
    } = proveedor;

    // Settings for react-slick product carousel
    const settings = {
        dots: true,
        infinite: productos.length > 2, // Only infinite if enough items
        speed: 500,
        slidesToShow: Math.min(3, productos.length || 1), // Show 3, or less if fewer products
        slidesToScroll: 1,
        arrows: false,
         responsive: [
            {
                breakpoint: 480, // Small mobile
                settings: {
                    slidesToShow: Math.min(2, productos.length || 1),
                }
            },
             {
                breakpoint: 380, // Even smaller mobile
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    return (
        <div className='proveedor-item-v2 hiddenInDesktop'>
            <div className='top-container'>
                <div className='titles-container'>
                    <div className='small-logo-box'>
                         {logo ? (
                            <img className='small-logo' src={logo} alt={nombre} />
                        ) : (
                            <div className="logo-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                <FaImage size={24} color="#ccc" />
                            </div>
                        )}
                    </div>
                    <h2>{nombre}</h2>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' alt="Verificado" />
                    <p><IoLocationOutline />{ubicacionDetalle}</p>
                    <div className='tags-box alineado-auto'>
                        <Tags proveedor={proveedor} />
                    </div>
                </div>
                <button>Ver Detalles</button>
            </div>

            {Array.isArray(productos) && productos.length > 0 ? (
                <div className='carousel-box products-carousel-mobile-v2'> {/* Added class for specific styling */}
                    <Slider {...settings}>
                        {productos.map((producto, index) => (
                            <div key={producto.imagenURL || index} className="product-card-mobile"> {/* Use imagenURL as key if available */}
                                <img 
                                    src={producto.imagenURL || 'default-product-image.png'} // Use imagenURL
                                    alt={producto.titulo} 
                                    className="product-image" 
                                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/eee/ccc?text=Img'; }} // Fallback
                                />
                                <div className="product-details-mobile">
                                    <h4>{producto.titulo || "Producto"}</h4>
                                    <p>{producto.precio || "Consultar"}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            ) : (
                <div style={{textAlign: 'center', padding: '20px', color: '#777'}}>
                    <p>(No hay productos destacados para mostrar)</p>
                </div>
            )}
        </div>
    );
};

export default CardMobileV2;