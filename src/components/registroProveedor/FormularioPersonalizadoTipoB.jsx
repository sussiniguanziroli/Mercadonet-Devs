import React from "react";

const FormularioPersonalizadoTipoB = ({ nextStep, prevStep, updateFormData }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateFormData(Object.fromEntries(formData));
    nextStep();
  };

  return (
    <div className="formulario-personalizado-b-container">

    
    <form onSubmit={handleSubmit} className="formulario-personalizado-b">
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

      {/* Galería de Productos */}
      <div className="form-section galeria-productos">
        <label>Galería de Productos</label>
        <div className="galeria-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="producto-card">
              <input type="file" name={`producto_imagen_${i}`} accept="image/*" />
              <input type="text" name={`producto_titulo_${i}`} placeholder="Título/Precio" />
              <textarea
                name={`producto_descripcion_${i}`}
                placeholder="Descripción"
                rows="2"
              ></textarea>
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="botones-navegacion">
        <button type="button" onClick={prevStep}>
          Atrás
        </button>
        <button type="submit">Continuar</button>
      </div>
    </form>
    <div className="card-productos-simulator-container">

    </div>
    </div>
  );
};

export default FormularioPersonalizadoTipoB;
