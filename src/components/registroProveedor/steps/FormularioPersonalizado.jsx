// src/components/registroProveedor/steps/FormularioPersonalizado.jsx

import React from 'react';
import FormularioPersonalizadoTipoA from './FormularioPersonalizadoTipoA';
import FormularioPersonalizadoTipoB from './FormularioPersonalizadoTipoB';

const FormularioPersonalizado = ({
    initialData,
    onNext,
    onBack,
    onCancel,
    selectedCard,
    // --- NUEVAS PROPS A RECIBIR Y PASAR ---
    nombreProveedor, // Del paso 1
    ciudad,          // Del paso 1
    provincia,       // Del paso 1
    // categoriasCompletas, // Ya no se necesita para preview de Historia
    marcas,          // Filtro global
    extras,          // Filtro global
}) => {

    const commonProps = { // Agrupa props comunes para pasarlas
        initialData, onNext, onBack, onCancel,
        nombreProveedor, ciudad, provincia,
        // categoriasCompletas, // No necesario por ahora
    };

    const tipoAProps = { ...commonProps, marcas, extras }; // Tipo A necesita marcas y extras
    const tipoBProps = { ...commonProps, marcas, extras }; // Tipo B necesita marcas y servicios

    return (
        <div>
            {selectedCard === 'tipoA' && <FormularioPersonalizadoTipoA {...tipoAProps} />}
            {selectedCard === 'tipoB' && <FormularioPersonalizadoTipoB {...tipoBProps} />}
            {!selectedCard && <p>Error: Tipo de card no determinado.</p>}
        </div>
    );
};

export default FormularioPersonalizado;