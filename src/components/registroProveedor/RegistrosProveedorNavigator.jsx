// src/components/registroProveedor/RegistrosProveedorNavigator.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

import { scrollToTop } from '../../utils/scrollHelper.js';

// Componentes Reutilizables y de Pasos
import CustomStepper from './assetsRegistro/CustomStepper'; // Ajusta ruta si es necesario
import SeleccionTipoCard from './steps/SeleccionTipoCard';
import FormularioGeneral from './steps/FormularioGeneral';
import FormularioPersonalizado from './steps/FormularioPersonalizado';
// Asegúrate de que estos componentes existan y sigan el patrón
import SeleccionPlan from './steps/SeleccionPlan';
import ResumenRegistro from './steps/ResumenRegistro';

// Importa SOLO las constantes estáticas necesarias
import { STEPS, backgroundImageURL } from "../registroProveedor/assetsRegistro/Constants.js"; // SIN CATEGORIAS

// --- Importa la función del servicio ---
import { fetchCategoriasPrincipales } from '../../services/firestoreService'; // <-- ¡¡AJUSTA ESTA RUTA!!

// Estructura inicial detallada para el estado del formulario (copiada de tu original)
const initialFormData = {
    tipoCard: null,
    datosGenerales: {
        pais: 'Argentina', nombreProveedor: '', tipoProveedor: '', categoriaPrincipal: '',
        categoriasAdicionales: [], ciudad: '', provincia: '', nombre: '', apellido: '',
        rol: '', whatsapp: '', cuit: '', antiguedad: '', facturacion: '',
    },
    datosPersonalizados: {
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

    // Estado para las categorías y su carga/error
    const [categoriasFirestore, setCategoriasFirestore] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [errorCategorias, setErrorCategorias] = useState(null);

    // --- useEffect para Scroll con Retraso ---
    useEffect(() => {
        // Se ejecuta cada vez que 'currentStep' cambia.
        console.log(`Navigator: Step cambió a ${currentStep}. Programando scroll...`);

        // Añadimos un pequeño retraso antes de intentar el scroll.
        // Esto le da tiempo a React para terminar de actualizar el DOM.
        const scrollTimeoutId = setTimeout(() => {
            console.log("Navigator: Ejecutando scrollToTop desde setTimeout.");
            scrollToTop(); // Llama a tu función original sin modificarla
        }, 20); // Retraso de 100 milisegundos (puedes ajustar este valor, ej: 50, 150)

        // Es BUENA PRÁCTICA limpiar el timeout si el componente se desmonta
        // o si el efecto se vuelve a ejecutar antes de que el timeout termine.
        return () => {
            console.log("Navigator: Limpiando timeout de scroll.");
            clearTimeout(scrollTimeoutId);
        };

    }, [currentStep]); 

    // --- useEffect para llamar al servicio y cargar categorías ---
    useEffect(() => {
        const cargarCategorias = async () => {
            setLoadingCategorias(true);
            setErrorCategorias(null);
            console.log("[Navigator] Llamando al servicio para cargar categorías...");
            try {
                const datosCategorias = await fetchCategoriasPrincipales(); // Llama al servicio

                if (datosCategorias.length === 0 && !errorCategorias) { // Verifica si está vacío sin un error previo explícito
                     console.warn("[Navigator] El servicio devolvió una lista de categorías vacía.");
                     // Podrías establecer un error si la lista vacía no es esperada
                     // setErrorCategorias("No se encontraron categorías disponibles.");
                }
                setCategoriasFirestore(datosCategorias);

            } catch (err) {
                // Captura errores si el servicio *lanzara* una excepción
                console.error("[Navigator] Error al llamar al servicio de categorías:", err);
                setErrorCategorias("Ocurrió un error inesperado al cargar las categorías.");
                setCategoriasFirestore([]);
            } finally {
                setLoadingCategorias(false);
                console.log("[Navigator] Carga de categorías finalizada (desde el servicio).");
            }
        };
        cargarCategorias();
    }, []); // Se ejecuta solo una vez al montar

    // --- Navegación ---
    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }
    const cancelRegistration = () => {
        setFormData(initialFormData);
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
            }
        }));
        nextStep();
    };

    // --- Renderizado del Paso Actual ---
    const renderCurrentStep = () => {
        const stepProps = { onBack: prevStep, onCancel: cancelRegistration };

        switch (currentStep) {
            case 0:
                return <SeleccionTipoCard onSelectCard={handleTipoCardSelection} onCancel={cancelRegistration} />;
            case 1:
                // Manejo de carga y error para categorías
                if (loadingCategorias) {
                    return (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5 }}>
                            <CircularProgress sx={{ color: 'common.white' }}/>
                            <Typography sx={{ ml: 2, color: 'common.white' }}>Cargando categorías...</Typography>
                        </Box>
                    );
                }
                if (errorCategorias) {
                     return (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}>
                             <Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>
                                {errorCategorias}
                             </Typography>
                             <Button onClick={cancelRegistration} variant="outlined" color="warning">Volver</Button>
                        </Box>
                    );
                }
                if (!loadingCategorias && !errorCategorias && categoriasFirestore.length === 0) {
                     return (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}>
                             <Typography sx={{ color: 'warning.main', textAlign: 'center', mb: 2 }}>
                                No hay categorías disponibles en este momento.
                             </Typography>
                             <Button onClick={cancelRegistration} variant="outlined" color="warning">Volver</Button>
                        </Box>
                     );
                 }

                // Renderiza el formulario si todo está bien
                return <FormularioGeneral {...stepProps}
                    initialData={formData.datosGenerales}
                    onNext={(localData) => handleStepCompletion('datosGenerales', localData)}
                    categorias={categoriasFirestore} // Pasa las categorías cargadas
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
                 return <SeleccionPlan {...stepProps}
                    initialData={formData.planSeleccionado}
                    onNext={(plan) => handleStepCompletion('planSeleccionado', plan)}
                    /* textColor={textColor} */ />;
            case 4:
                return <ResumenRegistro
                    formData={formData}
                    onBack={prevStep}
                    onCancel={cancelRegistration}
                    onConfirm={async () => {
                        console.log("[Navigator] Iniciando Confirmación de Registro:", JSON.stringify(formData, null, 2));
                        alert("Registro Finalizado (Simulación). Subida de archivos y guardado final pendiente.");
                        console.log("TODO: Implementar subida de archivos (logo, carrusel, galería) desde formData y guardado final en onConfirm.");
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
                position: 'relative', top: 0, zIndex: 1100,
                backgroundColor: 'rgba(0, 5, 16, 0.85)', // Fondo oscuro semi-transparente
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
                <Box sx={{ width: { xs: '95%', md: '85%', lg: '75%' }, margin: 'auto', py: 1.5 }}>
                    <CustomStepper
                        activeStep={currentStep}
                        steps={STEPS}
                        sx={{ // Estilos para fondo oscuro
                             padding: 1, backgroundColor: 'transparent', borderRadius: 0,
                             '& .MuiStepLabel-label': { color: 'rgba(255, 255, 255, 0.7)', '&.Mui-active': { color: '#FFFFFF', fontWeight: 'bold', }, '&.Mui-completed': { color: 'rgba(255, 255, 255, 0.9)', } },
                             '& .MuiStepIcon-root': { color: 'rgba(255, 255, 255, 0.5)', '&.Mui-active': { color: '#FFA500', /* Naranja */ }, '&.Mui-completed': { color: '#FFFFFF', } },
                             '& .MuiStepConnector-line': { borderColor: 'rgba(255, 255, 255, 0.3)', }
                        }}
                    />
                </Box>
            </Box>

            {/* Área Principal con Fondo */}
            <Box sx={{
                flexGrow: 1, width: '100%',
                pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 }, px: { xs: 2, md: 3 },
                backgroundImage: `url(${backgroundImageURL})`,
                backgroundSize: 'cover', backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-start',
            }}>
                {/* Contenedor para limitar ancho del contenido */}
                 <Box sx={{
                     width: '100%', maxWidth: '1500px', // Ancho máximo
                     position: 'relative',
                     display: 'flex', flexDirection: 'column', alignItems: 'center',
                 }}>
                    {/* Botón Cancelar Absoluto */}
                    {currentStep < STEPS.length && ( // Asumo que no quieres mostrarlo en el último paso (resumen)
                        <Button
                            onClick={cancelRegistration}
                            variant="outlined"
                            size="small"
                            sx={{
                                position: 'absolute', top: { xs: -25, md: -35 }, right: 0, zIndex: 1, // Ajustado para no superponerse tanto con padding superior
                                color: 'common.white', borderColor: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'common.white', }
                            }}
                        > Cancelar </Button>
                    )}

                    {/* Renderiza el componente del paso actual */}
                    {renderCurrentStep()}

                </Box>
            </Box>
        </Box>
    );
};

export default RegistrosProveedorNavigator;