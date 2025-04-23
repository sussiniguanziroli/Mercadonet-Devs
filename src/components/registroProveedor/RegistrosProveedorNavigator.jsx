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
        pais: 'Argentina', nombreProveedor: '', tipoProveedor: '', categoriaPrincipal: '',
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

    // --- Mantenemos el estado como si solo cargáramos categorías por ahora ---
    const [categoriasFirestore, setCategoriasFirestore] = useState([]);
    // Usaremos estos mismos estados de carga/error para la llamada global
    const [loadingFiltros, setLoadingFiltros] = useState(true); // Renombrado para claridad
    const [errorFiltros, setErrorFiltros] = useState(null);     // Renombrado para claridad

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

    // --- MODIFICADO: useEffect para llamar al servicio GLOBAL pero SOLO USAR CATEGORÍAS ---
    useEffect(() => {
        const cargarFiltros = async () => {
            setLoadingFiltros(true);
            setErrorFiltros(null);
            console.log("[Navigator] Llamando al servicio fetchFiltrosGlobales...");
            try {
                const datosGlobales = await fetchFiltrosGlobales(); // Llama a la función que trae TODO
                console.log("[Navigator] Datos globales recibidos:", datosGlobales);

                // Extraemos SOLO las categorías del objeto resultado
                const categoriasExtraidas = datosGlobales.categorias || [];
                setCategoriasFirestore(categoriasExtraidas); // Actualiza solo el estado de categorías

                if (categoriasExtraidas.length === 0) {
                     console.warn("[Navigator] La lista de categorías extraída está vacía.");
                     // setErrorFiltros("No se pudieron cargar las categorías esenciales."); // Opcional
                }
            } catch (err) {
                console.error("[Navigator] Error al llamar al servicio fetchFiltrosGlobales:", err);
                setErrorFiltros("Ocurrió un error inesperado al cargar la configuración.");
                setCategoriasFirestore([]);
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

    // --- Manejo de Datos (Completo) ---
    const updateStepData = (stepKey, newData) => {
        setFormData(prev => {
            // Si la clave es simple (tipoCard, planSeleccionado)
            if (stepKey === 'tipoCard' || stepKey === 'planSeleccionado') {
                return { ...prev, [stepKey]: newData };
            }
            // Si la clave es un objeto anidado (datosGenerales, datosPersonalizados)
            return {
                ...prev,
                [stepKey]: {
                    // Asegura mantener los datos previos del objeto si existen
                    ...(typeof prev[stepKey] === 'object' && prev[stepKey] !== null ? prev[stepKey] : {}),
                    // Fusiona los nuevos datos
                    ...newData
                }
            };
        });
    };

    // Función llamada por los componentes de paso al completarse
    const handleStepCompletion = (stepKey, stepLocalData) => {
        console.log(`[Navigator] Datos recibidos de ${stepKey}:`, stepLocalData);
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
                 // Opcional: Podrías resetear la data del OTRO tipo de card si quisieras
                 // [tipo === 'tipoA' ? 'tipoB' : 'tipoA']: initialFormData.datosPersonalizados[tipo === 'tipoA' ? 'tipoB' : 'tipoA']
            }
        }));
        console.log('[Navigator] handleTipoCardSelection - Llamando a nextStep. Tipo seleccionado:', tipo);
        nextStep(); // Avanza al siguiente paso
    };

    // --- Renderizado del Paso Actual (Usa estados de carga/error globales) ---
    const renderCurrentStep = () => {
        console.log('[Navigator] renderCurrentStep - currentStep es:', currentStep, '¿Está cargando filtros?', loadingFiltros); // Log
        const stepProps = { onBack: prevStep, onCancel: cancelRegistration };

        switch (currentStep) {
            case 0:
                return <SeleccionTipoCard onSelectCard={handleTipoCardSelection} onCancel={cancelRegistration} />;
            case 1:
                // Manejo de carga y error
                if (loadingFiltros) {
                    return (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5 }}>
                            <CircularProgress sx={{ color: 'common.white' }}/>
                            <Typography sx={{ ml: 2, color: 'common.white' }}>Cargando opciones...</Typography>
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
                 if (!loadingFiltros && !errorFiltros && categoriasFirestore.length === 0) {
                      return (
                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}>
                              <Typography sx={{ color: 'warning.main', textAlign: 'center', mb: 2 }}>No hay categorías disponibles en este momento.</Typography>
                              <Button onClick={cancelRegistration} variant="outlined" color="warning">Volver</Button>
                         </Box>
                      );
                  }
                // Renderiza FormularioGeneral pasando solo categorías por ahora
                return <FormularioGeneral {...stepProps}
                    initialData={formData.datosGenerales}
                    onNext={(localData) => handleStepCompletion('datosGenerales', localData)}
                    categorias={categoriasFirestore}
                    // Asegúrate de añadir aquí props para las otras listas (ubicaciones, pproductos, etc.)
                    // cuando las necesites en FormularioGeneral, ej:
                    // ubicaciones={filtrosData.ubicaciones}
                    selectedCard={formData.tipoCard}
                     />;
            case 2:
                 if (!formData.tipoCard) return <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 5 }}>Error: Tipo de card no seleccionado. Vuelve al paso anterior.</Typography>;
                 // Renderiza FormularioPersonalizado (aún sin pasarle las listas de filtros)
                 return <FormularioPersonalizado {...stepProps}
                    initialData={formData.datosPersonalizados[formData.tipoCard] || {}}
                    onNext={(localData) => handleStepCompletion('datosPersonalizados', { [formData.tipoCard]: localData })}
                    selectedCard={formData.tipoCard}
                    // Asegúrate de añadir aquí props para las listas que necesite este componente
                    // ej: marcas={filtrosData.marcas}, extras={filtrosData.extras}, etc.
                     />;
            case 3:
                 return <SeleccionPlan {...stepProps}
                    initialData={formData.planSeleccionado}
                    onNext={(plan) => handleStepCompletion('planSeleccionado', plan)}
                    />;
            case 4:
                return <ResumenRegistro
                    formData={formData}
                    // filtrosData={filtrosData} // Podrías pasar todos los filtros si el resumen los necesita
                    onBack={prevStep}
                    onCancel={cancelRegistration}
                    onConfirm={async () => {
                        console.log("[Navigator] Iniciando Confirmación de Registro:", JSON.stringify(formData, null, 2));
                        alert("Registro Finalizado (Simulación). Subida de archivos y guardado final pendiente.");
                        console.log("TODO: Implementar subida de archivos (logo, carrusel, galería) desde formData y guardado final en onConfirm.");
                        // navigate("/registro-exitoso");
                    }}
                    />;
            default:
                console.error("Error: Paso desconocido", currentStep);
                return <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 5 }}>Error: Paso desconocido.</Typography>;
        }
    };

    // --- Renderizado del Navegador (Completo) ---
    return (
        <Box sx={{ width: '100%', minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Stepper Fijo Arriba */}
            <Box sx={{
                position: 'sticky', // Cambiado de 'relative' a 'sticky' para que se pegue arriba
                top: 0, // Necesario para sticky
                zIndex: 1100,
                backgroundColor: 'rgba(0, 5, 16, 0.85)',
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
                alignItems: 'center', justifyContent: 'flex-start', // Alinea arriba
            }}>
                {/* Contenedor para limitar ancho del contenido */}
                 <Box sx={{
                     width: '100%', maxWidth: '1500px',
                     position: 'relative', // Para el botón cancelar
                     display: 'flex', flexDirection: 'column', alignItems: 'center',
                 }}>
                    {/* Botón Cancelar Absoluto */}
                    {currentStep < STEPS.length -1 && ( // Ocultar en el último paso (Resumen)
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