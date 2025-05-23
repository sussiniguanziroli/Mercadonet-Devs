import React, { useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { FaTimes } from 'react-icons/fa';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

const LIMITE_CARRUSEL = 7;
const DESCRIPCION_MAX_LENGTH = 1600;

const generateClientSideId = () => `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
}) => {
    const processedAccept = parseAcceptString(acceptProp);

    const onDrop = useCallback(acceptedFiles => {
        if (isLogo) {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                if (field.value && field.value.preview && field.value.preview.startsWith('blob:') && !field.value.isExisting) {
                    URL.revokeObjectURL(field.value.preview);
                }
                field.onChange({
                    file: file,
                    preview: URL.createObjectURL(file),
                    name: file.name,
                    type: file.type,
                    isExisting: false,
                    tempId: generateClientSideId(),
                    status: 'selected'
                });
            }
        } else {
            const espaciosDisponibles = limit - currentFilesCount;
            const archivosAAgregar = acceptedFiles.slice(0, espaciosDisponibles);

            if (archivosAAgregar.length > 0) {
                const nuevosMediaItems = archivosAAgregar.map(file => ({
                    file: file,
                    url: URL.createObjectURL(file),
                    fileType: file.type.startsWith('video/') ? 'video' : 'image',
                    mimeType: file.type,
                    name: file.name,
                    isExisting: false,
                    tempId: generateClientSideId(),
                    status: 'selected'
                }));
                const currentItems = field.value || [];
                field.onChange([...currentItems, ...nuevosMediaItems]);
            }
            if (acceptedFiles.length > archivosAAgregar.length) {
                alert(`Solo se agregarán ${archivosAAgregar.length} de ${acceptedFiles.length} archivos debido al límite de ${limit}.`);
            }
        }
    }, [field, isLogo, limit, currentFilesCount, processedAccept]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: processedAccept,
        multiple,
        maxFiles: isLogo ? maxFiles : undefined,
        onDrop
    });

    return (
        <div {...getRootProps()} className={`file-uploader-container ${isDragActive ? 'drag-active' : ''}`}>
            <input {...getInputProps()} />
            <div className="file-uploader-content">
                <FaFileCirclePlus size={24} />
                <p>{label}</p>
            </div>
        </div>
    );
};

const FileProgressIndicator = ({ progressInfo }) => {
    if (!progressInfo || progressInfo.status === 'removed') return null;

    const { progress, status, errorMsg } = progressInfo;

    if (status === 'uploading') {
        return (
            <Box sx={{ width: '100%', position: 'absolute', bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2 }}>
                <LinearProgress variant="determinate" value={progress} sx={{height: '6px'}} />
                <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', display: 'block', fontSize: '0.7rem', lineHeight: '1.2' }}>
                    {`${Math.round(progress)}%`}
                </Typography>
            </Box>
        );
    }
    if (status === 'success') {
        return (
            <Box sx={{ position: 'absolute', top: 5, right: 5, color: 'green', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '3px', zIndex: 2, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FaCheckCircle size={16} />
            </Box>
        );
    }
    if (status === 'error') {
        return (
            <Box sx={{ position: 'absolute', top: 5, right: 5, color: 'red', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '3px', cursor: 'pointer', zIndex: 2, display:'flex', alignItems:'center', justifyContent:'center' }} title={errorMsg || "Error al subir"}>
                <FaExclamationTriangle size={16} />
            </Box>
        );
    }
    return null;
};

const FormularioPersonalizadoTipoA = ({
    selectedServices = [],
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
    fileUploadProgress = {}, 
    uploadFileImmediately,
}) => {

    const getInitialDefaultValues = useCallback(() => {
        const initialLogo = initialData?.logoURL
            ? { file: null, preview: initialData.logoURL, isExisting: true, name: 'logo_cargado', type: 'image/existing', tempId: null, status: 'loaded' }
            : null;

        const initialCarruselItems = (initialData?.carruselURLs || []).map(media => ({
            file: null, url: media.url, fileType: media.fileType || (media.url?.includes('.mp4') || media.url?.includes('.mov') ? 'video' : 'image'),
            mimeType: media.mimeType || '', isExisting: true, name: 'media_cargado', tempId: media.tempId || null, status: 'loaded'
        }));

        return {
            descripcion: initialData?.descripcion || '',
            sitioWeb: initialData?.sitioWeb || '',
            whatsapp: initialData?.whatsapp || '',
            telefono: initialData?.telefono || '',
            email: initialData?.email || '',
            marcasSeleccionadas: Array.isArray(initialData?.marca) ? initialData.marca : [],
            extrasSeleccionados: Array.isArray(initialData?.extras) ? initialData.extras : [],
            logoFile: initialLogo,
            carruselMediaItems: initialCarruselItems,
        };
    }, [initialData]);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors }, register, getValues } = useForm({
        defaultValues: getInitialDefaultValues(),
        mode: 'onBlur',
    });

    const watchedLogoFile = watch('logoFile');
    const watchedCarruselMediaItems = watch('carruselMediaItems', []);
    const watchedAllFields = watch();

    const uploadQueueRef = useRef(new Set());

    useEffect(() => {
        scrollToTop();
        reset(getInitialDefaultValues());
        uploadQueueRef.current.clear(); 
    }, [initialData, reset, getInitialDefaultValues]);

    useEffect(() => {
        if (watchedLogoFile && watchedLogoFile.file instanceof File && watchedLogoFile.tempId && watchedLogoFile.status === 'selected' && !uploadQueueRef.current.has(watchedLogoFile.tempId)) {
            uploadQueueRef.current.add(watchedLogoFile.tempId);
            setValue('logoFile.status', 'initiating_upload'); 
            uploadFileImmediately(watchedLogoFile.file, watchedLogoFile.tempId, 'proveedores/tipoA/logos', { fieldType: 'logoFile' });
        }
    }, [watchedLogoFile, uploadFileImmediately, setValue]);

    useEffect(() => {
        (watchedCarruselMediaItems || []).forEach((item, index) => {
            if (item && item.file instanceof File && item.tempId && item.status === 'selected' && !uploadQueueRef.current.has(item.tempId)) {
                uploadQueueRef.current.add(item.tempId);
                const updatedItem = { ...item, status: 'initiating_upload' };
                const newCarrusel = [...watchedCarruselMediaItems];
                newCarrusel[index] = updatedItem;
                setValue('carruselMediaItems', newCarrusel, { shouldDirty: false }); 
                
                uploadFileImmediately(item.file, item.tempId, 'proveedores/tipoA/carrusel', { 
                    fieldType: 'carruselMediaItems', 
                    tempId: item.tempId 
                });
            }
        });
    }, [watchedCarruselMediaItems, uploadFileImmediately, setValue]);
    
    useEffect(() => {
        if (watchedLogoFile?.tempId && fileUploadProgress[watchedLogoFile.tempId]?.status === 'success' && !watchedLogoFile.isExisting) {
            setValue('logoFile', {
                ...watchedLogoFile,
                preview: fileUploadProgress[watchedLogoFile.tempId].finalUrl,
                file: null, 
                isExisting: true, 
                status: 'loaded'
            }, { shouldValidate: true, shouldDirty: true });
             uploadQueueRef.current.delete(watchedLogoFile.tempId); // Limpiar de la cola al completar
        } else if (watchedLogoFile?.tempId && fileUploadProgress[watchedLogoFile.tempId]?.status === 'error' && watchedLogoFile.status !== 'selected') {
            // Si falló, permitir que se pueda re-seleccionar/re-intentar
            setValue('logoFile.status', 'error_upload', { shouldDirty: true });
            uploadQueueRef.current.delete(watchedLogoFile.tempId);
        }


        const currentCarruselValues = getValues('carruselMediaItems'); // Obtener valor actual para comparar
        let carruselChanged = false;
        const newCarruselMediaItems = currentCarruselValues.map(item => {
            if (item.tempId && fileUploadProgress[item.tempId]?.status === 'success' && !item.isExisting) {
                carruselChanged = true;
                uploadQueueRef.current.delete(item.tempId);
                return {
                    ...item,
                    url: fileUploadProgress[item.tempId].finalUrl,
                    file: null,
                    isExisting: true,
                    status: 'loaded'
                };
            } else if (item.tempId && fileUploadProgress[item.tempId]?.status === 'error' && item.status !== 'selected') {
                 carruselChanged = true;
                 uploadQueueRef.current.delete(item.tempId);
                 return {...item, status: 'error_upload' };
            }
            return item;
        });
        
        if (carruselChanged) {
            setValue('carruselMediaItems', newCarruselMediaItems, { shouldValidate: true, shouldDirty: true });
        }

    }, [fileUploadProgress, watchedLogoFile, setValue, getValues]); // watchedCarruselMediaItems se lee con getValues para evitar bucles.


    // useEffect para limpieza de Blob URLs
    useEffect(() => {
        // Esta función se ejecuta cuando el componente se desmonta
        // o antes de que el efecto se ejecute de nuevo si las dependencias cambian.
        // Para limpiar todos los blobs al desmontar:
        return () => {
            const fieldsToCheck = ['logoFile', 'carruselMediaItems'];
            fieldsToCheck.forEach(fieldName => {
                const value = getValues(fieldName);
                if (fieldName === 'logoFile' && value) {
                    if (value.preview && value.preview.startsWith('blob:') && !value.isExisting) {
                        URL.revokeObjectURL(value.preview);
                    }
                } else if (fieldName === 'carruselMediaItems' && Array.isArray(value)) {
                    value.forEach(item => {
                        if (item.url && item.url.startsWith('blob:') && !item.isExisting) {
                            URL.revokeObjectURL(item.url);
                        }
                    });
                }
            });
        };
    }, [getValues]); // getValues es estable, el efecto de limpieza se ejecutará principalmente al desmontar.


    const prepareSubmitData = (dataFromForm) => {
        return {
            descripcion: dataFromForm.descripcion,
            sitioWeb: dataFromForm.sitioWeb,
            whatsapp: dataFromForm.whatsapp,
            telefono: dataFromForm.telefono,
            email: dataFromForm.email,
            marca: dataFromForm.marcasSeleccionadas || [],
            extras: dataFromForm.extrasSeleccionados || [],
            logoURL: dataFromForm.logoFile?.isExisting ? dataFromForm.logoFile.preview : (fileUploadProgress[dataFromForm.logoFile?.tempId]?.status === 'success' ? fileUploadProgress[dataFromForm.logoFile?.tempId].finalUrl : (initialData?.logoURL || '')),
            carruselURLs: (dataFromForm.carruselMediaItems || []).map(item => ({
                url: item.isExisting ? item.url : (fileUploadProgress[item.tempId]?.status === 'success' ? fileUploadProgress[item.tempId].finalUrl : (item.url || '')), // Si era existente o subió OK
                fileType: item.fileType,
                mimeType: item.mimeType,
                tempId: item.tempId 
            })).filter(item => item.url && item.status !== 'error_upload'), // Solo items con URL y que no hayan fallado en subida
        };
    };
    
    const onSubmit = (dataFromForm) => { const stepData = prepareSubmitData(dataFromForm); onNext(stepData); };
    const handleBack = () => { const dataFromForm = getValues(); const stepData = prepareSubmitData(dataFromForm); onBack(stepData);};
    
    const buildPreviewData = (currentFormData) => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        
        let logoForPreview = currentFormData.logoFile?.preview || null;
        if (currentFormData.logoFile?.tempId && fileUploadProgress[currentFormData.logoFile.tempId]?.status === 'success') {
            logoForPreview = fileUploadProgress[currentFormData.logoFile.tempId].finalUrl;
        } else if (currentFormData.logoFile?.isExisting) {
            logoForPreview = currentFormData.logoFile.preview;
        }

        const carruselForPreview = (currentFormData.carruselMediaItems || []).map(item => {
            let urlForPreview = item.url || item.preview; // `url` es donde se guarda el blob o la URL de Firebase
            if (item.tempId && fileUploadProgress[item.tempId]?.status === 'success') {
                urlForPreview = fileUploadProgress[item.tempId].finalUrl;
            } else if (item.isExisting) {
                urlForPreview = item.url;
            }
            return { url: urlForPreview, fileType: item.fileType, mimeType: item.mimeType };
        }).filter(item => item.url && item.status !== 'error_upload' && item.status !== 'removed');


        return {
            selectedServices: selectedServices, tipoProveedor: tipoProveedor, tipoRegistro: tipoRegistro,
            nombre: nombreProveedor, ubicacionDetalle: ubicacionDetalle,
            descripcion: currentFormData.descripcion, marca: currentFormData.marcasSeleccionadas, extras: currentFormData.extrasSeleccionados,
            logoPreview: logoForPreview, carrusel: carruselForPreview,
            sitioWeb: currentFormData.sitioWeb, whatsapp: currentFormData.whatsapp, telefono: currentFormData.telefono, email: currentFormData.email,
        };
    };
    const previewData = buildPreviewData(watchedAllFields);

    const handleRemoveLogo = () => {
        const currentLogo = getValues("logoFile");
        if (currentLogo) {
            if (currentLogo.preview && currentLogo.preview.startsWith('blob:') && !currentLogo.isExisting) {
                URL.revokeObjectURL(currentLogo.preview);
            }
            if (currentLogo.tempId) {
                 uploadQueueRef.current.delete(currentLogo.tempId);
                 // Notificar al Navigator para posible borrado de Storage si ya se subió
                 // El Navigator borrará de archivosSubidosTemporalmente si logoURL queda vacío en el submit.
                 // Opcional: llamar a una prop onFileRemoved(storagePath) si se quiere borrado inmediato.
                 // Marcar el estado local para que no se reintente la subida y para que el indicador de progreso se actualice
                 setValue('logoFile', {...currentLogo, status: 'removed', file: null}, { shouldDirty: true });
            } else if (currentLogo.isExisting) { // Si es un archivo ya subido (URL de Firebase)
                // Solo se limpia localmente. El Navigator gestionará si esta URL se mantiene o no en el submit.
            }
        }
        setValue('logoFile', null, { shouldValidate: true, shouldDirty: true });
    };

    const handleRemoveCarruselItem = (indexToRemove) => {
        const currentItems = getValues("carruselMediaItems") || [];
        const itemToRemove = currentItems[indexToRemove];

        if (itemToRemove) {
            if (itemToRemove.url && itemToRemove.url.startsWith('blob:') && !itemToRemove.isExisting) {
                URL.revokeObjectURL(itemToRemove.url);
            }
             if (itemToRemove.tempId) {
                uploadQueueRef.current.delete(itemToRemove.tempId);
                // Similar al logo, el Navigator gestiona el borrado de Storage basado en el estado final.
                // Marcar localmente para la UI y para que no se reintente.
                const newItems = [...currentItems];
                newItems[indexToRemove] = {...itemToRemove, status: 'removed', file: null};
                setValue('carruselMediaItems', newItems.filter((_,i) => i !== indexToRemove), { shouldValidate: true, shouldDirty: true }); // O solo filtrar
                return; // Salir para no ejecutar el filter de abajo innecesariamente
            } else if (itemToRemove.isExisting){
                // Solo se limpia localmente.
            }
        }
        const newItems = currentItems.filter((_, i) => i !== indexToRemove);
        setValue('carruselMediaItems', newItems, { shouldValidate: true, shouldDirty: true });
    };

    const errorSpanStyle = { color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', display: 'block' };

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Historia</h1>

                    <div className="form-section">
                        <InputLabel htmlFor="logo-uploader" error={!!errors.logoFile}>Logo</InputLabel>
                        {watchedLogoFile?.preview && watchedLogoFile?.status !== 'removed' && (
                            <div className="logo-preview-container" style={{ position: 'relative' }}>
                                <img src={watchedLogoFile.preview} alt={watchedLogoFile.name || "Vista previa del Logo"} />
                                <button type="button" onClick={handleRemoveLogo} className="remove-button" style={{ zIndex: 3 }}><FaTimes /></button>
                                {watchedLogoFile.tempId && fileUploadProgress[watchedLogoFile.tempId] && (
                                    <FileProgressIndicator progressInfo={fileUploadProgress[watchedLogoFile.tempId]} />
                                )}
                            </div>
                        )}
                        { (!watchedLogoFile || watchedLogoFile?.status === 'removed' || (watchedLogoFile?.tempId && fileUploadProgress[watchedLogoFile?.tempId]?.status === 'error') ) &&
                            <Controller
                                name="logoFile" control={control}
                                rules={{ validate: { 
                                    fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true 
                                }}}
                                render={({ field }) => (
                                    <FileUploaderRHF field={field} multiple={false} acceptProp="image/*"
                                        label={field.value?.preview && field.value?.status !== 'removed' ? "Cambiar logo" : "Arrastra tu logo aquí o haz clic"}
                                        isLogo={true} maxFiles={1} />
                                )}
                            />
                        }
                        {errors.logoFile && <FormHelperText error>{errors.logoFile.message || errors.logoFile.type}</FormHelperText>}
                    </div>

                    <div className="form-section">
                        <InputLabel htmlFor="carrusel-uploader" error={!!errors.carruselMediaItems}>
                            Carrusel Multimedia (Imágenes y Videos, máx. {LIMITE_CARRUSEL})
                        </InputLabel>
                        {(watchedCarruselMediaItems || []).filter(item => item.status !== 'removed').length > 0 && (
                            <div className="carrusel-previews">
                                {watchedCarruselMediaItems.map((item, index) => {
                                    if (item.status === 'removed') return null;
                                    return (
                                        <div key={item.tempId || item.url || index} className="carrusel-preview-item" style={{ position: 'relative' }}>
                                            {item.fileType === 'image' ? (
                                                <img src={item.url} alt={item.name || `Contenido ${index + 1}`} />
                                            ) : (
                                                <video controls muted style={{ width: '100%', display: 'block' }} src={item.url} type={item.mimeType}>
                                                    Tu navegador no soporta video.
                                                </video>
                                            )}
                                            <button type="button" onClick={() => handleRemoveCarruselItem(index)} className="remove-button" style={{ zIndex: 3 }}><FaTimes /></button>
                                            {item.tempId && fileUploadProgress[item.tempId] && (
                                                <FileProgressIndicator progressInfo={fileUploadProgress[item.tempId]} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {(watchedCarruselMediaItems || []).filter(item => item.status !== 'removed').length < LIMITE_CARRUSEL && 
                            <Controller
                                name="carruselMediaItems" control={control}
                                rules={{ validate: { maxItems: value => (value || []).filter(item => item.status !== 'removed').length <= LIMITE_CARRUSEL || `No puedes exceder los ${LIMITE_CARRUSEL} ítems.` } }}
                                render={({ field }) => (
                                    <FileUploaderRHF field={field} multiple={true} acceptProp="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                                        label={`Arrastra imágenes o videos (actuales: ${(field.value || []).filter(item => item.status !== 'removed').length} de ${LIMITE_CARRUSEL})`}
                                        currentFilesCount={(field.value || []).filter(item => item.status !== 'removed').length} limit={LIMITE_CARRUSEL} isLogo={false} />
                                )}
                            />
                        }
                        {errors.carruselMediaItems && <FormHelperText error>{errors.carruselMediaItems.message || errors.carruselMediaItems.type}</FormHelperText>}
                    </div>

                    <div className="form-section">
                        <Controller name="descripcion" control={control}
                            rules={{ required: 'La descripción es requerida', maxLength: { value: DESCRIPCION_MAX_LENGTH, message: `Máx. ${DESCRIPCION_MAX_LENGTH} chars.` } }}
                            render={({ field, fieldState: { error } }) => (
                                <TextField {...field} id="descripcion-a" label="Descripción del Proveedor *" multiline rows={5} variant="outlined" fullWidth
                                    placeholder="Describe tu empresa, historia, valores..." error={!!error}
                                    helperText={error ? error.message : `${(field.value || '').length}/${DESCRIPCION_MAX_LENGTH}`}
                                    inputProps={{ maxLength: DESCRIPCION_MAX_LENGTH }} InputLabelProps={{ shrink: true }} />
                            )} />
                    </div>
                    <div className="form-section">
                        <Controller name="marcasSeleccionadas" control={control}
                            render={({ field }) => ( <Autocomplete multiple id="marcas-tags" options={marcasOpciones} value={field.value || []} onChange={(event, newValue) => field.onChange(newValue)} getOptionLabel={(option) => typeof option === 'string' ? option : ''} isOptionEqualToValue={(option, value) => option === value} filterSelectedOptions renderInput={(params) => ( <TextField {...params} variant="outlined" label="Marcas que trabajás" placeholder="Escribí o seleccioná" error={!!errors.marcasSeleccionadas} helperText={errors.marcasSeleccionadas?.message} InputLabelProps={{ shrink: true }} /> )} renderTags={(value, getTagProps) => value.map((option, index) => <Chip key={option+index} label={option} {...getTagProps({ index })} sx={{ margin: '2px' }} />)} /> )} />
                    </div>
                    <div className="form-section">
                        <Controller name="extrasSeleccionados" control={control}
                            render={({ field }) => ( <Autocomplete multiple id="extras-tags" options={extrasOpciones} value={field.value || []} onChange={(event, newValue) => field.onChange(newValue)} getOptionLabel={(option) => typeof option === 'string' ? option : ''} isOptionEqualToValue={(option, value) => option === value} filterSelectedOptions renderInput={(params) => ( <TextField {...params} variant="outlined" label="Extras que ofrecés" placeholder="Escribí o seleccioná" error={!!errors.extrasSeleccionados} helperText={errors.extrasSeleccionados?.message} InputLabelProps={{ shrink: true }} /> )} renderTags={(value, getTagProps) => value.map((option, index) => <Chip key={option+index} label={option} {...getTagProps({ index })} sx={{ margin: '4px 4px 0 0' }} />)} /> )} />
                    </div>
                    <div className="form-section">
                        <h3>Información de Contacto (Visible en la Card)</h3>
                        <div className="form-field-html-group">
                            <label htmlFor="sitioWeb_contact">Sitio Web</label>
                            <input id="sitioWeb_contact" type="url" placeholder="https://..." {...register('sitioWeb', { pattern: { value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i, message: "URL inválida" } })} className={errors.sitioWeb ? 'input-error' : ''} />
                            {errors.sitioWeb && <span style={errorSpanStyle}>{errors.sitioWeb.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="whatsapp_contact">WhatsApp</label>
                            <input id="whatsapp_contact" type="text" placeholder="Ej: +54 9 11..." {...register('whatsapp')} className={errors.whatsapp ? 'input-error' : ''} />
                            {errors.whatsapp && <span style={errorSpanStyle}>{errors.whatsapp.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="telefono_contact">Teléfono Fijo (Opcional)</label>
                            <input id="telefono_contact" type="tel" placeholder="Teléfono" {...register('telefono')} className={errors.telefono ? 'input-error' : ''} />
                            {errors.telefono && <span style={errorSpanStyle}>{errors.telefono.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="email_contact">Email de Contacto Público</label>
                            <input id="email_contact" type="email" placeholder="Email" {...register('email', { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email inválido" } })} className={errors.email ? 'input-error' : ''} />
                            {errors.email && <span style={errorSpanStyle}>{errors.email.message}</span>}
                        </div>
                    </div>

                    <div className="botones-navegacion">
                        <button type="button" onClick={handleBack} className="secondary-button">Atrás</button>
                        <button type="submit" className="primary-button">Continuar</button>
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