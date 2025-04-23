// src/components/registroProveedor/steps/FormularioGeneral.jsx

import React, { useState, useEffect } from 'react';
import { scrollToTop } from '../../../utils/scrollHelper';

// Simuladores
import CardHistoriaSimulator from '../card_simulators/CardHistoriaSimulator';
import CardProductoSimulator from '../card_simulators/CardProductosSimulator';

// --- Componente del Paso: Formulario General ---
const FormularioGeneral = ({
    initialData, onNext, onBack, onCancel, categorias, selectedCard
}) => {
    // --- Estado Local (Sin cambios) ---
    const [pais, setPais] = useState('Argentina');
    const [nombreProveedor, setNombreProveedor] = useState('');
    const [tipoProveedor, setTipoProveedor] = useState('');
    const [categoriaPrincipal, setCategoriaPrincipal] = useState('');
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
    const [categoryError, setCategoryError] = useState('');

    // --- Efecto para Inicializar Estado (Sin cambios) ---
    useEffect(() => {
        if (initialData) {
            setPais(initialData.pais || 'Argentina');
            setNombreProveedor(initialData.nombreProveedor || '');
            setTipoProveedor(initialData.tipoProveedor || '');
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
        }
    }, [initialData]);

    // --- Manejadores de Eventos (handleCheckboxChange sin cambios) ---
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        let updated = [...selectedCategories];
        if (checked) {
            if (updated.length < 5) {
                updated.push(value); setCategoryError('');
            } else {
                setCategoryError("Solo puedes seleccionar hasta 5 categorías.");
                e.preventDefault(); return;
            }
        } else {
            updated = updated.filter(cat => cat !== value); setCategoryError('');
        }
        setSelectedCategories(updated);
    };

    // --- Submit (Sin cambios en lógica interna) ---
    const handleSubmit = (e) => {
        e.preventDefault();

        const stepData = { /* ...recolectar estado local... */
            pais, nombreProveedor, tipoProveedor, categoriaPrincipal,
            categoriasAdicionales: selectedCategories, ciudad, provincia,
            nombre, apellido, rol, whatsapp, cuit, antiguedad, facturacion
        };
        console.log('[FormularioGeneral] handleSubmit enviando:', stepData);
        onNext(stepData); // Llama al callback del padre (handleStepCompletion)

    };

    // --- Datos para el Simulador (Sin cambios) ---
    const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
    const simulatorData = { nombre: nombreProveedor, ubicacionDetalle };

    // --- Renderizado del Componente (CON NUEVAS CLASES CSS) ---
    return (
        // Usa la clase de layout base definida en _registroFormBase.scss
        <div className="registro-step-layout">

            {/* Contenedor del Formulario */}
            <div className="form-wrapper"> {/* Clase base para el contenedor del form */}
                <form onSubmit={handleSubmit} className="registro-form" noValidate> {/* Clase base para el form */}

                    {/* Título (estilado por .registro-form h1 en SCSS) */}
                    <h1>Datos básicos de Empresa</h1>
                    {/* <div className="orange-prop"></div> Reemplazado por border-bottom en h1 */}

                    {/* País / Región */}
                    {/* No necesita .form-section si es un solo elemento */}
                    {/* Usa la clase específica si necesita estilos únicos */}
                    <div className="custom-dropdown form-section"> {/* Añadido form-section si aplica gap */}
                        <label>País / Región:</label> {/* Label estilado por base */}
                        {/* Select estilado por base */}
                        <select name="pais" value={pais} onChange={e => setPais(e.target.value)}>
                            <option value="Argentina">🇦🇷 Argentina</option>
                        </select>
                    </div>

                    {/* Nombre Proveedor, Tipo, Categoría Principal */}
                    <div className='form-section'>
                        <label> Nombre del Proveedor:
                            <input type="text" name="nombreProveedor" value={nombreProveedor} onChange={e => setNombreProveedor(e.target.value)} required />
                        </label>
                        <label> Tipo de Proveedor:
                            <select name="tipoProveedor" value={tipoProveedor} onChange={e => setTipoProveedor(e.target.value)} required>
                                <option value="" disabled>Selecciona...</option>
                                <option value="Distribuidor">Distribuidor</option>
                                <option value="Fabricante">Fabricante</option>
                                <option value="Mayorista">Mayorista</option>
                            </select>
                        </label>
                        <label> Categoría Principal:
                            <select name="categoriaPrincipal" value={categoriaPrincipal} onChange={e => setCategoriaPrincipal(e.target.value)} required>
                                <option value="" disabled>Selecciona...</option>
                                {(categorias || []).map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                            </select>
                        </label>
                    </div>


                    {/* Otras Categorías */}
                    {/* Fieldset estilado por base */}
                    <fieldset className='form-section'>
                        <legend>Otras categorías (Elige hasta 5)</legend>
                        {/* Clase específica para estilos de layout/apariencia de checkboxes */}
                        <div className="cat-label-container">
                            {(categorias || []).map((cat, i) => (
                                // Clase específica para estilos del label del checkbox
                                <label className="cat-label" key={i}>
                                    <input type="checkbox" value={cat} onChange={handleCheckboxChange}
                                        checked={selectedCategories.includes(cat)}
                                        disabled={selectedCategories.length >= 5 && !selectedCategories.includes(cat)}
                                    />
                                    {/* El <p> interno podría no ser necesario si el label ya tiene buen estilo */}
                                    <span>{cat}</span>
                                </label>
                            ))}
                        </div>
                        {/* Usar clase base para errores */}
                        {categoryError && <p className="error-message">{categoryError}</p>}
                    </fieldset>

                    {/* Ubicación (usando input-row para layout) */}
                    <div className="form-section">
                        <label>Ubicación</label> {/* Label general para la fila */}
                        <div className="input-row"> {/* Clase base para poner inputs lado a lado en desktop */}
                            <label> {/* No necesita texto si el placeholder es claro */}
                                <input type="text" name="ciudad" placeholder="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} />
                            </label>
                            <label>
                                <input type="text" name="provincia" placeholder="Provincia / Estado" value={provincia} onChange={e => setProvincia(e.target.value)} />
                            </label>
                        </div>
                    </div>


                    {/* Datos de Contacto */}
                    <div className='form-section'>
                        <h3>Cuéntanos sobre ti (Contacto Principal)</h3>
                        <div className="input-row"> {/* Clase base para Nombre/Apellido */}
                            <label>
                                <input type="text" name="nombre" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
                            </label>
                            <label>
                                <input type="text" name="apellido" placeholder="Apellido" value={apellido} onChange={e => setApellido(e.target.value)} required />
                            </label>
                        </div>
                        <label> Rol en la Empresa:
                            <input type="text" name="rol" placeholder="Ej: Gerente de Ventas" value={rol} onChange={e => setRol(e.target.value)} required />
                        </label>
                        <label> Whatsapp (con código de país):
                            <input type="text" name="whatsapp" placeholder="Ej: +5491122223333" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required />
                        </label>
                    </div>


                    {/* Información Opcional */}
                    <div className='form-section'>
                        <h3>Información Legal y Financiera (Opcional)</h3>
                        <label> CUIT / RUT / Tax ID:
                            <input type="text" name="cuit" value={cuit} onChange={e => setCuit(e.target.value)} />
                        </label>
                        <div className="input-row"> {/* Antigüedad y Facturación lado a lado */}
                            <label> Antigüedad (años):
                                <input type="number" min="0" name="antiguedad" value={antiguedad} onChange={e => setAntiguedad(e.target.value)} />
                            </label>
                            <label> Facturación anual (USD):
                                <input type="number" min="0" name="facturacion" value={facturacion} onChange={e => setFacturacion(e.target.value)} />
                            </label>
                        </div>
                    </div>

                    {/* Botones de Navegación (usa clase base) */}
                    <div className="botones-navegacion">
                        <button type="button" onClick={onBack}>Atrás</button>
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            {/* Contenedor del Simulador (usa clase base) */}
            <div className="simulator-wrapper">
                {/* Título estilado por base */}
                <h1>{selectedCard === 'tipoA' ? 'Card Historia' : 'Card Producto'}</h1>
                {selectedCard === 'tipoA' && <CardHistoriaSimulator data={simulatorData} />}
                {selectedCard === 'tipoB' && <CardProductoSimulator data={simulatorData} />}
                {!selectedCard && <p style={{ color: 'white', textAlign: 'center' }}>Selecciona un tipo de card.</p>}
            </div>
        </div>
    );
};

export default FormularioGeneral;