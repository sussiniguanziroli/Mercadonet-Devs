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

// Funciones de sessionStorage
const saveToSessionStorage = (key, value) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error al guardar en sessionStorage", error);
    }
};

const loadFromSessionStorage = (key) => {
    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error al cargar desde sessionStorage", error);
        return null;
    }
};

const saveImageToSession = (key, file) => {
    try {
        const url = URL.createObjectURL(file);
        sessionStorage.setItem(key, url);
        return url;
    } catch (error) {
        console.error("Error al guardar imagen", error);
        return null;
    }
};

const loadImageFromSession = (key) => {
    try {
        return sessionStorage.getItem(key);
    } catch (error) {
        console.error("Error al cargar imagen", error);
        return null;
    }
};

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
    const [selectedServices, setSelectedServices] = useState([]);
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(() => loadFromSessionStorage("formData") || initialFormData);

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

    const updateStepData = (stepKey, newData) => {
        setFormData((prev) => {
            const updatedData = { ...prev, [stepKey]: { ...prev[stepKey], ...newData } };

            if (newData.logoFile instanceof File) {
                const logoUrl = saveImageToSession("logoFile", newData.logoFile);
                updatedData[stepKey].logoUrl = logoUrl;
            }

            if (Array.isArray(newData.carruselMediaItems)) {
                updatedData[stepKey].carruselMediaItems = newData.carruselMediaItems.map((item, index) => {
                    if (item.file instanceof File) {
                        const url = saveImageToSession(`carrusel-${index}`, item.file);
                        return { ...item, url };
                    }
                    return item;
                });
            }

            saveToSessionStorage("formData", updatedData);
            return updatedData;
        });
    };

    const handleStepCompletion = (stepKey, stepLocalData) => {
        updateStepData(stepKey, stepLocalData);
        nextStep();
    };

    const cancelRegistration = () => {
        setFormData(initialFormData);
        sessionStorage.clear();
        navigate("/registrar-mi-empresa");
    };

    useEffect(() => {
        const savedData = loadFromSessionStorage("formData");
        if (savedData) {
            const logoUrl = loadImageFromSession("logoFile");
            if (logoUrl) {
                savedData.datosPersonalizados.tipoA.logoFile = { url: logoUrl };
            }

            if (Array.isArray(savedData.datosPersonalizados.tipoA.carruselMediaItems)) {
                savedData.datosPersonalizados.tipoA.carruselMediaItems = savedData.datosPersonalizados.tipoA.carruselMediaItems.map((item, index) => {
                    const url = loadImageFromSession(`carrusel-${index}`);
                    return url ? { ...item, url } : item;
                });
            }

            setFormData(savedData);
        }
    }, []);



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
                    selectedServices={selectedServices}
                    setSelectedServices={setSelectedServices}
                />;
            case 2: // FormularioPersonalizado (Dispatcher)
                if (!formData.tipoCard) return <Typography color="error.main">Error: Tipo de card no seleccionado...</Typography>;

                // Prepara datos del paso anterior para la preview del paso 2
                const datosPasoAnterior = {
                    selectedServices: selectedServices,
                    tipoProveedor: formData.datosGenerales.tipoProveedor,
                    tipoRegistro: formData.datosGenerales.tipoRegistro,
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


            {/* Área Principal con Fondo */}
            <Box sx={{
                flexGrow: 1, width: '100%',
                pb: { xs: 4, md: 6 }, px: { xs: 2, md: 3 },
                backgroundImage: `url(${backgroundImageURL})`,
                backgroundSize: 'cover', backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-start',
            }}>
                {/* Stepper Fijo Arriba */}
                <Box sx={{
                    height: '120px',
                    width: '100%',
                    position: 'sticky', top: 0, zIndex: 1100,
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(6px)',
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
                {/* Contenedor para limitar ancho del contenido */}
                <Box sx={{
                    pt: { xs: 4, md: 6 },
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
                                position: 'absolute', top: { xs: 0, md: 0 }, right: 0, zIndex: 1,
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