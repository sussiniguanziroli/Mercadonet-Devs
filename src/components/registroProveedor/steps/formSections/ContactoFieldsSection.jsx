// src/components/registroProveedor/steps/formSections/ContactoFieldsSection.jsx
import React from 'react';

const ContactoFieldsSection = ({
    register,
    errors,
    sectionTitle = "Información de Contacto",
    requiredSymbol = "*", // Can be "" if fields are not always required
    sitioWebRequired = false, // Prop to control if website is required
    whatsappRequired = false, // Prop to control if WhatsApp is required
    emailRequired = false     // Prop to control if Email is required
}) => {
    const errorSpanStyle = { color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', display: 'block' };

    return (
        <div className="form-section">
            <h3>{sectionTitle}</h3>
            <div className="form-field-html-group">
                <label htmlFor="sitioWeb_contact">
                    Sitio Web {sitioWebRequired && <span style={{ color: 'red' }}>{requiredSymbol}</span>}
                </label>
                <input
                    id="sitioWeb_contact"
                    type="url"
                    placeholder="https://ejemplo.com"
                    {...register('sitioWeb', {
                        ...(sitioWebRequired && { required: 'El sitio web es requerido' }),
                        pattern: {
                            value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
                            message: "URL inválida"
                        }
                    })}
                    className={errors.sitioWeb ? 'input-error' : ''}
                />
                {errors.sitioWeb && <span style={errorSpanStyle}>{errors.sitioWeb.message}</span>}
            </div>

            <div className="form-field-html-group">
                <label htmlFor="whatsapp_contact">
                    WhatsApp {whatsappRequired && <span style={{ color: 'red' }}>{requiredSymbol}</span>}
                </label>
                <input
                    id="whatsapp_contact"
                    type="text"
                    placeholder="Ej: +54 9 11 12345678"
                    {...register('whatsapp', {
                        ...(whatsappRequired && { required: 'WhatsApp es requerido' })
                    })}
                    className={errors.whatsapp ? 'input-error' : ''}
                />
                {errors.whatsapp && <span style={errorSpanStyle}>{errors.whatsapp.message}</span>}
            </div>

            <div className="form-field-html-group">
                <label htmlFor="telefono_contact">Teléfono Fijo (Opcional)</label>
                <input
                    id="telefono_contact"
                    type="tel"
                    placeholder="Ej: 011 41234567"
                    {...register('telefono')}
                    className={errors.telefono ? 'input-error' : ''}
                />
                {errors.telefono && <span style={errorSpanStyle}>{errors.telefono.message}</span>}
            </div>

            <div className="form-field-html-group">
                <label htmlFor="email_contact">
                    Email de Contacto Público {emailRequired && <span style={{ color: 'red' }}>{requiredSymbol}</span>}
                </label>
                <input
                    id="email_contact"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    {...register('email', {
                        ...(emailRequired && { required: 'El email es requerido' }),
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Email inválido"
                        }
                    })}
                    className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span style={errorSpanStyle}>{errors.email.message}</span>}
            </div>
        </div>
    );
};

export default ContactoFieldsSection;
