import React from "react";
import { FaFileCirclePlus } from "react-icons/fa6";


const FormularioPersonalizadoTipoA = ({ nextStep, prevStep, updateFormData }) => {
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

            <div className="formulario-personalizado-a-container">
                <div className="for-per-container">
                    <form
                        onSubmit={handleSubmit}
                        className="formulario-personalizado-a"
                    >
                        <h1>Proveedor</h1>

                        {/* Logo */}
                        <div className="form-section">
                            <label>Logo</label>
                            <div className="input-logo">
                                <FaFileCirclePlus size={40} />

                                <input
                                    type="file"
                                    name="logo"
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        {/* Carrusel Multimedia */}
                        <div className="form-section">
                            <label>Carrusel multimedia</label>
                            <div className="input-carrusel">
                                <input
                                    type="file"
                                    name="carrusel"
                                    accept="image/*"
                                    multiple
                                />
                                <section>
                                    <FaFileCirclePlus size={40} />
                                    <p><strong>Agregar multimedia</strong> <br /> O arrastra y suelta</p>
                                </section>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="form-section">
                            <label>Descripción del Proveedor</label>
                            <textarea
                                name="descripcion"
                                placeholder="Descripción que verán los interesados en tu publicacion. Describe la historia y factores importantes de tu empresa por los cuales deberían elegirte. Puede ser modificado luego."
                                rows="4"
                            ></textarea>
                        </div>

                        {/* Marcas y Servicios */}
                        <div className="form-section">
                            <input
                                type="text"
                                name="marcas"
                                placeholder="Marcas"
                            />
                            <input
                                type="text"
                                name="servicios"
                                placeholder="Servicios extra y capacidades"
                            />
                        </div>

                        {/* Información de Contacto */}
                        <div className="form-section">
                            <label>Información de Contacto</label>
                            <input
                                type="text"
                                name="sitioWeb"
                                placeholder="Sitio Web"
                            />
                            <input
                                type="text"
                                name="whatsapp"
                                placeholder="Whatsapp"
                            />
                            <input
                                type="text"
                                name="telefono"
                                placeholder="Teléfono"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                            />
                        </div>

                        {/* Botones */}
                        <div className="botones-navegacion">
                            <button
                                type="button"
                                onClick={prevStep}
                            >
                                Atrás
                            </button>
                            <button onClick={nextStep} type="submit">Continuar</button>
                        </div>
                    </form>
                </div>

                <div className="card-historia-simulator-container"></div>
            </div>
        </div>


    );
};

export default FormularioPersonalizadoTipoA;
