import React from "react";

const FormularioPersonalizadoTipoB = ({ nextStep, prevStep, updateFormData }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        updateFormData(Object.fromEntries(formData));
        nextStep();
    };

    return (

        <div className="formulario-personalizado">
            <img
                className="formulario-bg"
                src="https://i.ibb.co/tZ1y0zQ/Background-Ciudad.png"
                alt="BG Form"
            />
            <div className="formulario-personalizado-b-container">

                <div className="for-per-container">
                    <form onSubmit={handleSubmit} className="formulario-personalizado-b">
                        <h1>Proveedor</h1>

                        {/* Logo */}
                        <div className="form-section">
                            <label htmlFor="logo">Logo</label>
                            <div className="input-logo">
                                <input id="logo" type="file" name="logo" accept="image/*" required />
                                <p>Haz clic o arrastra el archivo aquí</p>
                            </div>
                        </div>

                        {/* Carrusel Multimedia */}
                        <div className="form-section">
                            <label htmlFor="carrusel">Carrusel Multimedia</label>
                            <div className="input-carrusel">
                                <input
                                    id="carrusel"
                                    type="file"
                                    name="carrusel"
                                    accept="image/*"
                                    multiple
                                />
                                <p>Haz clic o arrastra las imágenes aquí</p>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="form-section">
                            <label htmlFor="descripcion">Descripción del Proveedor</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                placeholder="Escribe una breve descripción aquí..."
                                rows="4"
                                required
                            ></textarea>
                        </div>

                        {/* Marcas y Servicios */}
                        <div className="form-section">
                            <label htmlFor="marcas">Marcas</label>
                            <input
                                id="marcas"
                                type="text"
                                name="marcas"
                                placeholder="Ingresa las marcas que trabajas"
                                required
                            />
                            <label htmlFor="servicios">Servicios Extra</label>
                            <input
                                id="servicios"
                                type="text"
                                name="servicios"
                                placeholder="Describe servicios adicionales o capacidades"
                            />
                        </div>

                        {/* Información de Contacto */}
                        <div className="form-section">
                            <label>Información de Contacto</label>
                            <input
                                type="url"
                                name="sitioWeb"
                                placeholder="Sitio Web"
                                pattern="https?://.+"
                                required
                            />
                            <input
                                type="text"
                                name="whatsapp"
                                placeholder="Whatsapp (solo números)"
                                pattern="\d+"
                            />
                            <input type="tel" name="telefono" placeholder="Teléfono" />
                            <input type="email" name="email" placeholder="Email" required />
                        </div>

                        {/* Galería de Productos */}
                        <div className="form-section galeria-productos">
                            <label>Galería de Productos</label>
                            <div className="galeria-grid">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="producto-card">
                                        <label htmlFor={`producto_imagen_${i}`}>Imagen {i + 1}</label>
                                        <input
                                            id={`producto_imagen_${i}`}
                                            type="file"
                                            name={`producto_imagen_${i}`}
                                            accept="image/*"
                                        />
                                        <input
                                            type="text"
                                            name={`producto_titulo_${i}`}
                                            placeholder="Título o Precio"
                                        />
                                        <textarea
                                            name={`producto_descripcion_${i}`}
                                            placeholder="Descripción del producto"
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
                </div>




                <div className="card-productos-simulator-container">

                </div>
            </div>
        </div>
    );
};

export default FormularioPersonalizadoTipoB;
