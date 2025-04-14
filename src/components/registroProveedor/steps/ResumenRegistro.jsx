import React from "react";

const ResumenRegistro = ({ formData, selectedCard }) => {
  const handleConfirm = () => {
    console.log("Datos enviados:", formData, selectedCard);
    alert("Registro completado con éxito");
    // Aquí podrías enviar los datos a Firestore
  };

  return (
    <div className="resumen-registro">
      <h1>Resumen del Registro</h1>
      <div className="resumen-datos">
        <p><strong>Nombre:</strong> {formData.nombre}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Tipo de Card:</strong> {selectedCard}</p>
        <p><strong>Plan Seleccionado:</strong> {formData.plan}</p>
      </div>
      <button onClick={handleConfirm}>Confirmar y Finalizar</button>
    </div>
  );
};

export default ResumenRegistro;
