import React from 'react';
import Slider from 'react-slick';
import { IoLocationOutline } from 'react-icons/io5';
import Tags from './assets/Tags';

const CardMobileV2 = ({ proveedor }) => {
    const maxLength = 75;
    const truncatedDescription = proveedor.descripcion.length > maxLength
        ? proveedor.descripcion.slice(0, maxLength) + "...[ver más]"
        : proveedor.descripcion;

    const productos = [
        { titulo: "Conjunto Sommier", precio: "$80.000 - $160.000", imagen: "https://dcdn.mitiendanube.com/stores/001/365/853/products/pagina-web1-76c2d6c8884195030f16783915187385-1024-1024.jpg" },
        { titulo: "Samsung A15-A30", precio: "$100.000 c/u", imagen: "https://peruimporta.com/wp-content/uploads/2024/06/samsung-a15-5G-65x65-1.jpg" },
        { titulo: "Smart TV BGH", precio: "$120mil - $250mil", imagen: "https://arbghprod.vtexassets.com/arquivos/ids/163265/BGH-Android-TV_43.jpg?v=638445734763300000" },
        { titulo: "Mountain Bike", precio: "$70.000 x10u", imagen: "https://http2.mlstatic.com/D_NQ_NP_682156-MLU77775260580_072024-O.webp" },
        { titulo: "Notebook EXO", precio: "$120.000", imagen: "https://www.oscarbarbieri.com/pub/media/catalog/product/cache/7baadf0dec41407c7702efdbff940ecb/e/x/exo_t56.jpg" },
    ];

    // Configuración de react-slick para mobile
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
    };

    return (
        <div className='proveedor-item-v2 hiddenInDesktop'>
            <div className='top-container'>
                <div className='titles-container'>
                    <div className='small-logo-box'>
                        <img className='small-logo' src={proveedor.logo} alt={proveedor.nombre} />
                    </div>
                    <h2>{proveedor.nombre}</h2>
                    <img className="verificado" src='https://i.ibb.co/BsSRKwy/Verificado-HD.jpg' />
                    <p><IoLocationOutline />{proveedor.ubicacionDetalle}</p>

                    <div className='tags-box alineado-auto'>
                        <Tags proveedor={proveedor} />
                    </div>
                </div>
                <button>Ver Detalles</button>
            </div>

            {/* Carrusel de productos */}
            <div className='carousel-box'>
                <Slider {...settings}>
                    {productos.map((producto, index) => (
                        <div key={index} className="product-card">
                            <img src={producto.imagen} alt={producto.titulo} className="product-image" />
                            <div className="product-details">
                                <h4>{producto.titulo}</h4>
                                <p>{producto.precio}</p>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default CardMobileV2;
