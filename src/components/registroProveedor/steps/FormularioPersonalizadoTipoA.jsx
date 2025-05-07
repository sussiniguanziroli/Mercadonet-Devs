// src/components/registroProveedor/steps/FormularioPersonalizadoTipoA.jsx

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus} from 'react-icons/fa6';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { FaTimes } from 'react-icons/fa';

const FileUploader = ({ 
  onFilesChange, 
  multiple = true, 
  accept = 'image/*',
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
    const [carruselMediaItems, setCarruselMediaItems] = useState([]);

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
            setLogoFile(null);

            const initialMedia = (initialData.carruselURLs || []).map(url => {
                let fileType = 'image';
                let mimeType = 'image/jpeg'; // Default
                const extension = url.split('.').pop().toLowerCase().split('?')[0]; // Considerar query params
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
            setCarruselMediaItems([]);
        }
    }, [initialData]);

    useEffect(() => {
        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
            carruselMediaItems.forEach(item => {
                if (item.url && item.url.startsWith('blob:')) {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [logoPreview, carruselMediaItems]);

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
        
        const nuevosArchivosCarrusel = carruselMediaItems
            .filter(item => item.file instanceof File)
            .map(item => item.file);

        const urlsCarruselExistentes = carruselMediaItems
            .filter(item => !item.file && item.url)
            .map(item => ({ url: item.url, fileType: item.fileType, mimeType: item.mimeType }));

        const stepData = {
            descripcion, sitioWeb, whatsapp, telefono, email,
            marca: selectedMarcas,
            extras: selectedExtras,
            logoFile: logoFile,
            carruselNuevosArchivos: nuevosArchivosCarrusel, // Archivos nuevos para subir
            carruselUrlsExistentes: urlsCarruselExistentes, // URLs que ya estaban (para referencia o no cambiar)
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
            carrusel: carruselMediaItems.map(item => ({ 
                url: item.url,
                fileType: item.fileType,
                mimeType: item.mimeType
            })),
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

                    <div className="form-section">
                        <label>Carrusel Multimedia (Imágenes y Videos)</label>
                        {carruselMediaItems.length > 0 && (
                            <div className="carrusel-previews">
                                {carruselMediaItems.map((item, index) => (
                                    <div key={item.url + '-' + index} className="carrusel-preview-item">
                                        {item.fileType === 'image' ? (
                                            <img src={item.url} alt={`Contenido del carrusel ${index + 1}`} />
                                        ) : (
                                            <video controls muted style={{ width: '100%', display:'block' }}> {/* Ajusta estilos si es necesario */}
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