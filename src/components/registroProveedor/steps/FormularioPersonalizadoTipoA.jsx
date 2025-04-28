// src/components/registroProveedor/steps/FormularioPersonalizadoTipoA.jsx

import React, { useState, useEffect } from 'react';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';

// --- NUEVO: Importaciones de Material UI ---
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip'; // Importa Chip por si quieres personalizar renderTags 

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
    marcas = [],          // Lista de filtros (AÚN NO USADA EN INPUTS)
    extras = []           // Lista de filtros (AÚN NO USADA EN INPUTS)
}) => {

    // --- Estados locales ---
    const [descripcion, setDescripcion] = useState('');
    const [sitioWeb, setSitioWeb] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    // --- MODIFICADO: Estados para selecciones múltiples (arrays) ---
    const [selectedMarcas, setSelectedMarcas] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState([]);
    // Estados de archivos y previews (sin cambios)
    const [logoFile, setLogoFile] = useState(null);
    const [carruselFiles, setCarruselFiles] = useState([]);
    const [logoPreview, setLogoPreview] = useState(null);
    const [carruselPreviews, setCarruselPreviews] = useState([]);

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
            // --- MODIFICADO: Inicializa los arrays seleccionados ---
            setSelectedMarcas(Array.isArray(initialData.marca) ? initialData.marca : []);
            setSelectedExtras(Array.isArray(initialData.extras) ? initialData.extras : []);

            // Si no, las ponemos a null/[] para que se usen las locales si se sube archivo.
            setLogoPreview(initialData.logoURL || null); // Asume que si existe, es una URL de Storage
            setCarruselPreviews(initialData.carruselURLs || []); // Asume que si existe, es array de URLs de Storage

            // Reseteamos los File objects SIEMPRE al cargar initialData para evitar inconsistencias
            setLogoFile(null);
            setCarruselFiles([]);

        } else {
            // Resetear todo si no hay initialData
            setDescripcion(''); setSitioWeb(''); setWhatsapp(''); setTelefono(''); setEmail('');
            setSelectedMarcas([]); setSelectedExtras([]); // <= Resetea arrays
            setLogoFile(null); setLogoPreview(null);
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

    const handleInputChange = (e) => { // Para inputs de texto simples
        const { name, value } = e.target;
        switch (name) {
            case 'descripcion': setDescripcion(value); break;
            case 'sitioWeb': setSitioWeb(value); break;
            case 'whatsapp': setWhatsapp(value); break;
            case 'telefono': setTelefono(value); break;
            case 'email': setEmail(value); break;
            // --- ELIMINADO: Casos para marcaStr/extrasStr ---
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

        // Recolecta datos locales, usando los arrays de estado directamente
        const stepData = {
            descripcion, sitioWeb, whatsapp, telefono, email,
            // --- MODIFICADO: Usa los arrays de estado ---
            marca: selectedMarcas,
            extras: selectedExtras,
            logoFile: logoFile,
            carruselFiles: carruselFiles
        };
        console.log("[TipoA] Enviando Datos:", stepData);
        onNext(stepData); // Llama al callback del Navigator
    };

    // --- Construcción de Datos COMBINADOS para el Simulador ---
    const buildPreviewData = () => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;

        return {
            // Datos de pasos anteriores (props)
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
            // Datos de ESTE paso (estado local)
            descripcion: descripcion,
            // --- MODIFICADO: Usa los arrays de estado ---
            marca: selectedMarcas,
            extras: selectedExtras,
            logoPreview: logoPreview,
            carrusel: carruselPreviews,
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
                        {logoPreview && (<div className='preview-image-container solo'><img src={logoPreview} alt="Vista previa Logo" /></div>)}
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
                        {carruselPreviews.length > 0 && (<div className='preview-image-container multiple'> {carruselPreviews.map((previewUrl, index) => (<img key={index} src={previewUrl} alt={`Vista previa ${index + 1}`} />))} </div>)}
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

                    {/* --- REEMPLAZADO: Marcas y Extras con Autocomplete --- */}
                    <div className="form-section">
                        {/* Marcas con Autocomplete */}
                        <Autocomplete
                            multiple // Habilita selección múltiple
                            id="marcas-tags"
                            options={marcas} // La lista completa de marcas disponibles (prop)
                            value={selectedMarcas} // El array de estado con las marcas seleccionadas
                            onChange={(event, newValue) => {
                                setSelectedMarcas(newValue); // Actualiza el estado directamente
                            }}
                            getOptionLabel={(option) => option} // Muestra el string de la opción
                            filterSelectedOptions // Oculta opciones ya seleccionadas del dropdown
                            // renderTags={(value, getTagProps) => // Opcional: personalizar cómo se ven los chips
                            //     value.map((option, index) => (
                            //         <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                            //     ))
                            // }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined" // O el estilo que prefieras (standard, filled)
                                    label="Marcas que trabajas"
                                    placeholder="Selecciona o escribe para buscar..."
                                // Añadir sx prop para estilos si es necesario
                                // sx={{ /* Tus estilos MUI aquí */ }}
                                />
                            )}
                            // Estilo para el contenedor del Autocomplete si es necesario
                            sx={{ mb: 2 }} // Ejemplo: Margen inferior
                        />

                        {/* Extras con Autocomplete */}
                        <Autocomplete
                            multiple
                            id="extras-tags"
                            options={extras} // La lista completa de extras disponibles (prop)
                            value={selectedExtras} // El array de estado con los extras seleccionados
                            onChange={(event, newValue) => {
                                setSelectedExtras(newValue); // Actualiza el estado directamente
                            }}
                            getOptionLabel={(option) => option}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Servicios extra y capacidades"
                                    placeholder="Selecciona o escribe..."
                                />
                            )}
                        // sx={{ /* Estilos adicionales si se necesitan */ }}
                        />
                    </div>
                    {/* --- FIN REEMPLAZO --- */}

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