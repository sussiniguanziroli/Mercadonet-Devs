import React from "react";
import Slider from "react-slick";



const ProductsCarousel = ({ productos }) => {
    const settings = {
        dots: true, // Mostrar indicadores
        infinite: false, // Desplazamiento infinito
        speed: 500, // Velocidad de transición
        slidesToShow: 5, // Productos visibles al mismo tiempo
        slidesToScroll: 1, // Productos que avanza por clic
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    return (
        <div className="products-carousel">
            <Slider {...settings}>
                {productos.map((producto, index) => (
                    <div key={index} className="product-item">
                        <img
                            src={producto.imagenURL}
                            alt={producto.titulo}
                            className="product-image"
                        />
                        <p className="product-title">{producto.titulo}</p>
                        <p className="product-price">{producto.precio}</p>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default ProductsCarousel;
