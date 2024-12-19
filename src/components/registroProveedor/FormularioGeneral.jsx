import React, { useState } from "react";

const FormularioGeneral = ({ nextStep, prevStep, updateFormData }) => {
  const [error, setError] = useState(""); // Manejo de errores para checkboxes
  const [selectedCategories, setSelectedCategories] = useState([]); // Manejo de categorías

  const categorias = [
    "Constructores y Corralones",
    "Ropa y calzado",
    "Electro e iluminación",
    "Farmacias e Insumos Médicos",
    "Muebles y colchonería",
    "Hecho en Argentina",
    "Supermercados y Kioscos",
    "Librería y Mercería",
    "Industria y otros",
    "Crea tu propia marca",
  ];

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    let updatedCategories = [...selectedCategories];

    if (checked) {
      if (updatedCategories.length < 5) {
        updatedCategories.push(value);
      } else {
        setError("Solo puedes seleccionar hasta 5 categorías.");
        return;
      }
    } else {
      updatedCategories = updatedCategories.filter((cat) => cat !== value);
    }

    setError("");
    setSelectedCategories(updatedCategories);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Agregar categorías seleccionadas al formData
    formData.append("categoriasAdicionales", JSON.stringify(selectedCategories));
    updateFormData(Object.fromEntries(formData));
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-general">
      <h1>Datos Generales del Proveedor</h1>

      <label>
        País / Región:
        <select name="pais" defaultValue="Argentina" required>
          <option value="Argentina">Argentina</option>
          <option value="Chile">Chile</option>
          <option value="México">México</option>
        </select>
      </label>

      <label>
        Nombre del Proveedor:
        <input type="text" name="nombreProveedor" required />
      </label>

      <label>
        Tipo de Proveedor:
        <select name="tipoProveedor" required>
          <option value="">Selecciona...</option>
          <option value="Distribuidor">Distribuidor</option>
          <option value="Fabricante">Fabricante</option>
          <option value="Minorista">Minorista</option>
        </select>
      </label>

      <label>
        Categoría Principal:
        <select name="categoriaPrincipal" required>
          <option value="">Selecciona...</option>
          {categorias.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>Otras categorías (Elige hasta 5)</legend>
        {categorias.map((cat, index) => (
          <label key={index}>
            <input
              type="checkbox"
              value={cat}
              onChange={handleCheckboxChange}
              checked={selectedCategories.includes(cat)}
            />
            {cat}
          </label>
        ))}
        {error && <p>{error}</p>}
      </fieldset>

      <label>
        Ciudad:
        <input type="text" name="ciudad" />
      </label>
      <label>
        Provincia:
        <input type="text" name="provincia" />
      </label>

      <h3>Cuéntanos sobre ti</h3>
      <label>
        Nombre:
        <input type="text" name="nombre" required />
      </label>
      <label>
        Apellido:
        <input type="text" name="apellido" required />
      </label>
      <label>
        Rol en la Empresa:
        <input type="text" name="rol" required />
      </label>
      <label>
        Whatsapp:
        <input type="text" name="whatsapp" required />
      </label>

      <h3>Información Legal y Financiera (Opcional)</h3>
      <label>
        CUIT:
        <input type="text" name="cuit" />
      </label>
      <label>
        Antigüedad (en años):
        <input type="number" name="antiguedad" min="0" />
      </label>
      <label>
        Facturación anual estimada (USD):
        <input type="number" name="facturacion" min="0" />
      </label>

      <div className="botones-navegacion">
        <button type="button" onClick={prevStep}>
          Atrás
        </button>
        <button type="submit">Continuar</button>
      </div>
    </form>
  );
};

export default FormularioGeneral;
