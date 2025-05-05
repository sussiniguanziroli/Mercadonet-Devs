import React, { useState, useEffect } from 'react';
import { scrollToTop } from '../../../utils/scrollHelper';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Box,
    Autocomplete,
    TextField
} from '@mui/material';

// --- MODIFICADO: Importa el simulador unificado ---
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';
// TODO: Importar CardProductosPreview cuando esté unificado
import CardProductosPreview from '../card_simulators/CardProductosPreview';

// --- Componente del Paso: Formulario General ---
const FormularioGeneral = ({
    // Props esperadas del Navigator
    initialData,
    onNext,
    onBack,
    onCancel,
    categorias = [],   // Lista de categorías para los select/checkbox (con default)
    selectedCard, // 'tipoA' o 'tipoB'
    ubicaciones = [], // Lista de ubicaciones (con default)
    pproductos = [],   // Lista de tipos de proveedor (con default)
    servicios = [],
    marcasDisponibles = []
}) => {
    // --- Estados locales para cada campo del formulario ---
    const [pais, setPais] = useState('Argentina');
    const [tipoRegistro, setTipoRegistro] = useState('');
    const [nombreProveedor, setNombreProveedor] = useState('');
    const [tipoProveedor, setTipoProveedor] = useState([]);
    const [categoriaPrincipal, setCategoriaPrincipal] = useState('');
    const [marcasOficiales, setMarcasOficiales] = useState([]);
    const [marcasError, setMarcasError] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [ciudad, setCiudad] = useState('');
    const [provincia, setProvincia] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [rol, setRol] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [cuit, setCuit] = useState('');
    const [antiguedad, setAntiguedad] = useState('');
    const [facturacion, setFacturacion] = useState('');
    const [categoryError, setCategoryError] = useState(false);

    // --- Efecto para inicializar desde initialData ---
    useEffect(() => {
        // Inicializa estado local cuando initialData cambia
        if (initialData) {
            setPais(initialData.pais || 'Argentina');
            // --- MODIFICADO: Inicializa tipoRegistro ---
            setTipoRegistro(initialData.tipoRegistro || '');
            setNombreProveedor(initialData.nombreProveedor || '');
            setTipoProveedor(initialData.tipoProveedor || []);
            setCategoriaPrincipal(initialData.categoriaPrincipal || '');
            setSelectedCategories(initialData.categoriasAdicionales || []);
            setCiudad(initialData.ciudad || '');
            setProvincia(initialData.provincia || '');
            setNombre(initialData.nombre || '');
            setApellido(initialData.apellido || '');
            setRol(initialData.rol || '');
            setWhatsapp(initialData.whatsapp || '');
            setCuit(initialData.cuit || '');
            setAntiguedad(initialData.antiguedad || '');
            setFacturacion(initialData.facturacion || '');
            if (tipoProveedor.includes('Distribuidores Oficiales')) {
                setMarcasOficiales(initialData.marcasOficiales || []);
            } else {
                setMarcasOficiales([]); // Asegura que esté vacío si no es distribuidor oficial
            }
        }
    }, [initialData]);

    // --- [NUEVO]! Determina qué lista usar para categorías/servicios ---
    const esProveedorDeServicios = tipoRegistro === 'servicios';
    const categoriasDisponibles = esProveedorDeServicios ? servicios : categorias;
    const labelCategoriaPrincipal = esProveedorDeServicios ? 'Tipo de Servicio Principal' : 'Categoría Principal';
    const leyendaOtrasCategorias = esProveedorDeServicios ? 'Otros Servicios Ofrecidos (Hasta 5)' : 'Otras categorías (Elige hasta 5)';


     // --- [NUEVO] Efecto para limpiar marcas si se deselecciona "Distribuidores Oficiales" ---
     useEffect(() => {
        if (!tipoProveedor.includes('Distribuidores Oficiales')) {
            setMarcasOficiales([]);
            setMarcasError('');
        }
    }, [tipoProveedor]); 

    // --- Handlers ---

    const handleMarcasChangeAutocomplete = (event, newValue) => {
        // newValue ya es el array con las selecciones propuestas
        if (newValue.length <= 5) {
            setMarcasOficiales(newValue);
            setMarcasError(''); // Limpia error si está dentro del límite
        } else {
            // Si se excede, no actualizamos el estado y mostramos el error.
            // El Autocomplete no añadirá visualmente la 6ta opción si no actualizamos el state.
            setMarcasError("Solo puedes seleccionar hasta 5 marcas.");
        }
    };

    const getMarcaOptionDisabled = (option) => {
        // Deshabilita la opción si ya hay 5 seleccionadas Y esta opción no es una de ellas
        return marcasOficiales.length >= 5 && !marcasOficiales.includes(option);
    };

    const handleTipoProveedorChange = (event) => {
        const {
            target: { value }
        } = event;
        setTipoProveedor(typeof value === 'string' ? value.split(',') : value);
    };

    // NUEVO: Handler para cambio de Tipo de Registro
    const handleTipoRegistroChange = (e) => {
        const newType = e.target.value;
        setTipoRegistro(newType);
        setMarcasOficiales([]);
        setMarcasError('');
        setTipoProveedor([]);
        setCategoriaPrincipal('');
        setSelectedCategories([]);
        setCategoryError('');
        console.log("Tipo de Registro cambiado a:", newType);
    };

    // Modificado para usar la lista correcta
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        // Usamos una copia del estado actual para trabajar
        let updated = [...selectedCategories];

        if (checked) {
            // Verifica el límite antes de añadir
            if (updated.length < 5) {
                updated.push(value);
                setCategoryError(''); // Limpia error si había
            } else {
                setCategoryError("Solo puedes seleccionar hasta 5 opciones.");
                // Evita que el checkbox cambie visualmente si se supera el límite
                e.preventDefault();
                return; // No actualiza el estado si se supera el límite
            }
        } else {
            // Elimina el valor si se desmarca
            updated = updated.filter(cat => cat !== value);
            setCategoryError(''); // Limpia error si había
        }
        // Actualiza el estado con el array modificado
        setSelectedCategories(updated);
    };


    // Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        const stepData = {
            pais,
            tipoRegistro, 
            nombreProveedor,
            marcasOficiales,
            tipoProveedor: tipoRegistro === 'productos' ? tipoProveedor : [],
            categoriaPrincipal,
            categoriasAdicionales: selectedCategories,
            ciudad, provincia, nombre, apellido, rol, whatsapp,
            cuit, antiguedad, facturacion
        };
        // Validaciones básicas antes de enviar (ejemplo)
        if (!tipoRegistro) {
            alert("Por favor, selecciona si eres proveedor de Productos o Servicios.");
            return;
        }
        if (tipoRegistro === 'productos' && !tipoProveedor) {
            alert("Por favor, selecciona el Tipo de Proveedor.");
            return;
        }
        if (!categoriaPrincipal) {
            alert(`Por favor, selecciona ${labelCategoriaPrincipal}.`);
            return;
        }

        console.log('[FormularioGeneral] handleSubmit enviando:', stepData);
        onNext(stepData);
    };

    // --- Construcción de Datos para el Simulador (SOLO de este paso y SIN categorías) ---
    const buildPreviewDataForStep1 = () => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        // Ya no pasamos categorías a la preview
        return {
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
            // CardHistoriaPreview usará defaults/placeholders para lo demás
        };
    };
    const previewData = buildPreviewDataForStep1(); // Calcula en cada render

    // --- Renderizado del Componente ---
    return (
        <div className="registro-step-layout">
            {/* Contenedor del Formulario */}
            <div className="form-wrapper">
                <form onSubmit={handleSubmit} className="registro-form" noValidate>
                    <h1>Datos básicos de Empresa</h1>

                    {/* País / Región */}
                    <div className="custom-dropdown form-section">
                        <label>País / Región:</label>
                        <select name="pais" value={pais} onChange={e => setPais(e.target.value)}>
                            <option value="Argentina">🇦🇷 Argentina</option>
                        </select>
                    </div>

                    {/* --- NUEVO: Selector Tipo de Registro --- */}
                    <fieldset className='form-section'>
                        <legend>Tipo de Registro <span style={{ color: 'red' }}>*</span></legend>
                        <div className="radio-group" style={{ display: 'flex', gap: '15px' }}> {/* Estilo simple */}
                            <label style={{ cursor: 'pointer' }}>
                                <input type="radio" name="tipoRegistro" value="productos" checked={tipoRegistro === 'productos'} onChange={handleTipoRegistroChange} required /> Proveedor de Productos
                            </label>
                            <label style={{ cursor: 'pointer' }}>
                                <input type="radio" name="tipoRegistro" value="servicios" checked={tipoRegistro === 'servicios'} onChange={handleTipoRegistroChange} required /> Proveedor de Servicios
                            </label>
                        </div>
                    </fieldset>

                    {/* Nombre Proveedor y Tipo Proveedor (condicional) */}
                    <div className='form-section'>
                        <label> Nombre del Proveedor: <input type="text" name="nombreProveedor" value={nombreProveedor} onChange={e => setNombreProveedor(e.target.value)} required /> </label>

                        {/* --- CONDICIONAL: Mostrar solo si es proveedor de productos --- */}
                        {tipoRegistro === 'productos' && (
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel id="tipo-proveedor-label">Tipo de Proveedor</InputLabel>
                                <Select
                                    labelId="tipo-proveedor-label"
                                    multiple
                                    value={tipoProveedor}
                                    onChange={(e) => {
                                        const {
                                            target: { value },
                                        } = e;
                                        setTipoProveedor(
                                            typeof value === 'string' ? value.split(',') : value
                                        );
                                    }}
                                    input={<OutlinedInput label="Tipo de Proveedor" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={value}
                                                    onMouseDown={(e) => {
                                                        // Evita que se dispare el dropdown cuando hacés click en la X
                                                        e.stopPropagation();
                                                    }}
                                                    onDelete={() => {
                                                        setTipoProveedor((prev) =>
                                                            prev.filter((item) => item !== value)
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {pproductos.map((tipo) => (
                                        <MenuItem key={tipo} value={tipo}>
                                            {tipo}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}



                    </div>

                    {/* Se muestra si es producto Y si 'Distribuidores Oficiales' está seleccionado */}
                    {tipoRegistro === 'productos' && tipoProveedor.includes('Distribuidores Oficiales') && (
                        <div className='form-section'>
                            <Autocomplete
                                multiple
                                id="marcas-distribuidor-autocomplete"
                                options={marcasDisponibles} // Usa la prop
                                value={marcasOficiales} // Usa el estado
                                onChange={handleMarcasChangeAutocomplete} // Usa el handler adaptado
                                getOptionLabel={(option) => option} // Asume que las marcas son strings
                                filterSelectedOptions // Oculta opciones ya seleccionadas
                                getOptionDisabled={getMarcaOptionDisabled} // Deshabilita opciones si se supera el límite
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="¿De qué marca(s) eres Distribuidor Oficial? (Hasta 5) *"
                                        placeholder="Escribe o selecciona marcas..."
                                        // Aplicamos estilos del ejemplo para mejorar visualización de chips
                                        sx={{
                                             '& .MuiInputBase-root': { 
                                                 flexWrap: 'wrap', 
                                                 paddingTop: '8px', 
                                                 paddingBottom: '8px', 
                                                 paddingRight: '38px', 
                                             },
                                             '& .MuiAutocomplete-input': { // Estilo para el input real donde se escribe
                                                 minWidth: '120px', 
                                                marginTop: '6px', 
                                                 flexGrow: 1,
                                             },
                                        }}
                                        error={!!marcasError} // Marca el campo con error si marcasError no está vacío
                                       // helperText={marcasError} // Muestra el error debajo (opcional, ya lo mostramos aparte)
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            key={option} // Usa la marca como key si son únicas
                                            label={option}
                                            {...getTagProps({ index })}
                                            sx={{ margin: '2px 4px 2px 0' }} // Ajusta margen de los chips
                                        />
                                    ))
                                }
                                // Mensaje si no hay opciones (se muestra dentro del desplegable)
                                noOptionsText="No hay marcas disponibles"
                            />
                            {/* Muestra el mensaje de error debajo del Autocomplete */}
                            {marcasError && <p className="error-message" style={{ color: 'red', fontSize: '0.8em', marginTop: '4px', marginLeft: '14px' }}>{marcasError}</p>}
                        </div>
                    )}


                    {/* --- CONDICIONAL: Categorías / Servicios (Mostrar solo si se eligió tipoRegistro) --- */}
                    {tipoRegistro && (
                        <>
                            {/* Categoría/Servicio Principal */}
                            <div className='form-section'>
                                <label> {labelCategoriaPrincipal}:
                                    <select name="categoriaPrincipal" value={categoriaPrincipal} onChange={e => setCategoriaPrincipal(e.target.value)} required>
                                        <option value="" disabled>Selecciona...</option>
                                        {/* Usa la lista correcta */}
                                        {(categoriasDisponibles).map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                                    </select>
                                </label>
                            </div>

                            {/* Otras Categorías/Servicios */}
                            <fieldset className='form-section'>
                                <legend>{leyendaOtrasCategorias}</legend>
                                <div className="cat-label-container">
                                    {/* Usa la lista correcta */}
                                    {(categoriasDisponibles).map((cat, i) => (
                                        <label className="cat-label" key={i}>
                                            <input type="checkbox" value={cat} onChange={handleCheckboxChange} checked={selectedCategories.includes(cat)} disabled={selectedCategories.length >= 5 && !selectedCategories.includes(cat)} />
                                            <span>{cat}</span>
                                        </label>
                                    ))}
                                    {categoriasDisponibles.length === 0 && <p className='placeholder-text small'>(No hay opciones disponibles)</p>}
                                </div>
                                {categoryError && <p className="error-message">{categoryError}</p>}
                            </fieldset>
                        </>
                    )}

                    {/* Ubicación */}
                    <div className="form-section">
                        <label>Ubicación</label>
                        <div className="input-row">
                            <label>
                                <input type="text" name="ciudad" placeholder="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} />
                            </label>
                            <label> {/* TODO: Reemplazar input por Select usando prop 'ubicaciones' */}
                                {/* <input type="text" name="provincia" placeholder="Provincia / Estado" value={provincia} onChange={e => setProvincia(e.target.value)} /> */}
                                <select name="provincia" value={provincia} onChange={e => setProvincia(e.target.value)}>
                                    <option value="" disabled>Provincia / Estado</option>
                                    {(ubicaciones || []).map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
                                </select>
                            </label>
                        </div>
                    </div>

                    {/* Datos de Contacto */}
                    <div className='form-section'>
                        <h3>Cuéntanos sobre ti (Contacto Principal)</h3>
                        <div className="input-row">
                            <label><input type="text" name="nombre" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required /></label>
                            <label><input type="text" name="apellido" placeholder="Apellido" value={apellido} onChange={e => setApellido(e.target.value)} required /></label>
                        </div>
                        <label> Rol en la Empresa: <input type="text" name="rol" placeholder="Ej: Gerente de Ventas" value={rol} onChange={e => setRol(e.target.value)} required /></label>
                        <label> Whatsapp (con código de país): <input type="text" name="whatsapp" placeholder="Ej: +5491122223333" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required /></label>
                    </div>

                    {/* Información Opcional */}
                    <div className='form-section'>
                        <h3>Información Legal y Financiera (Opcional)</h3>
                        <label> CUIT / RUT / Tax ID: <input type="text" name="cuit" value={cuit} onChange={e => setCuit(e.target.value)} /></label>
                        <div className="input-row">
                            <label> Antigüedad (años): <input type="number" min="0" name="antiguedad" value={antiguedad} onChange={e => setAntiguedad(e.target.value)} /></label>
                            <label> Facturación anual (USD): <input type="number" min="0" name="facturacion" value={facturacion} onChange={e => setFacturacion(e.target.value)} /></label>
                        </div>
                    </div>

                    {/* Botones de Navegación */}
                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack} disabled={false}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            {/* Contenedor del Simulador (AJUSTADO - Usa previewData) */}
            <div className="simulator-wrapper">
                <h1>{selectedCard === 'tipoA' ? 'Card Historia' : 'Card Producto'}</h1>
                {selectedCard === 'tipoA' && <CardHistoriaPreview proveedor={previewData} />}
                {/* TODO: Reemplazar con CardProductosPreview cuando se unifique */}
                {selectedCard === 'tipoB' && <CardProductosPreview proveedor={previewData} />}
                {!selectedCard && <p style={{ color: 'white', textAlign: 'center' }}>Selecciona un tipo de card.</p>}
            </div>
        </div>
    );
};
export default FormularioGeneral;