// src/components/registroProveedor/steps/FormularioPersonalizado.jsx

import React from 'react';
import FormularioPersonalizadoTipoA from './FormularioPersonalizadoTipoA';
import FormularioPersonalizadoTipoB from './FormularioPersonalizadoTipoB';

const FormularioPersonalizado = ({
    selectedServices,
    initialData,    // Recibe formData.datosPersonalizados[selectedCard] del Navigator
    onNext,
    onBack,
    onCancel,
    selectedCard,
    tipoProveedor,
    tipoRegistro,
    nombreProveedor,
    ciudad,
    provincia,
    marcas,
    extras,
    servicios,
    fileUploadProgress, // Prop para el progreso de subida
    uploadFileImmediately, // <-- NUEVA PROP: Función para iniciar la subida inmediata
}) => {

    const commonProps = {
        initialData,
        onNext,
        onBack,
        onCancel,
        nombreProveedor,
        ciudad,
        provincia,
        tipoProveedor,
        tipoRegistro,
        selectedServices,
        marcas,
        extras,
        servicios,
        fileUploadProgress,
        uploadFileImmediately, // <-- Pasar la nueva prop
    };

    return (
        <div>
            {selectedCard === 'tipoA' && <FormularioPersonalizadoTipoA {...commonProps} />}
            {selectedCard === 'tipoB' && <FormularioPersonalizadoTipoB {...commonProps} />}
            {!selectedCard && <p>Error: Tipo de card no determinado.</p>}
        </div>
    );
};

export default FormularioPersonalizado;