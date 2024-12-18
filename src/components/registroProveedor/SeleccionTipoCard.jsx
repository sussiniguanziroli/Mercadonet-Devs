import React from "react";

const SeleccionTipoCard = ({ nextStep, setSelectedCard }) => {
  const handleCardSelection = (cardType) => {
    setSelectedCard(cardType);
    nextStep();
  };

  return (
    <div className="seleccion-tipo-card">
      <h1>Selecciona el tipo de proveedor</h1>
      <div className="card-options">
        <button onClick={() => handleCardSelection("tipoA")}>Tipo A</button>
        <button onClick={() => handleCardSelection("tipoB")}>Tipo B</button>
      </div>
    </div>
  );
};

export default SeleccionTipoCard;
