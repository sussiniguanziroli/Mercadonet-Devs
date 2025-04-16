// src/components/registroProveedor/RegistrosProveedorNavigator.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material'; // No necesitamos Paper aquí

// Componentes Reutilizables y de Pasos
import CustomStepper from './assetsRegistro/CustomStepper'; // Ajusta ruta si es necesario
import SeleccionTipoCard from './steps/SeleccionTipoCard';
import FormularioGeneral from './steps/FormularioGeneral';
import FormularioPersonalizado from './steps/FormularioPersonalizado';
// Asegúrate de que estos componentes existan y sigan el patrón
import SeleccionPlan from './steps/SeleccionPlan';
import ResumenRegistro from './steps/ResumenRegistro';

//importo constantes del archivo js

import { STEPS, CATEGORIAS, backgroundImageURL} from "../registroProveedor/assetsRegistro/Constants.js"

// Estructura inicial detallada para el estado del formulario
const initialFormData = {
    tipoCard: null,
    datosGenerales: {
        pais: 'Argentina', nombreProveedor: '', tipoProveedor: '', categoriaPrincipal: '',
        categoriasAdicionales: [], ciudad: '', provincia: '', nombre: '', apellido: '',
        rol: '', whatsapp: '', cuit: '', antiguedad: '', facturacion: '',
    },
    datosPersonalizados: {
        // Las claves 'tipoA' y 'tipoB' se llenarán según la selección
        tipoA: {
            descripcion: '', sitioWeb: '', whatsapp: '', telefono: '', email: '',
            marca: [], extras: [], logoFile: null, carruselFiles: [],
        },
        tipoB: {
            descripcion: '', sitioWeb: '', whatsapp: '', telefono: '', email: '',
            marcas: [], servicios: [], logoFile: null, carruselFiles: [],
            galeria: [], // Array de { titulo: '', precio: '', imagenFile: null }
        },
    },
    planSeleccionado: null,
};

