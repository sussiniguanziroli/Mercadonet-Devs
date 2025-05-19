import React, { useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { FaFileCirclePlus } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import { scrollToTop } from '../../../utils/scrollHelper'; // Asumiendo que esta ruta es correcta
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview'; // Asumiendo que esta ruta es correcta
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl'; // Usado para los Controller con MUI
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';

const LIMITE_CARRUSEL = 7;

// Helper para la prop 'accept' de react-dropzone
const parseAcceptString = (acceptString) => {
    if (typeof acceptString !== 'string') return acceptString; // Ya es un objeto o indefinido
    const types = acceptString.split(',');
    const parsed = {};
    types.forEach(type => {
        const trimmedType = type.trim();
        if (trimmedType) { // Asegurarse de no añadir entradas vacías si hay comas extra
            parsed[trimmedType] = [];
        }
    });
    return parsed;
};


const FileUploaderRHF = ({
    field,
    multiple = true,
    accept: acceptProp, // Renombrado para evitar conflicto con la variable interna
    maxFiles = 1,
    label = 'Arrastra archivos aquí o haz clic',
    currentFilesCount = 0,
    limit = LIMITE_CARRUSEL,
    isLogo = false,
}) => {
    const processedAccept = parseAcceptString(acceptProp);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: processedAccept,
        multiple,
        maxFiles: isLogo ? maxFiles : undefined,
        onDrop: acceptedFiles => {
            if (isLogo) {
                if (acceptedFiles.length > 0) {
                    const file = acceptedFiles[0];
                    if (field.value && typeof field.value.preview === 'string' && field.value.preview.startsWith('blob:') && !field.value.isExisting) {
                        URL.revokeObjectURL(field.value.preview);
                    }
                    const newFileObject = Object.assign(file, {
                        preview: URL.createObjectURL(file)
                    });
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
                    console.warn(`Solo se agregarán ${archivosAAgregar.length} de ${acceptedFiles.length} archivos debido al límite de ${limit}.`);
                }
            }
        }
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
            let fileType = 'image';
            let mimeType = 'image/jpeg';
            const urlString = typeof media.url === 'string' ? media.url : '';
            const extension = urlString ? urlString.split('.').pop().toLowerCase().split('?')[0] : '';

            if (media.fileType) {
                fileType = media.fileType;
                mimeType = media.mimeType || (fileType === 'video' ? `video/${extension === 'mov' ? 'quicktime' : extension}` : `image/${extension || 'jpeg'}`);
            } else if (extension) {
                if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
                    fileType = 'video';
                    mimeType = `video/${extension === 'mov' ? 'quicktime' : extension}`;
                } else if (['png', 'gif', 'bmp', 'webp', 'jpg', 'jpeg'].includes(extension)) {
                    mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
                    fileType = 'image';
                }
            }
            return { url: media.url, fileType, mimeType, file: null, isExisting: true };
        });

        return {
            descripcion: initialData?.descripcion || '',
            sitioWeb: initialData?.sitioWeb || '',
            whatsapp: initialData?.whatsapp || '',
            telefono: initialData?.telefono || '',
            email: initialData?.email || '',
            marcasSeleccionadas: Array.isArray(initialData?.marca) ? initialData.marca : [],
            extrasSeleccionados: Array.isArray(initialData?.extras) ? initialData.extras : [],
            logoFile: initialLogoFile,
            carruselMediaItems: initialCarruselItems,
        };
    }, [initialData]);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors }, register, getValues } = useForm({ // Añadido register y getValues
        defaultValues: getInitialDefaultValues(),
        mode: 'onBlur',
    });

    const watchedLogoFile = watch('logoFile');
    const watchedCarruselMediaItems = watch('carruselMediaItems');
    const watchedAllFields = watch();

    useEffect(() => {
        scrollToTop();
        reset(getInitialDefaultValues());
    }, [initialData, reset, getInitialDefaultValues]);

    useEffect(() => {
        const currentLogo = getValues("logoFile"); // Usar getValues para obtener el valor actual en el momento de la limpieza
        const currentCarrusel = getValues("carruselMediaItems");

        const logoPreviewToRevoke = currentLogo?.preview;
        const carruselPreviewsToRevoke = (currentCarrusel || []).map(item => item.url);

        return () => {
            if (logoPreviewToRevoke && logoPreviewToRevoke.startsWith('blob:') && !currentLogo?.isExisting) {
                URL.revokeObjectURL(logoPreviewToRevoke);
            }
            carruselPreviewsToRevoke.forEach(url => {
                if (url && url.startsWith('blob:')) {
                    const item = (currentCarrusel || []).find(i => i.url === url);
                    if (item && !item.isExisting) {
                        URL.revokeObjectURL(url);
                    }
                }
            });
        };
    }, [getValues]); // Depender de getValues (o una referencia estable si es posible)


    const onSubmit = (data) => {
        const nuevosArchivosCarrusel = (data.carruselMediaItems || [])
            .filter(item => item.file instanceof File && !item.isExisting)
            .map(item => item.file);

        const urlsCarruselExistentes = (data.carruselMediaItems || [])
            .filter(item => item.isExisting || (!item.file && item.url))
            .map(item => ({ url: item.url, fileType: item.fileType, mimeType: item.mimeType }));

        const stepData = {
            descripcion: data.descripcion,
            sitioWeb: data.sitioWeb,
            whatsapp: data.whatsapp,
            telefono: data.telefono,
            email: data.email,
            marca: data.marcasSeleccionadas,
            extras: data.extrasSeleccionados,
            logoFile: data.logoFile instanceof File && !data.logoFile.isExisting ? data.logoFile : null,
            logoUrlExistente: data.logoFile?.isExisting ? data.logoFile.preview : null,
            carruselNuevosArchivos: nuevosArchivosCarrusel,
            carruselUrlsExistentes: urlsCarruselExistentes,
        };
        onNext(stepData);
    };

    const buildPreviewData = (currentFormData) => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        const logoForPreview = currentFormData.logoFile?.preview || null;
        const carruselForPreview = (currentFormData.carruselMediaItems || []).map(item => ({
            url: item.url || item.preview,
            fileType: item.fileType,
            mimeType: item.mimeType,
        }));

        return {
            selectedServices: selectedServices,
            tipoProveedor: tipoProveedor,
            tipoRegistro, tipoRegistro,
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
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
        setValue('logoFile', null);
    };

    const handleRemoveCarruselItem = (indexToRemove) => {
        const currentItems = watchedCarruselMediaItems || [];
        const newItems = currentItems.filter((_, i) => i !== indexToRemove);
        setValue('carruselMediaItems', newItems);
    };

    

    const handleBack = () => {
        const currentData = getValues();
        onBack(currentData);
    };

    // Estilo para los mensajes de error de los inputs HTML
    const errorSpanStyle = {
        color: '#d32f2f', // Color de error de MUI por defecto
        fontSize: '0.75rem',
        marginTop: '3px',
        display: 'block' // Para que ocupe su propia línea
    };

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Personaliza tu Card Historia</h1>

                    {/* SECCIÓN LOGO (Sin cambios respecto a tu última versión buena) */}
                    <div className="form-section">
                        <InputLabel htmlFor="logo-uploader" error={!!errors.logoFile}>Logo</InputLabel>
                        {watchedLogoFile?.preview && (
                            <div className="logo-preview-container">
                                <img src={watchedLogoFile.preview} alt="Vista previa del Logo" />
                                <button type="button" onClick={handleRemoveLogo} className="remove-button">
                                    <FaTimes />
                                </button>
                            </div>
                        )}
                        <Controller
                            name="logoFile"
                            control={control}
                            rules={{
                                validate: {
                                    fileType: value => {
                                        if (value && value instanceof File && !value.isExisting) {
                                            return value.type.startsWith('image/') || 'Solo se permiten imágenes para el logo.';
                                        }
                                        return true;
                                    }
                                }
                            }}
                            render={({ field }) => (
                                <FileUploaderRHF
                                    field={field}
                                    multiple={false}
                                    acceptProp="image/*" // Usar acceptProp
                                    label={watchedLogoFile?.preview ? "Cambiar logo" : "Arrastra tu logo aquí o haz clic"}
                                    isLogo={true}
                                    maxFiles={1}
                                />
                            )}
                        />
                        {errors.logoFile && <FormHelperText error>{errors.logoFile.message}</FormHelperText>}
                    </div>

                    {/* SECCIÓN CARRUSEL (Sin cambios respecto a tu última versión buena) */}
                    <div className="form-section">
                        <InputLabel  htmlFor="carrusel-uploader" error={!!errors.carruselMediaItems}>
                            Carrusel Multimedia (Imágenes y Videos, máx. {LIMITE_CARRUSEL})
                        </InputLabel>
                        {(watchedCarruselMediaItems || []).length > 0 && (
                            <div className="carrusel-previews">
                                {(watchedCarruselMediaItems).map((item, index) => (
                                    <div key={item.url + '-' + index} className="carrusel-preview-item">
                                        {item.fileType === 'image' ? (
                                            <img src={item.url || item.preview} alt={`Contenido ${index + 1}`} />
                                        ) : (
                                            <video controls muted style={{ width: '100%', display: 'block' }}>
                                                <source src={item.url || item.preview} type={item.mimeType} />
                                                Tu navegador no soporta video.
                                            </video>
                                        )}
                                        <button type="button" onClick={() => handleRemoveCarruselItem(index)} className="remove-button">
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Controller
                            name="carruselMediaItems"
                            control={control}
                            rules={{
                                validate: {
                                    maxItems: value => (value && value.length <= LIMITE_CARRUSEL) || `No puedes exceder los ${LIMITE_CARRUSEL} ítems.`,
                                }
                            }}
                            render={({ field }) => (
                                <FileUploaderRHF
                                
                                    field={field}
                                    multiple={true}
                                    acceptProp="image/*,video/mp4,video/webm,video/ogg,video/quicktime" // Usar acceptProp
                                    label={`Arrastra imágenes o videos (actuales: ${(field.value || []).length} de ${LIMITE_CARRUSEL})`}
                                    currentFilesCount={(field.value || []).length}
                                    limit={LIMITE_CARRUSEL}
                                    isLogo={false}
                                />
                            )}
                        />
                        {errors.carruselMediaItems && <FormHelperText error>{errors.carruselMediaItems.message}</FormHelperText>}
                    </div>

                    {/* SECCIÓN DESCRIPCIÓN (Sin cambios) */}
                    <div className="form-section">
    <Controller
        name="descripcion"
        control={control}
        rules={{
            required: 'La descripción es requerida',
            maxLength: {
                value: 1300, // Mantenemos la regla para validación y mensaje de error
                message: 'La descripción no puede exceder los 1300 caracteres.'
            }
        }}
        render={({ field, fieldState: { error } }) => {
            const currentLength = field.value?.length || 0;
            const maxLengthValue = 1600; // Definir el límite como una constante

            const helperTextContent = error
                ? error.message
                : `${currentLength}/${maxLengthValue} caracteres`;

            return (
                <TextField
                    {...field}
                    id="descripcion-a"
                    label="Descripción del Proveedor *"
                    multiline
                    rows={5} // Ajusta según necesites
                    variant="outlined"
                    fullWidth
                    placeholder="Describe tu empresa, historia, valores..."
                    error={!!error}
                    helperText={helperTextContent}
                    // --- Añadido inputProps ---
                    inputProps={{
                        maxLength: maxLengthValue // Limita la entrada directamente en el textarea
                    }}
                    // --- Fin de añadido ---
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            );
        }}
    />
</div>


                    {/* SECCIÓN MARCAS */}
                    <div className="form-section">
                        <Controller
                            name="marcasSeleccionadas"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    multiple
                                    id="marcas-tags"
                                    options={marcasOpciones}
                                    value={field.value || []}
                                    onChange={(event, newValue) => field.onChange(newValue)}
                                    getOptionLabel={(option) => typeof option === 'string' ? option : ''}
                                    isOptionEqualToValue={(option, value) => option === value}
                                    filterSelectedOptions
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label="Marcas que trabajás"
                                            placeholder="Escribí o seleccioná"
                                            error={!!errors.marcasSeleccionadas}
                                            helperText={errors.marcasSeleccionadas?.message}
                                            InputLabelProps={{ shrink: true }} // Solución
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip label={option} {...getTagProps({ index })} sx={{ margin: '2px' }} />
                                        ))
                                    }
                                />
                            )}
                        />
                    </div>

                    {/* SECCIÓN EXTRAS */}
                    <div className="form-section">
                        <Controller
                            name="extrasSeleccionados"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    multiple
                                    id="extras-tags"
                                    options={extrasOpciones}
                                    value={field.value || []}
                                    onChange={(event, newValue) => field.onChange(newValue)}
                                    getOptionLabel={(option) => typeof option === 'string' ? option : ''}
                                    isOptionEqualToValue={(option, value) => option === value}
                                    filterSelectedOptions
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label="Extras que ofrecés"
                                            placeholder="Escribí o seleccioná"
                                            error={!!errors.extrasSeleccionados}
                                            helperText={errors.extrasSeleccionados?.message}
                                            InputLabelProps={{ shrink: true }} // Solución
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip label={option} {...getTagProps({ index })} sx={{ margin: '4px 4px 0 0' }} />
                                        ))
                                    }
                                />
                            )}
                        />
                    </div>


                    {/* ------ SECCIÓN INFORMACIÓN DE CONTACTO (MODIFICADA) ------ */}
                    <div className="form-section">
                        <h3>Información de Contacto (Visible en la Card)</h3>

                        <div className="form-field-html-group"> {/* Agrupador para label+input+error */}
                            <label htmlFor="sitioWeb_contact"> {/* Añadido htmlFor para accesibilidad */}
                                Sitio Web
                                <input
                                    id="sitioWeb_contact" // Id para el htmlFor
                                    type="url"
                                    placeholder="https://..."
                                    {...register('sitioWeb', {
                                        pattern: {
                                            value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
                                            message: "URL inválida (ej: http://sitio.com)"
                                        }
                                    })}
                                    className={errors.sitioWeb ? 'input-error' : ''} // Para estilos custom si tienes
                                />
                            </label>
                            {errors.sitioWeb && <span style={errorSpanStyle}>{errors.sitioWeb.message}</span>}
                        </div>

                        <div className="form-field-html-group">
                            <label htmlFor="whatsapp_contact">
                                WhatsApp
                                <input
                                    id="whatsapp_contact"
                                    type="text" // O "tel" si prefieres validación de navegador más estricta
                                    placeholder="Ej: +54 9 11..."
                                    {...register('whatsapp'
                                        // Ejemplo de regla si fuera obligatorio:
                                        // { required: "WhatsApp es requerido" }
                                    )}
                                    className={errors.whatsapp ? 'input-error' : ''}
                                />
                            </label>
                            {errors.whatsapp && <span style={errorSpanStyle}>{errors.whatsapp.message}</span>}
                        </div>

                        <div className="form-field-html-group">
                            <label htmlFor="telefono_contact">
                                Teléfono Fijo (Opcional)
                                <input
                                    id="telefono_contact"
                                    type="tel"
                                    placeholder="Teléfono"
                                    {...register('telefono')}
                                    className={errors.telefono ? 'input-error' : ''}
                                />
                            </label>
                            {errors.telefono && <span style={errorSpanStyle}>{errors.telefono.message}</span>}
                        </div>

                        <div className="form-field-html-group">
                            <label htmlFor="email_contact">
                                Email de Contacto Público
                                <input
                                    id="email_contact"
                                    type="email"
                                    placeholder="Email"
                                    {...register('email', {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Email inválido"
                                        }
                                    })}
                                    className={errors.email ? 'input-error' : ''}
                                />
                            </label>
                            {errors.email && <span style={errorSpanStyle}>{errors.email.message}</span>}
                        </div>
                    </div>

                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack} className="secondary-button">Atrás</button>
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