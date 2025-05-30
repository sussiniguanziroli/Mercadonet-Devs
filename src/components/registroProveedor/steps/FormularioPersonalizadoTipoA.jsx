// src/components/registroProveedor/steps/FormularioPersonalizadoTipoA.jsx
import React, { useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';

import LogoUploadSection from './formSections/LogoUploadSection';
import CarruselUploadSection from './formSections/CarruselUploadSection';
import TextFieldSection from './formSections/TextFieldSection';
import AutocompleteSection from './formSections/AutocompleteSection';
import ContactoFieldsSection from './formSections/ContactoFieldsSection';

const LIMITE_CARRUSEL_A = 7;
const DESCRIPCION_MAX_LENGTH_A = 1600;

const FormularioPersonalizadoTipoA = ({
    initialData, // This is formData.datosPersonalizados.tipoA from Navigator
    onNext,
    onBack,
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

    const getInitialDefaultValues = useCallback(() => {
        // initialData.logo is now an object { url, tempPath, fileType, mimeType, tempId, status } or null
        const initialLogoRHF = initialData?.logo 
            ? { 
                file: null, 
                preview: initialData.logo.url, 
                isExisting: true, 
                name: 'logo_cargado', 
                type: initialData.logo.mimeType || 'image/existing',
                tempId: initialData.logo.tempId || null, 
                status: initialData.logo.status || 'loaded',
              }
            : null;

        // initialData.carruselURLs is an array of objects { url, tempPath, fileType, mimeType, tempId, status }
        const initialCarruselItemsRHF = (initialData?.carruselURLs || []).map(media => ({
            file: null, 
            url: media.url, 
            fileType: media.fileType,
            mimeType: media.mimeType, 
            isExisting: true, 
            name: 'media_cargado', 
            tempId: media.tempId || null, 
            status: media.status || 'loaded',
        }));

        return {
            descripcion: initialData?.descripcion || '',
            sitioWeb: initialData?.sitioWeb || '',
            whatsapp: initialData?.whatsapp || '',
            telefono: initialData?.telefono || '',
            email: initialData?.email || '',
            marcasSeleccionadas: Array.isArray(initialData?.marca) ? initialData.marca : (Array.isArray(initialData?.marcasConfiguradas) ? initialData.marcasConfiguradas : []),
            extrasSeleccionados: Array.isArray(initialData?.extras) ? initialData.extras : (Array.isArray(initialData?.extrasConfigurados) ? initialData.extrasConfigurados : []),
            logoFile: initialLogoRHF,
            carruselMediaItems: initialCarruselItemsRHF,
        };
    }, [initialData]);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors }, register, getValues } = useForm({
        defaultValues: getInitialDefaultValues(),
        mode: 'onBlur',
    });

    const watchedAllFields = watch();
    const uploadQueueRef = useRef(new Set());

    useEffect(() => {
        scrollToTop();
        reset(getInitialDefaultValues());
        uploadQueueRef.current.clear();
    }, [initialData, reset, getInitialDefaultValues]);

    const initiateFileUpload = useCallback(({ file, tempId, type, itemIndex }) => {
        if (!file || !tempId) return;
        if (uploadQueueRef.current.has(tempId)) return;
        uploadQueueRef.current.add(tempId);

        let pathPrefix = '';
        let metadata = { tempId };
        let rhfPathForStatusUpdate = '';

        if (type === 'logo') {
            pathPrefix = 'proveedores/tipoA/logos';
            metadata.fieldType = 'logoFile';
            rhfPathForStatusUpdate = 'logoFile.status';
        } else if (type === 'carrusel') {
            pathPrefix = 'proveedores/tipoA/carrusel';
            metadata.fieldType = 'carruselMediaItems';
            const currentItems = getValues('carruselMediaItems');
            const targetItemIndex = currentItems.findIndex(it => it.tempId === tempId);
            if (targetItemIndex > -1) {
                 rhfPathForStatusUpdate = `carruselMediaItems.${targetItemIndex}.status`;
            }
        }
        
        if (rhfPathForStatusUpdate) {
            setValue(rhfPathForStatusUpdate, 'initiating_upload', { shouldDirty: true });
        }
        uploadFileImmediately(file, tempId, pathPrefix, metadata);

    }, [uploadFileImmediately, setValue, getValues]);
    
    useEffect(() => {
        const watchedLogoFileValue = getValues('logoFile'); 
        if (watchedLogoFileValue?.tempId && fileUploadProgress[watchedLogoFileValue.tempId]) {
            const progress = fileUploadProgress[watchedLogoFileValue.tempId];
            if (progress.status === 'success' && watchedLogoFileValue.status !== 'loaded') {
                setValue('logoFile', { 
                    ...watchedLogoFileValue, 
                    preview: progress.finalUrl, 
                    // tempPath: progress.storagePath, // Navigator handles this via handleFileUploaded
                    file: null, 
                    isExisting: true, 
                    status: 'loaded',
                    type: progress.mimeTypeOriginal || watchedLogoFileValue.type // Store mimeType
                }, { shouldValidate: true, shouldDirty: true });
                uploadQueueRef.current.delete(watchedLogoFileValue.tempId);
            } else if (progress.status === 'error' && watchedLogoFileValue.status !== 'error_upload') {
                setValue('logoFile.status', 'error_upload', { shouldValidate: true, shouldDirty: true });
                uploadQueueRef.current.delete(watchedLogoFileValue.tempId);
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
                    return { 
                        ...item, 
                        url: progress.finalUrl, 
                        // tempPath: progress.storagePath, // Navigator handles this
                        fileType: progress.fileTypeOriginal || item.fileType,
                        mimeType: progress.mimeTypeOriginal || item.mimeType,
                        file: null, 
                        isExisting: true, 
                        status: 'loaded' 
                    };
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
        }
    }, [fileUploadProgress, setValue, getValues]);

    useEffect(() => {
        return () => {
            const fieldsToClean = ['logoFile', 'carruselMediaItems'];
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
                }
            });
        };
    }, [getValues]);

    const prepareSubmitData = () => {
        const currentRHFValues = getValues();
        
        let submittedLogoData = null;
        const rhfLogo = currentRHFValues.logoFile;
        if (rhfLogo?.status === 'loaded' && rhfLogo.preview) {
            // If loaded, it means Navigator already has the full object from handleFileUploaded
            // We need to find that object in fileUploadProgress or initialData to get tempPath
            const logoProgress = fileUploadProgress[rhfLogo.tempId];
            submittedLogoData = {
                url: rhfLogo.preview, // This is the temp download URL
                tempPath: logoProgress?.storagePath || initialData?.logo?.tempPath || '',
                fileType: rhfLogo.type?.startsWith('video/') ? 'video' : 'image',
                mimeType: rhfLogo.type,
                tempId: rhfLogo.tempId,
                status: 'loaded'
            };
        } else if (initialData?.logo && rhfLogo?.status !== 'removed' && rhfLogo?.isExisting) {
             // If it was existing and not removed or failed, keep initialData.logo
            submittedLogoData = initialData.logo;
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
                    // If it was existing, not removed, and still has a URL, find it in initialData
                    const existingInitialItem = initialData?.carruselURLs?.find(i => i.tempId === item.tempId || i.url === item.url);
                    if(existingInitialItem) return existingInitialItem;
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
            marca: currentRHFValues.marcasSeleccionadas || [],
            extras: currentRHFValues.extrasSeleccionados || [],
            logo: submittedLogoData, 
            carruselURLs: submittedCarruselData,
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

        return {
            tipoRegistro,
            tipoProveedor,
            selectedServices,
            nombre: nombreProveedor, 
            ubicacionDetalle,
            descripcion: currentRHFData.descripcion,
            marca: currentRHFData.marcasSeleccionadas || [], 
            extras: currentRHFData.extrasSeleccionados || [],
            logoPreview: logoForPreview,
            carrusel: carruselForPreview,
            sitioWeb: currentRHFData.sitioWeb,
            whatsapp: currentRHFData.whatsapp,
            telefono: currentRHFData.telefono,
            email: currentRHFData.email,
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
                // No need to call deleteFileFromStorage here, Navigator handles it based on its state.
                // This component just updates its RHF state.
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

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Historia</h1>

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
                        onInitiateUpload={({ file, tempId, itemIndex }) => initiateFileUpload({ file, tempId, type: 'carrusel', itemIndex })}
                        onRemoveItem={handleRemoveCarruselItem}
                        limit={LIMITE_CARRUSEL_A}
                        sectionLabel="Carrusel Multimedia"
                    />

                    <TextFieldSection
                        rhfName="descripcion"
                        control={control}
                        errors={errors}
                        label="Descripción del Proveedor *"
                        rules={{
                            required: 'La descripción es requerida',
                            maxLength: { value: DESCRIPCION_MAX_LENGTH_A, message: `Máx. ${DESCRIPCION_MAX_LENGTH_A} caracteres.` }
                        }}
                        multiline
                        rows={5}
                        maxLength={DESCRIPCION_MAX_LENGTH_A}
                        placeholder="Describe tu empresa, historia, valores..."
                    />

                    <AutocompleteSection
                        rhfName="marcasSeleccionadas"
                        control={control}
                        errors={errors}
                        options={marcasOpciones}
                        label="Marcas que trabajás"
                    />

                    <AutocompleteSection
                        rhfName="extrasSeleccionados"
                        control={control}
                        errors={errors}
                        options={extrasOpciones}
                        label="Extras que ofrecés"
                    />
                    
                    <ContactoFieldsSection
                        register={register}
                        errors={errors}
                        sectionTitle="Información de Contacto (Visible en la Card)"
                        sitioWebRequired={false}
                        whatsappRequired={false}
                        emailRequired={false}
                    />

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

