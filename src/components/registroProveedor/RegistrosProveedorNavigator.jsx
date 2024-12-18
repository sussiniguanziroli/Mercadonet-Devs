import React, { useState } from "react";
import LandingRegistroProveedor from "./LandingRegistroProveedor";
import SeleccionTipoCard from "./SeleccionTipoCard";
import FormularioGeneral from "./FormularioGeneral";
import FormularioPersonalizado from "./FormularioPersonalizado";
import SeleccionPlan from "./SeleccionPlan";
import ResumenRegistro from "./ResumenRegistro";

const RegistrosProveedorNavigator = () => {
  const [currentStep, setCurrentStep] = useState(1); // Paso actual del flujo
  const [formData, setFormData] = useState({}); // Datos generales del formulario
  const [selectedCard, setSelectedCard] = useState(null); // Tipo de card seleccionada

  // Actualiza los datos del formulario
  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // Avanzar y retroceder entre pasos
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // Renderiza el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LandingRegistroProveedor nextStep={nextStep} />;
      case 2:
        return <SeleccionTipoCard nextStep={nextStep} setSelectedCard={setSelectedCard} />;
      case 3:
        return <FormularioGeneral nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} />;
      case 4:
        return (
          <FormularioPersonalizado
            nextStep={nextStep}
            prevStep={prevStep}
            selectedCard={selectedCard}
            updateFormData={updateFormData}
          />
        );
      case 5:
        return <SeleccionPlan nextStep={nextStep} prevStep={prevStep} updateFormData={updateFormData} />;
      case 6:
        return <ResumenRegistro formData={formData} selectedCard={selectedCard} />;
      default:
        return <LandingRegistroProveedor nextStep={nextStep} />;
    }
  };

  return <>{renderStep()}</>;
};

export default RegistrosProveedorNavigator;
