// src/components/registroProveedor/RegistrosProveedorNavigator.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

// Asumo que esta utilidad existe en tu proyecto
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

// --- MODIFICADO: Importa la función del servicio que trae TODO ---
import { fetchFiltrosGlobales } from '../../services/firestoreService'; // <-- ¡VERIFICA ESTA RUTA!

// Estructura inicial detallada para el estado del formulario (copiada de tu original)
const initialFormData = {
    tipoCard: null,
    datosGenerales: {
        pais: 'Argentina', tipoRegistro: '', nombreProveedor: '', tipoProveedor: '', categoriaPrincipal: '',
        categoriasAdicionales: [], ciudad: '', provincia: '', nombre: '', apellido: '',
        rol: '', whatsapp: '', cuit: '', antiguedad: '', facturacion: '',
    },
    datosPersonalizados: {
        tipoA: { // Historia
            descripcion: '', sitioWeb: '', whatsapp: '', telefono: '', email: '',
            marca: [], extras: [], logoFile: null, carruselFiles: [],
        },
        tipoB: { // Productos
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

    // --- MODIFICADO: Estado para TODOS los filtros globales ---
    const [filtrosData, setFiltrosData] = useState({
        categorias: [],
        pproductos: [],
        ubicaciones: [],
        extras: [],
        servicios: [],
        marcas: []
    });
    const [loadingFiltros, setLoadingFiltros] = useState(true);
    const [errorFiltros, setErrorFiltros] = useState(null);

    // --- useEffect para Scroll con Retraso ---
    useEffect(() => {
        console.log(`Navigator: Step cambió a ${currentStep}. Programando scroll...`);
        const scrollTimeoutId = setTimeout(() => {
            console.log("Navigator: Ejecutando scrollToTop desde setTimeout.");
            scrollToTop();
        }, 20);
        return () => {
            console.log("Navigator: Limpiando timeout de scroll.");
            clearTimeout(scrollTimeoutId);
        };
    }, [currentStep]);

    // --- MODIFICADO: useEffect para llamar al servicio GLOBAL y guardar TODO ---
    useEffect(() => {
        const cargarFiltros = async () => {
            setLoadingFiltros(true);
            setErrorFiltros(null);
            console.log("[Navigator] Llamando al servicio fetchFiltrosGlobales...");
            try {
                const datosGlobales = await fetchFiltrosGlobales(); // Llama a la función que trae TODO
                console.log("[Navigator] Datos globales recibidos:", datosGlobales);

                setFiltrosData(datosGlobales); // Guarda TODO el objeto de filtros

                // Chequeo básico post-carga (opcional)
                if (!datosGlobales.categorias?.length || !datosGlobales.ubicaciones?.length) {
                    console.warn("[Navigator] Advertencia: Categorías o Ubicaciones llegaron vacías desde el servicio.");
                    // Podrías querer setear un error si son cruciales y fallaron silenciosamente
                    // setErrorFiltros("Fallo al cargar datos esenciales de configuración.");
                }
            } catch (err) { // Error en la llamada misma
                console.error("[Navigator] Error CRÍTICO al llamar fetchFiltrosGlobales:", err);
                setErrorFiltros("Error al cargar datos esenciales. Intenta recargar.");
                // Resetear a estado vacío en error crítico
                setFiltrosData({ categorias: [], pproductos: [], ubicaciones: [], extras: [], servicios: [], marcas: [] });
            } finally {
                setLoadingFiltros(false); // Finaliza la carga
                console.log("[Navigator] Carga de filtros globales finalizada.");
            }
        };
        cargarFiltros();
    }, []); // Se ejecuta solo una vez al montar

    // --- Navegación (Completa) ---
    const nextStep = () => {
        // El scroll ahora se maneja en el useEffect [currentStep]
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
    const prevStep = () => {
        // El scroll ahora se maneja en el useEffect [currentStep]
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }
    const cancelRegistration = () => {
        setFormData(initialFormData); // Resetea el formulario
        navigate("/registrar-mi-empresa"); // Navega fuera
    };

    // --- Manejo de Datos (Completo y CON LOGS DETALLADOS) ---
    const updateStepData = (stepKey, newData) => {
        setFormData(prev => {
            // --- LOGS PARA DEPURACIÓN ---
            console.log(`%c[Navigator] updateStepData para stepKey: ${stepKey}`, 'color: blue; font-weight: bold;', {
                'Estado PREVIO (prev)': { ...prev }, // Loguea una copia para evitar problemas de referencia
                'Nuevos Datos (newData)': newData,
            });
            // --- FIN LOGS ---

            // Si la clave es simple (tipoCard, planSeleccionado)
            if (stepKey === 'tipoCard' || stepKey === 'planSeleccionado') {
                const newState = { ...prev, [stepKey]: newData };
                console.log(`%c[Navigator] updateStepData - Nuevo Estado (simple):`, 'color: green;', newState);
                return newState;
            }
            // Si la clave es un objeto anidado (datosGenerales, datosPersonalizados)
            const newState = {
                ...prev, // 1. Copia todo el estado anterior
                [stepKey]: { // 2. Sobrescribe la clave específica (ej: 'datosGenerales') con un NUEVO objeto
                    // 3. Copia el contenido *anterior* de esa clave anidada (si existía y era objeto)
                    ...(typeof prev[stepKey] === 'object' && prev[stepKey] !== null ? prev[stepKey] : {}),
                    // 4. Fusiona (y sobrescribe si hay colisión) con los nuevos datos recibidos
                    ...newData
                }
            };
            console.log(`%c[Navigator] updateStepData - Nuevo Estado (anidado):`, 'color: green;', newState);
            return newState; // Devuelve el nuevo estado completo
        });
    };

    // Función llamada por los componentes de paso al completarse
    const handleStepCompletion = (stepKey, stepLocalData) => {
        console.log(`[Navigator] handleStepCompletion - Recibiendo datos para ${stepKey}:`, stepLocalData);
        updateStepData(stepKey, stepLocalData); // Actualiza el estado central
        nextStep(); // Avanza al siguiente paso
    };

    // Función específica para el primer paso (SeleccionTipoCard)
    const handleTipoCardSelection = (tipo) => {
        console.log(`[Navigator] Tipo Card seleccionado:`, tipo);
        // Actualiza tipoCard y pre-inicializa la rama correspondiente en datosPersonalizados
        setFormData(prev => ({
            ...prev,
            tipoCard: tipo,
            datosPersonalizados: {
                ...prev.datosPersonalizados,
                // Asegura que la estructura para el tipo seleccionado exista
                [tipo]: prev.datosPersonalizados?.[tipo] || initialFormData.datosPersonalizados[tipo],
            }
        }));
        console.log('[Navigator] handleTipoCardSelection - Llamando a nextStep. Tipo seleccionado:', tipo);
        nextStep(); // Avanza al siguiente paso
    };

    // --- Renderizado del Paso Actual (Pasando las props necesarias) ---
    const renderCurrentStep = () => {
        console.log('[Navigator] renderCurrentStep - currentStep:', currentStep, 'loadingFiltros:', loadingFiltros, 'errorFiltros:', errorFiltros);
        const stepProps = { onBack: prevStep, onCancel: cancelRegistration };

        // Manejo global de carga/error inicial
        if (loadingFiltros) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5 }}>
                    <CircularProgress sx={{ color: 'common.white' }} />
                    <Typography sx={{ ml: 2, color: 'common.white' }}>Cargando configuración...</Typography>
                </Box>
            );
        }
        if (errorFiltros) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}>
                    <Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>{errorFiltros}</Typography>
                    <Button onClick={cancelRegistration} variant="outlined" color="warning">Volver</Button>
                </Box>
            );
        }
        // Si pasó la carga inicial y no hay error, renderiza el paso actual
        switch (currentStep) {
            case 0:
                return <SeleccionTipoCard onSelectCard={handleTipoCardSelection} onCancel={cancelRegistration} />;
            case 1: // FormularioGeneral
                // Chequeo específico si las categorías (necesarias aquí) están vacías
                if (!filtrosData.categorias?.length) {
                    return (<Box sx={{/*...*/ }}><Typography color="warning.main">No se pudieron cargar las categorías.</Typography>{/*...*/}</Box>);
                }
                return <FormularioGeneral {...stepProps}
                    initialData={formData.datosGenerales}
                    onNext={(localData) => handleStepCompletion('datosGenerales', localData)}
                    // --- Pasando listas de filtros ---
                    servicios={filtrosData.servicios}
                    categorias={filtrosData.categorias}
                    ubicaciones={filtrosData.ubicaciones}
                    pproductos={filtrosData.pproductos}
                    selectedCard={formData.tipoCard}
                    marcasDisponibles={filtrosData.marcas}
                />;
            case 2: // FormularioPersonalizado (Dispatcher)
                if (!formData.tipoCard) return <Typography color="error.main">Error: Tipo de card no seleccionado...</Typography>;

                // Prepara datos del paso anterior para la preview del paso 2
                const datosPasoAnterior = {
                    nombreProveedor: formData.datosGenerales.nombreProveedor,
                    ciudad: formData.datosGenerales.ciudad,
                    provincia: formData.datosGenerales.provincia,
                };

                return <FormularioPersonalizado {...stepProps}
                    initialData={formData.datosPersonalizados[formData.tipoCard] || {}}
                    onNext={(localData) => handleStepCompletion('datosPersonalizados', { [formData.tipoCard]: localData })}
                    selectedCard={formData.tipoCard}
                    // --- Pasando datos del paso anterior Y listas de filtros ---
                    {...datosPasoAnterior} // Pasa nombreProveedor, ciudad, provincia
                    marcas={filtrosData.marcas}
                    extras={filtrosData.extras}
                    servicios={filtrosData.servicios}
                />;
            case 3: // SeleccionPlan
                return <SeleccionPlan {...stepProps}
                    initialData={formData.planSeleccionado}
                    onNext={(plan) => handleStepCompletion('planSeleccionado', plan)}
                />;
            case 4: // ResumenRegistro
                return <ResumenRegistro
                    formData={formData}
                    // Pasa filtrosData si el resumen necesita mostrar nombres de selecciones
                    filtrosData={filtrosData}
                    onBack={prevStep}
                    onCancel={cancelRegistration}
                    onConfirm={async () => {
                        console.log("[Navigator] Iniciando Confirmación de Registro:", JSON.stringify(formData, null, 2));
                        alert("Registro Finalizado (Simulación). Subida de archivos y guardado final pendiente.");
                        console.log("TODO: Implementar subida de archivos y guardado final en onConfirm.");
                    }}
                />;
            default:
                console.error("Error: Paso desconocido", currentStep);
                return <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 5 }}>Error: Paso desconocido.</Typography>;
        }
    };

    // --- Renderizado del Navegador (JSX Principal - Completo) ---
    return (
        <Box sx={{ width: '100%', minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Stepper Fijo Arriba */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 1100,
                backgroundColor: 'rgba(0, 5, 16, 0.85)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
                <Box sx={{ width: { xs: '95%', md: '85%', lg: '75%' }, margin: 'auto', py: 1.5 }}>
                    <CustomStepper
                        activeStep={currentStep}
                        steps={STEPS}
                        sx={{ /* ... estilos del stepper ... */ }}
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
                    width: '100%', maxWidth: '1500px',
                    position: 'relative',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                    {/* Botón Cancelar Absoluto */}
                    {currentStep > 0 && currentStep < STEPS.length - 1 && ( // Mostrar desde paso 1 hasta antes del último
                        <Button
                            onClick={cancelRegistration}
                            variant="outlined"
                            size="small"
                            sx={{
                                position: 'absolute', top: { xs: -25, md: -35 }, right: 0, zIndex: 1,
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