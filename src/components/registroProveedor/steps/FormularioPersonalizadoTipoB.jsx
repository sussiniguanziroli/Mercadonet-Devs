import React, { useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardProductosPreview from '../card_simulators/CardProductosPreview';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';

const LIMITE_CARRUSEL = 7;
const LIMITE_GALERIA_PRODUCTOS = 6;
const PRODUCTOS_OBLIGATORIOS_GALERIA = 3; // Nuevo: Límite para productos obligatorios
const DESCRIPCION_MAX_LENGTH = 1300;

const parseAcceptString = (acceptString) => {
    if (typeof acceptString !== 'string') return acceptString;
    const types = acceptString.split(',');
    const parsed = {};
    types.forEach(type => {
        const trimmedType = type.trim();
        if (trimmedType) {
            parsed[trimmedType] = [];
        }
    });
    return parsed;
};

const FileUploaderRHF = ({
    field,
    multiple = true,
    accept: acceptProp,
    maxFiles = 1,
    label = 'Arrastra archivos aquí o haz clic',
    currentFilesCount = 0,
    limit = LIMITE_CARRUSEL,
    isLogo = false,
    isGaleria = false,
}) => {
    const processedAccept = parseAcceptString(acceptProp);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: processedAccept,
        multiple,
        maxFiles: isLogo || isGaleria ? maxFiles : undefined,
        onDrop: acceptedFiles => {
            if (isLogo || isGaleria) {
                if (acceptedFiles.length > 0) {
                    const file = acceptedFiles[0];
                    if (field.value && typeof field.value.preview === 'string' && field.value.preview.startsWith('blob:') && !field.value.isExisting) {
                        URL.revokeObjectURL(field.value.preview);
                    }
                    const newFileObject = Object.assign(file, { preview: URL.createObjectURL(file) });
                    field.onChange(newFileObject);
                }
            } else {
                const espaciosDisponibles = limit - currentFilesCount;
                const archivosAAgregar = acceptedFiles.slice(0, espaciosDisponibles);
                if (archivosAAgregar.length > 0) {
                    const nuevosMediaItems = archivosAAgregar.map(file => ({
                        url: URL.createObjectURL(file),
                        fileType: file.type.startsWith('video/') ? 'video' : 'image',
                        mimeType: file.type,
                        file: file
                    }));
                    field.onChange([...(field.value || []), ...nuevosMediaItems]);
                }
                if (acceptedFiles.length > archivosAAgregar.length) {
                    console.warn(`Solo se agregarán ${archivosAAgregar.length} de ${acceptedFiles.length} archivos debido al límite.`);
                }
            }
        }
    });

    return (
        <div {...getRootProps()} className={`file-uploader-container ${isDragActive ? 'drag-active' : ''} ${isGaleria ? 'galeria-uploader' : ''}`}>
            <input {...getInputProps()} />
            <div className="file-uploader-content">
                <FaFileCirclePlus size={isGaleria ? 20 : 24} />
                <p style={isGaleria ? {fontSize: '0.8em'} : {}}>{label}</p>
            </div>
        </div>
    );
};

