// src/components/registroProveedor/steps/FormularioPersonalizadoTipoA.jsx

import React, { useState, useEffect } from 'react';
import { FaFileCirclePlus } from 'react-icons/fa6'; // Icono para subida
import SimuladorCardHistoriaBis from '../card_simulators/CardHistoriaSimulatorBis'; // Ajusta ruta si es necesario

// --- Componente del Paso: Formulario Personalizado Tipo A (Historia) ---
const FormularioPersonalizadoTipoA = ({
    initialData,    // Datos iniciales para este paso (objeto específico de TipoA)
    onNext,         // Función para llamar al completar el paso
    onBack,         // Función para ir al paso anterior
    onCancel        // Función para cancelar el registro
}) => {

    // --- Estado Local del Formulario ---
    // Campos de texto
    const [descripcion, setDescripcion] = useState('');
    const [sitioWeb, setSitioWeb] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    // Campos de tags (guardados como string en el input, array en el estado final)
    const [marcaStr, setMarcaStr] = useState('');
    const [extrasStr, setExtrasStr] = useState('');
    // Archivos
    const [logoFile, setLogoFile] = useState(null); // Objeto File o null
    const [carruselFiles, setCarruselFiles] = useState([]); // Array de objetos File
    // Previsualizaciones (URLs temporales)
    const [logoPreview, setLogoPreview] = useState(null); // string (ObjectURL) o null
    const [carruselPreviews, setCarruselPreviews] = useState([]); // Array de strings (ObjectURLs)

    // --- Efecto para Inicializar/Actualizar Estado Local desde Props ---
    useEffect(() => {
        console.log("[TipoA] InitialData:", initialData);
        if (initialData) {
            setDescripcion(initialData.descripcion || '');
            setSitioWeb(initialData.sitioWeb || '');
            setWhatsapp(initialData.whatsapp || '');
            setTelefono(initialData.telefono || '');
            setEmail(initialData.email || '');
            // Convierte array de tags (si existe) a string para el input
            setMarcaStr(Array.isArray(initialData.marca) ? initialData.marca.join(', ') : '');
            setExtrasStr(Array.isArray(initialData.extras) ? initialData.extras.join(', ') : '');

            // Limpia archivos y previsualizaciones si los datos iniciales cambian.
            // Si necesitaras cargar previsualizaciones desde URLs guardadas en initialData,
            // la lógica iría aquí, pero por ahora reseteamos.
            setLogoFile(null);
            setLogoPreview(null); // Podrías setear initialData.logoURL aquí si existiera
            setCarruselFiles([]);
            setCarruselPreviews([]); // Podrías setear initialData.carruselURLs aquí

        }
        // Importante: No incluir cleanup de ObjectURLs aquí, va en otro efecto
    }, [initialData]);

    // --- Efecto para Limpiar ObjectURLs ---
    useEffect(() => {
        // Esta función se ejecutará cuando el componente se desmonte O antes de que
        // los estados de previsualización (logoPreview, carruselPreviews) se actualicen
        // si se vuelven a ejecutar los efectos que los generan.
        return () => {
            console.log("[TipoA] Limpiando ObjectURLs");
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
            carruselPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [logoPreview, carruselPreviews]); // Se ejecuta si las previews cambian

    // --- Manejadores de Eventos Locales ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'descripcion': setDescripcion(value); break;
            case 'sitioWeb': setSitioWeb(value); break;
            case 'whatsapp': setWhatsapp(value); break;
            case 'telefono': setTelefono(value); break;
            case 'email': setEmail(value); break;
            case 'marcaStr': setMarcaStr(value); break;
            case 'extrasStr': setExtrasStr(value); break;
            default: break;
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;

        if (name === "logo") {
            const file = files?.[0];
            setLogoFile(file || null); // Guarda el archivo (o null si se deselecciona)

            // Limpia preview anterior
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
                setLogoPreview(null);
            }
            // Crea nueva preview si hay archivo
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                setLogoPreview(previewUrl);
            }
        } else if (name === "carrusel") {
            const fileList = Array.from(files || []);
            setCarruselFiles(fileList); // Guarda el array de archivos

            // Limpia previews anteriores
            carruselPreviews.forEach(url => URL.revokeObjectURL(url));
            setCarruselPreviews([]);

            // Crea nuevas previews
            if (fileList.length > 0) {
                const newPreviews = fileList.map(file => URL.createObjectURL(file));
                setCarruselPreviews(newPreviews);
            }
        }
         // Resetear el valor del input permite seleccionar el mismo archivo de nuevo
         e.target.value = null;
    };


    // --- Submit ---
    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Parsear tags string a arrays, filtrando vacíos
        const marcaArray = marcaStr.split(',')
                                   .map(s => s.trim())
                                   .filter(Boolean);
        const extrasArray = extrasStr.split(',')
                                    .map(s => s.trim())
                                    .filter(Boolean);

        // 2. Recolectar datos locales (incluyendo los File objects)
        const stepData = {
            // Datos de texto
            descripcion,
            sitioWeb,
            whatsapp,
            telefono,
            email,
            // Datos de tags (arrays)
            marca: marcaArray,
            extras: extrasArray,
            // Archivos (File objects o null/[])
            // El Navigator decidirá si subirlos ahora o después
            logoFile: logoFile,
            carruselFiles: carruselFiles,
        };

        console.log("[TipoA] Enviando Datos:", stepData);

        // 3. Llamar a onNext con los datos locales
        onNext(stepData);
    };

    // --- Renderizado ---
    return (
        // Usa clase de layout base
        <div className="registro-step-layout">
    
            {/* Contenedor del Formulario */}
            <div className="form-wrapper">
                {/* Usa clase de form base */}
                <form onSubmit={handleSubmit} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Historia</h1>
    
                    {/* Logo */}
                    <div className="form-section">
                        <label>Logo</label>
                        {logoPreview && (
                             <div style={{ marginBottom: '10px', maxWidth: '150px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '5px', background: 'rgba(255,255,255,0.05)' }}>
                                <img src={logoPreview} alt="Vista previa del Logo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                        )}
                        {/* Clase específica si necesita tamaño diferente al mixin base */}
                        <div className="input-logo"> {/* Aplica estilos de _formPersonalizadoA.scss */}
                             {/* Label actúa como contenedor visual y activa input oculto */}
                             <label htmlFor="logo-upload-a" className="file-input-content" style={{ cursor: 'pointer' }}>
                                 <FaFileCirclePlus /> {/* Icono */}
                                 <p><strong>{logoFile ? logoFile.name : 'Seleccionar Logo'}</strong></p>
                             </label>
                            <input id="logo-upload-a" type="file" name="logo" accept="image/*" onChange={handleFileChange} />
                        </div>
                        {logoFile && <button type='button' onClick={() => handleFileChange({ target: { name: 'logo', files: null }})} className="remove-button-link">Quitar</button>}
                    </div>
    
                    {/* Carrusel */}
                    <div className="form-section">
                        <label>Carrusel Multimedia (Imágenes)</label>
                        {carruselPreviews.length > 0 && (
                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                {carruselPreviews.map((previewUrl, index) => (
                                    <img key={index} src={previewUrl} alt={`Vista previa ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #555', borderRadius: '4px' }} />
                                ))}
                            </div>
                        )}
                        {/* Clase específica si necesita tamaño diferente */}
                        <div className="input-carrusel"> {/* Aplica estilos de _formPersonalizadoA.scss */}
                            <label htmlFor="carrusel-upload-a" className="file-input-content" style={{ cursor: 'pointer' }}>
                                 <FaFileCirclePlus/>
                                 <p><strong>Agregar imágenes</strong><br />O arrastra y suelta</p>
                             </label>
                            <input id="carrusel-upload-a" type="file" name="carrusel" accept="image/*" multiple onChange={handleFileChange} />
                        </div>
                        {carruselFiles.length > 0 && <button type='button' onClick={() => handleFileChange({ target: { name: 'carrusel', files: null }})} className="remove-button-link">Quitar {carruselFiles.length} archivo(s)</button>}
                    </div>
    
                     {/* Descripción */}
                     <div className="form-section">
                         <label htmlFor="descripcion-a">Descripción del Proveedor</label>
                         <textarea id="descripcion-a" name="descripcion" value={descripcion} onChange={handleInputChange} rows="5" placeholder="Describe tu empresa, historia, valores..." />
                     </div>
    
                     {/* Marcas y Servicios */}
                     <div className="form-section">
                          <label htmlFor="marcaStr-a">Marcas que trabajas (separadas por coma)</label>
                         <input id="marcaStr-a" type="text" name="marcaStr" value={marcaStr} onChange={handleInputChange} placeholder="Ej: Marca A, Marca B, Otra Marca" />
                          <label htmlFor="extrasStr-a">Servicios extra y capacidades (separadas por coma)</label>
                         <input id="extrasStr-a" type="text" name="extrasStr" value={extrasStr} onChange={handleInputChange} placeholder="Ej: Envíos a todo el país, Instalación..." />
                     </div>
    
                     {/* Contacto */}
                     <div className="form-section">
                         {/* Usar <h3> para el título de la sección */}
                         <h3>Información de Contacto (Visible en la Card)</h3>
                         <label> Sitio Web
                            <input type="url" name="sitioWeb" value={sitioWeb} onChange={handleInputChange} placeholder="https://..." />
                         </label>
                         <label> Whatsapp
                            <input type="text" name="whatsapp" value={whatsapp} onChange={handleInputChange} placeholder="Ej: +54 9 11..." />
                         </label>
                         <label> Teléfono Fijo (Opcional)
                            <input type="tel" name="telefono" value={telefono} onChange={handleInputChange} placeholder="Teléfono" />
                         </label>
                         <label> Email de Contacto Público
                            <input type="email" name="email" value={email} onChange={handleInputChange} placeholder="Email" />
                         </label>
                     </div>
    
                    {/* Botones */}
                    <div className="botones-navegacion"> {/* Clase base */}
                        <button type="button" onClick={onBack}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>
    
            {/* Contenedor del Simulador */}
            <div className="simulator-wrapper"> {/* Clase base */}
                {/* Título estilado por base */}
                <h1>Vista Previa: Card Historia</h1>
                {/* Contenido específico del simulador */}
                <SimuladorCardHistoriaBis proveedor={{ descripcion, marca: marcaStr.split(',').map(s => s.trim()).filter(Boolean), extras: extrasStr.split(',').map(s => s.trim()).filter(Boolean), sitioWeb, whatsapp, telefono, email, logoPreview }} />
            </div>
        </div>
    );
};

export default FormularioPersonalizadoTipoA;