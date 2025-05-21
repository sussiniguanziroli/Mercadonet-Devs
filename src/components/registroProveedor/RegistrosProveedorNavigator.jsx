// src/components/registroProveedor/RegistrosProveedorNavigator.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress, Backdrop } from '@mui/material';

import { scrollToTop } from '../../utils/scrollHelper.js';

import CustomStepper from './assetsRegistro/CustomStepper';
import SeleccionTipoCard from './steps/SeleccionTipoCard';
import FormularioGeneral from './steps/FormularioGeneral';
import FormularioPersonalizado from './steps/FormularioPersonalizado';
import SeleccionPlan from './steps/SeleccionPlan';
import ResumenRegistro from './steps/ResumenRegistro';

import { STEPS, backgroundImageURL } from "../registroProveedor/assetsRegistro/Constants.js";
import { fetchFiltrosGlobales } from '../../services/firestoreService';

// Firebase imports
import { storage } from '../../firebase/config.js'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// Funciones de sessionStorage (solo para datos de formulario, no para blobs de imagen)
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

const initialFormData = {
    tipoCard: null,
    datosGenerales: {
        pais: 'Argentina', tipoRegistro: '', nombreProveedor: '', tipoProveedor: '', categoriaPrincipal: '',
        categoriasAdicionales: [], ciudad: '', provincia: '', nombre: '', apellido: '',
        rol: '', whatsapp: '', cuit: '', antiguedad: '', facturacion: '',
    },
    datosPersonalizados: {
        tipoA: {
            descripcion: '', sitioWeb: '', whatsapp: '', telefono: '', email: '',
            marca: [], extras: [],
            logoURL: '', // Cambio: de logoFile a logoURL (string)
            carruselURLs: [], // Cambio: de carruselFiles a carruselURLs (array de objetos {url, fileType, mimeType})
        },
        tipoB: {
            descripcion: '', sitioWeb: '', whatsapp: '', telefono: '', email: '',
            marcas: [], servicios: [],
            logoURL: '', // Cambio
            carruselURLs: [], // Cambio
            galeria: [], // Cambio: Array de { titulo: '', precio: '', imagenURL: '', fileType: '', mimeType: '' }
        },
    },
    planSeleccionado: null,
};

