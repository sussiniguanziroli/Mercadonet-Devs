import React, { useEffect, useRef, useState } from 'react'; // Asegúrate de importar useRef
import { useForm, Controller } from 'react-hook-form';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Box,
    Autocomplete,
    TextField,
    FormHelperText
} from '@mui/material';

import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';
import CardProductosPreview from '../card_simulators/CardProductosPreview';

const FormularioGeneral = ({
    selectedServices,
    setSelectedServices,
    initialData,
    onNext,
    onBack,
    categorias = [],
    selectedCard,
    ubicaciones = [],
    pproductos = [],
    servicios = [],
    marcasDisponibles = []
}) => {

    // Obtener el valor inicial de tipoRegistro para la referencia
    const initialTipoRegistroFromData = initialData?.tipoRegistro || '';

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            pais: initialData?.pais || 'Argentina',
            tipoRegistro: initialTipoRegistroFromData, // Usar el valor inicial obtenido
            nombreProveedor: initialData?.nombreProveedor || '',
            tipoProveedor: initialData?.tipoProveedor || [],
            categoriaPrincipal: initialData?.categoriaPrincipal || '',
            categoriasAdicionales: initialData?.categoriasAdicionales || [],
            ciudad: initialData?.ciudad || '',
            provincia: initialData?.provincia || '',
            nombre: initialData?.nombre || '',
            apellido: initialData?.apellido || '',
            rol: initialData?.rol || '',
            whatsapp: initialData?.whatsapp || '',
            cuit: initialData?.cuit || '',
            antiguedad: initialData?.antiguedad || '',
            facturacion: initialData?.facturacion || '',
            marcasOficiales: (initialTipoRegistroFromData === 'productos' && initialData?.tipoProveedor?.includes('Distribuidores Oficiales') && initialData?.marcasOficiales)
                ? initialData.marcasOficiales
                : []
        }
    });

    const onSubmit = async (data) => {
        let logoUrl = null;

        // Verificar si el logo está en el formulario
        if (data.logoFile instanceof File) {
            logoUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(data.logoFile);
            });
        }

        const carruselUrls = await Promise.all(
            (data.carruselMediaItems || []).map(async (item) => {
                if (item.file instanceof File) {
                    return await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(item.file);
                    });
                }
                return item.url;
            })
        );

        const stepData = {
            ...data,
            logoUrl,
            carruselUrls,
            tipoProveedor: data.tipoRegistro === 'productos' ? data.tipoProveedor : [],
        };
        onNext(stepData);
    };

    const watchedTipoRegistro = watch('tipoRegistro');
    const watchedTipoProveedor = watch('tipoProveedor', []);

    // Referencia para el valor previo de tipoRegistro
    const prevTipoRegistroRef = useRef(initialTipoRegistroFromData);

    // Efecto para resetear el formulario si initialData cambia (después del montaje)
    useEffect(() => {
        if (initialData) {
            const newInitialTipoRegistro = initialData.tipoRegistro || '';
            reset({
                pais: initialData.pais || 'Argentina',
                tipoRegistro: newInitialTipoRegistro,
                nombreProveedor: initialData.nombreProveedor || '',
                tipoProveedor: initialData.tipoProveedor || [],
                categoriaPrincipal: initialData.categoriaPrincipal || '',
                categoriasAdicionales: initialData.categoriasAdicionales || [],
                ciudad: initialData.ciudad || '',
                provincia: initialData.provincia || '',
                nombre: initialData.nombre || '',
                apellido: initialData.apellido || '',
                rol: initialData.rol || '',
                whatsapp: initialData.whatsapp || '',
                cuit: initialData.cuit || '',
                antiguedad: initialData.antiguedad || '',
                facturacion: initialData.facturacion || '',
                marcasOficiales: (newInitialTipoRegistro === 'productos' && initialData.tipoProveedor?.includes('Distribuidores Oficiales') && initialData.marcasOficiales)
                    ? initialData.marcasOficiales
                    : []
            });
            // Actualizar la referencia si initialData cambia y resetea tipoRegistro
            prevTipoRegistroRef.current = newInitialTipoRegistro;
        }
    }, [initialData, reset]);


    // Efecto para limpiar/resetear campos cuando cambia tipoRegistro (solo si realmente cambió)
    useEffect(() => {
        if (prevTipoRegistroRef.current !== watchedTipoRegistro) {
            // tipoRegistro ha cambiado realmente desde el valor anterior o inicial.
            setValue('tipoProveedor', [], { shouldValidate: watchedTipoRegistro === 'productos' });
            setValue('marcasOficiales', [], { shouldValidate: watchedTipoRegistro === 'productos' });
            setValue('categoriaPrincipal', '', { shouldValidate: !!watchedTipoRegistro });
            setValue('categoriasAdicionales', [], { shouldValidate: !!watchedTipoRegistro });
        }
        // Actualizar la referencia al valor actual para la próxima comparación.
        prevTipoRegistroRef.current = watchedTipoRegistro;
    }, [watchedTipoRegistro, setValue]);


    // Efecto para limpiar marcas si se deselecciona "Distribuidores Oficiales"
    useEffect(() => {
        if (!watchedTipoProveedor.includes('Distribuidores Oficiales')) {
            // Solo validar marcas si tipoRegistro es 'productos', de lo contrario no es relevante.
            const shouldValidateMarcas = watchedTipoRegistro === 'productos';
            setValue('marcasOficiales', [], { shouldValidate: shouldValidateMarcas });
        }
    }, [watchedTipoProveedor, watchedTipoRegistro, setValue]);

    const esProveedorDeServicios = watchedTipoRegistro === 'servicios';
    const categoriasDisponibles = esProveedorDeServicios ? servicios : categorias;
    const labelCategoriaPrincipal = esProveedorDeServicios ? 'Tipo de Servicio Principal' : 'Categoría Principal';
    const leyendaOtrasCategorias = esProveedorDeServicios ? 'Otros Servicios Ofrecidos (Hasta 5)' : 'Otras categorías (Elige hasta 5)';

    

    const watchedNombreProveedor = watch('nombreProveedor');
    const watchedCiudad = watch('ciudad');
    const watchedProvincia = watch('provincia');

    useEffect(() => {
        // Si es proveedor de servicios, combinar servicio principal y adicionales en un solo array
        if (esProveedorDeServicios) {
            const allServices = [
                watch('categoriaPrincipal'),
                ...(watch('categoriasAdicionales') || [])
            ].filter(Boolean); // Eliminar valores vacíos
            setSelectedServices(allServices);
        } else {
            // Limpiar el array si el tipo de registro cambia
            setSelectedServices([]);
        }
    }, [esProveedorDeServicios, watch('categoriaPrincipal'), watch('categoriasAdicionales')]);

    

    const buildPreviewDataForStep1 = () => {
        const ubicacionDetalle = `${watchedCiudad}${watchedCiudad && watchedProvincia ? ', ' : ''}${watchedProvincia}`;
        return {
            selectedServices: selectedServices || [],
            tipoProveedor: watchedTipoProveedor || [],
            tipoRegistro: watchedTipoRegistro || '',
            nombre: watchedNombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
        };
    };
    const previewData = buildPreviewDataForStep1();



    const getMarcaOptionDisabled = (option) => {
        const currentMarcas = watch('marcasOficiales', []);
        return currentMarcas.length >= 5 && !currentMarcas.includes(option);
    };

    return (
        <div className="registro-step-layout">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="registro-form" noValidate>
                    <h1>Datos básicos de Empresa</h1>

                    <div className="custom-dropdown form-section">
                        <label htmlFor="pais">País / Región:</label>
                        <select id="pais" {...register("pais")} >
                            <option value="Argentina">🇦🇷 Argentina</option>
                        </select>
                    </div>

                    <fieldset className='form-section'>
                        <legend>Tipo de Registro <span style={{ color: 'red' }}>*</span></legend>
                        <div className="radio-group" style={{ display: 'flex', gap: '15px' }}>
                            <label style={{ cursor: 'pointer' }}>
                                <input
                                    style={{ cursor: 'pointer' }}
                                    type="radio"
                                    value="productos"
                                    {...register("tipoRegistro", { required: "Selecciona si eres proveedor de Productos o Servicios" })}
                                /> Proveedor de Productos
                            </label>
                            <label style={{ cursor: 'pointer' }}>
                                <input
                                    style={{ cursor: 'pointer' }}
                                    type="radio"
                                    value="servicios"
                                    {...register("tipoRegistro", { required: "Selecciona si eres proveedor de Productos o Servicios" })}
                                /> Proveedor de Servicios
                            </label>
                        </div>
                        {errors.tipoRegistro && <p className="error-message" style={{ color: 'red', fontSize: '0.8em' }}>{errors.tipoRegistro.message}</p>}
                    </fieldset>

                    <div className='form-section'>
                        <legend htmlFor="nombreProveedor"> Nombre del Proveedor: <span style={{ color: 'red' }}>*</span></legend>
                        <input
                            type="text"
                            id="nombreProveedor"
                            {...register("nombreProveedor", { required: "El nombre del proveedor es obligatorio" })}
                        />
                        {errors.nombreProveedor && <p className="error-message">{errors.nombreProveedor.message}</p>}

                        {watchedTipoRegistro === 'productos' && (
                            <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.tipoProveedor}>
                                <InputLabel id="tipo-proveedor-label">
                                    Tipo de Proveedor <span style={{ color: 'red' }}>*</span>
                                </InputLabel>
                                <Controller
                                    name="tipoProveedor"
                                    control={control}
                                    rules={{ required: 'Selecciona al menos un tipo de proveedor' }}
                                    render={({ field }) => (
                                        <Select
                                            labelId="tipo-proveedor-label"
                                            multiple
                                            {...field} // Pasa value, onChange, onBlur, etc.
                                            input={<OutlinedInput label="Tipo de Proveedor *" />}
                                            renderValue={(selected) => ( // 'selected' es field.value
                                                selected.length > 0 ? (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => (
                                                            <Chip
                                                                key={value}
                                                                label={value}
                                                                onDelete={() => {
                                                                    const newValue = field.value.filter((item) => item !== value);
                                                                    field.onChange(newValue);
                                                                }}
                                                                onMouseDown={(event) => {
                                                                    // Previene que el Select se cierre al hacer clic en la 'x'
                                                                    event.stopPropagation();
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <em>Selecciona uno o más tipos</em>
                                                )
                                            )}
                                            sx={{
                                                borderRadius: 1, // Tu estilo
                                            }}
                                        >
                                            {/* Mapea tus opciones (asegúrate que 'pproductos' sea un array) */}
                                            {(pproductos || []).map((tipo) => (
                                                <MenuItem key={tipo} value={tipo}>
                                                    {tipo}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {/* Muestra el error si existe */}
                                {errors.tipoProveedor && (
                                    <FormHelperText>{errors.tipoProveedor.message}</FormHelperText>
                                )}
                            </FormControl>

                        )}
                    </div>

                    {watchedTipoRegistro === 'productos' && watchedTipoProveedor.includes('Distribuidores Oficiales') && (
                        <div className='form-section'>
                            <Controller
                                name="marcasOficiales"
                                control={control}
                                rules={{
                                    required: 'Debes seleccionar al menos una marca si eres Distribuidor Oficial',
                                    validate: value => value.length <= 5 || "Solo puedes seleccionar hasta 5 marcas."
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <Autocomplete
                                        multiple
                                        id="marcas-distribuidor-autocomplete"
                                        options={marcasDisponibles}
                                        value={field.value || []}
                                        onChange={(event, newValue) => {
                                            if (newValue.length <= 5) {
                                                field.onChange(newValue);
                                            }
                                        }}
                                        isOptionEqualToValue={(option, value) => option === value}
                                        getOptionLabel={(option) => option || ""}
                                        filterSelectedOptions
                                        getOptionDisabled={(option) =>
                                            field.value.includes(option) || field.value.length >= 5
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                label="¿De qué marca(s) eres Distribuidor Oficial? (Hasta 5) *"
                                                placeholder="Escribe o selecciona marcas..."
                                                error={!!error}
                                                helperText={error?.message}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    key={option}
                                                    label={option}
                                                    {...getTagProps({ index })}
                                                    sx={{ margin: '2px 4px 2px 0' }}
                                                />
                                            ))
                                        }
                                        noOptionsText="No hay marcas disponibles"
                                    />
                                )}
                            />
                        </div>
                    )}


                    {watchedTipoRegistro && (
                        <>
                            <div className='form-section'>
                                <legend htmlFor="categoriaPrincipal"> {labelCategoriaPrincipal}: <span style={{ color: 'red' }}>*</span></legend>
                                <select
                                    id="categoriaPrincipal"
                                    {...register("categoriaPrincipal", { required: `Selecciona ${labelCategoriaPrincipal}` })}
                                >
                                    <option value="">Selecciona...</option>
                                    {categoriasDisponibles.map((cat, i) => (
                                        <option key={i} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.categoriaPrincipal && <p className="error-message">{errors.categoriaPrincipal.message}</p>}
                            </div>

                            <fieldset className='form-section'>
                                <legend>{leyendaOtrasCategorias}</legend>
                                <div className="cat-label-container">
                                    {categoriasDisponibles
                                        .filter((cat) => cat !== watch("categoriaPrincipal")) // Filtrar el servicio principal seleccionado
                                        .map((cat, i) => (
                                            <label className="cat-label" key={i}>
                                                <input
                                                    type="checkbox"
                                                    value={cat}
                                                    {...register("categoriasAdicionales", {
                                                        validate: value => !value || value.length <= 5 || "Solo puedes seleccionar hasta 5 opciones."
                                                    })}
                                                    disabled={watch('categoriasAdicionales', []).length >= 5 && !watch('categoriasAdicionales', []).includes(cat)}
                                                />
                                                <span>{cat}</span>
                                            </label>
                                        ))}
                                    {categoriasDisponibles.length === 0 && <p className='placeholder-text small'>(No hay opciones disponibles)</p>}
                                </div>
                                {errors.categoriasAdicionales && <p className="error-message">{errors.categoriasAdicionales.message}</p>}
                            </fieldset>
                        </>
                    )}


                    <div className="form-section">
                        <legend>Ubicación: <span style={{ color: 'red' }}>*</span></legend>

                        <legend htmlFor="ciudad">Ciudad:</legend>
                        <input
                            type="text"
                            id="ciudad"
                            placeholder="Ciudad"
                            {...register("ciudad")}
                        />
                        {errors.ciudad && <p className="error-message">{errors.ciudad.message}</p>}

                        <legend htmlFor="provincia">Provincia / Estado:</legend>
                        <select
                            id="provincia"
                            {...register("provincia")}
                        >
                            <option value="">Provincia / Estado</option>
                            {(ubicaciones || []).map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
                        </select>
                        {errors.provincia && <p className="error-message">{errors.provincia.message}</p>}

                    </div>

                    <div className='form-section'>
                        <h3>Cuéntanos sobre ti (Contacto Principal)</h3>

                        <label htmlFor="nombre">Nombre: </label>
                        <input
                            type="text"
                            id="nombre"
                            placeholder="Nombre"
                            {...register("nombre", { required: "El nombre es obligatorio" })}
                        />
                        {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}

                        <label htmlFor="apellido">Apellido: </label>
                        <input
                            type="text"
                            id="apellido"
                            placeholder="Apellido"
                            {...register("apellido", { required: "El apellido es obligatorio" })}
                        />
                        {errors.apellido && <p className="error-message">{errors.apellido.message}</p>}

                        <label htmlFor="rol"> Rol en la Empresa: </label>
                        <input
                            type="text"
                            id="rol"
                            placeholder="Ej: Gerente de Ventas"
                            {...register("rol", { required: "El rol es obligatorio" })}
                        />
                        {errors.rol && <p className="error-message">{errors.rol.message}</p>}

                        <label htmlFor="whatsapp"> Whatsapp (con código de país): </label>
                        <input
                            type="text"
                            id="whatsapp"
                            placeholder="Ej: +5491122223333"
                            {...register("whatsapp", {
                                required: "Whatsapp es obligatorio",
                                pattern: {
                                    value: /^\+\d+$/,
                                    message: "Formato inválido (Ej: +54911...)"
                                }
                            })}
                        />
                        {errors.whatsapp && <p className="error-message">{errors.whatsapp.message}</p>}
                    </div>

                    <div className='form-section'>
                        <h3>Información Legal y Financiera (Opcional)</h3>
                        <label htmlFor="cuit">CUIT / RUT / Tax ID:</label>
                        <input type="text" id="cuit" {...register("cuit")} />

                        <div className="input-row">
                            <label htmlFor="antiguedad"> Antigüedad (años):</label>
                            <input
                                type="number"
                                id="antiguedad"
                                min="0"
                                {...register("antiguedad", {
                                    valueAsNumber: true,
                                    min: { value: 0, message: "La antigüedad no puede ser negativa" }
                                })}
                            />
                            {errors.antiguedad && <p className="error-message">{errors.antiguedad.message}</p>}

                            <label htmlFor="facturacion"> Facturación anual (USD):</label>
                            <input
                                type="number"
                                id="facturacion"
                                min="0"
                                {...register("facturacion", {
                                    valueAsNumber: true,
                                    min: { value: 0, message: "La facturación no puede ser negativa" }
                                })}
                            />
                            {errors.facturacion && <p className="error-message">{errors.facturacion.message}</p>}
                        </div>
                    </div>

                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack} disabled={false}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            <div className="simulator-wrapper">
                <h1>{selectedCard === 'tipoA' ? 'Card Historia' : 'Card Producto'}</h1>
                {selectedCard === 'tipoA' && <CardHistoriaPreview proveedor={previewData} />}
                {selectedCard === 'tipoB' && <CardProductosPreview proveedor={previewData} />}
                {!selectedCard && <p style={{ color: 'white', textAlign: 'center' }}>Selecciona un tipo de card.</p>}
            </div>
        </div>
    );
};
export default FormularioGeneral;