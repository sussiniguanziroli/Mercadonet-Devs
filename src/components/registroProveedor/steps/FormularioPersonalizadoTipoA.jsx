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

    const handleFileChange = (e) => { // Para Logo y Carrusel
        const { name, files } = e.target;
        const isLogo = name === 'logo';
        const currentFiles = isLogo ? [files?.[0]].filter(Boolean) : Array.from(files || []);
        const oldPreviews = isLogo ? [logoPreview].filter(Boolean) : carruselPreviews;
        const setFiles = isLogo ? setLogoFile : setCarruselFiles;
        const setPreviews = isLogo ? setLogoPreview : setCarruselPreviews;

        // Limpiar previews anteriores
        oldPreviews.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url) });

        // Crear nuevas previews
        const newPreviews = currentFiles.map(file => URL.createObjectURL(file));

        // Actualizar estado
        if (isLogo) {
            setFiles(currentFiles[0] || null);
            setPreviews(newPreviews[0] || null);
        } else {
            setFiles(currentFiles);
            setPreviews(newPreviews);
        }
        e.target.value = null; // Reset input
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

                    {/* Logo */}
                    <div className="form-section">
                        {/* Asociar label con input usando htmlFor */}
                        <label htmlFor="logo-upload-b">Logo</label>
                        {logoPreview && (
                            <div style={{ marginBottom: '10px', maxWidth: '150px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '5px', background: 'rgba(255,255,255,0.05)' }}>
                                <img src={logoPreview} alt="Vista previa del Logo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                        )}
                        {/* Contenedor que aplica el mixin/estilo base */}
                        <div className="input-logo"> {/* Clase específica para tamaño si es necesario */}
                            {/* Label visible que activará el input oculto */}
                            <label htmlFor="logo-upload-b" className="file-input-content" style={{ cursor: 'pointer' }}>
                                <FaFileCirclePlus />
                                <p><strong>{logoFile ? logoFile.name : 'Seleccionar Logo'}</strong></p>
                            </label>
                            {/* Input real (oculto por SCSS base o específico) */}
                            <input id="logo-upload-b" type="file" name="logo" accept="image/*" onChange={handleFileChange} />
                        </div>
                        {logoFile && <button type='button' onClick={() => handleFileChange({ target: { name: 'logo', files: null } })} className="remove-button-link">Quitar</button>}
                    </div>

                    {/* Carrusel */}
                    <div className="form-section">
                        <label htmlFor="carrusel-upload-b">Carrusel Multimedia (Imágenes)</label>
                        {carruselPreviews.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                {carruselPreviews.map((previewUrl, index) => (
                                    <img key={index} src={previewUrl} alt={`Vista previa ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #555', borderRadius: '4px' }} />
                                ))}
                            </div>
                        )}
                        <div className="input-carrusel"> {/* Clase específica para tamaño si es necesario */}
                            <label htmlFor="carrusel-upload-b" className="file-input-content" style={{ cursor: 'pointer' }}>
                                <FaFileCirclePlus />
                                <p><strong>Agregar imágenes</strong><br />O arrastra y suelta</p>
                            </label>
                            <input id="carrusel-upload-b" type="file" name="carrusel" accept="image/*" multiple onChange={handleFileChange} />
                        </div>
                        {carruselFiles.length > 0 && <button type='button' onClick={() => handleFileChange({ target: { name: 'carrusel', files: null } })} className="remove-button-link">Quitar {carruselFiles.length} archivo(s)</button>}
                    </div>

                    {/* Descripción */}
                    <div className="form-section">
                        <label htmlFor="descripcion-a">Descripción del Proveedor</label>
                        <textarea id="descripcion-a" name="descripcion" value={descripcion} onChange={handleInputChange} rows="5" placeholder="Describe tu empresa, historia, valores..." />
                    </div>

                    <div className="form-section">
                        {/* Marcas con Autocomplete */}
                        <Autocomplete
                            multiple
                            id="marcas-tags"
                            options={marcas}
                            value={selectedMarcas}
                            onChange={(event, newValue) => setSelectedMarcas(newValue)}
                            getOptionLabel={(option) => option}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Marcas que trabajás"
                                    placeholder="Escribí o seleccioná"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            flexWrap: 'wrap',
                                            paddingRight: '8px',
                                        },
                                        '& .MuiAutocomplete-input': {
                                            minWidth: '120px', // evita que se achique demasiado
                                            marginTop: '6px',
                                            flexGrow: 1,
                                    
                                        },
                                    }}
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        label={option}
                                        {...getTagProps({ index })}
                                        sx={{ margin: '2px' }}
                                    />
                                ))
                            }
                        />

                        {/* Extras con Autocomplete */}
                        <Autocomplete
                            multiple
                            id="extras-tags"
                            options={extras}
                            value={selectedExtras}
                            onChange={(event, newValue) => setSelectedExtras(newValue)}
                            getOptionLabel={(option) => option}
                            filterSelectedOptions
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        
                                        label={option}
                                        {...getTagProps({ index })}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Extras que ofrecés"
                                    placeholder="Escribí o seleccioná"
                                />
                            )}
                            sx={{
                                '& .MuiInputBase-root': {
                                    flexWrap: 'wrap',
                                    
                                    alignItems: 'flex-start',
                                },
                                '& .MuiChip-root': {
                                    margin: '4px 4px 0 0',
                                },
                                '& .MuiAutocomplete-input': {
                                    minWidth: '120px', // evita que se achique demasiado
                                    marginTop: '6px',
                                    flexGrow: 1,
                            
                                },
                            }}
                        />
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