const RegistrosProveedorNavigator = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(() => loadFromSessionStorage("formData") || initialFormData);

    const [filtrosData, setFiltrosData] = useState({
        categorias: [], pproductos: [], ubicaciones: [], extras: [], servicios: [], marcas: []
    });
    const [loadingFiltros, setLoadingFiltros] = useState(true);
    const [errorFiltros, setErrorFiltros] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [archivosSubidosTemporalmente, setArchivosSubidosTemporalmente] = useState(() => loadFromSessionStorage("archivosSubidosTemporalmente") || []);

    useEffect(() => {
        saveToSessionStorage("archivosSubidosTemporalmente", archivosSubidosTemporalmente);
    }, [archivosSubidosTemporalmente]);


    // --- Firebase Storage Helper Functions ---
    const uploadFileToStorage = useCallback(async (file, pathPrefix = 'uploads') => {
        if (!file) return null;
        // Idealmente, aquí se usaría un ID de usuario o un ID de sesión único.
        // Por ahora, usamos un timestamp para unicidad básica.
        const RUTA_STORAGE = `${pathPrefix}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, RUTA_STORAGE);

        try {
            const snapshot = await uploadBytesResumable(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return { downloadURL, storagePath: RUTA_STORAGE };
        } catch (error) {
            console.error("Error al subir archivo:", error);
            throw error; // Relanzar para manejo en el llamador
        }
    }, []);

    const deleteFileFromStorage = useCallback(async (filePath) => {
        if (!filePath) return;
        const fileRef = ref(storage, filePath);
        try {
            await deleteObject(fileRef);
            console.log("Archivo eliminado de Storage:", filePath);
        } catch (error) {
            // No es crítico si falla, especialmente si el archivo no existía.
            console.warn("Error al eliminar archivo de Storage (puede que ya no exista):", filePath, error);
        }
    }, []);


    useEffect(() => {
        const scrollTimeoutId = setTimeout(() => { scrollToTop(); }, 20);
        return () => { clearTimeout(scrollTimeoutId); };
    }, [currentStep]);

    useEffect(() => {
        const cargarFiltros = async () => {
            setLoadingFiltros(true);
            setErrorFiltros(null);
            try {
                const datosGlobales = await fetchFiltrosGlobales();
                setFiltrosData(datosGlobales);
            } catch (err) {
                console.error("[Navigator] Error CRÍTICO al llamar fetchFiltrosGlobales:", err);
                setErrorFiltros("Error al cargar datos esenciales. Intenta recargar.");
                setFiltrosData({ categorias: [], pproductos: [], ubicaciones: [], extras: [], servicios: [], marcas: [] });
            } finally {
                setLoadingFiltros(false);
            }
        };
        cargarFiltros();
    }, []);


    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleTipoCardSelection = (tipo) => {
        setFormData(prev => {
            const newState = {
                ...prev,
                tipoCard: tipo,
                datosPersonalizados: {
                    ...initialFormData.datosPersonalizados, // Resetea ambas ramas a initial
                    [tipo]: prev.datosPersonalizados?.[tipo] || initialFormData.datosPersonalizados[tipo],
                }
            };
            saveToSessionStorage("formData", newState);
            return newState;
        });
        nextStep();
    };

    const updateFormDataAndSession = (newFormData) => {
        setFormData(newFormData);
        saveToSessionStorage("formData", newFormData);
    };

    const updateArchivosTemporales = (newPath) => {
        if (newPath) {
            setArchivosSubidosTemporalmente(prev => [...prev, newPath]);
        }
    };

    // --- MODIFICADO: updateStepData para manejar subidas ---
    const updateStepData = async (stepKey, newDataFromStep) => {
        setIsUploading(true);
        setUploadError(null);
        let currentFormData = { ...formData }; // Trabaja con una copia para las subidas

        try {
            if (stepKey === 'datosPersonalizados' && formData.tipoCard) {
                const tipo = formData.tipoCard;
                const personalizadosActual = { ...currentFormData.datosPersonalizados[tipo], ...newDataFromStep };

                // Logo
                if (newDataFromStep.logoFile instanceof File) {
                    const { downloadURL, storagePath } = await uploadFileToStorage(newDataFromStep.logoFile, `proveedores/${tipo}/logos`);
                    personalizadosActual.logoURL = downloadURL;
                    updateArchivosTemporales(storagePath);
                } else if (newDataFromStep.hasOwnProperty('logoUrlExistente')) { // Check if the property exists
                    personalizadosActual.logoURL = newDataFromStep.logoUrlExistente || '';
                }


                // Carrusel
                if (Array.isArray(newDataFromStep.carruselNuevosArchivos)) {
                    const nuevasURLsCarrusel = [];
                    for (const file of newDataFromStep.carruselNuevosArchivos) {
                        const { downloadURL, storagePath } = await uploadFileToStorage(file, `proveedores/${tipo}/carrusel`);
                        nuevasURLsCarrusel.push({
                            url: downloadURL,
                            fileType: file.type.startsWith('video/') ? 'video' : 'image',
                            mimeType: file.type
                        });
                        updateArchivosTemporales(storagePath);
                    }
                    // Combinar con existentes
                    personalizadosActual.carruselURLs = [
                        ...(newDataFromStep.carruselUrlsExistentes || []),
                        ...nuevasURLsCarrusel
                    ];
                } else if (newDataFromStep.hasOwnProperty('carruselUrlsExistentes')) {
                    personalizadosActual.carruselURLs = newDataFromStep.carruselUrlsExistentes || [];
                }


                // Galería (solo para tipoB)
                if (tipo === 'tipoB' && Array.isArray(newDataFromStep.galeria)) {
                    const nuevaGaleriaProcesada = [];
                    for (const item of newDataFromStep.galeria) {
                        let imagenURLFinal = item.imagenUrlExistente || '';
                        if (item.imagenFile instanceof File) {
                            const { downloadURL, storagePath } = await uploadFileToStorage(item.imagenFile, `proveedores/${tipo}/galeria`);
                            imagenURLFinal = downloadURL;
                            updateArchivosTemporales(storagePath);
                        }
                        nuevaGaleriaProcesada.push({
                            titulo: item.titulo,
                            precio: item.precio,
                            imagenURL: imagenURLFinal,
                            fileType: item.imagenFile?.type.startsWith('video/') ? 'video' : (item.imagenFile ? 'image' : (item.fileType || '')), // Preservar fileType si no hay nuevo archivo
                            mimeType: item.imagenFile?.type || (item.mimeType || '')
                        });
                    }
                    personalizadosActual.galeria = nuevaGaleriaProcesada;
                }

                currentFormData = {
                    ...currentFormData,
                    datosPersonalizados: {
                        ...currentFormData.datosPersonalizados,
                        [tipo]: personalizadosActual
                    }
                };

            } else if (stepKey === 'datosGenerales') {
                currentFormData = { ...currentFormData, datosGenerales: { ...currentFormData.datosGenerales, ...newDataFromStep } };
            } else { // Para planSeleccionado u otros
                currentFormData = { ...currentFormData, [stepKey]: newDataFromStep };
            }

            updateFormDataAndSession(currentFormData);

        } catch (error) {
            console.error("Error durante la subida o actualización de datos:", error);
            setUploadError("Ocurrió un error al subir archivos. Inténtalo de nuevo.");
            // Considerar si revertir formData o no, dependiendo de la criticidad.
            // Por ahora, no avanzamos si hay error de subida.
            setIsUploading(false);
            throw error; // Para que handleStepCompletion no avance.
        } finally {
            setIsUploading(false);
        }
    };


    const handleStepBack = async (stepKey, stepLocalData) => {
        try {
            // Al ir atrás, solo actualizamos datos, no subimos nada nuevo que no estuviera ya.
            // Los archivos nuevos que el usuario pudo haber seleccionado pero no "continuó"
            // se perderán de stepLocalData si el componente hijo los maneja así, lo cual está bien.
            if (stepKey === 'datosPersonalizados' && formData.tipoCard) {
                const tipo = formData.tipoCard;
                const personalizadosActual = { ...formData.datosPersonalizados[tipo], ...stepLocalData };
                // Conservar URLs existentes si no se proporcionan explícitamente nuevas (lo cual no debería pasar al ir para atrás)
                personalizadosActual.logoURL = stepLocalData.logoUrlExistente !== undefined ? stepLocalData.logoUrlExistente : formData.datosPersonalizados[tipo].logoURL;
                personalizadosActual.carruselURLs = stepLocalData.carruselUrlsExistentes !== undefined ? stepLocalData.carruselUrlsExistentes : formData.datosPersonalizados[tipo].carruselURLs;
                if (tipo === 'tipoB' && stepLocalData.galeria !== undefined) {
                    personalizadosActual.galeria = stepLocalData.galeria.map(item => ({
                        ...item,
                        imagenURL: item.imagenUrlExistente !== undefined ? item.imagenUrlExistente : (formData.datosPersonalizados[tipo].galeria.find(g => g.titulo === item.titulo)?.imagenURL || '') // Intenta mantener la URL si es posible
                    }));
                }
                updateFormDataAndSession({
                    ...formData,
                    datosPersonalizados: { ...formData.datosPersonalizados, [tipo]: personalizadosActual }
                });

            } else if (stepKey === 'datosGenerales') {
                updateFormDataAndSession({ ...formData, datosGenerales: { ...formData.datosGenerales, ...stepLocalData } });
            } else {
                updateFormDataAndSession({ ...formData, [stepKey]: stepLocalData });
            }
        } catch (error) {
            console.error("Error al actualizar datos yendo hacia atrás:", error);
            setUploadError("Error al actualizar datos.");
        }
        prevStep();
    };


    const handleStepCompletion = async (stepKey, stepLocalData) => {
        try {
            await updateStepData(stepKey, stepLocalData);
            nextStep();
        } catch (error) {
            // El error ya se manejó y mostró en updateStepData
            console.log("No se avanzó de paso debido a un error previo.");
        }
    };

    const cancelRegistration = async () => {
        setIsUploading(true); // Usar el mismo estado para la limpieza
        setUploadError(null);
        try {
            // Eliminar todos los archivos subidos temporalmente
            for (const path of archivosSubidosTemporalmente) {
                await deleteFileFromStorage(path);
            }
            setArchivosSubidosTemporalmente([]);
            sessionStorage.removeItem("archivosSubidosTemporalmente"); // Limpia el session storage también

            setFormData(initialFormData);
            sessionStorage.removeItem("formData"); // Limpia el form data de session
            // sessionStorage.clear(); // Opcional: limpiar todo sessionStorage si es apropiado

            navigate("/registrar-mi-empresa"); // O a donde corresponda
        } catch (error) {
            console.error("Error durante la cancelación y limpieza:", error);
            setUploadError("Error al limpiar archivos temporales. Contacta a soporte si persiste.");
        } finally {
            setIsUploading(false);
        }
    };

    // Efecto para cargar datos de sessionStorage (solo si no hay una carga de filtros activa)
    useEffect(() => {
        if (!loadingFiltros) { // Solo cargar si los filtros ya se intentaron cargar (o no son necesarios al inicio)
            const savedFormData = loadFromSessionStorage("formData");
            if (savedFormData) {
                setFormData(savedFormData);
            }
            const savedTemporalFiles = loadFromSessionStorage("archivosSubidosTemporalmente");
            if (savedTemporalFiles) {
                setArchivosSubidosTemporalmente(savedTemporalFiles);
            }
        }
    }, [loadingFiltros]); // Depende de loadingFiltros para evitar sobreescribir el estado inicial muy pronto

    const [selectedServices, setSelectedServices] = useState([])

    const renderCurrentStep = () => {
        const stepProps = { onBack: prevStep, onCancel: cancelRegistration }; // onBack se redefine para algunos pasos

        if (loadingFiltros) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5 }}><CircularProgress sx={{ color: 'common.white' }} /><Typography sx={{ ml: 2, color: 'common.white' }}>Cargando configuración...</Typography></Box>);
        }
        if (errorFiltros) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}><Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>{errorFiltros}</Typography><Button onClick={() => window.location.reload()} variant="outlined" color="warning">Recargar</Button></Box>);
        }
        if (uploadError) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}><Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>{uploadError}</Typography><Button onClick={() => setUploadError(null)} variant="outlined" color="info">Intentar de Nuevo</Button></Box>);
        }

        switch (currentStep) {
            case 0:
                return <SeleccionTipoCard onSelectCard={handleTipoCardSelection} onCancel={cancelRegistration} />;
            case 1:
                return <FormularioGeneral
                    selectedServices={selectedServices}
                    setSelectedServices={setSelectedServices}
                    onBack={(localData) => handleStepBack('datosGenerales', localData)}
                    onCancel={cancelRegistration}
                    initialData={formData.datosGenerales}
                    onNext={(localData) => handleStepCompletion('datosGenerales', localData)}
                    categorias={filtrosData.categorias}
                    ubicaciones={filtrosData.ubicaciones}
                    pproductos={filtrosData.pproductos}
                    servicios={filtrosData.servicios}
                    selectedCard={formData.tipoCard}
                    marcasDisponibles={filtrosData.marcas}
                />;
            case 2:
                if (!formData.tipoCard) return <Typography color="error.main">Error: Tipo de card no seleccionado...</Typography>;
                const datosPasoAnterior = {
                    tipoProveedor: formData.datosGenerales.tipoProveedor,
                    tipoRegistro: formData.datosGenerales.tipoRegistro,
                    nombreProveedor: formData.datosGenerales.nombreProveedor,
                    ciudad: formData.datosGenerales.ciudad,
                    provincia: formData.datosGenerales.provincia,
                };
                return <FormularioPersonalizado
                    onBack={(localData) => handleStepBack('datosPersonalizados', localData)}
                    onCancel={cancelRegistration}
                    initialData={formData.datosPersonalizados[formData.tipoCard] || initialFormData.datosPersonalizados[formData.tipoCard]}
                    onNext={(localData) => handleStepCompletion('datosPersonalizados', localData)}
                    selectedCard={formData.tipoCard}
                    {...datosPasoAnterior}
                    marcas={filtrosData.marcas} // Para tipoA y tipoB
                    extras={filtrosData.extras} // Para tipoA y tipoB
                    servicios={filtrosData.servicios} // Para tipoA
                />;
            case 3:
                return <SeleccionPlan {...stepProps}
                    initialData={formData.planSeleccionado}
                    onNext={(plan) => handleStepCompletion('planSeleccionado', plan)}
                />;
            case 4:
                return <ResumenRegistro
                    formData={formData}
                    filtrosData={filtrosData}
                    onBack={prevStep} // Simple prevStep, no hay datos que guardar desde resumen hacia atrás
                    onCancel={cancelRegistration}
                    onConfirm={async () => {
                        setIsUploading(true);
                        setUploadError(null);
                        console.log("[Navigator] Iniciando Confirmación de Registro:", JSON.stringify(formData, null, 2));
                        try {
                            // AQUÍ VA LA LÓGICA PARA GUARDAR `formData` EN FIRESTORE
                            // Ejemplo: await saveProviderToFirestore(formData);
                            alert("Registro Finalizado (Simulación). Datos listos para Firestore.");

                            // Si el guardado en Firestore es exitoso, los archivos temporales se vuelven permanentes
                            setArchivosSubidosTemporalmente([]);
                            sessionStorage.removeItem("archivosSubidosTemporalmente");
                            sessionStorage.removeItem("formData");
                            // Considerar limpiar sessionStorage completo o navegar a una página de éxito
                            // navigate("/registro-exitoso"); 
                        } catch (error) {
                            console.error("Error al confirmar el registro en Firestore:", error);
                            setUploadError("Error al guardar el registro. Intenta de nuevo.");
                        } finally {
                            setIsUploading(false);
                        }
                    }}
                />;
            default:
                return <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 5 }}>Error: Paso desconocido.</Typography>;
        }
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, display: 'flex', flexDirection: 'column' }}
                open={isUploading && !uploadError && !errorFiltros} // No mostrar si hay un error que ya se está mostrando
            >
                <CircularProgress color="inherit" />
                <Typography sx={{ mt: 2 }}>Procesando archivos...</Typography>
            </Backdrop>

            <Box sx={{
                flexGrow: 1, width: '100%',
                pb: { xs: 4, md: 6 }, px: { xs: 2, md: 3 },
                backgroundImage: `url(${backgroundImageURL})`,
                backgroundSize: 'cover', backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-start',
            }}>
                <Box sx={{
                    height: '120px', width: '100%', position: 'sticky', top: 0, zIndex: 1100,
                    backgroundColor: 'transparent', backdropFilter: 'blur(6px)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    <Box sx={{ width: { xs: '95%', md: '85%', lg: '75%' }, margin: 'auto', py: 1.5 }}>
                        <CustomStepper activeStep={currentStep} steps={STEPS} />
                    </Box>
                </Box>
                <Box sx={{
                    pt: { xs: 4, md: 6 }, width: '100%', maxWidth: '1500px',
                    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                    {currentStep > 0 && currentStep < STEPS.length - 1 && (
                        <Button
                            onClick={cancelRegistration}
                            variant="outlined" size="small"
                            sx={{
                                position: 'absolute', top: { xs: 0, md: 0 }, right: 0, zIndex: 1,
                                color: 'common.white', borderColor: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'common.white', }
                            }}
                            disabled={isUploading}
                        > Cancelar </Button>
                    )}
                    {renderCurrentStep()}
                </Box>
            </Box>
        </Box>
    );
};

export default RegistrosProveedorNavigator;