const FormularioPersonalizadoTipoB = ({
    tipoProveedor = [],
    tipoRegistro = '',
    initialData,
    onNext,
    onBack,
    nombreProveedor = '',
    ciudad = '',
    provincia = '',
    marcas: marcasOpciones = [],
    extras: extrasOpciones = [],
}) => {

    const getInitialDefaultValues = useCallback(() => {
        const initialLogoFile = initialData?.logoURL
            ? { name: 'logo_existente.png', type: 'image/existing', preview: initialData.logoURL, isExisting: true }
            : null;

        const initialCarruselItems = (initialData?.carruselURLs || []).map(media => {
            let fileType = 'image'; let mimeType = 'image/jpeg';
            const urlString = typeof media.url === 'string' ? media.url : '';
            const extension = urlString ? urlString.split('.').pop().toLowerCase().split('?')[0] : '';
            if (media.fileType) {
                fileType = media.fileType;
                mimeType = media.mimeType || (fileType === 'video' ? `video/${extension === 'mov' ? 'quicktime' : extension}` : `image/${extension || 'jpeg'}`);
            } else if (extension) {
                 if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) { fileType = 'video'; mimeType = `video/${extension === 'mov' ? 'quicktime' : extension}`; }
                 else if (['png', 'gif', 'bmp', 'webp', 'jpg', 'jpeg'].includes(extension)) { mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`; fileType = 'image'; }
            }
            return { url: media.url, fileType, mimeType, file: null, isExisting: true };
        });

        const initialGaleria = Array(LIMITE_GALERIA_PRODUCTOS).fill(null).map((_, index) => {
            const productData = initialData?.galeria?.[index];
            return productData
                ? { imagenFile: productData.imagenURL ? { name: `prod_${index}_existente.png`, type:'image/existing', preview: productData.imagenURL, isExisting: true } : null,
                    titulo: productData.titulo || '', precio: productData.precio || '' }
                : { imagenFile: null, titulo: '', precio: '' };
        });

        return {
            descripcion: initialData?.descripcion || '',
            sitioWeb: initialData?.sitioWeb || '',
            whatsapp: initialData?.whatsapp || '',
            telefono: initialData?.telefono || '',
            email: initialData?.email || '',
            marcasSeleccionadas: Array.isArray(initialData?.marca) ? initialData.marca : (initialData?.marcas || []),
            extrasSeleccionados: Array.isArray(initialData?.extras) ? initialData.extras : [],
            logoFile: initialLogoFile,
            carruselMediaItems: initialCarruselItems,
            galeria: initialGaleria,
        };
    }, [initialData]);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors }, register, getValues } = useForm({
        defaultValues: getInitialDefaultValues(),
        mode: 'onBlur',
    });

    const { fields: galeriaFields } = useFieldArray({ control, name: "galeria" });
    const watchedAllFields = watch();

    useEffect(() => { scrollToTop(); reset(getInitialDefaultValues()); }, [initialData, reset, getInitialDefaultValues]);

    useEffect(() => {
        const currentValues = getValues();
        const logoPreviewToRevoke = currentValues.logoFile?.preview;
        const carruselPreviewsToRevoke = (currentValues.carruselMediaItems || []).map(item => item.url);
        const galeriaPreviewsToRevoke = (currentValues.galeria || []).map(item => item.imagenFile?.preview);
        return () => {
            if (logoPreviewToRevoke && logoPreviewToRevoke.startsWith('blob:') && !currentValues.logoFile?.isExisting) URL.revokeObjectURL(logoPreviewToRevoke);
            carruselPreviewsToRevoke.forEach(url => {
                if (url && url.startsWith('blob:')) {
                    const item = (currentValues.carruselMediaItems || []).find(i => i.url === url);
                    if (item && !item.isExisting) URL.revokeObjectURL(url);
                }
            });
            galeriaPreviewsToRevoke.forEach(previewUrl => {
                if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
            });
        };
    }, [getValues]);

    const onSubmit = (data) => {
        const nuevosArchivosCarrusel = (data.carruselMediaItems || []).filter(item => item.file instanceof File && !item.isExisting).map(item => item.file);
        const urlsCarruselExistentes = (data.carruselMediaItems || []).filter(item => item.isExisting || (!item.file && item.url)).map(item => ({ url: item.url, fileType: item.fileType, mimeType: item.mimeType }));
        const galeriaDataToSend = (data.galeria || []).map(producto => ({
            titulo: producto.titulo, 
            precio: producto.precio, // El $ es solo visual, se guarda el número
            imagenFile: producto.imagenFile instanceof File && !producto.imagenFile.isExisting ? producto.imagenFile : null,
            imagenUrlExistente: producto.imagenFile?.isExisting ? producto.imagenFile.preview : null,
        })).filter(item => item.titulo || item.precio || item.imagenFile || item.imagenUrlExistente);

        const stepData = {
            descripcion: data.descripcion, sitioWeb: data.sitioWeb, whatsapp: data.whatsapp, telefono: data.telefono, email: data.email,
            marca: data.marcasSeleccionadas, extras: data.extrasSeleccionados,
            logoFile: data.logoFile instanceof File && !data.logoFile.isExisting ? data.logoFile : null,
            logoUrlExistente: data.logoFile?.isExisting ? data.logoFile.preview : null,
            carruselNuevosArchivos: nuevosArchivosCarrusel,
            carruselUrlsExistentes: urlsCarruselExistentes,
            galeria: galeriaDataToSend,
        };
        onNext(stepData);
    };

    const buildPreviewData = (currentFormData) => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        const logoForPreview = currentFormData.logoFile?.preview || null;
        const carruselForPreview = (currentFormData.carruselMediaItems || []).map(item => ({ url: item.url || item.preview, fileType: item.fileType, mimeType: item.mimeType }));
        const descripcionCompleta = currentFormData.descripcion || '';
        const descripcionParaPreview = descripcionCompleta.length > 540 ? `${descripcionCompleta.substring(0, 540)}...` : descripcionCompleta;
        const galeriaForPreview = (currentFormData.galeria || []).map(item => ({ 
            titulo: item.titulo, 
            precio: item.precio ? `$${item.precio}` : '', // Añadir $ en la preview si hay precio
            imagenPreview: item.imagenFile?.preview || null 
        })).filter(item => item.titulo || item.precio || item.imagenPreview);

        return {
            tipoProveedor: tipoProveedor, tipoRegistro: tipoRegistro,
            nombre: nombreProveedor, ubicacionDetalle, descripcion: descripcionParaPreview, marca: currentFormData.marcasSeleccionadas,
            extras: currentFormData.extrasSeleccionados, logoPreview: logoForPreview, carrusel: carruselForPreview,
            sitioWeb: currentFormData.sitioWeb, whatsapp: currentFormData.whatsapp, telefono: currentFormData.telefono,
            email: currentFormData.email, galeriaProductos: galeriaForPreview,
        };
    };
    const previewData = buildPreviewData(watchedAllFields);

    const handleRemoveLogo = () => {
        const currentLogo = getValues("logoFile");
        if (currentLogo?.preview?.startsWith('blob:') && !currentLogo.isExisting) URL.revokeObjectURL(currentLogo.preview);
        setValue('logoFile', null, { shouldValidate: true, shouldDirty: true });
    };
    const handleRemoveCarruselItem = (indexToRemove) => {
        const currentItems = getValues("carruselMediaItems") || [];
        const itemToRemove = currentItems[indexToRemove];
        if (itemToRemove?.url?.startsWith('blob:') && !itemToRemove.isExisting) URL.revokeObjectURL(itemToRemove.url);
        const newItems = currentItems.filter((_, i) => i !== indexToRemove);
        setValue('carruselMediaItems', newItems, { shouldValidate: true, shouldDirty: true });
    };
    const handleRemoveGaleriaImage = (index) => {
        const fieldName = `galeria.${index}.imagenFile`;
        const currentImageFile = getValues(fieldName);
        if (currentImageFile?.preview?.startsWith('blob:') && !currentImageFile.isExisting) URL.revokeObjectURL(currentImageFile.preview);
        setValue(fieldName, null, { shouldValidate: true, shouldDirty: true });
    };
    
    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Productos</h1>

                    <div className="form-section"> {/* LOGO */}
                        <InputLabel htmlFor="logo-uploader-b" error={!!errors.logoFile}>Logo</InputLabel>
                        {watch('logoFile')?.preview && (
                            <div className="logo-preview-container">
                                <img src={watch('logoFile').preview} alt="Vista previa del Logo" />
                                <button type="button" onClick={handleRemoveLogo} className="remove-button"><FaTimes /></button>
                            </div>
                        )}
                        <Controller name="logoFile" control={control} rules={{ validate: { fileType: v => (v && v instanceof File && !v.isExisting) ? v.type.startsWith('image/') || 'Solo imágenes para logo.' : true } }}
                            render={({ field }) => <FileUploaderRHF field={field} multiple={false} acceptProp="image/*" label={watch('logoFile')?.preview ? "Cambiar logo" : "Arrastra tu logo"} isLogo={true} maxFiles={1} />} />
                        {errors.logoFile && <FormHelperText error>{errors.logoFile.message}</FormHelperText>}
                    </div>

                    <div className="form-section"> {/* CARRUSEL */}
                        <InputLabel htmlFor="carrusel-uploader-b" error={!!errors.carruselMediaItems}>Carrusel Multimedia (máx. {LIMITE_CARRUSEL})</InputLabel>
                        {(watch('carruselMediaItems') || []).length > 0 && (
                            <div className="carrusel-previews">
                                {(watch('carruselMediaItems')).map((item, index) => (
                                    <div key={item.url + '-' + index} className="carrusel-preview-item">
                                        {item.fileType === 'image' ? <img src={item.url || item.preview} alt={`Contenido ${index + 1}`} /> : <video controls muted style={{ width: '100%', display: 'block' }}><source src={item.url || item.preview} type={item.mimeType} />Tu navegador no soporta video.</video>}
                                        <button type="button" onClick={() => handleRemoveCarruselItem(index)} className="remove-button"><FaTimes /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Controller name="carruselMediaItems" control={control} rules={{ validate: { maxItems: v => (v && v.length <= LIMITE_CARRUSEL) || `No más de ${LIMITE_CARRUSEL} ítems.` } }}
                            render={({ field }) => <FileUploaderRHF field={field} multiple={true} acceptProp="image/*,video/mp4,video/webm,video/ogg,video/quicktime" label={`Imágenes/Videos (actuales: ${(field.value || []).length}/${LIMITE_CARRUSEL})`} currentFilesCount={(field.value || []).length} limit={LIMITE_CARRUSEL} />} />
                        {errors.carruselMediaItems && <FormHelperText error>{errors.carruselMediaItems.message}</FormHelperText>}
                    </div>
                    
                    <div className="form-section"> {/* DESCRIPCIÓN */}
                        <Controller name="descripcion" control={control} rules={{ required: 'La descripción es requerida', maxLength: { value: DESCRIPCION_MAX_LENGTH, message: `Máx. ${DESCRIPCION_MAX_LENGTH} caracteres.` } }}
                            render={({ field, fieldState: { error } }) => {
                                const len = field.value?.length || 0;
                                return <TextField {...field} id="descripcion-b" label="Descripción del Negocio/Productos *" multiline rows={4} variant="outlined" fullWidth placeholder="Describe tu negocio..." error={!!error} helperText={error ? error.message : `${len}/${DESCRIPCION_MAX_LENGTH}`} inputProps={{ maxLength: DESCRIPCION_MAX_LENGTH }} InputLabelProps={{ shrink: true }} />;
                            }} />
                    </div>
                    
                    <div className="form-section"> {/* MARCAS */}
                        <Controller name="marcasSeleccionadas" control={control}
                            render={({ field }) => <Autocomplete multiple id="marcas-tags-b" options={marcasOpciones} value={field.value || []} onChange={(e, v) => field.onChange(v)} getOptionLabel={(opt) => typeof opt === 'string' ? opt : ''} isOptionEqualToValue={(opt, val) => opt === val} filterSelectedOptions renderInput={(params) => <TextField {...params} variant="outlined" label="Marcas que trabajás" placeholder="Escribí o seleccioná" error={!!errors.marcasSeleccionadas} helperText={errors.marcasSeleccionadas?.message} InputLabelProps={{ shrink: true }} />} renderTags={(val, getTagProps) => val.map((opt, idx) => <Chip label={opt} {...getTagProps({ idx })} sx={{ margin: '2px' }} />)} />} />
                    </div>
                    <div className="form-section"> {/* EXTRAS */}
                         <Controller name="extrasSeleccionados" control={control}
                            render={({ field }) => <Autocomplete multiple id="extras-tags-b" options={extrasOpciones} value={field.value || []} onChange={(e, v) => field.onChange(v)} getOptionLabel={(opt) => typeof opt === 'string' ? opt : ''} isOptionEqualToValue={(opt, val) => opt === val} filterSelectedOptions renderInput={(params) => <TextField {...params} variant="outlined" label="Extras que ofrecés" placeholder="Escribí o seleccioná" error={!!errors.extrasSeleccionados} helperText={errors.extrasSeleccionados?.message} InputLabelProps={{ shrink: true }} />} renderTags={(val, getTagProps) => val.map((opt, idx) => <Chip label={opt} {...getTagProps({ idx })} sx={{ margin: '4px 4px 0 0' }} />)} />} />
                    </div>

                    <div className="form-section"> {/* CONTACTO */}
                        <h3>Información de Contacto</h3>
                        <div className="form-field-html-group">
                            <legend htmlFor="sitioWeb-b">Sitio Web <span style={{ color: 'red' }}>*</span></legend>
                            <input id="sitioWeb-b" type="url" placeholder="https://..." {...register('sitioWeb', { required: 'El sitio web es requerido', pattern: { value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i, message: "URL inválida" } })} className={errors.sitioWeb ? 'input-error' : ''} />
                            {errors.sitioWeb && <span className="error-message">{errors.sitioWeb.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <legend htmlFor="whatsapp-b">WhatsApp <span style={{ color: 'red' }}>*</span></legend>
                            <input id="whatsapp-b" type="text" placeholder="Ej: +54 9 11..." {...register('whatsapp', { required: 'WhatsApp es requerido' })} className={errors.whatsapp ? 'input-error' : ''} />
                            {errors.whatsapp && <span className="error-message">{errors.whatsapp.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <legend htmlFor="telefono-b">Teléfono Fijo (Opcional)</legend>
                            <input id="telefono-b" type="tel" placeholder="Teléfono" {...register('telefono')} className={errors.telefono ? 'input-error' : ''} />
                            {errors.telefono && <span className="error-message">{errors.telefono.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <legend htmlFor="email-b">Email de Contacto Público <span style={{ color: 'red' }}>*</span></legend>
                            <input id="email-b" type="email" placeholder="Email" {...register('email', { required: 'El email es requerido', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email inválido" } })} className={errors.email ? 'input-error' : ''} />
                            {errors.email && <span className="error-message">{errors.email.message}</span>}
                        </div>
                    </div>

                    <div className="form-section galeria-productos"> {/* GALERÍA */}
                        <h3>Galería de Productos (Hasta {LIMITE_GALERIA_PRODUCTOS}, primeros {PRODUCTOS_OBLIGATORIOS_GALERIA} obligatorios)</h3>
                        <div className="galeria-grid">
                            {galeriaFields.map((item, index) => {
                                const esObligatorio = index < PRODUCTOS_OBLIGATORIOS_GALERIA;
                                return (
                                    <div key={item.id} className="producto-card">
                                        <InputLabel 
                                            error={!!errors.galeria?.[index]?.imagenFile} 
                                            sx={{ mb: 0.5, fontSize: '0.8rem' }}
                                            htmlFor={`galeria_imagen_${index}`} // Conectar con el uploader si es posible
                                        >
                                            <legend>Producto {index + 1} {esObligatorio && <span style={{ color: 'red' }}>*</span>}</legend>
                                        </InputLabel>
                                        {watch(`galeria.${index}.imagenFile`)?.preview ? (
                                            <div className="single-preview">
                                                <img src={watch(`galeria.${index}.imagenFile`).preview} alt={`Preview ${index + 1}`} />
                                                <button type="button" onClick={() => handleRemoveGaleriaImage(index)} className="remove-button"><FaTimes /></button>
                                            </div>
                                        ) : (
                                            <Controller 
                                                name={`galeria.${index}.imagenFile`} 
                                                control={control}
                                                rules={esObligatorio ? { required: 'La imagen es requerida' } : {}}
                                                render={({ field }) => <FileUploaderRHF field={field} multiple={false} acceptProp="image/*" label="Subir imagen" isGaleria={true} maxFiles={1} />} 
                                            />
                                        )}
                                        {errors.galeria?.[index]?.imagenFile && <span className="error-message" style={{fontSize: '0.75rem', marginTop: '3px'}}>{errors.galeria[index].imagenFile.message}</span>}
                                        
                                        <div className="form-field-html-group" style={{marginTop: '8px'}}>
                                            <label htmlFor={`galeria_titulo_${index}`}>Título Producto {esObligatorio}</label>
                                            <input type="text" id={`galeria_titulo_${index}`} placeholder="Título"
                                                {...register(`galeria.${index}.titulo`, esObligatorio ? { required: 'Título requerido' } : {} )}
                                                className={errors.galeria?.[index]?.titulo ? 'input-error' : ''} />
                                            {errors.galeria?.[index]?.titulo && <span className="error-message">{errors.galeria[index].titulo.message}</span>}
                                        </div>

                                        <div className="form-field-html-group" style={{marginTop: '8px'}}>
                                            <label htmlFor={`galeria_precio_${index}`}>Precio {esObligatorio}</label>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ marginRight: '4px', fontSize: '1em', color: errors.galeria?.[index]?.precio ? '#d32f2f' : 'inherit' }}>$</span>
                                                <input type="text" id={`galeria_precio_${index}`} placeholder="100.00"
                                                    {...register(`galeria.${index}.precio`, {
                                                        ...(esObligatorio && { required: 'Precio requerido' }),
                                                        pattern: { value: /^\d*(\.\d{0,2})?$/, message: 'Precio inválido (ej: 100 o 100.99)' }
                                                    })}
                                                    className={errors.galeria?.[index]?.precio ? 'input-error' : ''} 
                                                    style={{ flexGrow: 1 }} // Para que el input ocupe el espacio restante
                                                />
                                            </div>
                                            {errors.galeria?.[index]?.precio && <span className="error-message">{errors.galeria[index].precio.message}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack} className="secondary-button">Atrás</button>
                        <button type="submit" className="primary-button">Continuar</button>
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
