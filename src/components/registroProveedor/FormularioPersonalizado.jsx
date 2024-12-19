import React from "react";
import FormularioPersonalizadoTipoA from "./FormularioPersonalizadoTipoA";
import FormularioPersonalizadoTipoB from "./FormularioPersonalizadoTipoB";

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
        <FormularioPersonalizadoTipoA />
      )}
      {selectedCard === "tipoB" && (
       <FormularioPersonalizadoTipoB />
      )}
      <button type="button" onClick={prevStep}>
        Volver
      </button>
      <button type="submit">Siguiente</button>
    </form>
  );
};

export default FormularioPersonalizado;
