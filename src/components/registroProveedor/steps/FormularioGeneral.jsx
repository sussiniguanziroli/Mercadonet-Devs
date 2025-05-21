import React, { useEffect, useRef } from 'react';
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
    selectedServices, // Esta prop parece que era para el preview, verificar su uso
    setSelectedServices, // Esta prop parece que era para el preview, verificar su uso
    initialData,
    onNext,
    onBack,
    categorias = [],
    selectedCard, // Para determinar qué preview mostrar
    ubicaciones = [],
    pproductos = [], // Opciones para "Tipo de Proveedor"
    servicios = [],  // Opciones para "Tipo de Servicio Principal" si es de servicios
    marcasDisponibles = [] // Opciones para "Marcas Oficiales"
}) => {

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
            tipoRegistro: initialTipoRegistroFromData,
            nombreProveedor: initialData?.nombreProveedor || '',
            tipoProveedor: initialData?.tipoProveedor || [], // Array para selección múltiple
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

    // Lógica de onSubmit simplificada: ya no procesa archivos aquí.
    const onSubmit = (data) => {
        // Asegurar que tipoProveedor esté vacío si no es de productos
        const stepData = {
            ...data,
            tipoProveedor: data.tipoRegistro === 'productos' ? data.tipoProveedor : [],
        };
        onNext(stepData); // stepData ahora solo contiene los datos generales del formulario
    };

    const watchedTipoRegistro = watch('tipoRegistro');
    const watchedTipoProveedor = watch('tipoProveedor', []);

    const prevTipoRegistroRef = useRef(initialTipoRegistroFromData);

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
            prevTipoRegistroRef.current = newInitialTipoRegistro;
        }
    }, [initialData, reset]);


    useEffect(() => {
        if (prevTipoRegistroRef.current !== watchedTipoRegistro) {
            setValue('tipoProveedor', [], { shouldValidate: watchedTipoRegistro === 'productos' });
            setValue('marcasOficiales', [], { shouldValidate: watchedTipoRegistro === 'productos' });
            setValue('categoriaPrincipal', '', { shouldValidate: !!watchedTipoRegistro });
            setValue('categoriasAdicionales', [], { shouldValidate: !!watchedTipoRegistro });
        }
        prevTipoRegistroRef.current = watchedTipoRegistro;
    }, [watchedTipoRegistro, setValue]);


    useEffect(() => {
        if (!watchedTipoProveedor.includes('Distribuidores Oficiales')) {
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
    const watchedCategoriaPrincipal = watch('categoriaPrincipal'); // Para preview
    const watchedCategoriasAdicionales = watch('categoriasAdicionales', []); // Para preview

    // Efecto para actualizar selectedServices para la preview
    // Este efecto se mantiene si selectedServices es usado por las Card Previews
    // y necesita reflejar las selecciones de este formulario.
    useEffect(() => {
        if (setSelectedServices) { // Solo si la función está definida
            if (esProveedorDeServicios) {
                const allServices = [
                    watchedCategoriaPrincipal,
                    ...watchedCategoriasAdicionales
                ].filter(Boolean);
                setSelectedServices(allServices);
            } else {
                setSelectedServices([]); // Limpiar si no es proveedor de servicios
            }
        }
    }, [
        esProveedorDeServicios,
        watchedCategoriaPrincipal,
        watchedCategoriasAdicionales,
        setSelectedServices // Añadir como dependencia
    ]);


    const buildPreviewDataForStep1 = () => {
        const ubicacionDetalle = `${watchedCiudad}${watchedCiudad && watchedProvincia ? ', ' : ''}${watchedProvincia}`;
        let servicesForPreview = [];
        if (esProveedorDeServicios) {
            servicesForPreview = [watchedCategoriaPrincipal, ...watchedCategoriasAdicionales].filter(Boolean);
        }

        return {
            // selectedServices se espera que venga de una prop si es un estado global
            // o se puede construir aquí si es solo para esta preview.
            // Si selectedServices es un estado del Navigator, no se debería modificar aquí directamente.
            // Para la preview, construimos los datos directamente de lo que se observa:
            selectedServices: servicesForPreview,
            tipoProveedor: watchedTipoProveedor || [],
            tipoRegistro: watchedTipoRegistro || '',
            nombre: watchedNombreProveedor || 'Nombre Empresa', // Placeholder si está vacío
            ubicacionDetalle: ubicacionDetalle || 'Ubicación', // Placeholder
        };
    };
    const previewData = buildPreviewDataForStep1();

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
                                <input style={{ cursor: 'pointer' }} type="radio" value="productos"
                                    {...register("tipoRegistro", { required: "Selecciona si eres proveedor de Productos o Servicios" })} /> Proveedor de Productos
                            </label>
                            <label style={{ cursor: 'pointer' }}>
                                <input style={{ cursor: 'pointer' }} type="radio" value="servicios"
                                    {...register("tipoRegistro", { required: "Selecciona si eres proveedor de Productos o Servicios" })} /> Proveedor de Servicios
                            </label>
                        </div>
                        {errors.tipoRegistro && <p className="error-message" style={{ color: 'red', fontSize: '0.8em' }}>{errors.tipoRegistro.message}</p>}
                    </fieldset>

                    <div className='form-section'>
                        <label htmlFor="nombreProveedor"> Nombre del Proveedor: <span style={{ color: 'red' }}>*</span></label>
                        <input type="text" id="nombreProveedor" {...register("nombreProveedor", { required: "El nombre del proveedor es obligatorio" })} />
                        {errors.nombreProveedor && <p className="error-message">{errors.nombreProveedor.message}</p>}

                        {watchedTipoRegistro === 'productos' && (
                            <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.tipoProveedor}>
                                <InputLabel id="tipo-proveedor-label">Tipo de Proveedor <span style={{ color: 'red' }}>*</span></InputLabel>
                                <Controller
                                    name="tipoProveedor"
                                    control={control}
                                    rules={{ required: 'Selecciona al menos un tipo de proveedor' }}
                                    render={({ field }) => (
                                        <Select labelId="tipo-proveedor-label" multiple {...field}
                                            input={<OutlinedInput label="Tipo de Proveedor *" />}
                                            renderValue={(selected) => (
                                                selected.length > 0 ? (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => (
                                                            <Chip key={value} label={value}
                                                                onDelete={() => field.onChange(field.value.filter((item) => item !== value))}
                                                                onMouseDown={(event) => event.stopPropagation()} />
                                                        ))}
                                                    </Box>
                                                ) : (<em>Selecciona uno o más tipos</em>)
                                            )} sx={{ borderRadius: 1 }}>
                                            {(pproductos || []).map((tipo) => (<MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>))}
                                        </Select>
                                    )} />
                                {errors.tipoProveedor && (<FormHelperText>{errors.tipoProveedor.message}</FormHelperText>)}
                            </FormControl>
                        )}
                    </div>

                    {watchedTipoRegistro === 'productos' && watchedTipoProveedor.includes('Distribuidores Oficiales') && (
                        <div className='form-section'>
                            <Controller
                                name="marcasOficiales" control={control}
                                rules={{ required: 'Debes seleccionar al menos una marca si eres Distribuidor Oficial', validate: value => (value || []).length <= 5 || "Solo puedes seleccionar hasta 5 marcas."}}
                                render={({ field, fieldState: { error } }) => (
                                    <Autocomplete multiple id="marcas-distribuidor-autocomplete" options={marcasDisponibles}
                                        value={field.value || []}
                                        onChange={(event, newValue) => { if (newValue.length <= 5) field.onChange(newValue);}}
                                        isOptionEqualToValue={(option, value) => option === value}
                                        getOptionLabel={(option) => option || ""} filterSelectedOptions
                                        getOptionDisabled={(option) => (field.value || []).includes(option) || (field.value || []).length >= 5}
                                        renderInput={(params) => (
                                            <TextField {...params} variant="outlined" label="¿De qué marca(s) eres Distribuidor Oficial? (Hasta 5) *"
                                                placeholder="Escribe o selecciona marcas..." error={!!error} helperText={error?.message} InputLabelProps={{ shrink: true }} />
                                        )}
                                        renderTags={(value, getTagProps) => value.map((option, index) => (<Chip key={option+index} label={option} {...getTagProps({ index })} sx={{ margin: '2px 4px 2px 0' }} />))}
                                        noOptionsText="No hay marcas disponibles" />
                                )} />
                        </div>
                    )}

                    {watchedTipoRegistro && (
                        <>
                            <div className='form-section'>
                                <label htmlFor="categoriaPrincipal"> {labelCategoriaPrincipal}: <span style={{ color: 'red' }}>*</span></label>
                                <select id="categoriaPrincipal" {...register("categoriaPrincipal", { required: `Selecciona ${labelCategoriaPrincipal}` })}>
                                    <option value="">Selecciona...</option>
                                    {categoriasDisponibles.map((cat, i) => (<option key={i} value={cat}>{cat}</option>))}
                                </select>
                                {errors.categoriaPrincipal && <p className="error-message">{errors.categoriaPrincipal.message}</p>}
                            </div>

                            <fieldset className='form-section'>
                                <legend>{leyendaOtrasCategorias}</legend>
                                <div className="cat-label-container">
                                    {categoriasDisponibles.filter((cat) => cat !== watch("categoriaPrincipal")).map((cat, i) => (
                                        <label className="cat-label" key={i}>
                                            <input type="checkbox" value={cat}
                                                {...register("categoriasAdicionales", { validate: value => !value || value.length <= 5 || "Solo puedes seleccionar hasta 5 opciones."})}
                                                disabled={watch('categoriasAdicionales', []).length >= 5 && !watch('categoriasAdicionales', []).includes(cat)} />
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
                        <legend>Ubicación:</legend> {/* Removido asterisco si no son obligatorios todos */}
                        <label htmlFor="ciudad">Ciudad:</label>
                        <input type="text" id="ciudad" placeholder="Ciudad" {...register("ciudad")} />
                        {errors.ciudad && <p className="error-message">{errors.ciudad.message}</p>}

                        <label htmlFor="provincia">Provincia / Estado:</label>
                        <select id="provincia" {...register("provincia")}>
                            <option value="">Provincia / Estado</option>
                            {(ubicaciones || []).map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
                        </select>
                        {errors.provincia && <p className="error-message">{errors.provincia.message}</p>}
                    </div>

                    <div className='form-section'>
                        <h3>Cuéntanos sobre ti (Contacto Principal)</h3>
                        <label htmlFor="nombre">Nombre: </label>
                        <input type="text" id="nombre" placeholder="Nombre" {...register("nombre", { required: "El nombre es obligatorio" })} />
                        {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}

                        <label htmlFor="apellido">Apellido: </label>
                        <input type="text" id="apellido" placeholder="Apellido" {...register("apellido", { required: "El apellido es obligatorio" })} />
                        {errors.apellido && <p className="error-message">{errors.apellido.message}</p>}

                        <label htmlFor="rol"> Rol en la Empresa: </label>
                        <input type="text" id="rol" placeholder="Ej: Gerente de Ventas" {...register("rol", { required: "El rol es obligatorio" })} />
                        {errors.rol && <p className="error-message">{errors.rol.message}</p>}

                        <label htmlFor="whatsapp"> Whatsapp (con código de país): </label>
                        <input type="text" id="whatsapp" placeholder="Ej: +5491122223333"
                            {...register("whatsapp", { required: "Whatsapp es obligatorio", pattern: { value: /^\+\d+$/, message: "Formato inválido (Ej: +54911...)" }})} />
                        {errors.whatsapp && <p className="error-message">{errors.whatsapp.message}</p>}
                    </div>

                    <div className='form-section'>
                        <h3>Información Legal y Financiera (Opcional)</h3>
                        <label htmlFor="cuit">CUIT / RUT / Tax ID:</label>
                        <input type="text" id="cuit" {...register("cuit")} />

                        <div className="input-row">
                            <label htmlFor="antiguedad"> Antigüedad (años):</label>
                            <input type="number" id="antiguedad" min="0" {...register("antiguedad", { valueAsNumber: true, min: { value: 0, message: "La antigüedad no puede ser negativa" }})} />
                            {errors.antiguedad && <p className="error-message">{errors.antiguedad.message}</p>}

                            <label htmlFor="facturacion"> Facturación anual (USD):</label>
                            <input type="number" id="facturacion" min="0" {...register("facturacion", { valueAsNumber: true, min: { value: 0, message: "La facturación no puede ser negativa" }})} />
                            {errors.facturacion && <p className="error-message">{errors.facturacion.message}</p>}
                        </div>
                    </div>

                    <div className="botones-navegacion">
                        {/* El botón "Atrás" en el primer formulario real podría simplemente ir a la selección de card, que es manejado por el Navigator */}
                        <button type="button" onClick={onBack}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            <div className="simulator-wrapper">
                {/* Asegúrate que selectedCard y previewData se pasen correctamente para la previsualización */}
                <h1>{selectedCard === 'tipoA' ? 'Card Historia' : (selectedCard === 'tipoB' ? 'Card Producto' : 'Vista Previa')}</h1>
                {selectedCard === 'tipoA' && <CardHistoriaPreview proveedor={previewData} />}
                {selectedCard === 'tipoB' && <CardProductosPreview proveedor={previewData} />}
                {!selectedCard && <p style={{ color: 'white', textAlign: 'center' }}>Selecciona un tipo de card en el primer paso.</p>}
            </div>
        </div>
    );
};
export default FormularioGeneral;