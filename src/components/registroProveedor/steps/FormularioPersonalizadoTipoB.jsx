import React, { useEffect, useCallback, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { FaTimes } from 'react-icons/fa';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardProductosPreview from '../card_simulators/CardProductosPreview';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

const LIMITE_CARRUSEL = 7;
const LIMITE_GALERIA_PRODUCTOS = 6;
const PRODUCTOS_OBLIGATORIOS_GALERIA = 3;
const DESCRIPCION_MAX_LENGTH = 1300;

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
    isGaleria = false,
    onFileProcessed, 
    itemIndex 
}) => {
    const processedAccept = parseAcceptString(acceptProp);

    const onDrop = useCallback(acceptedFiles => {
        if (isLogo || isGaleria) { 
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const tempId = generateClientSideId();
                const fileData = {
                    file: file,
                    preview: URL.createObjectURL(file),
                    name: file.name,
                    type: file.type,
                    isExisting: false,
                    tempId: tempId,
                    status: 'selected'
                };

                if (field.value && field.value.preview && field.value.preview.startsWith('blob:') && !field.value.isExisting && field.value.status !== 'loaded') {
                    URL.revokeObjectURL(field.value.preview);
                }
                field.onChange(fileData);

                if (onFileProcessed) {
                    onFileProcessed({ file: fileData.file, tempId: fileData.tempId, itemIndex });
                }
            }
        } else { 
            const espaciosDisponibles = limit - currentFilesCount;
            const archivosAAgregar = acceptedFiles.slice(0, espaciosDisponibles);

            if (archivosAAgregar.length > 0) {
                const newUploads = [];
                const nuevosMediaItems = archivosAAgregar.map(file => {
                    const tempId = generateClientSideId();
                    const mediaItem = {
                        file: file,
                        url: URL.createObjectURL(file),
                        fileType: file.type.startsWith('video/') ? 'video' : 'image',
                        mimeType: file.type,
                        name: file.name,
                        isExisting: false,
                        tempId: tempId,
                        status: 'selected'
                    };
                    newUploads.push({ file: mediaItem.file, tempId: mediaItem.tempId, itemIndex: (field.value || []).length + newUploads.length }); 
                    return mediaItem;
                });

                const currentItems = field.value || [];
                field.onChange([...currentItems, ...nuevosMediaItems]);

                if (onFileProcessed) { 
                    newUploads.forEach(upload => onFileProcessed(upload));
                }
            }
            if (acceptedFiles.length > archivosAAgregar.length) {
                alert(`Solo se agregarán ${archivosAAgregar.length} de ${acceptedFiles.length} archivos debido al límite de ${limit}.`);
            }
        }
    }, [field, multiple, limit, currentFilesCount, processedAccept, isLogo, isGaleria, onFileProcessed, itemIndex]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: processedAccept,
        multiple,
        maxFiles: (isLogo || isGaleria) ? 1 : (multiple ? undefined : 1), 
        onDrop
    });

    return (
        <div {...getRootProps()} className={`file-uploader-container ${isDragActive ? 'drag-active' : ''} ${isGaleria ? 'galeria-uploader' : ''}`}>
            <input {...getInputProps()} />
            <div className="file-uploader-content">
                <FaFileCirclePlus size={isGaleria ? 20 : 24} />
                <p style={isGaleria ? { fontSize: '0.8em' } : {}}>{label}</p>
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
                <LinearProgress variant="determinate" value={progress} sx={{ height: '6px' }} />
                <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', display: 'block', fontSize: '0.7rem', lineHeight: '1.2' }}>
                    {`${Math.round(progress)}%`}
                </Typography>
            </Box>
        );
    }
    if (status === 'success') {
        return (
            <Box sx={{ position: 'absolute', top: 5, right: 5, color: 'green', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '3px', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCheckCircle size={16} />
            </Box>
        );
    }
    if (status === 'error') {
        return (
            <Box sx={{ position: 'absolute', top: 5, right: 5, color: 'red', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '3px', cursor: 'pointer', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={errorMsg || "Error al subir"}>
                <FaExclamationTriangle size={16} />
            </Box>
        );
    }
    return null;
};

const FormularioPersonalizadoTipoB = ({
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
            ? { file: null, preview: initialData.logoURL, isExisting: true, name: 'logo_cargado', type: 'image/existing', tempId: initialData.logoTempId || null, status: 'loaded' }
            : null;

        const initialCarruselItems = (initialData?.carruselURLs || []).map(media => ({
            file: null, url: media.url, fileType: media.fileType || (media.url?.includes('.mp4') || media.url?.includes('.mov') ? 'video' : 'image'),
            mimeType: media.mimeType || '', isExisting: true, name: 'media_cargado', tempId: media.tempId || null, status: 'loaded'
        }));

        const initialGaleria = Array(LIMITE_GALERIA_PRODUCTOS).fill(null).map((_, index) => {
            const productData = initialData?.galeria?.[index];
            if (productData && (productData.titulo || productData.precio || productData.imagenURL)) {
                return {
                    titulo: productData.titulo || '',
                    precio: productData.precio || '',
                    imagenFile: productData.imagenURL
                        ? { file: null, preview: productData.imagenURL, isExisting: true, name: `prod_${index}_cargado`, type: productData.mimeType || 'image/existing', tempId: productData.tempId || null, status: 'loaded' }
                        : null,
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
            marcasSeleccionadas: Array.isArray(initialData?.marcas) ? initialData.marcas : [],
            extrasSeleccionados: Array.isArray(initialData?.servicios) ? initialData.servicios : [],
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
    const watchedLogoFile = watch('logoFile');
    const watchedCarruselMediaItems = watch('carruselMediaItems', []);

    const watchedAllFields = watch();

    const uploadQueueRef = useRef(new Set());

    useEffect(() => { scrollToTop(); reset(getInitialDefaultValues()); uploadQueueRef.current.clear(); }, [initialData, reset, getInitialDefaultValues]);

    const initiateFileUpload = useCallback(({ file, tempId, itemIndex, type }) => {
        if (!file || !tempId) {
            console.error("initiateFileUpload: File or tempId missing.");
            return;
        }
        if (uploadQueueRef.current.has(tempId)) {
            console.log(`Upload for tempId ${tempId} already initiated or in queue.`);
            return;
        }
        uploadQueueRef.current.add(tempId);

        let pathPrefix = '';
        let metadata = {};
        let rhfPathForStatusUpdate = '';

        switch (type) {
            case 'logo':
                pathPrefix = 'proveedores/tipoB/logos';
                metadata = { fieldType: 'logoFile', tempId };
                rhfPathForStatusUpdate = 'logoFile.status';
                setValue(rhfPathForStatusUpdate, 'initiating_upload', { shouldDirty: true });
                break;
            case 'carrusel':
                pathPrefix = 'proveedores/tipoB/carrusel';

                metadata = { fieldType: 'carruselMediaItems', tempId };

                break;
            case 'galeria':
                pathPrefix = 'proveedores/tipoB/galeria';
                metadata = { fieldType: 'galeria', arrayName: 'galeria', itemIndex, tempId };
                rhfPathForStatusUpdate = `galeria.${itemIndex}.imagenFile.status`;
                setValue(rhfPathForStatusUpdate, 'initiating_upload', { shouldDirty: true });
                break;
            default:
                console.error("initiateFileUpload: Unknown file type", type);
                return;
        }
        console.log(`Calling uploadFileImmediately for ${type} - tempId: ${tempId}`);
        uploadFileImmediately(file, tempId, pathPrefix, metadata);

    }, [uploadFileImmediately, setValue, getValues]);

     useEffect(() => {
        (watchedCarruselMediaItems || []).forEach((item) => { 
            if (item && item.file instanceof File && item.tempId && item.status === 'selected' && !uploadQueueRef.current.has(item.tempId)) {
                uploadQueueRef.current.add(item.tempId);

                const currentItems = getValues('carruselMediaItems');
                const targetItemIndex = currentItems.findIndex(it => it.tempId === item.tempId);
                if (targetItemIndex > -1) {
                     setValue(`carruselMediaItems.${targetItemIndex}.status`, 'initiating_upload', { shouldDirty: true });
                }

                uploadFileImmediately(item.file, item.tempId, 'proveedores/tipoB/carrusel', { fieldType: 'carruselMediaItems', tempId: item.tempId });
            }
        });
    }, [watchedCarruselMediaItems, uploadFileImmediately, setValue, getValues]);

    useEffect(() => {

        let formWasModified = false;

        if (watchedLogoFile?.tempId && fileUploadProgress[watchedLogoFile.tempId]) {
            const progress = fileUploadProgress[watchedLogoFile.tempId];
            if (progress.status === 'success' && watchedLogoFile.status !== 'loaded') { 
                setValue('logoFile', { ...watchedLogoFile, preview: progress.finalUrl, file: null, isExisting: true, status: 'loaded' }, { shouldValidate: true, shouldDirty: true });
                uploadQueueRef.current.delete(watchedLogoFile.tempId);
                formWasModified = true;
            } else if (progress.status === 'error' && watchedLogoFile.status !== 'error_upload') { 
                setValue('logoFile.status', 'error_upload', { shouldValidate: true, shouldDirty: true });
                uploadQueueRef.current.delete(watchedLogoFile.tempId);
                formWasModified = true;
            }
        }

        const currentCarruselValues = getValues('carruselMediaItems') || [];
        let carruselItemsChanged = false;
        const newCarruselMediaItems = currentCarruselValues.map(item => {
            if (item.tempId && fileUploadProgress[item.tempId]) {
                const progress = fileUploadProgress[item.tempId];
                if (progress.status === 'success' && item.status !== 'loaded') {
                    uploadQueueRef.current.delete(item.tempId);
                    carruselItemsChanged = true;
                    return { ...item, url: progress.finalUrl, file: null, isExisting: true, status: 'loaded' };
                } else if (progress.status === 'error' && item.status !== 'error_upload') {
                    uploadQueueRef.current.delete(item.tempId);
                    carruselItemsChanged = true;
                    return { ...item, status: 'error_upload' };
                }
            }
            return item;
        });
        if (carruselItemsChanged) {
            setValue('carruselMediaItems', newCarruselMediaItems, { shouldValidate: true, shouldDirty: true });
            formWasModified = true;
        }

        const currentGaleriaValues = getValues('galeria') || [];
        let galeriaItemsChanged = false;
        const newGaleriaItems = currentGaleriaValues.map(item => {
            if (item.imagenFile?.tempId && fileUploadProgress[item.imagenFile.tempId]) {
                const progress = fileUploadProgress[item.imagenFile.tempId];
                if (progress.status === 'success' && item.imagenFile.status !== 'loaded') {
                    uploadQueueRef.current.delete(item.imagenFile.tempId);
                    galeriaItemsChanged = true;
                    return { ...item, imagenFile: { ...item.imagenFile, preview: progress.finalUrl, file: null, isExisting: true, status: 'loaded' } };
                } else if (progress.status === 'error' && item.imagenFile.status !== 'error_upload') {
                    uploadQueueRef.current.delete(item.imagenFile.tempId);
                    galeriaItemsChanged = true;
                    return { ...item, imagenFile: { ...item.imagenFile, status: 'error_upload' } };
                }
            }
            return item;
        });
        if (galeriaItemsChanged) {
            setValue('galeria', newGaleriaItems, { shouldValidate: true, shouldDirty: true });
            formWasModified = true;
        }

    }, [fileUploadProgress, watchedLogoFile, setValue, getValues]); 

    useEffect(() => {
        return () => {
            const fieldsToCheck = ['logoFile', 'carruselMediaItems', 'galeria'];
            fieldsToCheck.forEach(fieldName => {
                const value = getValues(fieldName); 
                if (fieldName === 'logoFile' && value) {
                    if (value.preview && value.preview.startsWith('blob:') && !value.isExisting && value.status !== 'loaded') URL.revokeObjectURL(value.preview);
                } else if (fieldName === 'carruselMediaItems' && Array.isArray(value)) {
                    value.forEach(item => { if (item.url && item.url.startsWith('blob:') && !item.isExisting && item.status !== 'loaded') URL.revokeObjectURL(item.url); });
                } else if (fieldName === 'galeria' && Array.isArray(value)) {
                    value.forEach(item => { if (item.imagenFile?.preview?.startsWith('blob:') && !item.imagenFile.isExisting && item.imagenFile.status !== 'loaded') URL.revokeObjectURL(item.imagenFile.preview); });
                }
            });
        };
    }, [getValues]); 

    const prepareSubmitData = (dataFromForm) => {

        const currentValues = getValues();
        return {
            descripcion: currentValues.descripcion,
            sitioWeb: currentValues.sitioWeb,
            whatsapp: currentValues.whatsapp,
            telefono: currentValues.telefono,
            email: currentValues.email,
            marcas: currentValues.marcasSeleccionadas || [],
            servicios: currentValues.extrasSeleccionados || [],

            logoURL: currentValues.logoFile?.status === 'loaded' ? currentValues.logoFile.preview : (initialData?.logoURL || ''),

            carruselURLs: (currentValues.carruselMediaItems || []).map(item => ({
                url: item.status === 'loaded' ? item.url : '',
                fileType: item.fileType,
                mimeType: item.mimeType,
                tempId: item.tempId,
                status: item.status
            })).filter(item => item.url && item.status !== 'error_upload' && item.status !== 'removed'),

            galeria: (currentValues.galeria || []).map(producto => ({
                titulo: producto.titulo,
                precio: producto.precio,
                imagenURL: producto.imagenFile?.status === 'loaded' ? producto.imagenFile.preview : '',
                fileType: producto.fileType || (producto.imagenFile?.status === 'loaded' ? (producto.imagenFile.type?.startsWith('video/') ? 'video' : 'image') : ''),
                mimeType: producto.mimeType || (producto.imagenFile?.status === 'loaded' ? producto.imagenFile.type : ''),
                tempId: producto.imagenFile?.tempId,
                status: producto.imagenFile?.status
            })).filter(p => (p.titulo || p.precio || p.imagenURL) && p.status !== 'error_upload' && p.status !== 'removed'),
        };
    };

    const onSubmit = (dataFromForm) => { const stepData = prepareSubmitData(dataFromForm); onNext(stepData); };
    const handleBack = () => { const dataFromForm = getValues(); const stepData = prepareSubmitData(dataFromForm); onBack(stepData); };

    const buildPreviewData = (currentFormData) => {

        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;

        let logoForPreview = currentFormData.logoFile?.preview || null;

        if (currentFormData.logoFile?.tempId && fileUploadProgress[currentFormData.logoFile.tempId]?.status === 'success') {
            logoForPreview = fileUploadProgress[currentFormData.logoFile.tempId].finalUrl;
        } else if (currentFormData.logoFile?.status === 'loaded') {
            logoForPreview = currentFormData.logoFile.preview;
        }

        const carruselForPreview = (currentFormData.carruselMediaItems || []).map(item => {
            let urlForPreview = item.url;
            if (item.tempId && fileUploadProgress[item.tempId]?.status === 'success') {
                urlForPreview = fileUploadProgress[item.tempId].finalUrl;
            } else if (item.status === 'loaded') {
                urlForPreview = item.url;
            }
            return { url: urlForPreview, fileType: item.fileType, mimeType: item.mimeType, status: item.status };
        }).filter(item => item.url && item.status !== 'error_upload' && item.status !== 'removed');

        const galeriaForPreview = (currentFormData.galeria || []).map(item => {
            let imgPreview = item.imagenFile?.preview || null;
            if (item.imagenFile?.tempId && fileUploadProgress[item.imagenFile.tempId]?.status === 'success') {
                imgPreview = fileUploadProgress[item.imagenFile.tempId].finalUrl;
            } else if (item.imagenFile?.status === 'loaded') {
                imgPreview = item.imagenFile.preview;
            }
            return { titulo: item.titulo, precio: item.precio ? `$${item.precio}` : '', imagenPreview: imgPreview, status: item.imagenFile?.status };
        }).filter(p => (p.titulo || p.precio || p.imagenPreview) && p.status !== 'error_upload' && p.status !== 'removed');

        return {
            selectedServices, tipoProveedor, tipoRegistro,
            nombre: nombreProveedor, ubicacionDetalle,
            descripcion: currentFormData.descripcion,
            marcas: currentFormData.marcasSeleccionadas,
            servicios: currentFormData.extrasSeleccionados,
            logoPreview: logoForPreview,
            carrusel: carruselForPreview,
            sitioWeb: currentFormData.sitioWeb, whatsapp: currentFormData.whatsapp, telefono: currentFormData.telefono, email: currentFormData.email,
            galeriaProductos: galeriaForPreview,
        };
    };
    const previewData = buildPreviewData(watchedAllFields);

    const handleRemoveFunction = (fieldName, index = null) => {

        const currentItemPath = index !== null ? `${fieldName}.${index}` : fieldName;
        const fileObjectPath = index !== null ? `${fieldName}.${index}.imagenFile` : fieldName; 
        const actualPath = fieldName === 'logoFile' ? 'logoFile' : (fieldName === 'carruselMediaItems' ? `carruselMediaItems.${index}` : fileObjectPath);

        const fileObject = getValues(actualPath);

        if (fileObject) {
            const previewUrl = fieldName === 'carruselMediaItems' ? fileObject.url : fileObject.preview;
            if (previewUrl && previewUrl.startsWith('blob:') && !fileObject.isExisting && fileObject.status !== 'loaded') {
                URL.revokeObjectURL(previewUrl);
            }
            if (fileObject.tempId) {
                uploadQueueRef.current.delete(fileObject.tempId);
                setValue(actualPath + '.status', 'removed', { shouldDirty: true }); 

            }
        }

        if (fieldName === 'logoFile' || (fieldName === 'galeria' && index !== null)) {
            setValue(fileObjectPath, null, { shouldValidate: true, shouldDirty: true });
        }

    };

    const handleRemoveLogo = () => handleRemoveFunction('logoFile');

    const handleRemoveCarruselItem = (indexToRemove) => {
        const currentItems = getValues("carruselMediaItems") || [];
        const itemToRemove = currentItems[indexToRemove];
        if (itemToRemove) {
            if (itemToRemove.url?.startsWith('blob:') && !itemToRemove.isExisting && itemToRemove.status !== 'loaded') URL.revokeObjectURL(itemToRemove.url);
            if (itemToRemove.tempId) {
                uploadQueueRef.current.delete(itemToRemove.tempId);

            }
        }
        const newItems = currentItems.filter((_, i) => i !== indexToRemove);
        setValue('carruselMediaItems', newItems, { shouldValidate: true, shouldDirty: true });
    };
    const handleRemoveGaleriaImage = (index) => handleRemoveFunction('galeria', index);

    const errorSpanStyle = { color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', display: 'block' };

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Productos</h1>

                    {}
                    <div className="form-section">
                        <InputLabel htmlFor="logo-uploader-b" error={!!errors.logoFile}>Logo</InputLabel>
                        {watchedLogoFile?.preview && watchedLogoFile?.status !== 'removed' && (
                            <div className="logo-preview-container" style={{ position: 'relative' }}>
                                <img src={watchedLogoFile.preview} alt={watchedLogoFile.name || "Vista previa del Logo"} />
                                <button type="button" onClick={handleRemoveLogo} className="remove-button" style={{ zIndex: 3 }}><FaTimes /></button>
                                {watchedLogoFile.tempId && fileUploadProgress[watchedLogoFile.tempId] && (
                                    <FileProgressIndicator progressInfo={fileUploadProgress[watchedLogoFile.tempId]} />
                                )}
                            </div>
                        )}
                        {(!watchedLogoFile || watchedLogoFile?.status === 'removed' || (watchedLogoFile?.tempId && fileUploadProgress[watchedLogoFile?.tempId]?.status === 'error')) &&
                            <Controller name="logoFile" control={control} rules={{ validate: { fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true } }}
                                render={({ field }) => (
                                    <FileUploaderRHF
                                        field={field}
                                        multiple={false} acceptProp="image/*"
                                        label={field.value?.preview && field.value?.status !== 'removed' ? "Cambiar logo" : "Arrastra tu logo"}
                                        isLogo={true} maxFiles={1}
                                        onFileProcessed={({ file, tempId }) => {
                                            initiateFileUpload({ file, tempId, type: 'logo' });
                                        }}
                                    />
                                )}
                            />
                        }
                        {errors.logoFile && <FormHelperText error>{errors.logoFile.message || errors.logoFile.type}</FormHelperText>}
                    </div>

                    {}
                    <div className="form-section">
                        <InputLabel htmlFor="carrusel-uploader-b" error={!!errors.carruselMediaItems}>Carrusel Multimedia (máx. {LIMITE_CARRUSEL})</InputLabel>
                        {(watchedCarruselMediaItems || []).filter(item => item.status !== 'removed').length > 0 && (
                            <div className="carrusel-previews">
                                {watchedCarruselMediaItems.map((item, index) => {
                                    if (item.status === 'removed') return null;
                                    return (
                                        <div key={item.tempId || item.url || index} className="carrusel-preview-item" style={{ position: 'relative' }}>
                                            {item.fileType === 'image' ? <img src={item.url} alt={item.name || `Contenido ${index + 1}`} /> : <video controls muted style={{ width: '100%', display: 'block' }} src={item.url} type={item.mimeType}>Tu navegador no soporta video.</video>}
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
                            <Controller name="carruselMediaItems" control={control} rules={{ validate: { maxItems: v => (v || []).filter(item => item.status !== 'removed').length <= LIMITE_CARRUSEL || `No más de ${LIMITE_CARRUSEL} ítems.` } }}
                                render={({ field }) => (
                                    <FileUploaderRHF
                                        field={field}
                                        multiple={true} acceptProp="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                                        label={`Imágenes/Videos (${(field.value || []).filter(item => item.status !== 'removed').length}/${LIMITE_CARRUSEL})`}
                                        currentFilesCount={(field.value || []).filter(item => item.status !== 'removed').length} limit={LIMITE_CARRUSEL}

                                        onFileProcessed={({ file, tempId, itemIndex }) => { 

                                             console.log("FileUploaderRHF onFileProcessed - Carrusel item - tempId:", tempId, "File:", file.name);

                                        }}
                                    />
                                )}
                            />
                        }
                        {errors.carruselMediaItems && <FormHelperText error>{errors.carruselMediaItems.message || errors.carruselMediaItems.type}</FormHelperText>}
                    </div>

                    {}
                    <div className="form-section"> {}
                        <Controller name="descripcion" control={control} rules={{ required: 'La descripción es requerida', maxLength: { value: DESCRIPCION_MAX_LENGTH, message: `Máx. ${DESCRIPCION_MAX_LENGTH} caracteres.` } }}
                            render={({ field, fieldState: { error } }) => {
                                const len = field.value?.length || 0;
                                return <TextField {...field} id="descripcion-b" label="Descripción del Negocio/Productos *" multiline rows={4} variant="outlined" fullWidth placeholder="Describe tu negocio..." error={!!error} helperText={error ? error.message : `${len}/${DESCRIPCION_MAX_LENGTH}`} inputProps={{ maxLength: DESCRIPCION_MAX_LENGTH }} InputLabelProps={{ shrink: true }} />;
                            }} />
                    </div>
                    <div className="form-section"> {}
                        <Controller name="marcasSeleccionadas" control={control}
                            render={({ field }) => <Autocomplete multiple id="marcas-tags-b" options={marcasOpciones} value={field.value || []} onChange={(e, v) => field.onChange(v)} getOptionLabel={(opt) => typeof opt === 'string' ? opt : ''} isOptionEqualToValue={(opt, val) => opt === val} filterSelectedOptions renderInput={(params) => <TextField {...params} variant="outlined" label="Marcas que trabajás" placeholder="Escribí o seleccioná" error={!!errors.marcasSeleccionadas} helperText={errors.marcasSeleccionadas?.message} InputLabelProps={{ shrink: true }} />} renderTags={(val, getTagProps) => val.map((opt, idx) => <Chip key={opt + idx} label={opt} {...getTagProps({ idx })} sx={{ margin: '2px' }} />)} />} />
                    </div>
                    <div className="form-section"> {}
                        <Controller name="extrasSeleccionados" control={control}
                            render={({ field }) => <Autocomplete multiple id="extras-tags-b" options={extrasOpciones} value={field.value || []} onChange={(e, v) => field.onChange(v)} getOptionLabel={(opt) => typeof opt === 'string' ? opt : ''} isOptionEqualToValue={(opt, val) => opt === val} filterSelectedOptions renderInput={(params) => <TextField {...params} variant="outlined" label="Servicios Adicionales" placeholder="Escribí o seleccioná" error={!!errors.extrasSeleccionados} helperText={errors.extrasSeleccionados?.message} InputLabelProps={{ shrink: true }} />} renderTags={(val, getTagProps) => val.map((opt, idx) => <Chip key={opt + idx} label={opt} {...getTagProps({ idx })} sx={{ margin: '4px 4px 0 0' }} />)} />} />
                    </div>
                    <div className="form-section"> {}
                        <h3>Información de Contacto (Requerida para Card Productos)</h3>
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

                    {}
                    <div className="form-section galeria-productos">
                        <h3>Galería de Productos (Hasta {LIMITE_GALERIA_PRODUCTOS}, primeros {PRODUCTOS_OBLIGATORIOS_GALERIA} obligatorios)</h3>
                        <div className="galeria-grid">
                            {galeriaFields.map((fieldItem, index) => {
                                const esObligatorio = index < PRODUCTOS_OBLIGATORIOS_GALERIA;
                                const currentImagenFile = watch(`galeria.${index}.imagenFile`); 
                                const currentTempId = currentImagenFile?.tempId;
                                const progressInfo = currentTempId ? fileUploadProgress[currentTempId] : null;

                                return (
                                    <div key={fieldItem.id} className="producto-card">
                                        <InputLabel error={!!errors.galeria?.[index]?.imagenFile} sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                                            Producto {index + 1} {esObligatorio && <span style={{ color: 'red' }}>*</span>}
                                        </InputLabel>
                                        <div className="single-preview" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '4px', minHeight: '150px', padding: '5px' }}>
                                            {currentImagenFile?.preview && currentImagenFile?.status !== 'removed' ? (
                                                <>
                                                    <img src={currentImagenFile.preview} alt={currentImagenFile.name || `Preview ${index + 1}`} style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', marginBottom: progressInfo ? '20px' : '0' }} />
                                                    <button type="button" onClick={() => handleRemoveGaleriaImage(index)} className="remove-button" style={{ zIndex: 3 }}><FaTimes /></button>
                                                </>
                                            ) : null}
                                            {(!currentImagenFile || currentImagenFile?.status === 'removed' || (currentTempId && progressInfo?.status === 'error')) &&
                                                <Controller
                                                    name={`galeria.${index}.imagenFile`} control={control}
                                                    rules={esObligatorio ? {
                                                        required: 'Imagen requerida',
                                                        validate: { fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true }
                                                    } : {
                                                        validate: { fileType: v => (v && v.file instanceof File && !v.isExisting) ? v.file.type.startsWith('image/') || 'Solo imágenes.' : true }
                                                    }}
                                                    render={({ field: controllerField }) =>
                                                        <FileUploaderRHF
                                                            field={controllerField}
                                                            multiple={false}
                                                            acceptProp="image/*"
                                                            label={(currentImagenFile?.preview && currentImagenFile?.status !== 'removed') ? "Cambiar" : "Subir imagen"}
                                                            isGaleria={true}
                                                            maxFiles={1}
                                                            itemIndex={index} 
                                                            onFileProcessed={({ file, tempId, itemIndex: galleryItemIndex }) => {
                                                                initiateFileUpload({ file, tempId, itemIndex: galleryItemIndex, type: 'galeria' });
                                                            }}
                                                        />}
                                                />
                                            }
                                            {progressInfo && <FileProgressIndicator progressInfo={progressInfo} />}
                                        </div>
                                        {errors.galeria?.[index]?.imagenFile && <FormHelperText error sx={{ fontSize: '0.75rem', marginTop: '3px' }}>{errors.galeria[index].imagenFile.message || errors.galeria[index].imagenFile.type}</FormHelperText>}

                                        <div className="form-field-html-group" style={{ marginTop: '8px' }}>
                                            <label htmlFor={`galeria_titulo_${index}`}>Título {esObligatorio && <span style={{ color: 'red' }}>*</span>}</label>
                                            <input type="text" id={`galeria_titulo_${index}`} placeholder="Título producto"
                                                {...register(`galeria.${index}.titulo`, esObligatorio ? { required: 'Título requerido' } : {})}
                                                className={errors.galeria?.[index]?.titulo ? 'input-error' : ''} />
                                            {errors.galeria?.[index]?.titulo && <span style={errorSpanStyle}>{errors.galeria[index].titulo.message}</span>}
                                        </div>
                                        <div className="form-field-html-group" style={{ marginTop: '8px' }}>
                                            <label htmlFor={`galeria_precio_${index}`}>Precio {esObligatorio && <span style={{ color: 'red' }}>*</span>}</label>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ marginRight: '4px', fontSize: '1em', color: errors.galeria?.[index]?.precio ? '#d32f2f' : 'inherit' }}>$</span>
                                                <input type="text" id={`galeria_precio_${index}`} placeholder="100.00"
                                                    {...register(`galeria.${index}.precio`, {
                                                        ...(esObligatorio && { required: 'Precio requerido' }),
                                                        pattern: { value: /^\d*([.,]\d{0,2})?$/, message: 'Precio inválido (ej: 100 o 100.99)' }
                                                    })}
                                                    className={errors.galeria?.[index]?.precio ? 'input-error' : ''} style={{ flexGrow: 1 }} />
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