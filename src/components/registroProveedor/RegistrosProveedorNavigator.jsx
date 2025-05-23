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

import { storage } from '../../firebase/config.js';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

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
            logoURL: '',
            carruselURLs: [],
        },
        tipoB: {
            descripcion: '', sitioWeb: '', whatsapp: '', telefono: '', email: '',
            marcas: [], servicios: [],
            logoURL: '',
            carruselURLs: [],
            galeria: [],
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

    const [isProcessingGlobal, setIsProcessingGlobal] = useState(false);
    const [operationError, setOperationError] = useState(null);
    const [archivosSubidosTemporalmente, setArchivosSubidosTemporalmente] = useState(() => loadFromSessionStorage("archivosSubidosTemporalmente") || []);
    
    const [fileUploadProgress, setFileUploadProgress] = useState({});

    useEffect(() => {
        saveToSessionStorage("archivosSubidosTemporalmente", archivosSubidosTemporalmente);
    }, [archivosSubidosTemporalmente]);

    const handleFileUploadProgress = useCallback((tempFileId, progressData) => {
        setFileUploadProgress(prev => ({
            ...prev,
            [tempFileId]: { ...(prev[tempFileId] || {}), ...progressData }
        }));
    }, []);
    
    const updateArchivosTemporales = useCallback((newPath) => {
        if (newPath) {
            setArchivosSubidosTemporalmente(prev => {
                if (!prev.includes(newPath)) {
                    return [...prev, newPath];
                }
                return prev;
            });
        }
    }, []);

    const removeDeArchivosTemporales = useCallback((pathToRemove) => {
        setArchivosSubidosTemporalmente(prev => prev.filter(p => p !== pathToRemove));
    }, []);
    
    const deleteFileFromStorage = useCallback(async (filePath) => {
        if (!filePath) return;
        const fileRef = ref(storage, filePath);
        try {
            await deleteObject(fileRef);
            console.log("Archivo eliminado de Storage:", filePath);
            removeDeArchivosTemporales(filePath);
        } catch (error) {
            console.warn("Error al eliminar archivo de Storage:", filePath, error);
        }
    }, [removeDeArchivosTemporales]);


    const handleFileUploaded = useCallback((tempFileId, { downloadURL, storagePath, fileTypeOriginal, mimeTypeOriginal, error, fieldType, itemIndex = null, arrayName = null }) => {
        setFormData(prevFormData => {
            const newFormData = { ...prevFormData };
            const tipo = newFormData.tipoCard;

            if (!tipo || !newFormData.datosPersonalizados[tipo]) {
                console.warn("handleFileUploaded: tipoCard no definido en formData, no se puede actualizar.");
                return prevFormData;
            }

            const personalizados = JSON.parse(JSON.stringify(newFormData.datosPersonalizados[tipo])); // Deep copy

            if (error) {
                console.error(`Error final para ${tempFileId} (reportado por uploadFileImmediately):`, error);
                // Si hay un error, se podría limpiar la URL en el formData si corresponde
                // Por ejemplo, si se estaba reemplazando un logo y falla, restaurar el logoURL anterior o dejarlo vacío.
                // Esta parte requiere una lógica cuidadosa para no perder datos válidos.
            } else if (downloadURL && storagePath) {
                updateArchivosTemporales(storagePath);

                switch (fieldType) {
                    case 'logoFile':
                        if (personalizados.logoURL) { // Si había un logoURL previo
                            const oldStoragePath = archivosSubidosTemporalmente.find(p => 
                                personalizados.logoURL.includes(encodeURIComponent(p.split('/').pop())) && p !== storagePath
                            );
                            if (oldStoragePath) {
                                deleteFileFromStorage(oldStoragePath);
                            }
                        }
                        personalizados.logoURL = downloadURL;
                        break;
                    case 'carruselMediaItems':
                        const newItemCarrusel = { url: downloadURL, fileType: fileTypeOriginal, mimeType: mimeTypeOriginal, tempId: tempFileId };
                        let updatedCarrusel = Array.isArray(personalizados.carruselURLs) ? [...personalizados.carruselURLs] : [];
                        const existingCarruselIndex = updatedCarrusel.findIndex(item => item.tempId === tempFileId);
                        
                        if (existingCarruselIndex > -1) {
                            const oldItemCarrusel = updatedCarrusel[existingCarruselIndex];
                            if(oldItemCarrusel.url && oldItemCarrusel.tempId){ 
                                const oldStoragePath = archivosSubidosTemporalmente.find(p => oldItemCarrusel.url.includes(encodeURIComponent(p.split('/').pop())) && p !== storagePath);
                                if (oldStoragePath) {
                                     deleteFileFromStorage(oldStoragePath);
                                }
                            }
                            updatedCarrusel[existingCarruselIndex] = newItemCarrusel;
                        } else {
                            updatedCarrusel.push(newItemCarrusel);
                        }
                        personalizados.carruselURLs = updatedCarrusel;
                        break;
                    case 'galeria':
                        if (arrayName === 'galeria' && itemIndex !== null && Array.isArray(personalizados.galeria)) {
                            let updatedGaleria = [...personalizados.galeria];
                            // Asegurar que el array y el item existan
                            while(updatedGaleria.length <= itemIndex) {
                                updatedGaleria.push({ titulo: '', precio: '', imagenURL: '', fileType: '', mimeType: '', tempId: null });
                            }
                            const oldItemGaleria = updatedGaleria[itemIndex];
                            if(oldItemGaleria && oldItemGaleria.imagenURL && oldItemGaleria.tempId) { 
                                const oldStoragePath = archivosSubidosTemporalmente.find(p => oldItemGaleria.imagenURL.includes(encodeURIComponent(p.split('/').pop())) && p !== storagePath);
                                if(oldStoragePath){
                                    deleteFileFromStorage(oldStoragePath);
                                }
                            }
                            updatedGaleria[itemIndex] = {
                                ...(updatedGaleria[itemIndex] || {}), 
                                imagenURL: downloadURL,
                                fileType: fileTypeOriginal,
                                mimeType: mimeTypeOriginal,
                                tempId: tempFileId
                            };
                            personalizados.galeria = updatedGaleria;
                        } else if (arrayName === 'galeria' && itemIndex !== null && !Array.isArray(personalizados.galeria)) {
                            // Si personalizados.galeria no es un array pero debería serlo
                            personalizados.galeria = [];
                            while(personalizados.galeria.length <= itemIndex) {
                                personalizados.galeria.push({ titulo: '', precio: '', imagenURL: '', fileType: '', mimeType: '', tempId: null });
                            }
                            personalizados.galeria[itemIndex] = {
                                imagenURL: downloadURL,
                                fileType: fileTypeOriginal,
                                mimeType: mimeTypeOriginal,
                                tempId: tempFileId
                            };
                        }
                        break;
                    default:
                        console.warn("Tipo de campo desconocido en handleFileUploaded:", fieldType);
                        break;
                }
            }
            newFormData.datosPersonalizados[tipo] = personalizados;
            saveToSessionStorage("formData", newFormData);
            return newFormData;
        });
    }, [updateArchivosTemporales, deleteFileFromStorage, archivosSubidosTemporalmente, fileUploadProgress]);


    const uploadFileImmediately = useCallback(async (file, tempFileId, pathPrefix = 'uploads', fileMetadata = {}) => {
        if (!file || !tempFileId) {
            console.error("uploadFileImmediately: Falta archivo o tempFileId");
            handleFileUploadProgress(tempFileId, { progress: 0, status: 'error', errorMsg: 'Faltan datos para subir.' });
            return; 
        }

        handleFileUploadProgress(tempFileId, { progress: 0, status: 'uploading', errorMsg: null, storagePath: null, finalUrl: null });
        
        const RUTA_STORAGE = `${pathPrefix}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, RUTA_STORAGE);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                handleFileUploadProgress(tempFileId, { progress: Math.round(progress), status: 'uploading' });
            },
            (error) => {
                console.error(`Error en subida para ${tempFileId} (${file.name}):`, error);
                let errorCode = error.code || 'storage/unknown';
                handleFileUploadProgress(tempFileId, { progress: 0, status: 'error', errorMsg: errorCode });
                handleFileUploaded(tempFileId, { error, ...fileMetadata });
            },
            async () => { 
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    handleFileUploadProgress(tempFileId, { progress: 100, status: 'success', finalUrl: downloadURL, storagePath: RUTA_STORAGE });
                    handleFileUploaded(tempFileId, { 
                        downloadURL, 
                        storagePath: RUTA_STORAGE, 
                        fileTypeOriginal: file.type.startsWith('video/') ? 'video' : 'image', 
                        mimeTypeOriginal: file.type, 
                        ...fileMetadata 
                    });
                } catch (error) {
                    console.error(`Error obteniendo downloadURL para ${tempFileId} (${file.name}):`, error);
                    handleFileUploadProgress(tempFileId, { progress: 100, status: 'error', errorMsg: 'Error al obtener URL final' });
                    handleFileUploaded(tempFileId, { error, ...fileMetadata });
                }
            }
        );
    }, [handleFileUploadProgress, handleFileUploaded]);

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
            const previousCardType = prev.tipoCard;
            const previousCardData = previousCardType ? { ...prev.datosPersonalizados[previousCardType] } : {};

            const newState = {
                ...prev,
                tipoCard: tipo,
                datosPersonalizados: { 
                    tipoA: initialFormData.datosPersonalizados.tipoA,
                    tipoB: initialFormData.datosPersonalizados.tipoB,
                }
            };
             newState.datosPersonalizados[tipo] = (tipo === previousCardType && Object.keys(previousCardData).length > 0) 
                ? previousCardData 
                : ( initialFormData.datosPersonalizados[tipo]);
            
            setFileUploadProgress({}); 
            saveToSessionStorage("formData", newState);
            return newState;
        });
        nextStep();
    };
    
    const updateFormDataAndSession = (newFormData) => { 
        setFormData(newFormData);
        saveToSessionStorage("formData", newFormData);
    };

    const updateStepData = async (stepKey, newDataFromStep) => {
        setOperationError(null);
        
        setFormData(prevFormData => {
            let newFormData = { ...prevFormData };
            if (stepKey === 'datosPersonalizados' && newFormData.tipoCard) {
                const tipo = newFormData.tipoCard;
                const currentPersonalizados = newFormData.datosPersonalizados[tipo] || {};
                let updatedPersonalizados = { ...currentPersonalizados };

                for (const key in newDataFromStep) {
                    if (!['logoFile', 'logoTempId', 'logoUrlExistente', 
                          'carruselNuevosArchivos', 'carruselUrlsExistentes', 'carruselURLs',
                          'galeria' 
                         ].includes(key)) {
                        updatedPersonalizados[key] = newDataFromStep[key];
                    }
                }
                
                if (newDataFromStep.hasOwnProperty('logoURL')) {
                    updatedPersonalizados.logoURL = newDataFromStep.logoURL;
                }
                if (newDataFromStep.hasOwnProperty('carruselURLs')) {
                    updatedPersonalizados.carruselURLs = newDataFromStep.carruselURLs || [];
                }
                if (tipo === 'tipoB' && newDataFromStep.hasOwnProperty('galeria')) {
                    updatedPersonalizados.galeria = newDataFromStep.galeria || [];
                }

                newFormData.datosPersonalizados[tipo] = updatedPersonalizados;

            } else if (stepKey === 'datosGenerales') {
                newFormData.datosGenerales = { ...newFormData.datosGenerales, ...newDataFromStep };
            } else {
                newFormData[stepKey] = newDataFromStep;
            }
            saveToSessionStorage("formData", newFormData);
            return newFormData;
        });
    };

    const handleStepBack = (stepKey, stepLocalDataFromChild) => {
        setFormData(prev => {
            let newFormData = { ...prev };
            if (stepKey === 'datosPersonalizados' && formData.tipoCard) {
                const tipo = formData.tipoCard;
                newFormData.datosPersonalizados[tipo] = { 
                    ...(prev.datosPersonalizados[tipo] || {}), 
                    ...stepLocalDataFromChild 
                };
            } else if (stepKey === 'datosGenerales') {
                newFormData.datosGenerales = { ...prev.datosGenerales, ...stepLocalDataFromChild };
            } else {
                newFormData[stepKey] = stepLocalDataFromChild;
            }
            saveToSessionStorage("formData", newFormData);
            return newFormData;
        });
        prevStep();
    };

    const handleStepCompletion = async (stepKey, stepLocalData) => {
        setIsProcessingGlobal(true);
        try {
            await updateStepData(stepKey, stepLocalData);
            const uploadsStillActive = Object.values(fileUploadProgress).some(f => f.status === 'uploading');
            
            if (uploadsStillActive) {
                setOperationError("Algunos archivos aún se están subiendo. Por favor, espera...");
                console.log("Esperando subidas activas antes de avanzar...");
            } else if (!operationError) {
                 nextStep();
            }
        } catch (error) {
            console.error("Error en handleStepCompletion:", error);
            setOperationError("Ocurrió un error al procesar el paso.");
        } finally {
            setIsProcessingGlobal(false);
        }
    };
    
    const cancelRegistration = async () => {
        setIsProcessingGlobal(true);
        setOperationError(null);
        try {
            const deletePromises = archivosSubidosTemporalmente.map(path => deleteFileFromStorage(path));
            await Promise.all(deletePromises);
            
            setArchivosSubidosTemporalmente([]);
            sessionStorage.removeItem("archivosSubidosTemporalmente");
            setFormData(initialFormData);
            sessionStorage.removeItem("formData");
            setFileUploadProgress({});
            setCurrentStep(0);
            navigate("/registrar-mi-empresa");
        } catch (error) {
            console.error("Error durante la cancelación y limpieza:", error);
            setOperationError("Error al limpiar archivos temporales. Contacta a soporte si persiste.");
        } finally {
            setIsProcessingGlobal(false);
        }
    };

    useEffect(() => {
        if (!loadingFiltros) {
            const savedData = loadFromSessionStorage("formData");
            if (savedData) {
                setFormData(savedData);
                // Reiniciar el progreso de subida al cargar desde session storage,
                // ya que las tareas de subida no persisten entre sesiones de página.
                setFileUploadProgress({}); 
            }
            const savedTemporalFiles = loadFromSessionStorage("archivosSubidosTemporalmente");
            if (savedTemporalFiles) {
                setArchivosSubidosTemporalmente(savedTemporalFiles);
            }
        }
    }, [loadingFiltros]);

    const [selectedServices, setSelectedServices] = useState([]); 

    const renderCurrentStep = () => {
        if (loadingFiltros) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5 }}><CircularProgress sx={{ color: 'common.white' }} /><Typography sx={{ ml: 2, color: 'common.white' }}>Cargando configuración...</Typography></Box>);
        }
        if (errorFiltros) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}><Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>{errorFiltros}</Typography><Button onClick={() => window.location.reload()} variant="outlined" color="warning">Recargar</Button></Box>);
        }
        if (operationError && !Object.values(fileUploadProgress).some(f => f.status === 'uploading')) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}><Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>{operationError}</Typography><Button onClick={() => setOperationError(null)} variant="outlined" color="info">Entendido</Button></Box>);
        }

        switch (currentStep) {
            case 0:
                return <SeleccionTipoCard 
                            onSelectCard={handleTipoCardSelection} 
                            onCancel={cancelRegistration} 
                       />;
            case 1:
                return <FormularioGeneral
                    selectedServices={selectedServices} 
                    setSelectedServices={setSelectedServices} 
                    onBack={() => handleStepBack('datosGenerales', formData.datosGenerales)}
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
                    selectedServices: selectedServices,
                };
                return <FormularioPersonalizado
                    fileUploadProgress={fileUploadProgress}
                    uploadFileImmediately={uploadFileImmediately}
                    onBack={(localData) => handleStepBack('datosPersonalizados', localData)}
                    onCancel={cancelRegistration}
                    initialData={formData.datosPersonalizados[formData.tipoCard] || initialFormData.datosPersonalizados[formData.tipoCard]}
                    onNext={(localData) => handleStepCompletion('datosPersonalizados', localData)}
                    selectedCard={formData.tipoCard}
                    {...datosPasoAnterior}
                    marcas={filtrosData.marcas}
                    extras={filtrosData.extras}
                    servicios={filtrosData.servicios}
                />;
            case 3:
                return <SeleccionPlan
                    onBack={prevStep}
                    onCancel={cancelRegistration}
                    initialData={formData.planSeleccionado}
                    onNext={(plan) => handleStepCompletion('planSeleccionado', plan)}
                />;
            case 4:
                return <ResumenRegistro
                    formData={formData}
                    filtrosData={filtrosData} 
                    onBack={prevStep}
                    onCancel={cancelRegistration}
                    onConfirm={async () => {
                        setIsProcessingGlobal(true);
                        setOperationError(null);
                        const uploadsStillActive = Object.values(fileUploadProgress).some(f => f.status === 'uploading');
                        if (uploadsStillActive) {
                            setOperationError("Algunos archivos aún se están subiendo. Por favor, espera a que terminen antes de confirmar.");
                            setIsProcessingGlobal(false);
                            return;
                        }
                        console.log("[Navigator] Iniciando Confirmación de Registro:", JSON.stringify(formData, null, 2));
                        try {
                            alert("Registro Finalizado (Simulación). Datos listos para Firestore.");
                            setArchivosSubidosTemporalmente([]); 
                            sessionStorage.removeItem("archivosSubidosTemporalmente");
                            setFormData(initialFormData); 
                            sessionStorage.removeItem("formData");
                            setFileUploadProgress({}); 
                            setCurrentStep(0);
                        } catch (error) {
                            console.error("Error al confirmar el registro en Firestore:", error);
                            setOperationError("Error al guardar el registro. Intenta de nuevo.");
                        } finally {
                            setIsProcessingGlobal(false);
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
                open={(isProcessingGlobal || Object.values(fileUploadProgress).some(f => f.status === 'uploading')) && !operationError && !loadingFiltros}
            >
                <CircularProgress color="inherit" />
                <Typography sx={{ mt: 2 }}>
                    {Object.values(fileUploadProgress).some(f => f.status === 'uploading') ? 'Subiendo archivos...' : 'Procesando...'}
                </Typography>
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
                            disabled={isProcessingGlobal || Object.values(fileUploadProgress).some(f => f.status === 'uploading')}
                        > Cancelar </Button>
                    )}
                    {renderCurrentStep()}
                </Box>
            </Box>
        </Box>
    );
};

export default RegistrosProveedorNavigator;