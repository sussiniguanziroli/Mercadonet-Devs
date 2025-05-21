// src/components/registroProveedor/steps/FormularioPersonalizado.jsx

import React from 'react';
import FormularioPersonalizadoTipoA from './FormularioPersonalizadoTipoA';
import FormularioPersonalizadoTipoB from './FormularioPersonalizadoTipoB';

const FormularioPersonalizado = ({
    selectedServices, // Prop para TipoA y TipoB (si es necesario para la lógica interna o preview)
    initialData,    // Recibe formData.datosPersonalizados[selectedCard] del Navigator
    onNext,
    onBack,
    onCancel,
    selectedCard,
    tipoProveedor,    // Prop para preview en TipoA y TipoB
    tipoRegistro,     // Prop para preview en TipoA y TipoB
    nombreProveedor,  // Prop para preview en TipoA y TipoB
    ciudad,           // Prop para preview en TipoA y TipoB
    provincia,        // Prop para preview en TipoA y TipoB
    marcas,           // Prop para opciones de Autocomplete en TipoA y TipoB
    extras,           // Prop para opciones de Autocomplete en TipoA y TipoB
    // servicios ya no se pasa aquí, ya que FormularioGeneral lo usa y selectedServices se pasa a TipoA/B
}) => {

    const commonProps = {
        initialData, // Se pasa directamente initialData, ya que está en el formato esperado
        onNext,
        onBack,
        onCancel,
        nombreProveedor,
        ciudad,
        provincia,
        tipoProveedor,
        tipoRegistro,
        selectedServices, // Asegúrate de que esta prop se esté pasando si es necesaria para CardHistoriaPreview o CardProductosPreview
        marcas,          // Opciones para el Autocomplete de marcas
        extras           // Opciones para el Autocomplete de extras
    };

    // Ya no se necesita una transformación específica para tipoAProps si initialData
    // (proveniente de formData.datosPersonalizados.tipoA del Navigator)
    // ya tiene la estructura correcta (ej: logoURL, carruselURLs).

    return (
        <div>
            {selectedCard === 'tipoA' && <FormularioPersonalizadoTipoA {...commonProps} />}
            {selectedCard === 'tipoB' && <FormularioPersonalizadoTipoB {...commonProps} />}
            {!selectedCard && <p>Error: Tipo de card no determinado.</p>}
        </div>
    );
};

export default FormularioPersonalizado;