import React from "react";

const SeleccionPlan = ({ nextStep, prevStep, updateFormData }) => {
  const handlePlanSelection = (plan) => {
    updateFormData({ plan });
    nextStep();
  };

  return (
    <div className="seleccion-plan">
      <h1>Selecciona tu Plan</h1>
      <div className="plan-options">
        <div className="plan-card">
          <h2>Plan Básico</h2>
          <p>Descripción breve del plan básico.</p>
          <button onClick={() => handlePlanSelection("Basico")}>Seleccionar Básico</button>
        </div>
        <div className="plan-card">
          <h2>Plan Premium</h2>
          <p>Descripción breve del plan premium.</p>
          <button onClick={() => handlePlanSelection("Premium")}>Seleccionar Premium</button>
        </div>
      </div>
      <button onClick={prevStep}>Volver</button>
    </div>
  );
};

export default SeleccionPlan;
