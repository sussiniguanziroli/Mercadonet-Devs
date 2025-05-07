// src/components/registroProveedor/steps/FormularioPersonalizadoTipoB.jsx

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardProductosPreview from '../card_simulators/CardProductosPreview';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { FaTimes } from 'react-icons/fa';

// Componente FileUploader reusable
const FileUploader = ({ 
  onFilesChange, 
  multiple = true, 
  accept = 'image/*',
  previews = [],
  maxFiles = 1,
  label = 'Arrastra archivos aquí o haz clic'
}) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept,
        multiple,
        maxFiles: multiple ? undefined : maxFiles,
        onDrop: acceptedFiles => {
          onFilesChange(acceptedFiles);
        }
      });

  return (
    <div 
      {...getRootProps()}
      className={`file-uploader-container ${isDragActive ? 'drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="file-uploader-content">
        <FaFileCirclePlus size={24} />
        <p>{label}</p>
        {!multiple && previews.length > 0 && (
          <div className="single-preview">
            <img src={previews[0]} alt="Preview" />
          </div>
        )}
      </div>
    </div>
  );
};

// Estado inicial para un producto vacío en la galería
const initialProductState = { imagenFile: null, imagenPreview: null, titulo: '', precio: '' };

const FormularioPersonalizadoTipoB = ({
    initialData,
    onNext,
    onBack,
    onCancel,
    nombreProveedor = '',
    ciudad = '',
    provincia = '',
    marcas = [],
    servicios = [],
    extras = []
}) => {
    // --- Estado Local del Formulario ---
    const [descripcion, setDescripcion] = useState('');
    const [sitioWeb, setSitioWeb] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [selectedMarcas, setSelectedMarcas] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [carruselFiles, setCarruselFiles] = useState([]);
    const [carruselPreviews, setCarruselPreviews] = useState([]);
    const [galeria, setGaleria] = useState(
        Array(6).fill(null).map(() => ({ ...initialProductState }))
    );

    useEffect(() => {
        scrollToTop();
        console.log("[TipoB] useEffect - Recibiendo initialData:", initialData);
        if (initialData) {
            setDescripcion(initialData.descripcion || '');
            setSitioWeb(initialData.sitioWeb || '');
            setWhatsapp(initialData.whatsapp || '');
            setTelefono(initialData.telefono || '');
            setEmail(initialData.email || '');

            // Inicializar Galería desde initialData
            if (Array.isArray(initialData.galeria) && initialData.galeria.length > 0) {
                const initialGaleriaState = Array(6).fill(null).map((_, index) => {
                    const productData = initialData.galeria[index];
                    return productData ? {
                        imagenFile: null,
                        imagenPreview: productData.imagenURL || null,
                        titulo: productData.titulo || '',
                        precio: productData.precio || '',
                    } : { ...initialProductState };
                });
                setGaleria(initialGaleriaState);
            } else {
                setGaleria(Array(6).fill(null).map(() => ({ ...initialProductState })));
            }

            setLogoPreview(initialData.logoURL || null);
            setCarruselPreviews(initialData.carruselURLs || []);
            setLogoFile(null);
            setCarruselFiles([]);
        } else {
            setDescripcion(''); setSitioWeb(''); setWhatsapp(''); setTelefono(''); setEmail('');
            setLogoFile(null); setLogoPreview(null);
            setCarruselFiles([]); setCarruselPreviews([]);
            setGaleria(Array(6).fill(null).map(() => ({ ...initialProductState })));
        }
    }, [initialData]);

    /// --- Efecto para Limpiar ObjectURLs ---
    useEffect(() => {
        return () => {
            console.log("[TipoB] Limpiando ObjectURLs locales (si existen y son blob)");
            if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
            carruselPreviews.forEach(url => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url) });
            galeria.forEach(item => {
                if (item.imagenPreview && item.imagenPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.imagenPreview);
                }
            });
        };
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
            default: break;
        }
    };

    const handleGaleriaInputChange = (index, field, value) => {
        setGaleria(currentGaleria =>
            currentGaleria.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const handleGaleriaFileChange = (index, event) => {
        const file = event.target.files?.[0];
        event.target.value = null;

        setGaleria(currentGaleria => {
            const oldPreview = currentGaleria[index]?.imagenPreview;
            if (oldPreview && oldPreview.startsWith('blob:')) {
                URL.revokeObjectURL(oldPreview);
            }
            const newPreview = file ? URL.createObjectURL(file) : null;
            return currentGaleria.map((item, i) =>
                i === index ? { ...item, imagenFile: file || null, imagenPreview: newPreview } : item
            );
        });
    };

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

        const galeriaDataToSend = galeria.map(item => ({
            titulo: item.titulo,
            precio: item.precio,
            imagenFile: item.imagenFile
        })).filter(item => item.titulo || item.precio || item.imagenFile);

        const stepData = {
            descripcion, sitioWeb, whatsapp, telefono, email,
            logoFile: logoFile,
            carruselFiles: carruselFiles,
            galeria: galeriaDataToSend,
        };

        console.log("[TipoB] Enviando Datos:", stepData);
        onNext(stepData);
    };

    // --- Construcción de Datos para el Simulador ---
    const buildPreviewData = () => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;

        const galeriaForPreview = galeria.map(item => ({
            titulo: item.titulo,
            precio: item.precio,
            imagenPreview: item.imagenPreview
        })).filter(item => item.titulo || item.precio || item.imagenPreview);

        return {
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
            descripcion: descripcion,
            logoPreview: logoPreview,
            carrusel: carruselPreviews,
            sitioWeb: sitioWeb,
            whatsapp: whatsapp,
            telefono: telefono,
            email: email,
            galeriaProductos: galeriaForPreview
        };
    };
    const previewData = buildPreviewData();

    return (
        <div className="registro-step-layout">
            {/* Contenedor del Formulario */}
            <div className="form-wrapper">
                <form onSubmit={handleSubmit} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Productos</h1>

                    {/* Logo */}
                    <div className="form-section">
                        <label>Logo</label>
                        {logoPreview && (
                            <div className="logo-preview-container">
                                <img src={logoPreview} alt="Vista previa del Logo" />
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        if (logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
                                        setLogoFile(null);
                                        setLogoPreview(null);
                                    }}
                                    className="remove-button"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        )}
                        
                        <FileUploader
                            onFilesChange={(files) => {
                                if (files.length > 0) {
                                    const file = files[0];
                                    if (logoPreview && logoPreview.startsWith('blob:')) {
                                        URL.revokeObjectURL(logoPreview);
                                    }
                                    setLogoFile(file);
                                    setLogoPreview(URL.createObjectURL(file));
                                }
                            }}
                            multiple={false}
                            label={logoPreview ? "Cambiar logo" : "Arrastra tu logo aquí o haz clic"}
                        />
                    </div>

                    {/* Carrusel */}
                    <div className="form-section">
                        <label>Carrusel Multimedia (Imágenes)</label>
                        {carruselPreviews.length > 0 && (
                            <div className="carrusel-previews"> {/* Reusa clase de TipoB si existe o define estilos */}
                                {carruselPreviews.map((previewUrl, index) => (
                                    <div key={index} className="carrusel-preview-item">
                                        <img src={previewUrl} alt={`Vista previa ${index + 1}`} />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newPreviews = [...carruselPreviews];
                                                const newFiles = [...carruselFiles];
                                                const removedPreviewUrl = newPreviews.splice(index, 1)[0];
                                                
                                                
                                                if (removedPreviewUrl.startsWith('blob:')) {
                                                    URL.revokeObjectURL(removedPreviewUrl);
                                                   
                                                    let blobCountBeforeIndex = 0;
                                                    for (let i = 0; i < index; i++) {
                                                        if (carruselPreviews[i].startsWith('blob:')) {
                                                            blobCountBeforeIndex++;
                                                        }
                                                    }
                                                    
                                                    if (carruselFiles.length > blobCountBeforeIndex) {
                                                         newFiles.splice(blobCountBeforeIndex, 1);
                                                    }

                                                }
                                                
                                                setCarruselPreviews(newPreviews);
                                                setCarruselFiles(newFiles);
                                            }}
                                            className="remove-button"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <FileUploader
                            onFilesChange={(acceptedFiles) => {
                                const LIMITE_CARRUSEL = 7;

                                // Previews actuales que NO son blob (de initialData)
                                const persistentPreviews = carruselPreviews.filter(url => !url.startsWith('blob:'));
                                // Files actuales que SÍ son blob (de subidas previas en esta sesión)
                                const currentUploadedFiles = carruselFiles || [];

                                const totalEspaciosOcupadosPorPersistentesYBlobsActuales = persistentPreviews.length + currentUploadedFiles.length;

                                if (totalEspaciosOcupadosPorPersistentesYBlobsActuales >= LIMITE_CARRUSEL) {
                                    // Opcional: Aquí podrías disparar una notificación al usuario
                                    console.warn(`Límite de ${LIMITE_CARRUSEL} imágenes alcanzado. No se pueden agregar más.`);
                                    return;
                                }

                                const espaciosDisponiblesParaNuevosArchivos = LIMITE_CARRUSEL - totalEspaciosOcupadosPorPersistentesYBlobsActuales;
                                
                                // Tomar solo los archivos que caben
                                const nuevosArchivosFiltrados = acceptedFiles.slice(0, espaciosDisponiblesParaNuevosArchivos);

                                if (nuevosArchivosFiltrados.length === 0 && acceptedFiles.length > 0) {
                                     console.warn(`Límite de ${LIMITE_CARRUSEL} imágenes alcanzado o no hay espacio para nuevos archivos.`);
                                     return;
                                }
                                
                                if (acceptedFiles.length > nuevosArchivosFiltrados.length) {
                                    // Opcional: Notificar al usuario que algunos archivos no se agregaron
                                    console.warn(`Se intentaron agregar ${acceptedFiles.length} imágenes, pero solo ${nuevosArchivosFiltrados.length} fueron añadidas para no exceder el límite de ${LIMITE_CARRUSEL}.`);
                                }

                                if (nuevosArchivosFiltrados.length > 0) {
                                    // Los Object URLs de blobs anteriores se limpian por el useEffect general
                                    // cuando 'carruselPreviews' y/o 'carruselFiles' cambian.

                                    const updatedUploadedFiles = [...currentUploadedFiles, ...nuevosArchivosFiltrados];
                                    
                                    // Crear ObjectURLs solo para los archivos en updatedUploadedFiles
                                    const updatedUploadedFilePreviews = updatedUploadedFiles.map(file => URL.createObjectURL(file));
                                                                              
                                    setCarruselFiles(updatedUploadedFiles);
                                    setCarruselPreviews([...persistentPreviews, ...updatedUploadedFilePreviews]);
                                }
                            }}
                            multiple={true}
                            label="Arrastra imágenes aquí o haz clic (máx. 7)" 
                        />
                    </div>

                    {/* Descripción */}
                    <div className="form-section">
                        <label htmlFor="descripcion-b">Descripción del Proveedor</label>
                        <textarea id="descripcion-b" name="descripcion" value={descripcion} onChange={handleInputChange} rows="4" placeholder="Describe tu negocio, productos destacados..." />
                    </div>

                    {/* Marcas y Extras */}
                    <div className="form-section">
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
                                            minWidth: '120px',
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
                                    minWidth: '120px',
                                    marginTop: '6px',
                                    flexGrow: 1,
                                },
                            }}
                        />
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
                                    <label>Producto {index + 1}</label>
                                    
                                    {producto.imagenPreview ? (
                                        <div className="single-preview">
                                            <img src={producto.imagenPreview} alt={`Preview Producto ${index + 1}`} />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGaleriaImage(index)}
                                                className="remove-button"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <FileUploader
                                            onFilesChange={(files) => {
                                                if (files.length > 0) {
                                                    handleGaleriaFileChange(index, { target: { files } });
                                                }
                                            }}
                                            multiple={false}
                                            label="Arrastra imagen del producto aquí o haz clic"
                                        />
                                    )}
                                    
                                    <input 
                                        type="text" 
                                        value={producto.titulo} 
                                        onChange={(e) => handleGaleriaInputChange(index, 'titulo', e.target.value)} 
                                        placeholder="Título Producto" 
                                    />
                                    
                                    <input 
                                        type="text" 
                                        value={producto.precio} 
                                        onChange={(e) => handleGaleriaInputChange(index, 'precio', e.target.value)} 
                                        placeholder="Precio o Rango" 
                                    />
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
                <CardProductosPreview proveedor={previewData} />
            </div>
        </div>
    );
};

export default FormularioPersonalizadoTipoB;