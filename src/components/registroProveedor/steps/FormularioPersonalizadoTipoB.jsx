import React, { useEffect, useCallback } from 'react';
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

    const getInitialDefaultValues = useCallback((data) => {
        const initialLogoRHF = data?.logo ? { file: null, preview: data.logo.url, isExisting: true, name: 'logo_cargado', type: data.logo.mimeType, tempId: data.logo.tempId, status: data.logo.status || 'loaded' } : null;
        const initialCarruselItemsRHF = (data?.carruselURLs || []).map(media => ({ file: null, url: media.url, fileType: media.fileType, mimeType: media.mimeType, isExisting: true, name: 'media_cargado', tempId: media.tempId, status: media.status || 'loaded' }));
        const initialGaleriaRHF = Array(LIMITE_GALERIA_PRODUCTOS_B).fill(null).map((_, index) => {
            const productData = data?.galeria?.[index];
            return productData ? {
                titulo: productData.titulo || '',
                precio: productData.precio || '',
                imagenFile: (productData.url || productData.imagenURL) ? { file: null, preview: productData.url || productData.imagenURL, isExisting: true, name: `prod_cargado`, type: productData.mimeType, tempId: productData.tempId, status: productData.status || 'loaded' } : null,
                ...productData
            } : { imagenFile: null, titulo: '', precio: '' };
        });

        return {
            descripcion: data?.descripcion || '',
            sitioWeb: data?.sitioWeb || '',
            whatsapp: data?.whatsapp || '',
            telefono: data?.telefono || '',
            email: data?.email || '',
            marcasSeleccionadas: data?.marcasSeleccionadas || [],
            extrasSeleccionados: data?.extrasSeleccionados || [],
            logoFile: initialLogoRHF,
            carruselMediaItems: initialCarruselItemsRHF,
            galeria: initialGaleriaRHF,
        };
    }, []);

    const { control, handleSubmit, watch, setValue, formState: { errors }, register, getValues, reset } = useForm({
        defaultValues: getInitialDefaultValues(initialData),
        mode: 'onBlur',
    });

    const { fields: galeriaFields } = useFieldArray({ control, name: "galeria" });
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

    useEffect(() => {
        const newGaleriaValue = getInitialDefaultValues(initialData).galeria;
        if (JSON.stringify(newGaleriaValue) !== JSON.stringify(getValues('galeria'))) {
            setValue('galeria', newGaleriaValue, { shouldValidate: true, shouldDirty: true });
        }
    }, [initialData?.galeria, setValue, getValues, getInitialDefaultValues]);

    const prepareSubmitData = () => {
        const currentData = getValues();
        
        const transformedGaleria = currentData.galeria.map(g => {
            const imageUrl = g.imagenFile?.preview || g.imagenFile?.url || g.url || g.imagenURL || null;
            return {
                titulo: g.titulo,
                precio: g.precio,
                url: imageUrl,
                imagenURL: imageUrl,
                tempPath: g.imagenFile?.tempPath || g.tempPath,
                fileType: 'image',
                mimeType: g.imagenFile?.type || g.mimeType,
                tempId: g.imagenFile?.tempId || g.tempId,
                status: g.imagenFile?.status || g.status,
            };
        }).filter(g => g.titulo || g.precio || g.url);

        const logoObject = currentData.logoFile ? {
            url: currentData.logoFile.preview || currentData.logoFile.url,
            tempPath: currentData.logoFile.tempPath,
            fileType: 'image',
            mimeType: currentData.logoFile.type,
            tempId: currentData.logoFile.tempId,
            status: currentData.logoFile.status,
        } : null;

        const carruselObjects = (currentData.carruselMediaItems || []).map(item => ({
             url: item.url || item.preview,
             tempPath: item.tempPath,
             fileType: item.fileType,
             mimeType: item.mimeType,
             tempId: item.tempId,
             status: item.status,
        }));

        return {
            ...currentData,
            logo: logoObject,
            carruselURLs: carruselObjects,
            galeria: transformedGaleria,
        };
    };

    const onSubmit = () => onNext(prepareSubmitData());
    const handleBack = () => onBack(prepareSubmitData());

    const buildPreviewData = (currentRHFData) => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        const logoForPreview = currentRHFData.logoFile?.preview || null;
        const carruselForPreview = (currentRHFData.carruselMediaItems || []).map(item => ({ url: item.url || item.preview, fileType: item.fileType })).filter(item => item.url);
        const galeriaForPreview = (currentRHFData.galeria || []).map(item => ({ titulo: item.titulo, precio: item.precio ? `$${item.precio}` : '', imagenPreview: item.imagenFile?.preview || null })).filter(p => p.titulo || p.precio || p.imagenPreview);

        return {
            tipoRegistro, tipoProveedor, selectedServices,
            nombre: nombreProveedor, ubicacionDetalle,
            descripcion: currentRHFData.descripcion,
            marcas: currentRHFData.marcasSeleccionadas,
            servicios: currentRHFData.extrasSeleccionados,
            logoPreview: logoForPreview, carrusel: carruselForPreview,
            sitioWeb: currentRHFData.sitioWeb, whatsapp: currentRHFData.whatsapp,
            telefono: currentRHFData.telefono, email: currentRHFData.email,
            galeriaProductos: galeriaForPreview,
        };
    };

    const previewData = buildPreviewData(watchedAllFields);

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Productos</h1>
                    <LogoUploadSection control={control} errors={errors} rhfName="logoFile" watchedValue={watch('logoFile')} fileUploadProgress={fileUploadProgress} onInitiateUpload={({ file, tempId }) => uploadFileImmediately(file, tempId, 'logos', { fieldType: 'logoFile' })} onRemove={() => setValue('logoFile', null, { shouldDirty: true })} sectionLabel="Logo"/>
                    <CarruselUploadSection control={control} errors={errors} rhfName="carruselMediaItems" watchedValue={watch('carruselMediaItems')} fileUploadProgress={fileUploadProgress} onInitiateUpload={({ file, tempId }) => uploadFileImmediately(file, tempId, 'carrusel', { fieldType: 'carruselMediaItems' })} onRemoveItem={(index) => setValue('carruselMediaItems', getValues('carruselMediaItems').filter((_, i) => i !== index), { shouldDirty: true })} limit={LIMITE_CARRUSEL_B} sectionLabel="Carrusel Multimedia"/>
                    <TextFieldSection rhfName="descripcion" control={control} errors={errors} label="Descripción del Negocio/Productos *" rules={{ required: 'La descripción es requerida', maxLength: { value: DESCRIPCION_MAX_LENGTH_B, message: `Máx. ${DESCRIPCION_MAX_LENGTH_B} caracteres.` } }} multiline rows={4} maxLength={DESCRIPCION_MAX_LENGTH_B} placeholder="Describe tu negocio..."/>
                    <AutocompleteSection rhfName="marcasSeleccionadas" control={control} errors={errors} options={marcasOpciones} label="Marcas que trabajás" multiple />
                    <AutocompleteSection rhfName="extrasSeleccionados" control={control} errors={errors} options={extrasOpciones} label="Extras / Servicios Adicionales" multiple />
                    <ContactoFieldsSection register={register} errors={errors} sectionTitle="Información de Contacto (Requerida para Card Productos)" sitioWebRequired={true} whatsappRequired={true} emailRequired={true}/>
                    <GaleriaProductosSection control={control} register={register} errors={errors} galeriaFields={galeriaFields} watch={watch} fileUploadProgress={fileUploadProgress} onInitiateUpload={({ file, tempId, itemIndex }) => uploadFileImmediately(file, tempId, 'galeria', { fieldType: 'galeria', arrayName: 'galeria', itemIndex })} onRemoveImage={(index) => setValue(`galeria.${index}.imagenFile`, null, { shouldDirty: true })} limiteProductos={LIMITE_GALERIA_PRODUCTOS_B} productosObligatorios={PRODUCTOS_OBLIGATORIOS_GALERIA_B}/>
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
