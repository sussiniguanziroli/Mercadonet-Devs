import React from "react";

const FormularioPersonalizadoTipoA = ({ nextStep, prevStep, updateFormData }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateFormData(Object.fromEntries(formData));
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-personalizado-a">
      <h1>Proveedor</h1>

      {/* Logo */}
      <div className="form-section">
        <label>Logo</label>
        <div className="input-logo">
          <input type="file" name="logo" accept="image/*" />
        </div>
      </div>

      {/* Carrusel Multimedia */}
      <div className="form-section">
        <label>Carrusel multimedia</label>
        <div className="input-carrusel">
          <input type="file" name="carrusel" accept="image/*" multiple />
          <p>Agregar multimedia <br /> O arrastra y suelta</p>
        </div>
      </div>

      {/* Descripción */}
      <div className="form-section">
        <label>Descripción del Proveedor</label>
        <textarea name="descripcion" placeholder="Escribe una breve descripción aquí..." rows="4"></textarea>
      </div>

      {/* Marcas y Servicios */}
      <div className="form-section">
        <input type="text" name="marcas" placeholder="Marcas" />
        <input type="text" name="servicios" placeholder="Servicios extra y capacidades" />
      </div>

      {/* Información de Contacto */}
      <div className="form-section">
        <label>Información de Contacto</label>
        <input type="text" name="sitioWeb" placeholder="Sitio Web" />
        <input type="text" name="whatsapp" placeholder="Whatsapp" />
        <input type="text" name="telefono" placeholder="Teléfono" />
        <input type="email" name="email" placeholder="Email" />
      </div>

      {/* Botones */}
      <div className="botones-navegacion">
        <button type="button" onClick={prevStep}>Atrás</button>
        <button type="submit">Continuar</button>
      </div>
    </form>
  );
};

export default FormularioPersonalizadoTipoA;