// --- Componente Principal del Navegador ---
const RegistrosProveedorNavigator = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(initialFormData);

    // --- Navegación ---
    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
    const prevStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }
    const cancelRegistration = () => {
        // Opcional: Añadir confirmación
        setFormData(initialFormData); // Resetea el formulario al cancelar
        navigate("/registrar-mi-empresa");
    };

    // --- Manejo de Datos ---
    const updateStepData = (stepKey, newData) => {
        setFormData(prev => {
            if (stepKey === 'tipoCard' || stepKey === 'planSeleccionado') {
                return { ...prev, [stepKey]: newData };
            }
            return {
                ...prev,
                [stepKey]: {
                    ...(typeof prev[stepKey] === 'object' && prev[stepKey] !== null ? prev[stepKey] : {}),
                    ...newData
                }
            };
        });
    };

    const handleStepCompletion = (stepKey, stepLocalData) => {
        console.log(`[Navigator] Datos recibidos de ${stepKey}:`, stepLocalData);
        updateStepData(stepKey, stepLocalData);
        nextStep();
    };

    const handleTipoCardSelection = (tipo) => {
        console.log(`[Navigator] Tipo Card seleccionado:`, tipo);
        setFormData(prev => ({
            ...prev,
            tipoCard: tipo,
            datosPersonalizados: {
                ...prev.datosPersonalizados,
                [tipo]: prev.datosPersonalizados?.[tipo] || initialFormData.datosPersonalizados[tipo],
                // Opcional: Resetear el otro tipo: [tipo === 'tipoA' ? 'tipoB' : 'tipoA']: initialFormData.datosPersonalizados[tipo === 'tipoA' ? 'tipoB' : 'tipoA']
            }
        }));
        nextStep();
    };

    // --- Renderizado del Paso Actual ---
    const renderCurrentStep = () => {
        const stepProps = { onBack: prevStep, onCancel: cancelRegistration };
        // El color del texto deberá manejarse dentro de cada componente o con un tema oscuro global
        // const textColor = 'common.white';

        switch (currentStep) {
            case 0:
                return <SeleccionTipoCard onSelectCard={handleTipoCardSelection} onCancel={cancelRegistration}  />;
            case 1:
                return <FormularioGeneral {...stepProps}
                    initialData={formData.datosGenerales}
                    onNext={(localData) => handleStepCompletion('datosGenerales', localData)}
                    categorias={CATEGORIAS}
                    selectedCard={formData.tipoCard}
                    /* textColor={textColor} */ />;
            case 2:
                if (!formData.tipoCard) return <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 5 }}>Error: Tipo de card no seleccionado. Vuelve al paso anterior.</Typography>;
                return <FormularioPersonalizado {...stepProps}
                    initialData={formData.datosPersonalizados[formData.tipoCard] || {}}
                    onNext={(localData) => handleStepCompletion('datosPersonalizados', { [formData.tipoCard]: localData })}
                    selectedCard={formData.tipoCard}
                    /* textColor={textColor} */ />;
            case 3:
                // Asumiendo que SeleccionPlan existe
                return <SeleccionPlan {...stepProps}
                    initialData={formData.planSeleccionado}
                    onNext={(plan) => handleStepCompletion('planSeleccionado', plan)}
                    /* textColor={textColor} */ />;
            case 4:
                // Asumiendo que ResumenRegistro existe
                return <ResumenRegistro
                    formData={formData}
                    onBack={prevStep}
                    onCancel={cancelRegistration}
                    onConfirm={async () => {
                        console.log("[Navigator] Iniciando Confirmación de Registro:", JSON.stringify(formData, null, 2));
                        alert("Registro Finalizado (Simulación). Subida de archivos y guardado final pendiente.");
                        console.log("TODO: Implementar subida de archivos (logo, carrusel, galería) desde formData y guardado final en onConfirm.");
                        // Lógica async para subir archivos, obtener URLs, crear objeto final, enviar a API...
                        // navigate("/registro-exitoso");
                    }}
                    /* textColor={textColor} */ />;
            default:
                console.error("Error: Paso desconocido", currentStep);
                return <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 5 }}>Error: Paso desconocido.</Typography>;
        }
    };

    // --- Renderizado del Navegador ---
    return (
        <Box sx={{ width: '100%', minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Stepper Fijo Arriba */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 1100,
                backgroundColor: 'rgba(0, 5, 16, 0.85)', // Fondo oscuro semi-transparente
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
                <Box sx={{ width: { xs: '95%', md: '85%', lg: '75%' }, margin: 'auto', py: 1.5 }}>
                    <CustomStepper
                        activeStep={currentStep}
                        steps={STEPS}
                        sx={{ // Estilos para que el Stepper se vea bien sobre fondo oscuro
                             padding: 1,
                             backgroundColor: 'transparent', // Fondo transparente
                             borderRadius: 0,
                             '& .MuiStepLabel-label': {
                                 color: 'rgba(255, 255, 255, 0.7)', // Blanco semi-transparente (inactivo)
                                 '&.Mui-active': {
                                     color: '#FFFFFF', // Blanco (activo)
                                     fontWeight: 'bold',
                                 },
                                 '&.Mui-completed': {
                                     color: 'rgba(255, 255, 255, 0.9)', // Blanco más opaco (completado)
                                 }
                             },
                             '& .MuiStepIcon-root': {
                                 color: 'rgba(255, 255, 255, 0.5)', // Grisáceo (inactivo)
                                 '&.Mui-active': {
                                     color: '#FFA500', // Naranja (activo - ajusta tu color)
                                 },
                                 '&.Mui-completed': {
                                     color: '#FFFFFF', // Blanco (completado)
                                 }
                             },
                             '& .MuiStepConnector-line': {
                                borderColor: 'rgba(255, 255, 255, 0.3)', // Línea grisácea
                             }
                        }}
                    />
                </Box>
            </Box>

            {/* Área Principal con Fondo y Contenido Directo (SIN Paper) */}
            <Box sx={{
                flexGrow: 1, width: '100%',
                pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 }, px: { xs: 2, md: 3 }, // Paddings ajustados
                backgroundImage: `url(${backgroundImageURL})`,
                backgroundSize: 'cover', backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed',
                display: 'flex', flexDirection: 'column', // Centra el Box interior
                alignItems: 'center', justifyContent: 'flex-start', // Alinea contenido arriba
            }}>
                {/* Contenedor para limitar ancho del contenido */}
                 <Box sx={{
                     width: '100%',
                     maxWidth: '1500px', // Ancho máximo como en diseño
                     position: 'relative', // Para botón cancelar
                     display: 'flex', flexDirection: 'column', alignItems: 'center',
                 }}>
                    {/* Botón Cancelar Absoluto (Estilo para fondo oscuro) */}
                    {currentStep < STEPS.length && (
                        <Button
                            onClick={cancelRegistration}
                            variant="outlined"
                            size="small"
                            sx={{
                                position: 'absolute', top: 0, right: 0, zIndex: 1,
                                color: 'common.white', borderColor: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderColor: 'common.white',
                                }
                            }}
                        > Cancelar </Button>
                    )}

                    {/* Renderiza el componente del paso actual directamente */}
                    {renderCurrentStep()}

                </Box>
            </Box>
             {/* Footer podría ir aquí fuera del Box principal si es necesario */}
        </Box>
    );
};

export default RegistrosProveedorNavigator;