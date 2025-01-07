import React, { useState } from "react";
import { AR } from 'country-flag-icons/react/3x2'

const FormularioGeneral = ({ nextStep, prevStep, updateFormData }) => {
    const [error, setError] = useState(""); // Manejo de errores para checkboxes
    const [selectedCategories, setSelectedCategories] = useState([]); // Manejo de categorías

    // aca hay que agregar estados para CADA una de los datos que debe cargar el proveedor

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
        "Nueva Categoria"
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

    console.log(AR)

    return (
        <div className="formulario-general-container">
            <img className="formulario-bg" src="https://i.ibb.co/tZ1y0zQ/Background-Ciudad.png" alt="BG Form" />
            <div className="form-card-container">
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="formulario-general">
                        <h1>Proveedor</h1>
                        <div className="orange-prop"></div>
                        <div className="custom-dropdown">
                            <label>
                                País / Región:
                                <select
                                    name="pais"
                                    defaultValue="Argentina"
                                    onChange={(e) => console.log(e.target.value)} // Aquí puedes manejar el cambio de estado
                                >
                                    <option value="Argentina">
                                        🇦🇷 Argentina
                                    </option>
                                    <option value="Chile">
                                        🇨🇱 Chile
                                    </option>
                                    <option value="México">
                                        🇲🇽 México
                                    </option>
                                </select>
                            </label>
                        </div>

                        <label>
                            Nombre del Proveedor:
                            <input type="text" name="nombreProveedor" placeholder="Nombre comercial al público" required />
                        </label>

                        <label>
                            Tipo de Proveedor:
                            <select name="tipoProveedor" required>
                                <option value="">Selecciona...</option>
                                <option value="Distribuidor">Distribuidor</option>
                                <option value="Fabricante">Fabricante</option>
                                <option value="Minorista">Mayorista</option>
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
                            <div className="cat-label-container">
                                {categorias.map((cat, index) => (
                                    <label className="cat-label" key={index}>
                                        <input
                                            type="checkbox"
                                            value={cat}
                                            onChange={handleCheckboxChange}
                                            checked={selectedCategories.includes(cat)}
                                        />
                                        <p>{cat}</p>
                                    </label>
                                ))}
                                {error && <p>{error}</p>}
                            </div>
                        </fieldset>

                        <div className="ubicacion-label-box">
                            <label>
                                <input type="text" name="ciudad" placeholder="Ciudad" />
                            </label>
                            <label>
                                <input type="text" name="provincia" placeholder="Provincia" />
                            </label>
                        </div>

                        <h3>Cuéntanos sobre ti</h3>

                        <div className="nombre-label-box">
                            <label>
                                <input type="text" name="nombre" placeholder="Nombre" required />
                            </label>
                            <label>
                                <input type="text" name="apellido" placeholder="Apellido" required />
                            </label>
                        </div>

                        <label>
                            Rol en la Empresa:
                            <input type="text" name="rol" required placeholder="Ej: Gerente" />
                        </label>
                        <label>
                            Whatsapp:
                            <input type="text" name="whatsapp" placeholder="Ej: + 54 111 222 333" required />
                        </label>

                        <h3>Información Legal y Financiera (Opcional)</h3>
                        <label>
                            CUIT:
                            <input type="text" name="cuit" />
                        </label>
                        <label>
                            Antigüedad (en años):
                            <input type="text" name="antiguedad" />
                        </label>
                        <label>
                            Facturación anual estimada (USD):
                            <input type="text" name="facturacion" />
                        </label>

                        <div className="botones-navegacion">
                            <button type="button" onClick={prevStep}>
                                Atrás
                            </button>
                            <button type="submit">Continuar</button>
                        </div>
                    </form>

                </div>

                <div className="general-card-simulator">
                    SIMULACION DE CARD
                </div>
            </div>
        </div>
    );
};

export default FormularioGeneral;
