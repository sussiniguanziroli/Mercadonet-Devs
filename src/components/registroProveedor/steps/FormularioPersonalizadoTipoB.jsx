// src/components/registroProveedor/steps/FormularioPersonalizadoTipoB.jsx

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus} from 'react-icons/fa6'; 
import { FaTimes } from 'react-icons/fa';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardProductosPreview from '../card_simulators/CardProductosPreview';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';

// Componente FileUploader reusable
const FileUploader = ({ 
  onFilesChange, 
  multiple = true, 
  accept = 'image/*',
  // previews prop no se usa directamente en este FileUploader para mostrarse internamente,
  // excepto para el caso !multiple, pero el padre maneja las previews principales.
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
        {/* Previsualización interna para single file upload (ej: logo), si se pasa 'previews' */}
        {!multiple && previews && previews.length > 0 && (
          <div className="single-preview"> 
            {/* Asumimos que el primer preview es el relevante para single upload */}
            {/* Necesitaría saber el tipo de 'previews[0]' para mostrar img o video */}
            {typeof previews[0] === 'string' ? ( // Si es una URL (simple caso para logo)
                <img src={previews[0]} alt="Preview" />
            ) : previews[0] && previews[0].fileType === 'image' ? (
                <img src={previews[0].url} alt="Preview" />
            ) : previews[0] && previews[0].fileType === 'video' ? (
                <video src={previews[0].url} controls muted style={{maxWidth: '100px', maxHeight: '100px'}} />
            ) : null}
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
    servicios = [], // Esta prop no se usa en el formulario actual, pero la mantengo
    extras = []
}) => {
    const [descripcion, setDescripcion] = useState('');
    const [sitioWeb, setSitioWeb] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [selectedMarcas, setSelectedMarcas] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    
    // --- ESTADO DEL CARRUSEL MODIFICADO ---
    const [carruselMediaItems, setCarruselMediaItems] = useState([]);
    // const [carruselFiles, setCarruselFiles] = useState([]); // REEMPLAZADO
    // const [carruselPreviews, setCarruselPreviews] = useState([]); // REEMPLAZADO
    
    const [galeria, setGaleria] = useState(
        Array(6).fill(null).map(() => ({ ...initialProductState }))
    );

    useEffect(() => {
        scrollToTop();
        if (initialData) {
            setDescripcion(initialData.descripcion || '');
            setSitioWeb(initialData.sitioWeb || '');
            setWhatsapp(initialData.whatsapp || '');
            setTelefono(initialData.telefono || '');
            setEmail(initialData.email || '');
            setSelectedMarcas(Array.isArray(initialData.marca) ? initialData.marca : (initialData.marcas || [])); // Compatibilidad
            setSelectedExtras(Array.isArray(initialData.extras) ? initialData.extras : []);


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
            setLogoFile(null);

            // --- INICIALIZACIÓN DEL CARRUSEL MODIFICADA ---
            const initialMedia = (initialData.carruselURLs || []).map(url => {
                let fileType = 'image';
                let mimeType = 'image/jpeg'; 
                const extension = url.split('.').pop().toLowerCase().split('?')[0];
                if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
                    fileType = 'video';
                    mimeType = `video/${extension === 'mov' ? 'quicktime' : extension}`;
                } else if (['png', 'gif', 'bmp', 'webp'].includes(extension)) {
                    mimeType = `image/${extension}`;
                }
                return { url, fileType, mimeType, file: null };
            });
            setCarruselMediaItems(initialMedia);

        } else {
            setDescripcion(''); setSitioWeb(''); setWhatsapp(''); setTelefono(''); setEmail('');
            setSelectedMarcas([]); setSelectedExtras([]);
            setLogoFile(null); setLogoPreview(null);
            setCarruselMediaItems([]); // Reset del nuevo estado
            setGaleria(Array(6).fill(null).map(() => ({ ...initialProductState })));
        }
    }, [initialData]);

    useEffect(() => {
        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
            
            // --- LIMPIEZA DE CARRUSEL MODIFICADA ---
            carruselMediaItems.forEach(item => { 
                if (item.url && item.url.startsWith('blob:')) {
                    URL.revokeObjectURL(item.url);
                }
            });

            galeria.forEach(item => {
                if (item.imagenPreview && item.imagenPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.imagenPreview);
                }
            });
        };
    }, [logoPreview, carruselMediaItems, galeria]); // Dependencia actualizada

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

    const handleGaleriaFileChange = (index, eventOrFiles) => {
        // Adaptado para funcionar tanto con evento como con array de files de FileUploader
        const file = eventOrFiles.target ? eventOrFiles.target.files?.[0] : (Array.isArray(eventOrFiles) ? eventOrFiles[0] : null);
        if (eventOrFiles.target) eventOrFiles.target.value = null;
    
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const galeriaDataToSend = galeria.map(item => ({
            titulo: item.titulo,
            precio: item.precio,
            imagenFile: item.imagenFile
        })).filter(item => item.titulo || item.precio || item.imagenFile);

        // --- DATOS DEL CARRUSEL PARA ENVIAR MODIFICADOS ---
        const carruselNuevosArchivos = carruselMediaItems
            .filter(item => item.file instanceof File)
            .map(item => item.file);

        const carruselUrlsExistentes = carruselMediaItems
            .filter(item => !item.file && item.url)
            .map(item => ({ url: item.url, fileType: item.fileType, mimeType: item.mimeType }));

        const stepData = {
            descripcion, sitioWeb, whatsapp, telefono, email,
            logoFile: logoFile,
            // carruselFiles: carruselFiles, // REEMPLAZADO
            carruselNuevosArchivos: carruselNuevosArchivos,
            carruselUrlsExistentes: carruselUrlsExistentes,
            galeria: galeriaDataToSend,
            marca: selectedMarcas, // Asegúrate de que el backend espera "marca"
            extras: selectedExtras,
        };
        onNext(stepData);
    };

    const buildPreviewData = () => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;

        const galeriaForPreview = galeria.map(item => ({
            titulo: item.titulo,
            precio: item.precio,
            imagenPreview: item.imagenPreview // Galería sigue usando imagenPreview
        })).filter(item => item.titulo || item.precio || item.imagenPreview);

        return {
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
            descripcion: descripcion,
            logoPreview: logoPreview,
            // --- DATOS DEL CARRUSEL PARA SIMULADOR MODIFICADOS ---
            carrusel: carruselMediaItems.map(item => ({ 
                url: item.url,
                fileType: item.fileType,
                mimeType: item.mimeType
            })),
            sitioWeb: sitioWeb,
            whatsapp: whatsapp,
            telefono: telefono,
            email: email,
            galeriaProductos: galeriaForPreview,
            marca: selectedMarcas,
            extras: selectedExtras,
        };
    };
    const previewData = buildPreviewData();

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Productos</h1>

                    <div className="form-section">
                        <label>Logo</label>
                        {logoPreview && (
                            <div className="logo-preview-container">
                                <img src={logoPreview} alt="Vista previa del Logo" />
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
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
                            accept="image/*" // Logo sigue siendo solo imagen
                            label={logoPreview ? "Cambiar logo" : "Arrastra tu logo aquí o haz clic"}
                        />
                    </div>

                    {/* --- SECCIÓN CARRUSEL MODIFICADA --- */}
                    <div className="form-section">
                        <label>Carrusel Multimedia (Imágenes y Videos)</label>
                        {carruselMediaItems.length > 0 && (
                            <div className="carrusel-previews">
                                {carruselMediaItems.map((item, index) => (
                                    <div key={item.url + '-' + index} className="carrusel-preview-item">
                                        {item.fileType === 'image' ? (
                                            <img src={item.url} alt={`Contenido del carrusel ${index + 1}`} />
                                        ) : (
                                            <video controls muted style={{ width: '100%', display:'block' }}>
                                                <source src={item.url} type={item.mimeType} />
                                                Tu navegador no soporta la etiqueta de video.
                                            </video>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const itemToRemove = carruselMediaItems[index];
                                                if (itemToRemove.url.startsWith('blob:')) {
                                                    URL.revokeObjectURL(itemToRemove.url);
                                                }
                                                setCarruselMediaItems(prevItems => prevItems.filter((_, i) => i !== index));
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
                                const archivosActualesCount = carruselMediaItems.length;

                                if (archivosActualesCount >= LIMITE_CARRUSEL) {
                                    console.warn(`Límite de ${LIMITE_CARRUSEL} ítems alcanzado.`);
                                    return;
                                }

                                const espaciosDisponibles = LIMITE_CARRUSEL - archivosActualesCount;
                                const archivosAAgregarFiltrados = acceptedFiles.slice(0, espaciosDisponibles);

                                if (acceptedFiles.length > archivosAAgregarFiltrados.length) {
                                    console.warn(`Solo se agregarán ${archivosAAgregarFiltrados.length} de ${acceptedFiles.length} archivos debido al límite.`);
                                }

                                if (archivosAAgregarFiltrados.length > 0) {
                                    const nuevosMediaItems = archivosAAgregarFiltrados.map(file => ({
                                        url: URL.createObjectURL(file),
                                        fileType: file.type.startsWith('video/') ? 'video' : 'image',
                                        mimeType: file.type,
                                        file: file 
                                    }));
                                    setCarruselMediaItems(prevItems => [...prevItems, ...nuevosMediaItems]);
                                }
                            }}
                            multiple={true}
                            accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                            label={`Arrastra imágenes o videos (máx. 7)`}
                        />
                    </div>
                    {/* --- FIN SECCIÓN CARRUSEL MODIFICADA --- */}

                    <div className="form-section">
                        <label htmlFor="descripcion-b">Descripción del Proveedor</label>
                        <textarea id="descripcion-b" name="descripcion" value={descripcion} onChange={handleInputChange} rows="4" placeholder="Describe tu negocio, productos destacados..." />
                    </div>

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
                                        '& .MuiInputBase-root': { flexWrap: 'wrap', paddingRight: '8px' },
                                        '& .MuiAutocomplete-input': { minWidth: '120px', marginTop: '6px', flexGrow: 1 },
                                    }}
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip label={option} {...getTagProps({ index })} sx={{ margin: '2px' }} />
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
                                    <Chip label={option} {...getTagProps({ index })} onMouseDown={(e) => e.stopPropagation()} sx={{ margin: '4px 4px 0 0' }}/>
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
                                '& .MuiInputBase-root': { flexWrap: 'wrap', alignItems: 'flex-start' },
                                '& .MuiAutocomplete-input': { minWidth: '120px', marginTop: '6px', flexGrow: 1 },
                            }}
                        />
                    </div>

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

                    <div className="form-section galeria-productos">
                        <h3>Galería de Productos (Hasta 6)</h3>
                        <div className="galeria-grid">
                            {galeria.map((producto, index) => (
                                <div key={index} className="producto-card">
                                    <label>Producto {index + 1}</label>
                                    {producto.imagenPreview ? (
                                        <div className="single-preview"> {/* Usar clase de TipoB o definirla */}
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
                                            onFilesChange={(files) => { // Pasar 'files' directamente
                                                if (files.length > 0) {
                                                    handleGaleriaFileChange(index, files); // Modificado para pasar files
                                                }
                                            }}
                                            multiple={false}
                                            accept="image/*" // Galería sigue siendo solo imagen
                                            label="Arrastra imagen aquí"
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

                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            <div className="simulator-wrapper">
                <h1>Vista Previa: Card Productos</h1>
                <CardProductosPreview proveedor={previewData} />
            </div>
        </div>
    );
};

export default FormularioPersonalizadoTipoB;