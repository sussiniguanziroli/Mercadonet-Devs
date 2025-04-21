// src/components/registroProveedor/steps/FormularioPersonalizadoTipoB.jsx

import React, { useState, useEffect } from 'react';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { scrollToTop } from '../../../utils/scrollHelper';

// Estado inicial para un producto vacío en la galería
const initialProductState = { imagenFile: null, imagenPreview: null, titulo: '', precio: '' };

// --- Componente del Paso: Formulario Personalizado Tipo B (Productos) ---
const FormularioPersonalizadoTipoB = ({
    initialData,    // Datos iniciales para este paso (objeto específico de TipoB)
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
    // Campos de tags (strings para input)
    const [marcasStr, setMarcasStr] = useState('');
    const [serviciosStr, setServiciosStr] = useState('');
    // Archivos Logo y Carrusel
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [carruselFiles, setCarruselFiles] = useState([]);
    const [carruselPreviews, setCarruselPreviews] = useState([]);
    // Galería de Productos (Array de objetos)
    const [galeria, setGaleria] = useState(
        // Inicializa con 6 slots vacíos
        Array(6).fill(null).map(() => ({ ...initialProductState }))
    );

    // --- Efecto para Inicializar/Actualizar Estado Local desde Props ---
    useEffect(() => {
        console.log("[TipoB] InitialData:", initialData);
        if (initialData) {
            setDescripcion(initialData.descripcion || '');
            setSitioWeb(initialData.sitioWeb || '');
            setWhatsapp(initialData.whatsapp || '');
            setTelefono(initialData.telefono || '');
            setEmail(initialData.email || '');
            setMarcasStr(Array.isArray(initialData.marcas) ? initialData.marcas.join(', ') : '');
            setServiciosStr(Array.isArray(initialData.servicios) ? initialData.servicios.join(', ') : '');

            // Inicializar Galería desde initialData si existe
            if (Array.isArray(initialData.galeria) && initialData.galeria.length > 0) {
                const initialGaleriaState = Array(6).fill(null).map((_, index) => {
                    const productData = initialData.galeria[index];
                    return {
                        imagenFile: null, // Asumimos que no pasamos File objects en initialData
                        imagenPreview: productData?.imagenURL || null, // Usar URL si viene
                        titulo: productData?.titulo || '',
                        precio: productData?.precio || '',
                    };
                });
                setGaleria(initialGaleriaState);
            } else {
                // Resetear si no hay datos iniciales para la galería
                setGaleria(Array(6).fill(null).map(() => ({ ...initialProductState })));
            }

            // Resetear logo/carousel (o cargar previews si initialData tuviera URLs)
            setLogoFile(null);
            setLogoPreview(initialData.logoURL || null); // Ejemplo si viniera URL
            setCarruselFiles([]);
            setCarruselPreviews(initialData.carruselURLs || []); // Ejemplo

        } else {
            // Si initialData es null/undefined, resetea todo a valores por defecto
            setDescripcion(''); setSitioWeb(''); setWhatsapp(''); setTelefono(''); setEmail('');
            setMarcasStr(''); setServiciosStr(''); setLogoFile(null); setLogoPreview(null);
            setCarruselFiles([]); setCarruselPreviews([]);
            setGaleria(Array(6).fill(null).map(() => ({ ...initialProductState })));
        }

        // Cleanup de ObjectURLs generadas en ESTE efecto (si hubiera) va en return
        // return () => { /* revoke initialData preview URLs */ }

    }, [initialData]);

    // --- Efecto para Limpiar ObjectURLs ---
    useEffect(() => {
        return () => {
            console.log("[TipoB] Limpiando ObjectURLs");
            if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
            carruselPreviews.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url) });
            galeria.forEach(item => {
                if (item.imagenPreview && item.imagenPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.imagenPreview);
                }
            });
        };
        // Dependencias: Se ejecuta cuando CUALQUIER preview cambie O al desmontar
    }, [logoPreview, carruselPreviews, galeria]);

    // --- Manejadores de Eventos Locales ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'descripcion': setDescripcion(value); break;
            case 'sitioWeb': setSitioWeb(value); break;
            case 'whatsapp': setWhatsapp(value); break;
            case 'telefono': setTelefono(value); break;
            case 'email': setEmail(value); break;
            case 'marcasStr': setMarcasStr(value); break;
            case 'serviciosStr': setServiciosStr(value); break;
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

    // Handler para cambios en inputs de texto de la galería
    const handleGaleriaInputChange = (index, field, value) => {
        setGaleria(currentGaleria =>
            currentGaleria.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    // Handler para cambios de archivo en la galería
    const handleGaleriaFileChange = (index, event) => {
        const file = event.target.files?.[0];
        event.target.value = null; // Reset input

        setGaleria(currentGaleria => {
            // Revocar preview anterior del item específico
            const oldPreview = currentGaleria[index]?.imagenPreview;
            if (oldPreview && oldPreview.startsWith('blob:')) {
                URL.revokeObjectURL(oldPreview);
            }
            // Crear nueva preview
            const newPreview = file ? URL.createObjectURL(file) : null;
            // Actualizar el item inmutablemente
            return currentGaleria.map((item, i) =>
                i === index ? { ...item, imagenFile: file || null, imagenPreview: newPreview } : item
            );
        });
    };

    // Handler para quitar una imagen de la galería
    const handleRemoveGaleriaImage = (index) => {
        setGaleria(currentGaleria => {
            const oldPreview = currentGaleria[index]?.imagenPreview;
            if (oldPreview && oldPreview.startsWith('blob:')) {
                URL.revokeObjectURL(oldPreview);
            }
            return currentGaleria.map((item, i) =>
                i === index ? { ...item, imagenFile: null, imagenPreview: null } : item
            );
        });
    };


    // --- Submit ---
    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Parsear tags
        const marcasArray = marcasStr.split(',').map(s => s.trim()).filter(Boolean);
        const serviciosArray = serviciosStr.split(',').map(s => s.trim()).filter(Boolean);

        // 2. Procesar galería: Incluir solo los datos relevantes (File object incluido)
        const galeriaDataToSend = galeria.map(item => ({
            titulo: item.titulo,
            precio: item.precio,
            imagenFile: item.imagenFile // Pasamos el objeto File
        })).filter(item => item.titulo || item.precio || item.imagenFile); // Filtra slots completamente vacíos

        // 3. Recolectar todos los datos locales
        const stepData = {
            // Datos de texto
            descripcion,
            sitioWeb,
            whatsapp,
            telefono,
            email,
            // Datos de tags (arrays)
            marcas: marcasArray,
            servicios: serviciosArray,
            // Archivos principales (File objects o null/[])
            logoFile: logoFile,
            carruselFiles: carruselFiles,
            // Galería procesada
            galeria: galeriaDataToSend,
        };

        console.log("[TipoB] Enviando Datos:", stepData);

        // 4. Llamar a onNext con los datos locales
        onNext(stepData);
    };

    // --- Renderizado ---
    // --- Renderizado Corregido ---
    return (
        // Usa clase de layout base
        <div className="registro-step-layout">

            {/* Contenedor del Formulario */}
            <div className="form-wrapper">
                {/* Usa clase de form base */}
                <form onSubmit={handleSubmit} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Productos</h1>

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
                        <label htmlFor="descripcion-b">Descripción del Proveedor</label>
                        <textarea id="descripcion-b" name="descripcion" value={descripcion} onChange={handleInputChange} rows="4" placeholder="Describe tu negocio, productos destacados..." />
                    </div>

                    {/* Marcas y Servicios (Tags) */}
                    <div className="form-section">
                        <label htmlFor="marcasStr-b">Marcas (separadas por coma)</label>
                        <input id="marcasStr-b" type="text" name="marcasStr" value={marcasStr} onChange={handleInputChange} placeholder="Ej: Marca X, Marca Y" />
                        <label htmlFor="serviciosStr-b">Servicios extra (separados por coma)</label>
                        <input id="serviciosStr-b" type="text" name="serviciosStr" value={serviciosStr} onChange={handleInputChange} placeholder="Ej: Envío Rápido, Soporte Técnico" />
                    </div>

                    {/* Contacto */}
                    <div className="form-section">
                        <h3>Información de Contacto</h3>
                        <label htmlFor="sitioWeb-b"> Sitio Web</label>
                        <input id="sitioWeb-b" type="url" name="sitioWeb" value={sitioWeb} onChange={handleInputChange} placeholder="https://..." />

                        <label htmlFor="whatsapp-b"> Whatsapp</label>
                        <input id="whatsapp-b" type="text" name="whatsapp" value={whatsapp} onChange={handleInputChange} placeholder="Whatsapp" />

                        <label htmlFor="telefono-b"> Teléfono</label>
                        <input id="telefono-b" type="tel" name="telefono" value={telefono} onChange={handleInputChange} placeholder="Teléfono" />

                        <label htmlFor="email-b"> Email</label>
                        <input id="email-b" type="email" name="email" value={email} onChange={handleInputChange} placeholder="Email" />
                    </div>

                    {/* Galería de Productos */}
                    <div className="form-section galeria-productos">
                        <h3>Galería de Productos (Hasta 6)</h3>
                        <div className="galeria-grid">
                            {galeria.map((producto, index) => (
                                <div key={index} className="producto-card">
                                    <label htmlFor={`producto_imagen_${index}`}>Producto {index + 1}</label> {/* Label para accesibilidad */}
                                    {/* Input de Imagen */}
                                    <div className="custom-file-upload">
                                        {producto.imagenPreview ? (
                                            <div className="image-preview-container">
                                                <img src={producto.imagenPreview} alt={`Preview Producto ${index + 1}`} />
                                                {/* Botón corregido con type="button" */}
                                                <button type="button" onClick={() => handleRemoveGaleriaImage(index)} className="remove-image-button" aria-label={`Quitar imagen ${index + 1}`}>X</button>
                                            </div>
                                        ) : (
                                            <label htmlFor={`producto_imagen_${index}`} className="file-input-content" style={{ cursor: 'pointer' }}>
                                                <div className="file-icon"><FaFileCirclePlus /></div>
                                                <span>Añadir Imagen</span>
                                                {/* Input real oculto por SCSS */}
                                                <input
                                                    id={`producto_imagen_${index}`}
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/webp"
                                                    onChange={(e) => handleGaleriaFileChange(index, e)}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    {/* Input de Título */}
                                    <label htmlFor={`titulo_producto_${index}`} className="sr-only">Título Producto {index + 1}</label> {/* Label visualmente oculto */}
                                    <input id={`titulo_producto_${index}`} type="text" value={producto.titulo} onChange={(e) => handleGaleriaInputChange(index, 'titulo', e.target.value)} placeholder="Título Producto" />
                                    {/* Input de Precio */}
                                    <label htmlFor={`precio_producto_${index}`} className="sr-only">Precio Producto {index + 1}</label> {/* Label visualmente oculto */}
                                    <input id={`precio_producto_${index}`} type="text" value={producto.precio} onChange={(e) => handleGaleriaInputChange(index, 'precio', e.target.value)} placeholder="Precio o Rango" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            {/* Contenedor del Simulador */}
            <div className="simulator-wrapper">
                <h1>Vista Previa: Card Productos</h1>
                {/* TODO: Añadir o implementar SimuladorCardProductos */}
                <p style={{ color: 'lightgray', textAlign: 'center', paddingTop: '20px' }}>(Vista previa no implementada aún)</p>
            </div>
        </div>
    );
};

export default FormularioPersonalizadoTipoB;