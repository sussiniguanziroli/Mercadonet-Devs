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
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';

const LIMITE_CARRUSEL = 7;
const LIMITE_GALERIA_PRODUCTOS = 6;
const PRODUCTOS_OBLIGATORIOS_GALERIA = 3;
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

// Definición de FileUploaderRHF (similar a TipoA, podría ser un componente compartido)
const FileUploaderRHF = ({
    field,
    multiple = true,
    accept: acceptProp,
    maxFiles = 1,
    label = 'Arrastra archivos aquí o haz clic',
    currentFilesCount = 0,
    limit = LIMITE_CARRUSEL,
    isLogo = false,
    isGaleria = false, // Prop específica para la galería
}) => {
    const processedAccept = parseAcceptString(acceptProp);

    const onDrop = useCallback(acceptedFiles => {
        if (isLogo || isGaleria) { // Para logo o imagen de galería (un solo archivo)
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                if (field.value && typeof field.value.preview === 'string' && field.value.preview.startsWith('blob:') && !field.value.isExisting) {
                    URL.revokeObjectURL(field.value.preview);
                }
                field.onChange({
                    file: file,
                    preview: URL.createObjectURL(file),
                    name: file.name,
                    type: file.type,
                    isExisting: false
                });
            }
        } else { // Para carrusel (múltiples archivos)
            const espaciosDisponibles = limit - currentFilesCount;
            const archivosAAgregar = acceptedFiles.slice(0, espaciosDisponibles);

            if (archivosAAgregar.length > 0) {
                const nuevosMediaItems = archivosAAgregar.map(file => ({
                    file: file,
                    url: URL.createObjectURL(file),
                    fileType: file.type.startsWith('video/') ? 'video' : 'image',
                    mimeType: file.type,
                    name: file.name,
                    isExisting: false
                }));
                const currentItems = field.value || [];
                field.onChange([...currentItems, ...nuevosMediaItems]);
            }
            if (acceptedFiles.length > archivosAAgregar.length) {
                 alert(`Solo se agregarán ${archivosAAgregar.length} de ${acceptedFiles.length} archivos debido al límite de ${limit}.`);
            }
        }
    }, [field, isLogo, isGaleria, multiple, limit, currentFilesCount, processedAccept]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: processedAccept,
        multiple,
        maxFiles: (isLogo || isGaleria) ? maxFiles : undefined,
        onDrop
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
    selectedServices = [], // Aunque no se use directamente, se pasa para la preview si es necesario
    tipoProveedor = [],
    tipoRegistro = '',
    initialData, // Viene de RegistrosProveedorNavigator.formData.datosPersonalizados.tipoB
    onNext,
    onBack,
    onCancel,
    nombreProveedor = '',
    ciudad = '',
    provincia = '',
    marcas: marcasOpciones = [],
    extras: extrasOpciones = [],
}) => {

    const getInitialDefaultValues = useCallback(() => {
        const initialLogo = initialData?.logoURL
            ? { file: null, preview: initialData.logoURL, isExisting: true, name: 'logo_cargado', type: 'image/existing' }
            : null;

        const initialCarruselItems = (initialData?.carruselURLs || []).map(media => ({
            file: null,
            url: media.url,
            fileType: media.fileType || (media.url.includes('.mp4') || media.url.includes('.mov') ? 'video' : 'image'),
            mimeType: media.mimeType || '',
            isExisting: true,
            name: 'media_cargado'
        }));

        // Inicializar galería, asegurando que haya LIMITE_GALERIA_PRODUCTOS items
        const initialGaleria = Array(LIMITE_GALERIA_PRODUCTOS).fill(null).map((_, index) => {
            const productData = initialData?.galeria?.[index];
            if (productData) {
                return {
                    titulo: productData.titulo || '',
                    precio: productData.precio || '',
                    imagenFile: productData.imagenURL // El campo en initialData es imagenURL
                        ? { file: null, preview: productData.imagenURL, isExisting: true, name: `prod_${index}_cargado`, type: productData.mimeType || 'image/existing' }
                        : null,
                    // Preservar fileType y mimeType si vienen en productData (desde el navigator)
                    fileType: productData.fileType || (productData.imagenURL ? 'image' : ''),
                    mimeType: productData.mimeType || (productData.imagenURL ? 'image/existing' : ''),
                };
            }
            return { imagenFile: null, titulo: '', precio: '', fileType: '', mimeType: '' };
        });


        return {
            descripcion: initialData?.descripcion || '',
            sitioWeb: initialData?.sitioWeb || '',
            whatsapp: initialData?.whatsapp || '',
            telefono: initialData?.telefono || '',
            email: initialData?.email || '',
            marcasSeleccionadas: Array.isArray(initialData?.marca) ? initialData.marca : (Array.isArray(initialData?.marcas) ? initialData.marcas : []),
            extrasSeleccionados: Array.isArray(initialData?.extras) ? initialData.extras : [],
            logoFile: initialLogo,
            carruselMediaItems: initialCarruselItems,
            galeria: initialGaleria,
        };
    }, [initialData]);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors }, register, getValues } = useForm({
        defaultValues: getInitialDefaultValues(),
        mode: 'onBlur',
    });

    const { fields: galeriaFields } = useFieldArray({ control, name: "galeria" });
    const watchedAllFields = watch(); // Para la preview

    useEffect(() => { scrollToTop(); reset(getInitialDefaultValues()); }, [initialData, reset, getInitialDefaultValues]);

    // Limpieza de Blob URLs
    useEffect(() => {
        const currentValues = getValues();
        return () => {
            // Logo
            if (currentValues.logoFile?.preview?.startsWith('blob:') && !currentValues.logoFile.isExisting) {
                URL.revokeObjectURL(currentValues.logoFile.preview);
            }
            // Carrusel
            (currentValues.carruselMediaItems || []).forEach(item => {
                if (item.url?.startsWith('blob:') && !item.isExisting) {
                    URL.revokeObjectURL(item.url);
                }
            });
            // Galería
            (currentValues.galeria || []).forEach(item => {
                if (item.imagenFile?.preview?.startsWith('blob:') && !item.imagenFile.isExisting) {
                    URL.revokeObjectURL(item.imagenFile.preview);
                }
            });
        };
    }, [getValues]);

    const prepareSubmitData = (dataFromForm) => {
        const logoEsNuevo = dataFromForm.logoFile?.file instanceof File && !dataFromForm.logoFile.isExisting;
        const logoAEnviar = logoEsNuevo ? dataFromForm.logoFile.file : null;
        const logoUrlExistenteAEnviar = dataFromForm.logoFile?.isExisting ? dataFromForm.logoFile.preview : null;

        const carruselNuevosArchivos = (dataFromForm.carruselMediaItems || [])
            .filter(item => item.file instanceof File && !item.isExisting)
            .map(item => item.file);
        const carruselUrlsExistentes = (dataFromForm.carruselMediaItems || [])
            .filter(item => item.isExisting && item.url)
            .map(item => ({ url: item.url, fileType: item.fileType, mimeType: item.mimeType }));

        const galeriaProcesada = (dataFromForm.galeria || []).map(producto => {
            const imagenEsNueva = producto.imagenFile?.file instanceof File && !producto.imagenFile.isExisting;
            return {
                titulo: producto.titulo,
                precio: producto.precio,
                imagenFile: imagenEsNueva ? producto.imagenFile.file : null,
                imagenUrlExistente: producto.imagenFile?.isExisting ? producto.imagenFile.preview : null,
                // El navigator se encargará de fileType y mimeType para los nuevos archivos.
                // Para los existentes, ya deberían estar en la URL del navigator, pero no se reenvían desde aquí.
            };
        }).filter(p => p.titulo || p.precio || p.imagenFile || p.imagenUrlExistente); // Enviar solo productos con datos

        return {
            descripcion: dataFromForm.descripcion,
            sitioWeb: dataFromForm.sitioWeb,
            whatsapp: dataFromForm.whatsapp,
            telefono: dataFromForm.telefono,
            email: dataFromForm.email,
            marca: dataFromForm.marcasSeleccionadas || [], // Asegurar que sea array (o 'marcas')
            extras: dataFromForm.extrasSeleccionados || [],
            logoFile: logoAEnviar,
            logoUrlExistente: logoUrlExistenteAEnviar,
            carruselNuevosArchivos: carruselNuevosArchivos,
            carruselUrlsExistentes: carruselUrlsExistentes,
            galeria: galeriaProcesada,
        };
    };

    const onSubmit = (dataFromForm) => {
        const stepData = prepareSubmitData(dataFromForm);
        onNext(stepData);
    };
    const handleBack = () => {
        const dataFromForm = getValues();
        const stepData = prepareSubmitData(dataFromForm);
        onBack(stepData);
    };

    const buildPreviewData = (currentFormData) => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        const logoForPreview = currentFormData.logoFile?.preview || null;
        const carruselForPreview = (currentFormData.carruselMediaItems || []).map(item => ({
            url: item.url || item.preview, fileType: item.fileType, mimeType: item.mimeType
        }));
        const galeriaForPreview = (currentFormData.galeria || []).map(item => ({
            titulo: item.titulo,
            precio: item.precio ? `$${item.precio}` : '', // Añadir $ para preview
            imagenPreview: item.imagenFile?.preview || null
        })).filter(p => p.titulo || p.precio || p.imagenPreview);


        return {
            selectedServices, tipoProveedor, tipoRegistro,
            nombre: nombreProveedor, ubicacionDetalle,
            descripcion: currentFormData.descripcion,
            marca: currentFormData.marcasSeleccionadas, // o 'marcas' si es el nombre correcto
            extras: currentFormData.extrasSeleccionados,
            logoPreview: logoForPreview,
            carrusel: carruselForPreview,
            sitioWeb: currentFormData.sitioWeb,
            whatsapp: currentFormData.whatsapp,
            telefono: currentFormData.telefono,
            email: currentFormData.email,
            galeriaProductos: galeriaForPreview,
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
    
    const errorSpanStyle = { color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', display: 'block' };

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Productos</h1>

                    {/* LOGO */}
                    <div className="form-section">
                        <InputLabel htmlFor="logo-uploader-b" error={!!errors.logoFile}>Logo</InputLabel>
                        {watch('logoFile')?.preview && (
                            <div className="logo-preview-container">
                                <img src={watch('logoFile').preview} alt={watch('logoFile').name || "Vista previa del Logo"} />
                                <button type="button" onClick={handleRemoveLogo} className="remove-button"><FaTimes /></button>
                            </div>
                        )}
                        <Controller name="logoFile" control={control}
                            rules={{ validate: { fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true }}}
                            render={({ field }) => <FileUploaderRHF field={field} multiple={false} acceptProp="image/*" label={field.value?.preview ? "Cambiar logo" : "Arrastra tu logo"} isLogo={true} maxFiles={1} />} />
                        {errors.logoFile && <FormHelperText error>{errors.logoFile.message || errors.logoFile.type}</FormHelperText>}
                    </div>

                    {/* CARRUSEL */}
                    <div className="form-section">
                        <InputLabel htmlFor="carrusel-uploader-b" error={!!errors.carruselMediaItems}>Carrusel Multimedia (máx. {LIMITE_CARRUSEL})</InputLabel>
                        {(watch('carruselMediaItems') || []).length > 0 && (
                            <div className="carrusel-previews">
                                {watch('carruselMediaItems').map((item, index) => (
                                    <div key={item.url || item.name || index} className="carrusel-preview-item">
                                        {item.fileType === 'image' ? <img src={item.url} alt={item.name || `Contenido ${index + 1}`} /> : <video controls muted style={{ width: '100%', display: 'block' }} src={item.url} type={item.mimeType}>Tu navegador no soporta video.</video>}
                                        <button type="button" onClick={() => handleRemoveCarruselItem(index)} className="remove-button"><FaTimes /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Controller name="carruselMediaItems" control={control} rules={{ validate: { maxItems: v => (v || []).length <= LIMITE_CARRUSEL || `No más de ${LIMITE_CARRUSEL} ítems.` } }}
                            render={({ field }) => <FileUploaderRHF field={field} multiple={true} acceptProp="image/*,video/mp4,video/webm,video/ogg,video/quicktime" label={`Imágenes/Videos (${(field.value || []).length}/${LIMITE_CARRUSEL})`} currentFilesCount={(field.value || []).length} limit={LIMITE_CARRUSEL} />} />
                        {errors.carruselMediaItems && <FormHelperText error>{errors.carruselMediaItems.message || errors.carruselMediaItems.type}</FormHelperText>}
                    </div>
                    
                    {/* DESCRIPCIÓN */}
                    <div className="form-section">
                        <Controller name="descripcion" control={control} rules={{ required: 'La descripción es requerida', maxLength: { value: DESCRIPCION_MAX_LENGTH, message: `Máx. ${DESCRIPCION_MAX_LENGTH} caracteres.` } }}
                            render={({ field, fieldState: { error } }) => (
                                <TextField {...field} id="descripcion-b" label="Descripción del Negocio/Productos *" multiline rows={4} variant="outlined" fullWidth placeholder="Describe tu negocio..." error={!!error} helperText={error ? error.message : `${(field.value || '').length}/${DESCRIPCION_MAX_LENGTH}`} inputProps={{ maxLength: DESCRIPCION_MAX_LENGTH }} InputLabelProps={{ shrink: true }} />
                            )} />
                    </div>
                    
                    {/* MARCAS y EXTRAS (igual que TipoA) */}
                    <div className="form-section">
                        <Controller name="marcasSeleccionadas" control={control}
                            render={({ field }) => <Autocomplete multiple id="marcas-tags-b" options={marcasOpciones} value={field.value || []} onChange={(e, v) => field.onChange(v)} getOptionLabel={(opt) => typeof opt === 'string' ? opt : ''} isOptionEqualToValue={(opt, val) => opt === val} filterSelectedOptions renderInput={(params) => <TextField {...params} variant="outlined" label="Marcas que trabajás" placeholder="Escribí o seleccioná" error={!!errors.marcasSeleccionadas} helperText={errors.marcasSeleccionadas?.message} InputLabelProps={{ shrink: true }} />} renderTags={(val, getTagProps) => val.map((opt, idx) => <Chip key={opt+idx} label={opt} {...getTagProps({ idx })} sx={{ margin: '2px' }} />)} />} />
                    </div>
                    <div className="form-section">
                         <Controller name="extrasSeleccionados" control={control}
                            render={({ field }) => <Autocomplete multiple id="extras-tags-b" options={extrasOpciones} value={field.value || []} onChange={(e, v) => field.onChange(v)} getOptionLabel={(opt) => typeof opt === 'string' ? opt : ''} isOptionEqualToValue={(opt, val) => opt === val} filterSelectedOptions renderInput={(params) => <TextField {...params} variant="outlined" label="Extras que ofrecés" placeholder="Escribí o seleccioná" error={!!errors.extrasSeleccionados} helperText={errors.extrasSeleccionados?.message} InputLabelProps={{ shrink: true }} />} renderTags={(val, getTagProps) => val.map((opt, idx) => <Chip key={opt+idx} label={opt} {...getTagProps({ idx })} sx={{ margin: '4px 4px 0 0' }} />)} />} />
                    </div>

                    {/* CONTACTO (igual que TipoA, pero con validaciones de requerido para algunos campos) */}
                    <div className="form-section">
                        <h3>Información de Contacto</h3>
                        <div className="form-field-html-group">
                            <label htmlFor="sitioWeb-b">Sitio Web <span style={{ color: 'red' }}>*</span></label>
                            <input id="sitioWeb-b" type="url" placeholder="https://..." {...register('sitioWeb', { required: 'El sitio web es requerido', pattern: { value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i, message: "URL inválida" } })} className={errors.sitioWeb ? 'input-error' : ''} />
                            {errors.sitioWeb && <span style={errorSpanStyle}>{errors.sitioWeb.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="whatsapp-b">WhatsApp <span style={{ color: 'red' }}>*</span></label>
                            <input id="whatsapp-b" type="text" placeholder="Ej: +54 9 11..." {...register('whatsapp', { required: 'WhatsApp es requerido' })} className={errors.whatsapp ? 'input-error' : ''} />
                            {errors.whatsapp && <span style={errorSpanStyle}>{errors.whatsapp.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="telefono-b">Teléfono Fijo (Opcional)</label>
                            <input id="telefono-b" type="tel" placeholder="Teléfono" {...register('telefono')} className={errors.telefono ? 'input-error' : ''} />
                            {errors.telefono && <span style={errorSpanStyle}>{errors.telefono.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="email-b">Email de Contacto Público <span style={{ color: 'red' }}>*</span></label>
                            <input id="email-b" type="email" placeholder="Email" {...register('email', { required: 'El email es requerido', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email inválido" } })} className={errors.email ? 'input-error' : ''} />
                            {errors.email && <span style={errorSpanStyle}>{errors.email.message}</span>}
                        </div>
                    </div>

                    {/* GALERÍA DE PRODUCTOS */}
                    <div className="form-section galeria-productos">
                        <h3>Galería de Productos (Hasta {LIMITE_GALERIA_PRODUCTOS}, primeros {PRODUCTOS_OBLIGATORIOS_GALERIA} obligatorios con imagen, título y precio)</h3>
                        <div className="galeria-grid">
                            {galeriaFields.map((item, index) => {
                                const esObligatorio = index < PRODUCTOS_OBLIGATORIOS_GALERIA;
                                return (
                                    <div key={item.id} className="producto-card">
                                        <InputLabel error={!!errors.galeria?.[index]?.imagenFile} sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                                            Producto {index + 1} {esObligatorio && <span style={{ color: 'red' }}>*</span>}
                                        </InputLabel>
                                        {watch(`galeria.${index}.imagenFile`)?.preview ? (
                                            <div className="single-preview">
                                                <img src={watch(`galeria.${index}.imagenFile`).preview} alt={watch(`galeria.${index}.imagenFile`).name || `Preview ${index + 1}`} />
                                                <button type="button" onClick={() => handleRemoveGaleriaImage(index)} className="remove-button"><FaTimes /></button>
                                            </div>
                                        ) : null}
                                        <Controller 
                                            name={`galeria.${index}.imagenFile`} 
                                            control={control}
                                            rules={esObligatorio ? { 
                                                required: 'La imagen es requerida',
                                                validate: { fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true }
                                            } : {
                                                validate: { fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true }
                                            }}
                                            render={({ field }) => <FileUploaderRHF field={field} multiple={false} acceptProp="image/*" label={field.value?.preview ? "Cambiar" : "Subir imagen"} isGaleria={true} maxFiles={1} />} 
                                        />
                                        {errors.galeria?.[index]?.imagenFile && <FormHelperText error sx={{fontSize: '0.75rem', marginTop: '3px'}}>{errors.galeria[index].imagenFile.message || errors.galeria[index].imagenFile.type}</FormHelperText>}
                                        
                                        <div className="form-field-html-group" style={{marginTop: '8px'}}>
                                            <label htmlFor={`galeria_titulo_${index}`}>Título {esObligatorio && <span style={{ color: 'red' }}>*</span>}</label>
                                            <input type="text" id={`galeria_titulo_${index}`} placeholder="Título producto"
                                                {...register(`galeria.${index}.titulo`, esObligatorio ? { required: 'Título requerido' } : {} )}
                                                className={errors.galeria?.[index]?.titulo ? 'input-error' : ''} />
                                            {errors.galeria?.[index]?.titulo && <span style={errorSpanStyle}>{errors.galeria[index].titulo.message}</span>}
                                        </div>

                                        <div className="form-field-html-group" style={{marginTop: '8px'}}>
                                            <label htmlFor={`galeria_precio_${index}`}>Precio {esObligatorio && <span style={{ color: 'red' }}>*</span>}</label>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ marginRight: '4px', fontSize: '1em', color: errors.galeria?.[index]?.precio ? '#d32f2f' : 'inherit' }}>$</span>
                                                <input type="text" id={`galeria_precio_${index}`} placeholder="100.00"
                                                    {...register(`galeria.${index}.precio`, {
                                                        ...(esObligatorio && { required: 'Precio requerido' }),
                                                        pattern: { value: /^\d*([.,]\d{0,2})?$/, message: 'Precio inválido (ej: 100 o 100.99)' }
                                                    })}
                                                    className={errors.galeria?.[index]?.precio ? 'input-error' : ''} 
                                                    style={{ flexGrow: 1 }}
                                                />
                                            </div>
                                            {errors.galeria?.[index]?.precio && <span style={errorSpanStyle}>{errors.galeria[index].precio.message}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="botones-navegacion">
                        <button type="button" onClick={handleBack} className="secondary-button">Atrás</button>
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
