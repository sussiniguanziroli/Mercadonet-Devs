import React from "react";

const SeleccionTipoCard = ({ nextStep, setSelectedCard }) => {
    const handleCardSelection = (cardType) => {
        setSelectedCard(cardType);
        nextStep();
    };

    return (
        <div className="seleccion-card-container">
            <div className="seleccion-tipo-card">
                <h1>Elige el tipo de Card</h1>
                <div className="card-options">
                    <div className="button-and-text-div">
                        <h2>Card Historia</h2>
                        <button className="card-button" onClick={() => handleCardSelection("tipoA")}>
                            <img src="../../../public/CardHistoria.png" alt="" />
                        </button>
                        <p>Todo proveedor tiene una historia que contar y una identidad a construir.</p>
                        <p>¡Cuéntanos a qué se dedica tu empresa y por qué deberían elegirte!</p>
                    </div>
                    <div className="button-and-text-div">
                        <h2>Card Productos</h2>
                        <button className="card-button" onClick={() => handleCardSelection("tipoB")}>
                            <img src="../../../public/CardProducto.png" alt="" />
                        </button>
                        <p>Card Premium de <strong>Mercadonet+</strong></p>
                        <p>Destinado a proveedores más demandantes que buscan destacar su catálogo de manera visual.</p>
                        <p>Permite mostrar imágenes y descripciones de publicaciones o productos directamente en la tarjeta del proveedor.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeleccionTipoCard;
