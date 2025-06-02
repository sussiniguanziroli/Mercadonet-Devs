// src/components/registroProveedor/steps/FormularioPersonalizadoTipoB.jsx
import React, { useEffect, useCallback, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardProductosPreview from '../card_simulators/CardProductosPreview';

import LogoUploadSection from './formSections/LogoUploadSection';
import CarruselUploadSection from './formSections/CarruselUploadSection';
import TextFieldSection from './formSections/TextFieldSection';
import AutocompleteSection from './formSections/AutocompleteSection';
import ContactoFieldsSection from './formSections/ContactoFieldsSection';
import GaleriaProductosSection from './formSections/GaleriaProductosSection';

const LIMITE_CARRUSEL_B = 7;
const LIMITE_GALERIA_PRODUCTOS_B = 6;
const PRODUCTOS_OBLIGATORIOS_GALERIA_B = 3;
const DESCRIPCION_MAX_LENGTH_B = 1300;

const FormularioPersonalizadoTipoB = ({
    initialData,
    onNext,
    onBack,
    onCancel, // Make sure this prop is passed from FormularioPersonalizado
    nombreProveedor = '',
    ciudad = '',
    provincia = '',
    marcas: marcasOpciones = [],
    extras: extrasOpciones = [], 
    fileUploadProgress = {},
    uploadFileImmediately,
    tipoRegistro,
    tipoProveedor,
    selectedServices
}) => {

    const getInitialDefaultValues = useCallback((currentInitialData) => {
        const dataToUse = currentInitialData || {}; // Use provided data or empty object

        const initialLogoRHF = dataToUse.logo
            ? { 
                file: null, preview: dataToUse.logo.url, isExisting: true, 
                name: 'logo_cargado', type: dataToUse.logo.mimeType || 'image/existing', 
                tempId: dataToUse.logo.tempId || null, status: dataToUse.logo.status || 'loaded'
              }
            : null;

        const initialCarruselItemsRHF = (dataToUse.carruselURLs || []).map(media => ({
            file: null, url: media.url, fileType: media.fileType,
            mimeType: media.mimeType, isExisting: true, name: 'media_cargado', 
            tempId: media.tempId || null, status: media.status || 'loaded'
        }));
        
        const initialGaleriaRHF = Array(LIMITE_GALERIA_PRODUCTOS_B).fill(null).map((_, index) => {
            const productData = dataToUse.galeria?.[index];
            if (productData && (productData.titulo || productData.precio || productData.url || productData.imagenURL)) {
                return {
                    titulo: productData.titulo || '',
                    precio: productData.precio || '',
                    imagenFile: (productData.url || productData.imagenURL)
                        ? { 
                            file: null, preview: productData.url || productData.imagenURL, isExisting: true, 
                            name: `prod_${index}_cargado`, type: productData.mimeType || 'image/existing', 
                            tempId: productData.tempId || null, status: productData.status || 'loaded'
                          }
                        : null,
                };
            }
            return { imagenFile: null, titulo: '', precio: '' };
        });

        return {
            descripcion: dataToUse.descripcion || '',
            sitioWeb: dataToUse.sitioWeb || '',
            whatsapp: dataToUse.whatsapp || '',
            telefono: dataToUse.telefono || '',
            email: dataToUse.email || '',
            marcasSeleccionadas: Array.isArray(dataToUse.marcas) ? dataToUse.marcas : [],
            serviciosSeleccionados: Array.isArray(dataToUse.servicios) ? dataToUse.servicios : [],
            logoFile: initialLogoRHF,
            carruselMediaItems: initialCarruselItemsRHF,
            galeria: initialGaleriaRHF,
        };
    }, []); // Empty dependency array as it's a definition based on its argument

    const { control, handleSubmit, watch, setValue, reset, formState: { errors }, register, getValues } = useForm({
        defaultValues: getInitialDefaultValues(initialData), // Initial call with initialData
        mode: 'onBlur',
    });

    const { fields: galeriaFields } = useFieldArray({ control, name: "galeria" });
    const watchedAllFields = watch();
    const uploadQueueRef = useRef(new Set());

    // This useEffect handles re-initialization when initialData prop changes,
    // for example, after a file upload completes and RegistrosProveedorNavigator updates its formData.
    useEffect(() => {
        // console.log("FormularioPersonalizadoTipoB: initialData prop changed", initialData);
        const currentFormValues = getValues(); // Get current values from the form
        const newDefaultsFromInitialData = getInitialDefaultValues(initialData); // Get defaults based on new initialData

        // Create a merged object: prioritize current form values for non-file text fields,
        // but take file structures from newDefaultsFromInitialData (which reflects uploaded files).
        const mergedValues = {
            ...newDefaultsFromInitialData, // Start with new defaults (includes updated file info)
            
            // Overwrite with current form values if they exist and are different, for specific fields
            descripcion: currentFormValues.descripcion !== undefined ? currentFormValues.descripcion : newDefaultsFromInitialData.descripcion,
            sitioWeb: currentFormValues.sitioWeb !== undefined ? currentFormValues.sitioWeb : newDefaultsFromInitialData.sitioWeb,
            whatsapp: currentFormValues.whatsapp !== undefined ? currentFormValues.whatsapp : newDefaultsFromInitialData.whatsapp,
            telefono: currentFormValues.telefono !== undefined ? currentFormValues.telefono : newDefaultsFromInitialData.telefono,
            email: currentFormValues.email !== undefined ? currentFormValues.email : newDefaultsFromInitialData.email,
            
            marcasSeleccionadas: currentFormValues.marcasSeleccionadas !== undefined ? currentFormValues.marcasSeleccionadas : newDefaultsFromInitialData.marcasSeleccionadas,
            serviciosSeleccionados: currentFormValues.serviciosSeleccionados !== undefined ? currentFormValues.serviciosSeleccionados : newDefaultsFromInitialData.serviciosSeleccionados,
            
            // For galeria, merge title and price from current form values into the structure derived from initialData
            galeria: newDefaultsFromInitialData.galeria.map((defaultGalleryItem, index) => {
                const currentGalleryItem = currentFormValues.galeria?.[index];
                if (currentGalleryItem) {
                    return {
                        ...defaultGalleryItem, // This has the correct imagenFile from newInitialData
                        titulo: currentGalleryItem.titulo !== undefined ? currentGalleryItem.titulo : defaultGalleryItem.titulo,
                        precio: currentGalleryItem.precio !== undefined ? currentGalleryItem.precio : defaultGalleryItem.precio,
                    };
                }
                return defaultGalleryItem;
            }),
        };
        
        reset(mergedValues); // Reset the form with merged values
        // uploadQueueRef.current.clear(); // Clearing queue might be too aggressive here if uploads are multi-stage
    }, [initialData, reset, getInitialDefaultValues, getValues]);


    const initiateFileUpload = useCallback(({ file, tempId, type, itemIndex }) => {
        if (!file || !tempId) return;
        if (uploadQueueRef.current.has(tempId)) {
            // console.log(`Upload for ${tempId} already in queue or processing.`);
            return;
        }
        uploadQueueRef.current.add(tempId);

        let pathPrefix = '';
        let metadata = { tempId };
        let rhfPathForStatusUpdate = '';

        if (type === 'logo') {
            pathPrefix = 'proveedores/tipoB/logos';
            metadata.fieldType = 'logoFile';
            rhfPathForStatusUpdate = 'logoFile.status';
        } else if (type === 'carrusel') {
            pathPrefix = 'proveedores/tipoB/carrusel';
            metadata.fieldType = 'carruselMediaItems';
            const currentItems = getValues('carruselMediaItems');
            const targetItemIndex = currentItems.findIndex(it => it.tempId === tempId);
            if (targetItemIndex > -1) {
                rhfPathForStatusUpdate = `carruselMediaItems.${targetItemIndex}.status`;
            }
        } else if (type === 'galeria') {
            pathPrefix = 'proveedores/tipoB/galeria';
            metadata.fieldType = 'galeria'; 
            metadata.arrayName = 'galeria'; 
            metadata.itemIndex = itemIndex; 
            rhfPathForStatusUpdate = `galeria.${itemIndex}.imagenFile.status`;
        }
        
        if (rhfPathForStatusUpdate) {
            setValue(rhfPathForStatusUpdate, 'initiating_upload', { shouldDirty: true });
        }
        uploadFileImmediately(file, tempId, pathPrefix, metadata);

    }, [uploadFileImmediately, setValue, getValues]);
    
    // This useEffect updates the RHF state for specific file fields when their upload completes.
    // It should NOT reset the whole form.
    useEffect(() => {
        let formChanged = false;

        const watchedLogoFileValue = getValues('logoFile');
        if (watchedLogoFileValue?.tempId && fileUploadProgress[watchedLogoFileValue.tempId]) {
            const progress = fileUploadProgress[watchedLogoFileValue.tempId];
            if (progress.status === 'success' && watchedLogoFileValue.status !== 'loaded') {
                setValue('logoFile', { 
                    ...watchedLogoFileValue, preview: progress.finalUrl, 
                    file: null, isExisting: true, status: 'loaded',
                    type: progress.mimeTypeOriginal || watchedLogoFileValue.type
                }, { shouldValidate: true, shouldDirty: true });
                uploadQueueRef.current.delete(watchedLogoFileValue.tempId);
                formChanged = true;
            } else if (progress.status === 'error' && watchedLogoFileValue.status !== 'error_upload') {
                setValue('logoFile.status', 'error_upload', { shouldValidate: true, shouldDirty: true });
                uploadQueueRef.current.delete(watchedLogoFileValue.tempId);
                formChanged = true;
            }
        }

        const currentCarruselValues = getValues('carruselMediaItems') || [];
        const newCarruselMediaItems = currentCarruselValues.map(item => {
            if (item.tempId && fileUploadProgress[item.tempId]) {
                const progress = fileUploadProgress[item.tempId];
                if (progress.status === 'success' && item.status !== 'loaded') {
                    uploadQueueRef.current.delete(item.tempId);
                    formChanged = true;
                    return { 
                        ...item, url: progress.finalUrl, 
                        fileType: progress.fileTypeOriginal || item.fileType,
                        mimeType: progress.mimeTypeOriginal || item.mimeType,
                        file: null, isExisting: true, status: 'loaded' 
                    };
                } else if (progress.status === 'error' && item.status !== 'error_upload') {
                    uploadQueueRef.current.delete(item.tempId);
                    formChanged = true;
                    return { ...item, status: 'error_upload' };
                }
            }
            return item;
        });
        if (formChanged && JSON.stringify(newCarruselMediaItems) !== JSON.stringify(currentCarruselValues)) { // Only update if changed
            setValue('carruselMediaItems', newCarruselMediaItems, { shouldValidate: true, shouldDirty: true });
        }
        
        let galeriaFormChanged = false;
        const currentGaleriaValues = getValues('galeria') || [];
        const newGaleriaItems = currentGaleriaValues.map((item) => {
            if (item.imagenFile?.tempId && fileUploadProgress[item.imagenFile.tempId]) {
                const progress = fileUploadProgress[item.imagenFile.tempId];
                if (progress.status === 'success' && item.imagenFile.status !== 'loaded') {
                    uploadQueueRef.current.delete(item.imagenFile.tempId);
                    galeriaFormChanged = true;
                    return { 
                        ...item, 
                        imagenFile: { 
                            ...item.imagenFile, preview: progress.finalUrl, 
                            file: null, isExisting: true, status: 'loaded',
                            type: progress.mimeTypeOriginal || item.imagenFile.type
                        } 
                    };
                } else if (progress.status === 'error' && item.imagenFile.status !== 'error_upload') {
                    uploadQueueRef.current.delete(item.imagenFile.tempId);
                    galeriaFormChanged = true;
                    return { ...item, imagenFile: { ...item.imagenFile, status: 'error_upload' } };
                }
            }
            return item;
        });
        if (galeriaFormChanged) {
            setValue('galeria', newGaleriaItems, { shouldValidate: true, shouldDirty: true });
        }

    }, [fileUploadProgress, setValue, getValues]);

    useEffect(() => {
        return () => {
            const fieldsToClean = ['logoFile', 'carruselMediaItems', 'galeria'];
            fieldsToClean.forEach(fieldName => {
                const value = getValues(fieldName);
                if (fieldName === 'logoFile' && value) {
                    if (value.preview && value.preview.startsWith('blob:') && !value.isExisting && value.status !== 'loaded') {
                        URL.revokeObjectURL(value.preview);
                    }
                } else if (fieldName === 'carruselMediaItems' && Array.isArray(value)) {
                    value.forEach(item => {
                        if (item.url && item.url.startsWith('blob:') && !item.isExisting && item.status !== 'loaded') {
                            URL.revokeObjectURL(item.url);
                        }
                    });
                } else if (fieldName === 'galeria' && Array.isArray(value)) {
                    value.forEach(item => {
                        if (item.imagenFile?.preview?.startsWith('blob:') && !item.imagenFile.isExisting && item.imagenFile.status !== 'loaded') {
                            URL.revokeObjectURL(item.imagenFile.preview);
                        }
                    });
                }
            });
        };
    }, [getValues]);

    const prepareSubmitData = () => {
        const currentRHFValues = getValues();
        
        let submittedLogoData = null;
        const rhfLogo = currentRHFValues.logoFile;
        if (rhfLogo?.status === 'loaded' && rhfLogo.preview) {
            const logoProgress = fileUploadProgress[rhfLogo.tempId];
            submittedLogoData = {
                url: rhfLogo.preview,
                tempPath: logoProgress?.storagePath || initialData?.logo?.tempPath || '',
                fileType: rhfLogo.type?.startsWith('video/') ? 'video' : 'image',
                mimeType: rhfLogo.type,
                tempId: rhfLogo.tempId,
                status: 'loaded'
            };
        } else if (initialData?.logo && rhfLogo?.status !== 'removed' && rhfLogo?.isExisting) {
            submittedLogoData = initialData.logo;
        } else if (initialData?.logo && !rhfLogo) { // Logo was removed
             submittedLogoData = null;
        }


        const submittedCarruselData = (currentRHFValues.carruselMediaItems || [])
            .map(item => {
                if (item.status === 'loaded' && item.url) {
                    const itemProgress = fileUploadProgress[item.tempId];
                    return {
                        url: item.url,
                        tempPath: itemProgress?.storagePath || initialData?.carruselURLs?.find(i => i.tempId === item.tempId)?.tempPath || '',
                        fileType: item.fileType,
                        mimeType: item.mimeType,
                        tempId: item.tempId,
                        status: 'loaded'
                    };
                } else if (item.isExisting && item.status !== 'removed' && item.url) {
                     const existingInitialItem = initialData?.carruselURLs?.find(i => i.tempId === item.tempId || i.url === item.url);
                    if(existingInitialItem) return existingInitialItem;
                }
                return null;
            })
            .filter(Boolean);

        const submittedGaleriaData = (currentRHFValues.galeria || [])
            .map(producto => {
                const rhfImagenFile = producto.imagenFile;
                if (rhfImagenFile?.status === 'loaded' && rhfImagenFile.preview) {
                    const itemProgress = fileUploadProgress[rhfImagenFile.tempId];
                    return {
                        titulo: producto.titulo,
                        precio: producto.precio,
                        url: rhfImagenFile.preview, 
                        imagenURL: rhfImagenFile.preview, 
                        tempPath: itemProgress?.storagePath || initialData?.galeria?.find(p => p.tempId === rhfImagenFile.tempId)?.tempPath || '',
                        fileType: rhfImagenFile.type?.startsWith('video/') ? 'video' : 'image',
                        mimeType: rhfImagenFile.type,
                        tempId: rhfImagenFile.tempId,
                        status: 'loaded'
                    };
                } else if (rhfImagenFile?.isExisting && rhfImagenFile?.status !== 'removed' && rhfImagenFile?.preview) {
                    const existingInitialItem = initialData?.galeria?.find(p => p.tempId === rhfImagenFile.tempId || p.url === rhfImagenFile.preview || p.imagenURL === rhfImagenFile.preview);
                    if (existingInitialItem) {
                        return {
                            titulo: producto.titulo || existingInitialItem.titulo,
                            precio: producto.precio || existingInitialItem.precio,
                            url: existingInitialItem.url || existingInitialItem.imagenURL,
                            imagenURL: existingInitialItem.imagenURL || existingInitialItem.url,
                            tempPath: existingInitialItem.tempPath,
                            fileType: existingInitialItem.fileType,
                            mimeType: existingInitialItem.mimeType,
                            tempId: existingInitialItem.tempId,
                            status: existingInitialItem.status || 'loaded'
                        };
                    }
                }
                if (producto.titulo || producto.precio) { // Keep item if only text fields are filled
                    return {
                        titulo: producto.titulo,
                        precio: producto.precio,
                        url: null, imagenURL: null, tempPath: null, fileType: null, mimeType: null, tempId: null, status: rhfImagenFile ? 'error_upload' : 'no_image'
                    };
                }
                return null;
            })
            .filter(Boolean);

        return {
            descripcion: currentRHFValues.descripcion,
            sitioWeb: currentRHFValues.sitioWeb,
            whatsapp: currentRHFValues.whatsapp,
            telefono: currentRHFValues.telefono,
            email: currentRHFValues.email,
            marcas: currentRHFValues.marcasSeleccionadas || [],
            servicios: currentRHFValues.serviciosSeleccionados || [],
            logo: submittedLogoData,
            carruselURLs: submittedCarruselData,
            galeria: submittedGaleriaData,
        };
    };

    const onSubmit = () => {
        const stepData = prepareSubmitData();
        onNext(stepData);
    };
    const handleBack = () => {
        const stepData = prepareSubmitData();
        onBack(stepData);
    };

    const buildPreviewData = (currentRHFData) => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        
        const logoForPreview = currentRHFData.logoFile?.preview || initialData?.logo?.url || null;

        const carruselForPreview = (currentRHFData.carruselMediaItems || []).map(item => ({
            url: item.url || item.preview,
            fileType: item.fileType,
            mimeType: item.mimeType,
            status: item.status
        })).filter(item => item.url && item.status !== 'error_upload' && item.status !== 'removed');
        
        const galeriaForPreview = (currentRHFData.galeria || []).map(item => ({
            titulo: item.titulo, 
            precio: item.precio ? `$${item.precio}` : '', 
            imagenPreview: item.imagenFile?.preview || null, 
            status: item.imagenFile?.status 
        })).filter(p => (p.titulo || p.precio || p.imagenPreview) && p.status !== 'error_upload' && p.status !== 'removed');

        return {
            tipoRegistro,
            tipoProveedor,
            selectedServices,
            nombre: nombreProveedor, 
            ubicacionDetalle,
            descripcion: currentRHFData.descripcion,
            marcas: currentRHFData.marcasSeleccionadas, 
            servicios: currentRHFData.serviciosSeleccionados, 
            logoPreview: logoForPreview,
            carrusel: carruselForPreview,
            sitioWeb: currentRHFData.sitioWeb,
            whatsapp: currentRHFData.whatsapp,
            telefono: currentRHFData.telefono,
            email: currentRHFData.email,
            galeriaProductos: galeriaForPreview,
        };
    };
    const previewData = buildPreviewData(watchedAllFields);

    const handleRemoveLogo = () => {
        const currentLogo = getValues("logoFile");
        if (currentLogo) {
            if (currentLogo.preview && currentLogo.preview.startsWith('blob:') && !currentLogo.isExisting && currentLogo.status !== 'loaded') {
                URL.revokeObjectURL(currentLogo.preview);
            }
            if (currentLogo.tempId) {
                uploadQueueRef.current.delete(currentLogo.tempId);
            }
        }
        setValue('logoFile', null, { shouldValidate: true, shouldDirty: true });
    };

    const handleRemoveCarruselItem = (indexToRemove) => {
        const currentItems = getValues("carruselMediaItems") || [];
        const itemToRemove = currentItems[indexToRemove];
        if (itemToRemove) {
            if (itemToRemove.url && itemToRemove.url.startsWith('blob:') && !itemToRemove.isExisting && itemToRemove.status !== 'loaded') {
                URL.revokeObjectURL(itemToRemove.url);
            }
            if (itemToRemove.tempId) {
                uploadQueueRef.current.delete(itemToRemove.tempId);
            }
        }
        const newItems = currentItems.filter((_, i) => i !== indexToRemove);
        setValue('carruselMediaItems', newItems, { shouldValidate: true, shouldDirty: true });
    };

    const handleRemoveGaleriaImage = (index) => {
        const rhfPath = `galeria.${index}.imagenFile`;
        const currentImageFile = getValues(rhfPath);
        if (currentImageFile) {
            if (currentImageFile.preview && currentImageFile.preview.startsWith('blob:') && !currentImageFile.isExisting && currentImageFile.status !== 'loaded') {
                URL.revokeObjectURL(currentImageFile.preview);
            }
            if (currentImageFile.tempId) {
                uploadQueueRef.current.delete(currentImageFile.tempId);
            }
        }
        setValue(rhfPath, null, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Productos</h1>

                    <LogoUploadSection
                        control={control}
                        errors={errors}
                        rhfName="logoFile"
                        watchedValue={watch('logoFile')}
                        fileUploadProgress={fileUploadProgress}
                        onInitiateUpload={({ file, tempId }) => initiateFileUpload({ file, tempId, type: 'logo' })}
                        onRemove={handleRemoveLogo}
                        sectionLabel="Logo"
                    />

                    <CarruselUploadSection
                        control={control}
                        errors={errors}
                        rhfName="carruselMediaItems"
                        watchedValue={watch('carruselMediaItems')}
                        fileUploadProgress={fileUploadProgress}
                        onInitiateUpload={({ file, tempId }) => initiateFileUpload({ file, tempId, type: 'carrusel' })}
                        onRemoveItem={handleRemoveCarruselItem}
                        limit={LIMITE_CARRUSEL_B}
                        sectionLabel="Carrusel Multimedia"
                    />
                    
                    <TextFieldSection
                        rhfName="descripcion"
                        control={control}
                        errors={errors}
                        label="Descripción del Negocio/Productos *"
                        rules={{
                            required: 'La descripción es requerida',
                            maxLength: { value: DESCRIPCION_MAX_LENGTH_B, message: `Máx. ${DESCRIPCION_MAX_LENGTH_B} caracteres.` }
                        }}
                        multiline
                        rows={4}
                        maxLength={DESCRIPCION_MAX_LENGTH_B}
                        placeholder="Describe tu negocio..."
                    />

                    <AutocompleteSection
                        rhfName="marcasSeleccionadas"
                        control={control}
                        errors={errors}
                        options={marcasOpciones}
                        label="Marcas que trabajás"
                    />

                    <AutocompleteSection
                        rhfName="serviciosSeleccionados" 
                        control={control}
                        errors={errors}
                        options={extrasOpciones} 
                        label="Servicios Adicionales"
                    />
                    
                    <ContactoFieldsSection
                        register={register}
                        errors={errors}
                        sectionTitle="Información de Contacto (Requerida para Card Productos)"
                        sitioWebRequired={true}
                        whatsappRequired={true}
                        emailRequired={true}
                    />

                    <GaleriaProductosSection
                        control={control}
                        register={register}
                        errors={errors}
                        galeriaFields={galeriaFields}
                        watch={watch}
                        fileUploadProgress={fileUploadProgress}
                        onInitiateUpload={({ file, tempId, itemIndex }) => initiateFileUpload({ file, tempId, type: 'galeria', itemIndex })}
                        onRemoveImage={handleRemoveGaleriaImage}
                        limiteProductos={LIMITE_GALERIA_PRODUCTOS_B}
                        productosObligatorios={PRODUCTOS_OBLIGATORIOS_GALERIA_B}
                    />

                    <div className="botones-navegacion">
                        <button type="button" onClick={handleBack} className="secondary-button">Atrás</button>
                        <button type="button" onClick={onCancel} className="cancel-button">Cancelar Registro</button>
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
