// src/components/registroProveedor/steps/FormularioPersonalizadoTipoA.jsx

import React, { useState, useEffect } from 'react';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { scrollToTop } from '../../../utils/scrollHelper';
// --- MODIFICADO: Usa el simulador unificado ---
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';

// --- Componente del Paso: Formulario Personalizado Tipo A (Historia) ---
const FormularioPersonalizadoTipoA = ({
    initialData, // Datos iniciales para ESTE paso (tipoA)
    onNext,
    onBack,
    onCancel,
    // --- PROPS RECIBIDAS DEL NAVIGATOR (vía Dispatcher) ---
    nombreProveedor = '', // Nombre de la empresa desde FormularioGeneral
    ciudad = '',          // Ciudad desde FormularioGeneral
    provincia = '',       // Provincia desde FormularioGeneral
    // categoriasCompletas = [], // No se usa en esta preview
    marcas = [],          // Lista de filtros (AÚN NO USADA EN INPUTS)
    extras = []           // Lista de filtros (AÚN NO USADA EN INPUTS)
}) => {

    // --- Estados locales para los campos de ESTE formulario ---
    const [descripcion, setDescripcion] = useState('');
    const [sitioWeb, setSitioWeb] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [marcaStr, setMarcaStr] = useState(''); // TODO: Reemplazar por estado para selección múltiple usando 'marcas' prop
    const [extrasStr, setExtrasStr] = useState(''); // TODO: Reemplazar por estado para selección múltiple usando 'extras' prop
    const [logoFile, setLogoFile] = useState(null);
    const [carruselFiles, setCarruselFiles] = useState([]);
    const [logoPreview, setLogoPreview] = useState(null); // Puede ser blob URL o https URL (si viene de initialData)
    const [carruselPreviews, setCarruselPreviews] = useState([]); // Array de blob URLs o https URLs

    // --- Efecto para inicializar estado local desde initialData ---
    useEffect(() => {
        scrollToTop();
        // --- AÑADIDO LOG ---
        console.log("[TipoA] useEffect - Recibiendo initialData:", initialData);
        if (initialData) {
            setDescripcion(initialData.descripcion || '');
            setSitioWeb(initialData.sitioWeb || '');
            setWhatsapp(initialData.whatsapp || '');
            setTelefono(initialData.telefono || '');
            setEmail(initialData.email || '');
            // Sigue inicializando desde initialData para los campos de texto de tags
            setMarcaStr(Array.isArray(initialData.marca) ? initialData.marca.join(', ') : '');
            setExtrasStr(Array.isArray(initialData.extras) ? initialData.extras.join(', ') : '');

            // Si initialData viene con URLs (datos ya guardados), las usamos para la preview inicial
            // Si no, las ponemos a null/[] para que se usen las locales si se sube archivo.
            setLogoPreview(initialData.logoURL || null); // Asume que si existe, es una URL de Storage
            setCarruselPreviews(initialData.carruselURLs || []); // Asume que si existe, es array de URLs de Storage

            // Reseteamos los File objects SIEMPRE al cargar initialData para evitar inconsistencias
            setLogoFile(null);
            setCarruselFiles([]);

        } else {
             // Si no hay initialData, resetea todo (caso de primer ingreso a este paso)
             setDescripcion(''); setSitioWeb(''); setWhatsapp(''); setTelefono(''); setEmail('');
             setMarcaStr(''); setExtrasStr(''); setLogoFile(null); setLogoPreview(null);
             setCarruselFiles([]); setCarruselPreviews([]);
        }
    }, [initialData]);

    // --- Efecto para Limpiar ObjectURLs de Previews Locales ---
     useEffect(() => {
         // Función de limpieza que se ejecuta al desmontar o ANTES de la siguiente ejecución del efecto
         return () => {
             console.log("[TipoA] Limpiando ObjectURLs locales (si existen y son blob)");
             // Solo revoca si es una URL blob local generada por este componente
             if (logoPreview && logoPreview.startsWith('blob:')) {
                 URL.revokeObjectURL(logoPreview);
                 console.log("[TipoA] Revocada URL de logo:", logoPreview);
             }
             carruselPreviews.forEach((url, index) => {
                 if (url && url.startsWith('blob:')) {
                     URL.revokeObjectURL(url);
                     console.log(`[TipoA] Revocada URL de carrusel ${index}:`, url);
                 }
             });
         };
     }, [logoPreview, carruselPreviews]); // Ejecutar SOLO si las previews locales cambian

    // --- Manejadores de Eventos Locales ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'descripcion': setDescripcion(value); break;
            case 'sitioWeb': setSitioWeb(value); break;
            case 'whatsapp': setWhatsapp(value); break;
            case 'telefono': setTelefono(value); break;
            case 'email': setEmail(value); break;
            case 'marcaStr': setMarcaStr(value); break; // TODO: Reemplazar
            case 'extrasStr': setExtrasStr(value); break; // TODO: Reemplazar
            default: break;
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === "logo") {
            const file = files?.[0];
             // Limpia la preview ANTERIOR si era una URL local (blob)
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
            setLogoFile(file || null); // Guarda el nuevo File (o null)
            setLogoPreview(file ? URL.createObjectURL(file) : null); // Crea nueva preview local (o null)

        } else if (name === "carrusel") {
            const fileList = Array.from(files || []);
            // Limpia previews ANTERIORES si eran locales (blob)
            carruselPreviews.forEach(url => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url) });
            setCarruselFiles(fileList); // Guarda los nuevos Files
            setCarruselPreviews(fileList.map(file => URL.createObjectURL(file))); // Crea nuevas previews locales
        }
        e.target.value = null; // Permite seleccionar el mismo archivo otra vez
    };

    // --- Submit de este paso ---
    const handleSubmit = (e) => {
        e.preventDefault();
        // 1. Parsear tags (mientras se usan inputs de texto)
        const marcaArray = marcaStr.split(',').map(s => s.trim()).filter(Boolean); // TODO: Obtener de estado de selección múltiple
        const extrasArray = extrasStr.split(',').map(s => s.trim()).filter(Boolean); // TODO: Obtener de estado de selección múltiple

        // 2. Recolectar datos locales (incluyendo los File objects para subida posterior)
        const stepData = {
            descripcion, sitioWeb, whatsapp, telefono, email,
            marca: marcaArray,
            extras: extrasArray,
            logoFile: logoFile,       // Se envía el File o null
            carruselFiles: carruselFiles // Se envía el array de Files
            // NO se envían las previews (logoPreview, carruselPreviews)
        };
        console.log("[TipoA] Enviando Datos:", stepData);
        onNext(stepData); // Llama al callback del Navigator
    };

    // --- Construcción de Datos COMBINADOS para el Simulador ---
    const buildPreviewData = () => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        const marcaArray = marcaStr.split(',').map(s => s.trim()).filter(Boolean); // Parseado para preview
        const extrasArray = extrasStr.split(',').map(s => s.trim()).filter(Boolean); // Parseado para preview

        return {
            // Datos de pasos anteriores (recibidos como props)
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
            // No pasamos categorías a la preview

            // Datos de ESTE paso (leídos del estado local)
            descripcion: descripcion,
            marca: marcaArray,
            extras: extrasArray,
            logoPreview: logoPreview,       // Pasa la preview local o la URL de initialData
            carrusel: carruselPreviews,     // Pasa las previews locales o las URLs de initialData
            sitioWeb: sitioWeb,
            whatsapp: whatsapp,
            telefono: telefono,
            email: email
        };
    };
    const previewData = buildPreviewData(); // Calcular en cada render

    // --- Renderizado ---
    return (
        <div className="registro-step-layout">
            {/* Contenedor del Formulario */}
            <div className="form-wrapper">
                 <form onSubmit={handleSubmit} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Historia</h1>

                    {/* Logo Input */}
                    <div className="form-section">
                         <label>Logo</label>
                         {logoPreview && ( <div className='preview-image-container solo'><img src={logoPreview} alt="Vista previa Logo"/></div> )}
                         <div className="input-logo">
                             <label htmlFor="logo-upload-a" className="file-input-content">
                                 <FaFileCirclePlus />
                                 <p><strong>{logoFile ? logoFile.name : 'Seleccionar Logo'}</strong></p>
                             </label>
                             <input id="logo-upload-a" type="file" name="logo" accept="image/*" onChange={handleFileChange} />
                         </div>
                         {logoFile && <button type='button' onClick={() => handleFileChange({ target: { name: 'logo', files: null } })} className="remove-button-link">Quitar</button>}
                     </div>

                    {/* Carrusel Input */}
                    <div className="form-section">
                         <label>Carrusel Multimedia (Imágenes)</label>
                         {carruselPreviews.length > 0 && ( <div className='preview-image-container multiple'> {carruselPreviews.map((previewUrl, index) => ( <img key={index} src={previewUrl} alt={`Vista previa ${index + 1}`} /> ))} </div> )}
                         <div className="input-carrusel">
                             <label htmlFor="carrusel-upload-a" className="file-input-content">
                                 <FaFileCirclePlus />
                                 <p><strong>Agregar imágenes</strong><br />O arrastra y suelta</p>
                             </label>
                             <input id="carrusel-upload-a" type="file" name="carrusel" accept="image/*" multiple onChange={handleFileChange} />
                         </div>
                         {carruselFiles.length > 0 && <button type='button' onClick={() => handleFileChange({ target: { name: 'carrusel', files: null } })} className="remove-button-link">Quitar {carruselFiles.length} archivo(s)</button>}
                     </div>

                    {/* Descripción */}
                    <div className="form-section">
                        <label htmlFor="descripcion-a">Descripción del Proveedor</label>
                        <textarea id="descripcion-a" name="descripcion" value={descripcion} onChange={handleInputChange} rows="5" placeholder="Describe tu empresa, historia, valores..." />
                    </div>

                    {/* Marcas y Servicios/Extras */}
                    <div className="form-section">
                        {/* TODO: Reemplazar input por componente (ej: Autocomplete multiple de MUI) usando 'marcas' prop */}
                        <label htmlFor="marcaStr-a">Marcas que trabajas (separadas por coma)</label>
                        <input id="marcaStr-a" type="text" name="marcaStr" value={marcaStr} onChange={handleInputChange} placeholder="Ej: Marca A, Marca B, Otra Marca" />

                        {/* TODO: Reemplazar input por componente (ej: Checkboxes o Autocomplete multiple) usando 'extras' prop */}
                        <label htmlFor="extrasStr-a">Servicios extra y capacidades (separadas por coma)</label>
                        <input id="extrasStr-a" type="text" name="extrasStr" value={extrasStr} onChange={handleInputChange} placeholder="Ej: Envíos a todo el país, Instalación..." />
                    </div>

                    {/* Contacto */}
                    <div className="form-section">
                        <h3>Información de Contacto (Visible en la Card)</h3>
                        <label> Sitio Web <input type="url" name="sitioWeb" value={sitioWeb} onChange={handleInputChange} placeholder="https://..." /></label>
                        <label> WhatsApp <input type="text" name="whatsapp" value={whatsapp} onChange={handleInputChange} placeholder="Ej: +54 9 11..." /></label>
                        <label> Teléfono Fijo (Opcional) <input type="tel" name="telefono" value={telefono} onChange={handleInputChange} placeholder="Teléfono" /></label>
                        <label> Email de Contacto Público <input type="email" name="email" value={email} onChange={handleInputChange} placeholder="Email" /></label>
                    </div>

                    {/* Botones Navegación */}
                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            {/* Simulador (Usa el unificado con datos combinados) */}
            <div className="simulator-wrapper">
                <h1>Vista Previa: Card Historia</h1>
                {/* Pasa los datos combinados al simulador */}
                <CardHistoriaPreview proveedor={previewData} />
            </div>
        </div>
    );
};
export default FormularioPersonalizadoTipoA;