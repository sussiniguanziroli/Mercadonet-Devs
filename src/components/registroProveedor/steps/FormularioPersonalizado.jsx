// src/components/registroProveedor/steps/FormularioPersonalizado.jsx

import React from 'react';

// Importa los componentes específicos TipoA y TipoB
import FormularioPersonalizadoTipoA from './FormularioPersonalizadoTipoA';
import FormularioPersonalizadoTipoB from './FormularioPersonalizadoTipoB';

/**
 * Componente "Dispatcher" que renderiza el formulario personalizado
 * correcto (TipoA o TipoB) basado en la `selectedCard`.
 * Pasa todas las props necesarias a los hijos.
 */
const FormularioPersonalizado = ({
    initialData,    // Datos iniciales para el tipo de card específico (pasados por el Navigator)
    onNext,         // Función para guardar datos y avanzar (pasada por el Navigator)
    onBack,         // Función para retroceder (pasada por el Navigator)
    onCancel,       // Función para cancelar (pasada por el Navigator)
    selectedCard    // 'tipoA' o 'tipoB', determina qué formulario renderizar
}) => {

    // console.log("[FormularioPersonalizado] Initial Data:", initialData); // Para depurar

    // No necesita estado propio, solo lógica de renderizado condicional.

    return (
        // El div contenedor principal puede o no ser necesario dependiendo de estilos globales.
        // Ya no necesita la clase 'formulario-personalizado' si no tiene estilos asociados.
        <div>
            {selectedCard === 'tipoA' && (
                <FormularioPersonalizadoTipoA
                    // Pasa los datos iniciales específicos para TipoA
                    initialData={initialData}
                    // Pasa las funciones de navegación/guardado directamente
                    onNext={onNext}
                    onBack={onBack}
                    onCancel={onCancel}
                />
            )}
            {selectedCard === 'tipoB' && (
                <FormularioPersonalizadoTipoB
                    // Pasa los datos iniciales específicos para TipoB
                    initialData={initialData}
                     // Pasa las funciones de navegación/guardado directamente
                    onNext={onNext}
                    onBack={onBack}
                    onCancel={onCancel}
                />
            )}
            {/* Podríamos añadir un mensaje si selectedCard no es ni 'tipoA' ni 'tipoB' */}
            {!selectedCard && (
                <p>Error: Tipo de card no determinado.</p>
            )}
        </div>
    );
};

export default FormularioPersonalizado;