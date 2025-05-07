// src/components/registroProveedor/steps/FormularioPersonalizadoTipoA.jsx

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone'; // Importado para FileUploader
import { FaFileCirclePlus } from 'react-icons/fa6'; // FaTimes para botones de eliminar
import { scrollToTop } from '../../../utils/scrollHelper';
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { FaTimes } from 'react-icons/fa';

// Componente FileUploader reusable (copiado de TipoB)
const FileUploader = ({ 
  onFilesChange, 
  multiple = true, 
  accept = 'image/*',
  maxFiles = 1, // Aunque en carrusel se maneja diferente, es un prop base
  label = 'Arrastra archivos aquí o haz clic'
  // 'previews' prop no se usa directamente dentro de este FileUploader para mostrarse,
  // el componente padre maneja las previews externas.
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple,
    maxFiles: multiple ? undefined : maxFiles, // maxFiles solo aplica restrictivamente para single upload aquí
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
      </div>
    </div>
  );
};

const FormularioPersonalizadoTipoA = ({
    initialData,
    onNext,
    onBack,
    onCancel,
    nombreProveedor = '',
    ciudad = '',
    provincia = '',
    marcas = [],
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
    const [carruselFiles, setCarruselFiles] = useState([]);
    const [carruselPreviews, setCarruselPreviews] = useState([]);

    useEffect(() => {
        scrollToTop();
        if (initialData) {
            setDescripcion(initialData.descripcion || '');
            setSitioWeb(initialData.sitioWeb || '');
            setWhatsapp(initialData.whatsapp || '');
            setTelefono(initialData.telefono || '');
            setEmail(initialData.email || '');
            setSelectedMarcas(Array.isArray(initialData.marca) ? initialData.marca : []);
            setSelectedExtras(Array.isArray(initialData.extras) ? initialData.extras : []);
            setLogoPreview(initialData.logoURL || null);
            setCarruselPreviews(initialData.carruselURLs || []);
            setLogoFile(null);
            setCarruselFiles([]);
        } else {
            setDescripcion(''); setSitioWeb(''); setWhatsapp(''); setTelefono(''); setEmail('');
            setSelectedMarcas([]); setSelectedExtras([]);
            setLogoFile(null); setLogoPreview(null);
            setCarruselFiles([]); setCarruselPreviews([]);
        }
    }, [initialData]);

    useEffect(() => {
        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
            carruselPreviews.forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [logoPreview, carruselPreviews]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const stepData = {
            descripcion, sitioWeb, whatsapp, telefono, email,
            marca: selectedMarcas,
            extras: selectedExtras,
            logoFile: logoFile,
            carruselFiles: carruselFiles
        };
        onNext(stepData);
    };

    const buildPreviewData = () => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        return {
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
            descripcion: descripcion,
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
    const previewData = buildPreviewData();

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Historia</h1>

                    <div className="form-section">
                        <label>Logo</label>
                        {logoPreview && (
                            <div className="logo-preview-container"> {/* Reusa clase de TipoB si existe o define estilos */}
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
                            label={logoPreview ? "Cambiar logo" : "Arrastra tu logo aquí o haz clic"}
                        />
                    </div>

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

                    <div className="form-section">
                        <label htmlFor="descripcion-a">Descripción del Proveedor</label>
                        <textarea id="descripcion-a" name="descripcion" value={descripcion} onChange={handleInputChange} rows="5" placeholder="Describe tu empresa, historia, valores..." />
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
                                // '& .MuiChip-root': { margin: '4px 4px 0 0' }, // Movido a renderTags para mejor control
                                '& .MuiAutocomplete-input': { minWidth: '120px', marginTop: '6px', flexGrow: 1 },
                            }}
                        />
                    </div>

                    <div className="form-section">
                        <h3>Información de Contacto (Visible en la Card)</h3>
                        <label> Sitio Web <input type="url" name="sitioWeb" value={sitioWeb} onChange={handleInputChange} placeholder="https://..." /></label>
                        <label> WhatsApp <input type="text" name="whatsapp" value={whatsapp} onChange={handleInputChange} placeholder="Ej: +54 9 11..." /></label>
                        <label> Teléfono Fijo (Opcional) <input type="tel" name="telefono" value={telefono} onChange={handleInputChange} placeholder="Teléfono" /></label>
                        <label> Email de Contacto Público <input type="email" name="email" value={email} onChange={handleInputChange} placeholder="Email" /></label>
                    </div>

                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            <div className="simulator-wrapper">
                <h1>Vista Previa: Card Historia</h1>
                <CardHistoriaPreview proveedor={previewData} />
            </div>
        </div>
    );
};
export default FormularioPersonalizadoTipoA;