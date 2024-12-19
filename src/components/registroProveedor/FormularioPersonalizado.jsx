import React from "react";
import FormularioPersonalizadoTipoA from "./FormularioPersonalizadoTipoA";
import FormularioPersonalizadoTipoB from "./FormularioPersonalizadoTipoB";

const FormularioPersonalizado = ({ nextStep, prevStep, selectedCard, updateFormData }) => {
    

    //a es historia b productos
    return (
        <div className="formulario-personalizado">
            <h1>Formulario Personalizado para {selectedCard}</h1>
            {selectedCard === "tipoA" && (
                <FormularioPersonalizadoTipoA prevStep={prevStep} nextStep={nextStep} />
            )}
            {selectedCard === "tipoB" && (
                <FormularioPersonalizadoTipoB prevStep={prevStep} nextStep={nextStep} />
            )}
        </div>
    );
};

export default FormularioPersonalizado;
