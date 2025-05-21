import React, { useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';

const LIMITE_CARRUSEL = 7;
const DESCRIPCION_MAX_LENGTH = 1600;


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
                // Revocar blob URL anterior si existía y era nueva
                if (field.value && typeof field.value.preview === 'string' && field.value.preview.startsWith('blob:') && !field.value.isExisting) {
                    URL.revokeObjectURL(field.value.preview);
                }
                field.onChange({
                    file: file, // El objeto File
                    preview: URL.createObjectURL(file), // Blob URL para preview local
                    name: file.name,
                    type: file.type,
                    isExisting: false // Marcar como nuevo
                });
            }
        } else { // Para carrusel
            const espaciosDisponibles = limit - currentFilesCount;
            const archivosAAgregar = acceptedFiles.slice(0, espaciosDisponibles);

            if (archivosAAgregar.length > 0) {
                const nuevosMediaItems = archivosAAgregar.map(file => ({
                    file: file, // El objeto File
                    url: URL.createObjectURL(file), // Blob URL para preview local
                    fileType: file.type.startsWith('video/') ? 'video' : 'image',
                    mimeType: file.type,
                    name: file.name,
                    isExisting: false // Marcar como nuevo
                }));
                // Limpiar blobs de items que se están reemplazando (si aplica, no es común en append)
                const currentItems = field.value || [];
                field.onChange([...currentItems, ...nuevosMediaItems]);
            }
            if (acceptedFiles.length > archivosAAgregar.length) {
                alert(`Solo se agregarán ${archivosAAgregar.length} de ${acceptedFiles.length} archivos debido al límite de ${limit}.`);
            }
        }
    }, [field, isLogo, multiple, limit, currentFilesCount, processedAccept]);


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: processedAccept,
        multiple,
        maxFiles: isLogo ? maxFiles : undefined, // maxFiles solo aplica si no es múltiple (para el logo)
        onDrop
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
    selectedServices = [],
    tipoProveedor = [],
    tipoRegistro = '',
    initialData, // Viene de RegistrosProveedorNavigator.formData.datosPersonalizados.tipoA
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
        // Cargar logoURL de initialData si existe (URL de Firebase)
        const initialLogo = initialData?.logoURL
            ? { file: null, preview: initialData.logoURL, isExisting: true, name: 'logo_cargado', type: 'image/existing' }
            : null;

        // Cargar carruselURLs de initialData si existen (URLs de Firebase)
        const initialCarruselItems = (initialData?.carruselURLs || []).map(media => ({
            file: null,
            url: media.url,
            fileType: media.fileType || (media.url.includes('.mp4') || media.url.includes('.mov') ? 'video' : 'image'), // Inferir si no está
            mimeType: media.mimeType || '',
            isExisting: true,
            name: 'media_cargado'
        }));

        return {
            descripcion: initialData?.descripcion || '',
            sitioWeb: initialData?.sitioWeb || '',
            whatsapp: initialData?.whatsapp || '',
            telefono: initialData?.telefono || '',
            email: initialData?.email || '',
            marcasSeleccionadas: Array.isArray(initialData?.marca) ? initialData.marca : [],
            extrasSeleccionados: Array.isArray(initialData?.extras) ? initialData.extras : [],
            logoFile: initialLogo, // Este es el campo del formulario para el logo
            carruselMediaItems: initialCarruselItems, // Campo para el carrusel
        };
    }, [initialData]);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors }, register, getValues } = useForm({
        defaultValues: getInitialDefaultValues(),
        mode: 'onBlur',
    });

    const watchedLogoFile = watch('logoFile');
    const watchedCarruselMediaItems = watch('carruselMediaItems', []); // Default a array vacío
    const watchedAllFields = watch();

    useEffect(() => {
        scrollToTop();
        reset(getInitialDefaultValues());
    }, [initialData, reset, getInitialDefaultValues]);

    // Limpieza de Blob URLs
    useEffect(() => {
        const logo = getValues("logoFile");
        const carrusel = getValues("carruselMediaItems");

        return () => {
            if (logo && logo.preview && logo.preview.startsWith('blob:') && !logo.isExisting) {
                URL.revokeObjectURL(logo.preview);
            }
            (carrusel || []).forEach(item => {
                if (item.url && item.url.startsWith('blob:') && !item.isExisting) {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [getValues]);


    const prepareSubmitData = (dataFromForm) => {
        // Procesar logo
        const logoEsNuevo = dataFromForm.logoFile && dataFromForm.logoFile.file instanceof File && !dataFromForm.logoFile.isExisting;
        const logoAEnviar = logoEsNuevo ? dataFromForm.logoFile.file : null;
        const logoUrlExistenteAEnviar = dataFromForm.logoFile?.isExisting ? dataFromForm.logoFile.preview : null;

        // Procesar carrusel
        const carruselNuevosArchivos = (dataFromForm.carruselMediaItems || [])
            .filter(item => item.file instanceof File && !item.isExisting)
            .map(item => item.file);

        const carruselUrlsExistentes = (dataFromForm.carruselMediaItems || [])
            .filter(item => item.isExisting && item.url) // Solo las que son existentes y tienen URL
            .map(item => ({ url: item.url, fileType: item.fileType, mimeType: item.mimeType }));
        
        return {
            descripcion: dataFromForm.descripcion,
            sitioWeb: dataFromForm.sitioWeb,
            whatsapp: dataFromForm.whatsapp,
            telefono: dataFromForm.telefono,
            email: dataFromForm.email,
            marca: dataFromForm.marcasSeleccionadas || [],
            extras: dataFromForm.extrasSeleccionados || [],
            logoFile: logoAEnviar, // Solo el File object si es nuevo
            logoUrlExistente: logoUrlExistenteAEnviar, // Solo la URL si era existente
            carruselNuevosArchivos: carruselNuevosArchivos,
            carruselUrlsExistentes: carruselUrlsExistentes,
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
        // Para el preview, usamos 'preview' del logoFile o 'url' de carruselMediaItems
        const logoForPreview = currentFormData.logoFile?.preview || null;
        const carruselForPreview = (currentFormData.carruselMediaItems || []).map(item => ({
            url: item.url || item.preview, // item.url para carrusel, item.preview para el logo
            fileType: item.fileType,
            mimeType: item.mimeType,
        }));

        return {
            selectedServices: selectedServices,
            tipoProveedor: tipoProveedor,
            tipoRegistro: tipoRegistro,
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
            descripcion: currentFormData.descripcion,
            marca: currentFormData.marcasSeleccionadas,
            extras: currentFormData.extrasSeleccionados,
            logoPreview: logoForPreview, // Prop para CardHistoriaPreview
            carrusel: carruselForPreview, // Prop para CardHistoriaPreview
            sitioWeb: currentFormData.sitioWeb,
            whatsapp: currentFormData.whatsapp,
            telefono: currentFormData.telefono,
            email: currentFormData.email,
        };
    };
    const previewData = buildPreviewData(watchedAllFields);

    const handleRemoveLogo = () => {
        const currentLogo = getValues("logoFile");
        if (currentLogo && currentLogo.preview && currentLogo.preview.startsWith('blob:') && !currentLogo.isExisting) {
            URL.revokeObjectURL(currentLogo.preview);
        }
        setValue('logoFile', null, { shouldValidate: true, shouldDirty: true });
    };

    const handleRemoveCarruselItem = (indexToRemove) => {
        const currentItems = getValues("carruselMediaItems") || [];
        const itemToRemove = currentItems[indexToRemove];

        if (itemToRemove && itemToRemove.url && itemToRemove.url.startsWith('blob:') && !itemToRemove.isExisting) {
            URL.revokeObjectURL(itemToRemove.url);
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
                        {watchedLogoFile?.preview && (
                            <div className="logo-preview-container">
                                <img src={watchedLogoFile.preview} alt={watchedLogoFile.name || "Vista previa del Logo"} />
                                <button type="button" onClick={handleRemoveLogo} className="remove-button"><FaTimes /></button>
                            </div>
                        )}
                        <Controller
                            name="logoFile"
                            control={control}
                            rules={{
                                validate: {
                                    fileType: value => {
                                        if (value && value.file instanceof File && !value.isExisting) { // Validar el 'file'
                                            return value.file.type.startsWith('image/') || 'Solo se permiten imágenes para el logo.';
                                        }
                                        return true;
                                    }
                                }
                            }}
                            render={({ field }) => (
                                <FileUploaderRHF
                                    field={field}
                                    multiple={false}
                                    acceptProp="image/*"
                                    label={field.value?.preview ? "Cambiar logo" : "Arrastra tu logo aquí o haz clic"}
                                    isLogo={true}
                                    maxFiles={1}
                                />
                            )}
                        />
                        {errors.logoFile && <FormHelperText error>{errors.logoFile.message || errors.logoFile.type}</FormHelperText>}
                    </div>

                    <div className="form-section">
                        <InputLabel htmlFor="carrusel-uploader" error={!!errors.carruselMediaItems}>
                            Carrusel Multimedia (Imágenes y Videos, máx. {LIMITE_CARRUSEL})
                        </InputLabel>
                        {(watchedCarruselMediaItems || []).length > 0 && (
                            <div className="carrusel-previews">
                                {watchedCarruselMediaItems.map((item, index) => (
                                    <div key={item.url || item.name || index} className="carrusel-preview-item">
                                        {item.fileType === 'image' ? (
                                            <img src={item.url} alt={item.name || `Contenido ${index + 1}`} />
                                        ) : (
                                            <video controls muted style={{ width: '100%', display: 'block' }} src={item.url} type={item.mimeType}>
                                                Tu navegador no soporta video.
                                            </video>
                                        )}
                                        <button type="button" onClick={() => handleRemoveCarruselItem(index)} className="remove-button"><FaTimes /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Controller
                            name="carruselMediaItems"
                            control={control}
                            rules={{ validate: { maxItems: value => (value || []).length <= LIMITE_CARRUSEL || `No puedes exceder los ${LIMITE_CARRUSEL} ítems.` } }}
                            render={({ field }) => (
                                <FileUploaderRHF
                                    field={field}
                                    multiple={true}
                                    acceptProp="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                                    label={`Arrastra imágenes o videos (actuales: ${(field.value || []).length} de ${LIMITE_CARRUSEL})`}
                                    currentFilesCount={(field.value || []).length}
                                    limit={LIMITE_CARRUSEL}
                                    isLogo={false}
                                />
                            )}
                        />
                        {errors.carruselMediaItems && <FormHelperText error>{errors.carruselMediaItems.message || errors.carruselMediaItems.type}</FormHelperText>}
                    </div>

                    <div className="form-section">
                        <Controller
                            name="descripcion"
                            control={control}
                            rules={{ required: 'La descripción es requerida', maxLength: { value: DESCRIPCION_MAX_LENGTH, message: `Máx. ${DESCRIPCION_MAX_LENGTH} chars.` } }}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field} id="descripcion-a" label="Descripción del Proveedor *"
                                    multiline rows={5} variant="outlined" fullWidth
                                    placeholder="Describe tu empresa, historia, valores..."
                                    error={!!error}
                                    helperText={error ? error.message : `${(field.value || '').length}/${DESCRIPCION_MAX_LENGTH}`}
                                    inputProps={{ maxLength: DESCRIPCION_MAX_LENGTH }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}
                        />
                    </div>

                    <div className="form-section">
                        <Controller name="marcasSeleccionadas" control={control}
                            render={({ field }) => (
                                <Autocomplete multiple id="marcas-tags" options={marcasOpciones}
                                    value={field.value || []} onChange={(event, newValue) => field.onChange(newValue)}
                                    getOptionLabel={(option) => typeof option === 'string' ? option : ''}
                                    isOptionEqualToValue={(option, value) => option === value} filterSelectedOptions
                                    renderInput={(params) => (
                                        <TextField {...params} variant="outlined" label="Marcas que trabajás"
                                            placeholder="Escribí o seleccioná" error={!!errors.marcasSeleccionadas}
                                            helperText={errors.marcasSeleccionadas?.message} InputLabelProps={{ shrink: true }} />
                                    )}
                                    renderTags={(value, getTagProps) => value.map((option, index) => <Chip key={option+index} label={option} {...getTagProps({ index })} sx={{ margin: '2px' }} />)} />
                            )} />
                    </div>

                    <div className="form-section">
                        <Controller name="extrasSeleccionados" control={control}
                            render={({ field }) => (
                                <Autocomplete multiple id="extras-tags" options={extrasOpciones}
                                    value={field.value || []} onChange={(event, newValue) => field.onChange(newValue)}
                                    getOptionLabel={(option) => typeof option === 'string' ? option : ''}
                                    isOptionEqualToValue={(option, value) => option === value} filterSelectedOptions
                                    renderInput={(params) => (
                                        <TextField {...params} variant="outlined" label="Extras que ofrecés"
                                            placeholder="Escribí o seleccioná" error={!!errors.extrasSeleccionados}
                                            helperText={errors.extrasSeleccionados?.message} InputLabelProps={{ shrink: true }} />
                                    )}
                                    renderTags={(value, getTagProps) => value.map((option, index) => <Chip key={option+index} label={option} {...getTagProps({ index })} sx={{ margin: '4px 4px 0 0' }} />)} />
                            )} />
                    </div>

                    <div className="form-section">
                        <h3>Información de Contacto (Visible en la Card)</h3>
                        <div className="form-field-html-group">
                            <label htmlFor="sitioWeb_contact">Sitio Web</label>
                            <input id="sitioWeb_contact" type="url" placeholder="https://..."
                                {...register('sitioWeb', { pattern: { value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i, message: "URL inválida" } })}
                                className={errors.sitioWeb ? 'input-error' : ''} />
                            {errors.sitioWeb && <span style={errorSpanStyle}>{errors.sitioWeb.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="whatsapp_contact">WhatsApp</label>
                            <input id="whatsapp_contact" type="text" placeholder="Ej: +54 9 11..."
                                {...register('whatsapp')} className={errors.whatsapp ? 'input-error' : ''} />
                            {errors.whatsapp && <span style={errorSpanStyle}>{errors.whatsapp.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="telefono_contact">Teléfono Fijo (Opcional)</label>
                            <input id="telefono_contact" type="tel" placeholder="Teléfono"
                                {...register('telefono')} className={errors.telefono ? 'input-error' : ''} />
                            {errors.telefono && <span style={errorSpanStyle}>{errors.telefono.message}</span>}
                        </div>
                        <div className="form-field-html-group">
                            <label htmlFor="email_contact">Email de Contacto Público</label>
                            <input id="email_contact" type="email" placeholder="Email"
                                {...register('email', { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email inválido" } })}
                                className={errors.email ? 'input-error' : ''} />
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