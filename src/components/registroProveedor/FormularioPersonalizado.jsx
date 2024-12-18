import React from "react";

const FormularioPersonalizado = ({ nextStep, prevStep, selectedCard, updateFormData }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateFormData(Object.fromEntries(formData));
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-personalizado">
      <h1>Formulario Personalizado para {selectedCard}</h1>
      {selectedCard === "tipoA" && (
        <label>
          Campo A1:
          <input type="text" name="campoA1" />
        </label>
      )}
      {selectedCard === "tipoB" && (
        <label>
          Campo B1:
          <input type="text" name="campoB1" />
        </label>
      )}
      <button type="button" onClick={prevStep}>
        Volver
      </button>
      <button type="submit">Siguiente</button>
    </form>
  );
};

export default FormularioPersonalizado;
