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
    // Props from FormularioGeneral needed for RegisterTags in preview
    tipoRegistro,
    tipoProveedor,
    selectedServices 
}) => {

    const getInitialDefaultValues = useCallback(() => {
        const initialLogo = initialData?.logoURL
            ? { file: null, preview: initialData.logoURL, isExisting: true, name: 'logo_cargado', type: 'image/existing', tempId: initialData.logoTempId || null, status: 'loaded' }
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

    const watchedAllFields = watch();
    const uploadQueueRef = useRef(new Set());

    useEffect(() => {
        scrollToTop();
        reset(getInitialDefaultValues());
        uploadQueueRef.current.clear();
    }, [initialData, reset, getInitialDefaultValues]);

    const initiateFileUpload = useCallback(({ file, tempId, type, itemIndex }) => {
        if (!file || !tempId) {
            return;
        }
        if (uploadQueueRef.current.has(tempId)) {
            return;
        }
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
        const watchedLogoFileValue = getValues('logoFile'); // Use getValues for latest
        if (watchedLogoFileValue?.tempId && fileUploadProgress[watchedLogoFileValue.tempId]) {
            const progress = fileUploadProgress[watchedLogoFileValue.tempId];
            if (progress.status === 'success' && watchedLogoFileValue.status !== 'loaded') {
                setValue('logoFile', { ...watchedLogoFileValue, preview: progress.finalUrl, file: null, isExisting: true, status: 'loaded' }, { shouldValidate: true, shouldDirty: true });
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
        const currentValues = getValues();
        return {
            descripcion: currentValues.descripcion,
            sitioWeb: currentValues.sitioWeb,
            whatsapp: currentValues.whatsapp,
            telefono: currentValues.telefono,
            email: currentValues.email,
            marca: currentValues.marcasSeleccionadas || [],
            extras: currentValues.extrasSeleccionados || [],
            logoURL: currentValues.logoFile?.status === 'loaded' ? currentValues.logoFile.preview : (initialData?.logoURL || ''),
            carruselURLs: (currentValues.carruselMediaItems || [])
                .filter(item => item.status === 'loaded' && item.url)
                .map(item => ({
                    url: item.url,
                    fileType: item.fileType,
                    mimeType: item.mimeType,
                    tempId: item.tempId
                })),
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

    const buildPreviewData = (currentFormData) => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        
        let logoForPreview = currentFormData.logoFile?.preview || null;
        if (currentFormData.logoFile?.status === 'loaded') {
            logoForPreview = currentFormData.logoFile.preview;
        } else if (currentFormData.logoFile?.tempId && fileUploadProgress[currentFormData.logoFile.tempId]?.status === 'success') {
            logoForPreview = fileUploadProgress[currentFormData.logoFile.tempId].finalUrl;
        }

        const carruselForPreview = (currentFormData.carruselMediaItems || [])
            .map(item => {
                let urlForPreview = item.url;
                if (item.status === 'loaded') {
                    urlForPreview = item.url;
                } else if (item.tempId && fileUploadProgress[item.tempId]?.status === 'success') {
                    urlForPreview = fileUploadProgress[item.tempId].finalUrl;
                }
                return { url: urlForPreview, fileType: item.fileType, mimeType: item.mimeType, status: item.status };
            })
            .filter(item => item.url && item.status !== 'error_upload' && item.status !== 'removed');

        return {
            tipoRegistro,     // Added for RegisterTags
            tipoProveedor,    // Added for RegisterTags
            selectedServices, // Added for RegisterTags
            nombre: nombreProveedor, 
            ubicacionDetalle,
            descripcion: currentFormData.descripcion,
            marca: currentFormData.marcasSeleccionadas,
            extras: currentFormData.extrasSeleccionados,
            logoPreview: logoForPreview,
            carrusel: carruselForPreview,
            sitioWeb: currentFormData.sitioWeb,
            whatsapp: currentFormData.whatsapp,
            telefono: currentFormData.telefono,
            email: currentFormData.email,
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
                setValue('logoFile.status', 'removed', { shouldDirty: true });
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
                        // Pass optionLabelKey and optionIdKey if marcasOpciones are objects
                        // optionLabelKey="nombre" 
                        // optionIdKey="id" 
                    />

                    <AutocompleteSection
                        rhfName="extrasSeleccionados"
                        control={control}
                        errors={errors}
                        options={extrasOpciones}
                        label="Extras que ofrecés"
                        // Pass optionLabelKey and optionIdKey if extrasOpciones are objects
                        // optionLabelKey="nombre"
                        // optionIdKey="id"
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
