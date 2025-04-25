// src/components/registroProveedor/steps/FormularioGeneral.jsx

import React, { useState, useEffect } from 'react';
import { scrollToTop } from '../../../utils/scrollHelper';
import CardHistoriaPreview from '../card_simulators/CardHistoriaPreview';
// TODO: Importar CardProductosPreview cuando esté unificado
import CardProductoSimulator from '../card_simulators/CardProductosSimulator'; // Placeholder

const FormularioGeneral = ({
    initialData,
    onNext,
    onBack,
    onCancel,
    categorias = [],   // <= Recibe categorías
    selectedCard,
    ubicaciones = [], // <= Recibe ubicaciones (provincias)
    pproductos = []   // <= Recibe tipos de proveedor
}) => {
    // --- Estados locales ---
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

    // --- Efecto para inicializar desde initialData ---
    useEffect(() => {
        if (initialData) {
            setPais(initialData.pais || 'Argentina');
            setNombreProveedor(initialData.nombreProveedor || '');
            setTipoProveedor(initialData.tipoProveedor || '');
            setCategoriaPrincipal(initialData.categoriaPrincipal || '');
            setSelectedCategories(initialData.categoriasAdicionales || []);
            setCiudad(initialData.ciudad || '');
            setProvincia(initialData.provincia || ''); // Inicializa el estado de provincia
            setNombre(initialData.nombre || '');
            setApellido(initialData.apellido || '');
            setRol(initialData.rol || '');
            setWhatsapp(initialData.whatsapp || '');
            setCuit(initialData.cuit || '');
            setAntiguedad(initialData.antiguedad || '');
            setFacturacion(initialData.facturacion || '');
        }
    }, [initialData]);

    // --- Manejador para checkboxes ---
    const handleCheckboxChange = (e) => { /* ... (sin cambios) ... */ };

    // --- Submit ---
    const handleSubmit = (e) => {
        e.preventDefault();
        const stepData = {
            pais, nombreProveedor, tipoProveedor, categoriaPrincipal,
            categoriasAdicionales: selectedCategories, ciudad, provincia,
            nombre, apellido, rol, whatsapp, cuit, antiguedad, facturacion
        };
        console.log('[FormularioGeneral] handleSubmit enviando:', stepData);
        onNext(stepData);
    };

    // --- Datos para el Simulador (Sin categorías) ---
    const buildPreviewDataForStep1 = () => {
        const ubicacionDetalle = `${ciudad}${ciudad && provincia ? ', ' : ''}${provincia}`;
        return {
            nombre: nombreProveedor,
            ubicacionDetalle: ubicacionDetalle,
        };
    };
    const previewData = buildPreviewDataForStep1();

    // --- Renderizado ---
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

                    {/* Nombre Proveedor, Tipo, Categoría Principal */}
                    <div className='form-section'>
                        <label> Nombre del Proveedor:
                            <input type="text" name="nombreProveedor" value={nombreProveedor} onChange={e => setNombreProveedor(e.target.value)} required />
                        </label>
                        <label> Tipo de Proveedor: {/* Usa prop 'pproductos' */}
                            <select name="tipoProveedor" value={tipoProveedor} onChange={e => setTipoProveedor(e.target.value)} required>
                                <option value="" disabled>Selecciona...</option>
                                {/* Mapea los tipos de proveedor recibidos */}
                                {(pproductos || []).map((tipo, i) => <option key={i} value={tipo}>{tipo}</option>)}
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
                    <fieldset className='form-section'>
                         <legend>Otras categorías (Elige hasta 5)</legend>
                         <div className="cat-label-container">
                             {(categorias || []).map((cat, i) => (
                                 <label className="cat-label" key={i}>
                                     <input type="checkbox" value={cat} onChange={handleCheckboxChange} checked={selectedCategories.includes(cat)} disabled={selectedCategories.length >= 5 && !selectedCategories.includes(cat)} />
                                     <span>{cat}</span>
                                 </label>
                             ))}
                         </div>
                         {categoryError && <p className="error-message">{categoryError}</p>}
                     </fieldset>

                    {/* Ubicación */}
                    <div className="form-section">
                        <label>Ubicación</label>
                        <div className="input-row">
                            <label>
                                {/* *** PLACEHOLDER CAMBIADO *** */}
                                <input type="text" name="ciudad" placeholder="Ciudad / Localidad" value={ciudad} onChange={e => setCiudad(e.target.value)} />
                            </label>
                            <label>
                                {/* *** USA SELECT CON PROP 'ubicaciones' *** */}
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
                         <button type="button" onClick={onBack} disabled={true}>Atrás</button>
                         <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>

            {/* Contenedor del Simulador */}
            <div className="simulator-wrapper">
                <h1>{selectedCard === 'tipoA' ? 'Card Historia' : 'Card Producto'}</h1>
                {selectedCard === 'tipoA' && <CardHistoriaPreview proveedor={previewData} />}
                {selectedCard === 'tipoB' && <CardProductoSimulator data={previewData} />} {/* TODO: Cambiar a CardProductosPreview */}
                {!selectedCard && <p style={{ color: 'white', textAlign: 'center' }}>Selecciona un tipo de card.</p>}
            </div>
        </div>
    );
};
export default FormularioGeneral;