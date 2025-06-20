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

import { STEPS, backgroundImageURL } from "./assetsRegistro/Constants.js";
import { fetchFiltrosGlobales } from '../../services/firestoreService';
import { prepareProviderDataForFirestore, saveProviderProfileToFirestore } from '../../services/providerService';

import { storage } from '../../firebase/config.js';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { useAuth } from '../../context/AuthContext.jsx';

const TEMPORARY_UPLOAD_BASE_PATH = 'temp_registrations';

const saveToSessionStorage = (key, value) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error saving to sessionStorage", error);
    }
};

const loadFromSessionStorage = (key) => {
    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error loading from sessionStorage", error);
        return null;
    }
};

const initialFormData = {
    tipoCard: null,
    datosGenerales: {
        pais: 'Argentina', tipoRegistro: '', nombreProveedor: '', tipoProveedor: [], categoriaPrincipal: '',
        categoriasAdicionales: [], ciudad: '', provincia: '', nombre: '', apellido: '',
        rol: '', whatsapp: '', cuit: '', antiguedad: '', facturacion: '', marcasOficiales: [],
        serviciosClaveParaTags: []
    },
    datosPersonalizados: {
        tipoA: {
            descripcion: '', sitioWeb: '', whatsapp: '', telefono: '', email: '',
            marca: [], extras: [],
            logo: null,
            carruselURLs: [],
        },
        tipoB: {
            descripcion: '', sitioWeb: '', whatsapp: '', telefono: '', email: '',
            marcas: [], servicios: [],
            logo: null,
            carruselURLs: [],
            galeria: [],
        },
    },
    planSeleccionado: null,
};

