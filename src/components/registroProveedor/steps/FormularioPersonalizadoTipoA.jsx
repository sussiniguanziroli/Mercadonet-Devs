import React, { useEffect, useCallback } from 'react';
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
    onCancel,
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

    const getInitialDefaultValues = useCallback((data) => ({
        descripcion: data?.descripcion || '',
        sitioWeb: data?.sitioWeb || '',
        whatsapp: data?.whatsapp || '',
        telefono: data?.telefono || '',
        email: data?.email || '',
        marcasSeleccionadas: data?.marcasSeleccionadas || [],
        extrasSeleccionados: data?.extrasSeleccionados || [],
        logoFile: data?.logo ? { ...data.logo, file: null, preview: data.logo.url, isExisting: true } : null,
        carruselMediaItems: (data?.carruselURLs || []).map(media => ({ ...media, file: null, preview: media.url, isExisting: true })),
    }), []);

    const { control, handleSubmit, watch, setValue, formState: { errors }, register, getValues, reset } = useForm({
        defaultValues: getInitialDefaultValues(initialData),
        mode: 'onBlur',
    });

    const watchedAllFields = watch();

    useEffect(() => {
        scrollToTop();
        reset(getInitialDefaultValues(initialData));
    }, [reset, getInitialDefaultValues]);

    useEffect(() => {
        const newLogoValue = getInitialDefaultValues(initialData).logoFile;
        if (JSON.stringify(newLogoValue) !== JSON.stringify(getValues('logoFile'))) {
            setValue('logoFile', newLogoValue, { shouldValidate: true, shouldDirty: true });
        }
    }, [initialData?.logo, setValue, getValues, getInitialDefaultValues]);

    useEffect(() => {
        const newCarruselValue = getInitialDefaultValues(initialData).carruselMediaItems;
        if (JSON.stringify(newCarruselValue) !== JSON.stringify(getValues('carruselMediaItems'))) {
            setValue('carruselMediaItems', newCarruselValue, { shouldValidate: true, shouldDirty: true });
        }
    }, [initialData?.carruselURLs, setValue, getValues, getInitialDefaultValues]);

    const prepareSubmitData = () => {
        const currentData = getValues();
        
        const logoObject = currentData.logoFile ? { ...currentData.logoFile, url: currentData.logoFile.preview || currentData.logoFile.url } : null;
        if (logoObject) delete logoObject.file;

        const carruselObjects = (currentData.carruselMediaItems || []).map(item => {
             const newItem = { ...item, url: item.url || item.preview };
             delete newItem.file;
             return newItem;
        });
        
        return {
            descripcion: currentData.descripcion,
            sitioWeb: currentData.sitioWeb,
            whatsapp: currentData.whatsapp,
            telefono: currentData.telefono,
            email: currentData.email,
            marcasSeleccionadas: currentData.marcasSeleccionadas,
            extrasSeleccionados: currentData.extrasSeleccionados,
            logo: logoObject,
            carruselURLs: carruselObjects,
        };
    };

    const onSubmit = () => onNext(prepareSubmitData());
    const handleBack = () => onBack(prepareSubmitData());

    const buildPreviewData = (currentRHFData) => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        const logoForPreview = currentRHFData.logoFile?.preview || null;
        const carruselForPreview = (currentRHFData.carruselMediaItems || []).map(item => ({ url: item.url || item.preview, fileType: item.fileType })).filter(item => item.url);

        return {
            tipoRegistro, tipoProveedor, selectedServices,
            nombre: nombreProveedor, ubicacionDetalle,
            descripcion: currentRHFData.descripcion,
            marca: currentRHFData.marcasSeleccionadas,
            extras: currentRHFData.extrasSeleccionados,
            logoPreview: logoForPreview, carrusel: carruselForPreview,
            sitioWeb: currentRHFData.sitioWeb, whatsapp: currentRHFData.whatsapp,
            telefono: currentRHFData.telefono, email: currentRHFData.email,
        };
    };

    const previewData = buildPreviewData(watchedAllFields);

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Historia</h1>
                    <LogoUploadSection control={control} errors={errors} rhfName="logoFile" watchedValue={watch('logoFile')} fileUploadProgress={fileUploadProgress} onInitiateUpload={({ file, tempId }) => uploadFileImmediately(file, tempId, 'logos', { fieldType: 'logoFile' })} onRemove={() => setValue('logoFile', null, { shouldDirty: true })} sectionLabel="Logo"/>
                    <CarruselUploadSection control={control} errors={errors} rhfName="carruselMediaItems" watchedValue={watch('carruselMediaItems')} fileUploadProgress={fileUploadProgress} onInitiateUpload={({ file, tempId }) => uploadFileImmediately(file, tempId, 'carrusel', { fieldType: 'carruselMediaItems' })} onRemoveItem={(index) => setValue('carruselMediaItems', getValues('carruselMediaItems').filter((_, i) => i !== index), { shouldDirty: true })} limit={LIMITE_CARRUSEL_A} sectionLabel="Carrusel Multimedia"/>
                    <TextFieldSection rhfName="descripcion" control={control} errors={errors} label="Descripción del Proveedor *" rules={{ required: 'La descripción es requerida', maxLength: { value: DESCRIPCION_MAX_LENGTH_A, message: `Máx. ${DESCRIPCION_MAX_LENGTH_A} caracteres.` } }} multiline rows={5} maxLength={DESCRIPCION_MAX_LENGTH_A} placeholder="Describe tu empresa, historia, valores..."/>
                    <AutocompleteSection rhfName="marcasSeleccionadas" control={control} errors={errors} options={marcasOpciones} label="Marcas que trabajás" multiple />
                    <AutocompleteSection rhfName="extrasSeleccionados" control={control} errors={errors} options={extrasOpciones} label="Extras que ofrecés" multiple />
                    <ContactoFieldsSection register={register} errors={errors} sectionTitle="Información de Contacto (Visible en la Card)" />
                    <div className="botones-navegacion">
                        <button type="button" onClick={handleBack} className="secondary-button">Atrás</button>
                        <button type="button" onClick={onCancel} className="cancel-button">Cancelar Registro</button>
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