const RegistrosProveedorNavigator = () => {
    const navigate = useNavigate();
    const { currentUser, loadingAuth } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(() => {
        const loadedData = loadFromSessionStorage("formData");
        if (loadedData) {
            const mergedData = { ...initialFormData, ...loadedData };
            mergedData.datosGenerales = { ...initialFormData.datosGenerales, ...(loadedData.datosGenerales || {}) };
            
            const deepMergePersonalizados = (initial, loaded) => {
                const result = { ...initial };
                if (loaded) {
                    for (const key in initial) {
                        if (loaded[key] !== undefined) {
                            if (typeof initial[key] === 'object' && initial[key] !== null && !Array.isArray(initial[key])) {
                                result[key] = { ...initial[key], ...loaded[key] };
                            } else {
                                result[key] = loaded[key];
                            }
                        }
                    }
                     for (const key in loaded) { 
                        if (result[key] === undefined) {
                            result[key] = loaded[key];
                        }
                    }
                }
                return result;
            };

            mergedData.datosPersonalizados = {
                tipoA: deepMergePersonalizados(initialFormData.datosPersonalizados.tipoA, loadedData.datosPersonalizados?.tipoA),
                tipoB: deepMergePersonalizados(initialFormData.datosPersonalizados.tipoB, loadedData.datosPersonalizados?.tipoB)
            };
            return mergedData;
        }
        return initialFormData;
    });

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
            removeDeArchivosTemporales(filePath);
        } catch (error) {
            console.warn("Error deleting file from Storage:", filePath, error);
        }
    }, [removeDeArchivosTemporales]);

    const handleFileUploaded = useCallback((tempFileId, { downloadURL, storagePath, fileTypeOriginal, mimeTypeOriginal, error, fieldType, itemIndex = null, arrayName = null }) => {
        setFormData(prevFormData => {
            const newFormData = JSON.parse(JSON.stringify(prevFormData));
            const tipo = newFormData.tipoCard;

            if (!tipo || !newFormData.datosPersonalizados[tipo]) {
                return prevFormData;
            }
            
            const personalizados = newFormData.datosPersonalizados[tipo];

            if (error) {
                console.error(`Error final for ${tempFileId}:`, error);
            } else if (downloadURL && storagePath) {
                updateArchivosTemporales(storagePath);
                const fileData = {
                    url: downloadURL,
                    tempPath: storagePath,
                    fileType: fileTypeOriginal,
                    mimeType: mimeTypeOriginal,
                    tempId: tempFileId,
                    status: 'loaded'
                };

                switch (fieldType) {
                    case 'logoFile':
                        if (personalizados.logo && personalizados.logo.tempPath && personalizados.logo.tempPath !== storagePath) {
                            deleteFileFromStorage(personalizados.logo.tempPath);
                        }
                        personalizados.logo = fileData;
                        break;
                    case 'carruselMediaItems':
                        let updatedCarrusel = Array.isArray(personalizados.carruselURLs) ? [...personalizados.carruselURLs] : [];
                        const existingCarruselIndex = updatedCarrusel.findIndex(item => item.tempId === tempFileId);
                        
                        if (existingCarruselIndex > -1) {
                            const oldItemCarrusel = updatedCarrusel[existingCarruselIndex];
                            if(oldItemCarrusel.tempPath && oldItemCarrusel.tempPath !== storagePath){
                                deleteFileFromStorage(oldItemCarrusel.tempPath);
                            }
                            updatedCarrusel[existingCarruselIndex] = fileData;
                        } else {
                            updatedCarrusel.push(fileData);
                        }
                        personalizados.carruselURLs = updatedCarrusel;
                        break;
                    case 'galeria':
                        if (arrayName === 'galeria' && itemIndex !== null) {
                            let updatedGaleria = Array.isArray(personalizados.galeria) ? [...personalizados.galeria] : [];
                            while(updatedGaleria.length <= itemIndex) {
                                updatedGaleria.push({ titulo: '', precio: '', url: '', tempPath: '', fileType: '', mimeType: '', tempId: null, status: 'empty' });
                            }
                            const oldItemGaleria = updatedGaleria[itemIndex];
                            if(oldItemGaleria && oldItemGaleria.tempPath && oldItemGaleria.tempPath !== storagePath) {
                                deleteFileFromStorage(oldItemGaleria.tempPath);
                            }
                            updatedGaleria[itemIndex] = {
                                ...(updatedGaleria[itemIndex] || {}),
                                imagenURL: downloadURL, 
                                url: downloadURL,
                                tempPath: storagePath,
                                fileType: fileTypeOriginal,
                                mimeType: mimeTypeOriginal,
                                tempId: tempFileId,
                                status: 'loaded'
                            };
                            personalizados.galeria = updatedGaleria;
                        }
                        break;
                    default:
                        break;
                }
            }
            newFormData.datosPersonalizados[tipo] = personalizados;
            saveToSessionStorage("formData", newFormData);
            return newFormData;
        });
    }, [updateArchivosTemporales, deleteFileFromStorage]);

    const uploadFileImmediately = useCallback(async (file, tempFileId, pathSuffixFromForm = 'general_uploads', fileMetadata = {}) => {
        if (!currentUser || !currentUser.uid) {
            handleFileUploadProgress(tempFileId, { progress: 0, status: 'error', errorMsg: 'User not authenticated.' });
            setOperationError("You must be logged in to upload files. Please refresh and log in.");
            return;
        }
        if (!file || !tempFileId) {
            handleFileUploadProgress(tempFileId, { progress: 0, status: 'error', errorMsg: 'Missing data for upload.' });
            return;
        }
        setOperationError(null);
        handleFileUploadProgress(tempFileId, { progress: 0, status: 'uploading', errorMsg: null, storagePath: null, finalUrl: null });
        
        const userId = currentUser.uid;
        const RUTA_STORAGE = `${TEMPORARY_UPLOAD_BASE_PATH}/${userId}/${pathSuffixFromForm}/${Date.now()}-${file.name}`;
        
        const storageRefInstance = ref(storage, RUTA_STORAGE);
        const uploadTask = uploadBytesResumable(storageRefInstance, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                handleFileUploadProgress(tempFileId, { progress: Math.round(progress), status: 'uploading' });
            },
            (error) => {
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
                    handleFileUploadProgress(tempFileId, { progress: 100, status: 'error', errorMsg: 'Error getting final URL' });
                    handleFileUploaded(tempFileId, { error, ...fileMetadata });
                }
            }
        );
    }, [currentUser, handleFileUploadProgress, handleFileUploaded]);

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
                setErrorFiltros("Error loading essential data. Please try reloading.");
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
                    tipoA: tipo === 'tipoA' && prev.tipoCard === 'tipoA' ? { ...prev.datosPersonalizados.tipoA } : { ...initialFormData.datosPersonalizados.tipoA },
                    tipoB: tipo === 'tipoB' && prev.tipoCard === 'tipoB' ? { ...prev.datosPersonalizados.tipoB } : { ...initialFormData.datosPersonalizados.tipoB },
                }
            };
            if (prev.tipoCard !== tipo && prev.datosPersonalizados && prev.datosPersonalizados[tipo]) {
                 newState.datosPersonalizados[tipo] = { ...initialFormData.datosPersonalizados[tipo] }; 
            } else if (prev.tipoCard === tipo && prev.datosPersonalizados && prev.datosPersonalizados[tipo]) {
                newState.datosPersonalizados[tipo] = { ...prev.datosPersonalizados[tipo] };
            } else {
                newState.datosPersonalizados[tipo] = { ...initialFormData.datosPersonalizados[tipo] };
            }

            setFileUploadProgress({});
            saveToSessionStorage("formData", newState);
            return newState;
        });
        nextStep();
    };
    
    const updateStepData = async (stepKey, newDataFromStep) => {
        setOperationError(null);
        setFormData(prevFormData => {
            let newFormData = JSON.parse(JSON.stringify(prevFormData));
            if (stepKey === 'datosPersonalizados' && newFormData.tipoCard) {
                const tipo = newFormData.tipoCard;
                if (!newFormData.datosPersonalizados[tipo]) {
                    newFormData.datosPersonalizados[tipo] = { ...initialFormData.datosPersonalizados[tipo] };
                }
                const currentPersonalizados = newFormData.datosPersonalizados[tipo];
                let updatedPersonalizados = { ...currentPersonalizados };

                for (const key in newDataFromStep) {
                    if (key === 'logo' || key === 'carruselURLs' || key === 'galeria') {
                         if (newDataFromStep[key] !== undefined) { 
                           updatedPersonalizados[key] = newDataFromStep[key];
                        }
                    } else if (!['logoFile', 'carruselMediaItems'].includes(key)) { 
                        updatedPersonalizados[key] = newDataFromStep[key];
                    }
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
            let newFormData = JSON.parse(JSON.stringify(prev));
            if (stepKey === 'datosPersonalizados' && newFormData.tipoCard) {
                const tipo = newFormData.tipoCard;
                if (!newFormData.datosPersonalizados[tipo]) {
                     newFormData.datosPersonalizados[tipo] = { ...initialFormData.datosPersonalizados[tipo] };
                }
                newFormData.datosPersonalizados[tipo] = {
                    ...newFormData.datosPersonalizados[tipo],
                    ...stepLocalDataFromChild
                };
            } else if (stepKey === 'datosGenerales') {
                newFormData.datosGenerales = { ...newFormData.datosGenerales, ...stepLocalDataFromChild };
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
        setOperationError(null);
        try {
            await updateStepData(stepKey, stepLocalData);
            const uploadsStillActive = Object.values(fileUploadProgress).some(f => f.status === 'uploading');
            
            if (uploadsStillActive) {
                setOperationError("Some files are still uploading. Please wait...");
            } else if (!operationError) {
                 nextStep();
            }
        } catch (error) {
            setOperationError("An error occurred while processing the step.");
        } finally {
            setIsProcessingGlobal(false);
        }
    };
    
    const cancelRegistration = async () => {
        setIsProcessingGlobal(true);
        setOperationError(null);
        try {
            const userId = currentUser?.uid;
            if (userId) {
                const userSpecificTempFiles = archivosSubidosTemporalmente.filter(path =>
                    path.startsWith(`${TEMPORARY_UPLOAD_BASE_PATH}/${userId}/`)
                );
                const deletePromises = userSpecificTempFiles.map(path => deleteFileFromStorage(path));
                await Promise.all(deletePromises);
            }
            
            setArchivosSubidosTemporalmente([]);
            sessionStorage.removeItem("archivosSubidosTemporalmente");
            setFormData(initialFormData);
            sessionStorage.removeItem("formData");
            setFileUploadProgress({});
            setCurrentStep(0);
            navigate("/registrar-mi-empresa");
        } catch (error) {
            setOperationError("Error cleaning temporary files. Please contact support if this persists.");
        } finally {
            setIsProcessingGlobal(false);
        }
    };

    useEffect(() => {
        if (!loadingFiltros) {
            const savedData = loadFromSessionStorage("formData");
            if (savedData) {
                 const mergedData = { ...initialFormData, ...savedData };
                 mergedData.datosGenerales = { ...initialFormData.datosGenerales, ...(savedData.datosGenerales || {}) };
                
                 const deepMergePersonalizados = (initial, loaded) => {
                    const result = { ...initial };
                    if (loaded) {
                        for (const key in initial) {
                            if (loaded[key] !== undefined) {
                                if (typeof initial[key] === 'object' && initial[key] !== null && !Array.isArray(initial[key])) {
                                    result[key] = { ...initial[key], ...loaded[key] };
                                } else {
                                    result[key] = loaded[key];
                                }
                            }
                        }
                        for (const key in loaded) {
                            if (result[key] === undefined) {
                                result[key] = loaded[key];
                            }
                        }
                    }
                    return result;
                };
                mergedData.datosPersonalizados = {
                    tipoA: deepMergePersonalizados(initialFormData.datosPersonalizados.tipoA, savedData.datosPersonalizados?.tipoA),
                    tipoB: deepMergePersonalizados(initialFormData.datosPersonalizados.tipoB, savedData.datosPersonalizados?.tipoB)
                 };
                setFormData(mergedData);
                setFileUploadProgress({});
            }
            const savedTemporalFiles = loadFromSessionStorage("archivosSubidosTemporalmente");
            if (savedTemporalFiles) {
                setArchivosSubidosTemporalmente(savedTemporalFiles);
            }
        }
    }, [loadingFiltros]);

    useEffect(() => {
        if (!loadingAuth && !currentUser) {
            setOperationError("Invalid session. You must be logged in to continue.");
        } else if (currentUser && operationError === "Invalid session. You must be logged in to continue.") {
            setOperationError(null);
        }
    }, [currentUser, loadingAuth, operationError]);


    const renderCurrentStep = () => {
        if (loadingAuth || loadingFiltros) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5 }}><CircularProgress sx={{ color: 'common.white' }} /><Typography sx={{ ml: 2, color: 'common.white' }}>Loading configuration...</Typography></Box>);
        }
        if (!currentUser && !loadingAuth) {
             return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}><Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>You must be logged in to register your company.</Typography><Button onClick={() => navigate('/registrarme')} variant="outlined" color="warning">Login / Register</Button></Box>);
        }
        if (errorFiltros) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}><Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>{errorFiltros}</Typography><Button onClick={() => window.location.reload()} variant="outlined" color="warning">Reload</Button></Box>);
        }
        
        const uploadsStillActive = Object.values(fileUploadProgress).some(f => f.status === 'uploading');
        if (operationError && !uploadsStillActive) {
            return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', py: 5, flexDirection: 'column' }}><Typography sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>{operationError}</Typography><Button onClick={() => setOperationError(null)} variant="outlined" color="info">Got it</Button></Box>);
        }

        switch (currentStep) {
            case 0:
                return <SeleccionTipoCard
                            onSelectCard={handleTipoCardSelection}
                            onCancel={cancelRegistration}
                       />;
            case 1:
                return <FormularioGeneral
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
                if (!formData.tipoCard) return <Typography color="error.main">Error: Card type not selected...</Typography>;
                const commonPersonalizadoProps = {
                    fileUploadProgress,
                    uploadFileImmediately,
                    onBack: (localData) => handleStepBack('datosPersonalizados', localData),
                    onCancel: cancelRegistration,
                    initialData: formData.datosPersonalizados[formData.tipoCard] || initialFormData.datosPersonalizados[formData.tipoCard],
                    onNext: (localData) => handleStepCompletion('datosPersonalizados', localData),
                    selectedCard: formData.tipoCard,
                    nombreProveedor: formData.datosGenerales.nombreProveedor,
                    ciudad: formData.datosGenerales.ciudad,
                    provincia: formData.datosGenerales.provincia,
                    tipoRegistro: formData.datosGenerales.tipoRegistro,
                    tipoProveedor: formData.datosGenerales.tipoProveedor,
                    selectedServices: formData.datosGenerales.serviciosClaveParaTags,
                    marcas: filtrosData.marcas,
                    extras: filtrosData.extras,
                    servicios: filtrosData.servicios
                };
                return <FormularioPersonalizado {...commonPersonalizadoProps} />;

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
                        const uploadsStillActiveConfirm = Object.values(fileUploadProgress).some(f => f.status === 'uploading');
                        if (uploadsStillActiveConfirm) {
                            setOperationError("Some files are still uploading. Please wait for them to finish before confirming.");
                            setIsProcessingGlobal(false);
                            return;
                        }
                        if (!currentUser || !currentUser.uid) {
                             setOperationError("Authentication error. Cannot confirm registration.");
                             setIsProcessingGlobal(false);
                             return;
                        }
                        
                        const userId = currentUser.uid;

                        try {
                            const providerDataToSave = prepareProviderDataForFirestore(formData, userId);
                            
                            await saveProviderProfileToFirestore(providerDataToSave);
                                                        
                            setArchivosSubidosTemporalmente([]);
                            sessionStorage.removeItem("archivosSubidosTemporalmente");
                            setFormData(initialFormData);
                            sessionStorage.removeItem("formData");
                            setFileUploadProgress({});
                            setCurrentStep(0);
                            navigate('/dashboard/mi-empresa');

                        } catch (error) {
                            setOperationError("Error saving registration. Please try again. Details: " + error.message);
                        } finally {
                            setIsProcessingGlobal(false);
                        }
                    }}
                />;
            default:
                return <Typography sx={{ color: 'error.main', textAlign: 'center', mt: 5 }}>Error: Unknown step.</Typography>;
        }
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, display: 'flex', flexDirection: 'column' }}
                open={(isProcessingGlobal || Object.values(fileUploadProgress).some(f => f.status === 'uploading')) && !operationError && !loadingFiltros && !loadingAuth}
            >
                <CircularProgress color="inherit" />
                <Typography sx={{ mt: 2 }}>
                    {Object.values(fileUploadProgress).some(f => f.status === 'uploading') ? 'Uploading files...' : 'Processing...'}
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
