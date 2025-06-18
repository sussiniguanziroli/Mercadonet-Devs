// src/components/dashboard/pages/MiEmpresaCardCustomization.jsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form'; // Import Controller and useFieldArray
import { useAuth } from '../../../context/AuthContext';
import { listenToProviderById, fetchFiltrosGlobales } from '../../../services/firestoreService'; // Import fetchFiltrosGlobales
import { saveProviderProfileToFirestore } from '../../../services/providerService'; // Re-use save function, which will now also handle updates
import CardHistoriaPreview from '../../registroProveedor/card_simulators/CardHistoriaPreview';
import CardProductosPreview from '../../registroProveedor/card_simulators/CardProductosPreview';

// Reusing form sections from registration flow
import LogoUploadSection from '../../registroProveedor/steps/formSections/LogoUploadSection';
import CarruselUploadSection from '../../registroProveedor/steps/formSections/CarruselUploadSection';
import TextFieldSection from '../../registroProveedor/steps/formSections/TextFieldSection';
import AutocompleteSection from '../../registroProveedor/steps/formSections/AutocompleteSection';
import ContactoFieldsSection from '../../registroProveedor/steps/formSections/ContactoFieldsSection';
import GaleriaProductosSection from '../../registroProveedor/steps/formSections/GaleriaProductosSection';

// Firebase Storage imports for direct uploads from dashboard
import { storage } from '../../../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { MenuItemFR } from 'react-pro-sidebar';

const MiEmpresaCardCustomization = () => {
  const { proveedorId } = useParams(); // Get the providerId from the URL
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();

  const [providerData, setProviderData] = useState(null); // Stores the original fetched provider data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Global filters for autocomplete options
  const [filtrosData, setFiltrosData] = useState({ categorias: [], pproductos: [], ubicaciones: [], extras: [], servicios: [], marcas: [] });
  const [loadingFiltros, setLoadingFiltros] = useState(true);

  // State for tracking file upload progress (for newly uploaded files during editing)
  const [fileUploadProgress, setFileUploadProgress] = useState({});
  const uploadQueueRef = useRef(new Set()); // Tracks files currently being uploaded

  // Constants from registration flow
  const LIMITE_CARRUSEL = 7;
  const LIMITE_GALERIA_PRODUCTOS = 6;
  const PRODUCTOS_OBLIGATORIOS_GALERIA = 0; // Can be 0 for editing, or adjust as needed
  const DESCRIPCION_MAX_LENGTH_TIPO_A = 1600;
  const DESCRIPCION_MAX_LENGTH_TIPO_B = 1300;

  const { control, handleSubmit, watch, reset, setValue, getValues, register, formState: { errors, isDirty } } = useForm({
    mode: 'onChange',
    defaultValues: {}
  });

  const { fields: galeriaFields, append, remove } = useFieldArray({ control, name: "galeria" });

  const watchedAllFields = watch(); // Watch all fields for real-time preview


  // --- Fetch Global Filters ---
  useEffect(() => {
    const loadFiltros = async () => {
      setLoadingFiltros(true);
      try {
        const data = await fetchFiltrosGlobales();
        setFiltrosData(data);
      } catch (err) {
        console.error("Error loading global filters:", err);
        setError("Error al cargar opciones de categorías/marcas.");
      } finally {
        setLoadingFiltros(false);
      }
    };
    loadFiltros();
  }, []);


  // --- Fetch Provider Data in Real-time (and initialize form) ---
  useEffect(() => {
    if (!proveedorId || loadingAuth || !currentUser || loadingFiltros) {
      if (!loadingAuth && !currentUser) setError("Debes iniciar sesión para ver esta página.");
      else if (!proveedorId) setError("ID de proveedor no especificado.");
      else if (loadingFiltros) { /* Still loading filters, do nothing yet */ return; }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = listenToProviderById(
      proveedorId,
      (snapshotData) => {
        if (snapshotData) {
          const fetchedData = snapshotData.data;
          setProviderData(fetchedData); // Store the raw fetched data
          console.log("Fetched provider data for customization:", fetchedData);

          // Prepare form values from fetched data
          const initialFormValues = {
            // General Info
            nombreProveedor: fetchedData.nombreProveedor || '',
            tipoRegistro: fetchedData.tipoRegistro || '',
            tipoProveedor: fetchedData.tipoProveedor || [],
            categoriaPrincipal: fetchedData.categoriaPrincipal || '',
            categoriasAdicionales: fetchedData.categoriasAdicionales || [],
            pais: fetchedData.pais || 'Argentina',
            provincia: fetchedData.provincia || '',
            ciudad: fetchedData.ciudad || '',
            nombreContactoPersona: fetchedData.nombreContactoPersona || '',
            apellidoContactoPersona: fetchedData.apellidoContactoPersona || '',
            rolContactoPersona: fetchedData.rolContactoPersona || '',
            cuit: fetchedData.cuit || '',
            antiguedad: fetchedData.antiguedad || '',
            facturacion: fetchedData.facturacion || '',
            marcasOficiales: fetchedData.marcasOficiales || [],

            // Card Specific Data (from descriptionGeneral, contacto, media, etc.)
            descripcion: fetchedData.descripcionGeneral || '',
            sitioWeb: fetchedData.contacto?.sitioWeb || '',
            whatsapp: fetchedData.contacto?.whatsapp || '',
            telefono: fetchedData.contacto?.telefono || '',
            email: fetchedData.contacto?.email || '',

            marcasSeleccionadas: fetchedData.marcasConfiguradas || fetchedData.marcas || [], // Consolidated
            extrasSeleccionados: fetchedData.extrasConfigurados || fetchedData.servicios || [], // Consolidated

            logoFile: fetchedData.logo?.url ? {
                file: null, preview: fetchedData.logo.url, isExisting: true,
                name: 'logo_cargado', type: fetchedData.logo.mimeType || 'image/existing',
                tempId: null, // Existing files don't have tempId for this component
                status: 'loaded', permanentStoragePath: fetchedData.logo.permanentStoragePath || fetchedData.logo.tempStoragePath
            } : null,
            carruselMediaItems: (fetchedData.carrusel || []).map(item => ({
                file: null, url: item.url, fileType: item.fileType,
                mimeType: item.mimeType, isExisting: true, name: 'media_cargado',
                tempId: null, // Existing files don't have tempId for this component
                status: 'loaded', permanentStoragePath: item.permanentStoragePath || item.tempStoragePath
            })),
            galeria: (fetchedData.galeria || []).map(item => ({
                titulo: item.titulo || '',
                precio: item.precio || '',
                imagenFile: item.url || item.imagenURL ? {
                    file: null, preview: item.url || item.imagenURL, isExisting: true,
                    name: `prod_${item.titulo || 'img'}_cargado`, type: item.mimeType || 'image/existing',
                    tempId: null, status: 'loaded', permanentStoragePath: item.permanentStoragePath || item.tempStoragePath
                } : null,
            })),
          };
          reset(initialFormValues); // Reset the form with fetched data
          setLoading(false);
          setSaveSuccess(false); // Reset success message on new data load
        } else {
          setError("Perfil de proveedor no encontrado o no tienes permiso para verlo.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore listener error for provider:", err);
        setError("Error al cargar los datos del proveedor: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [proveedorId, currentUser, loadingAuth, loadingFiltros, reset]);


  // --- File Upload Logic (Direct to Permanent Storage) ---
  const uploadFileImmediately = useCallback(async (file, tempFileId, pathSuffix, fileMetadata = {}) => {
      if (!currentUser || !currentUser.uid) {
          setError("Usuario no autenticado. No se puede subir el archivo.");
          return;
      }
      if (!file || !tempFileId) { // tempFileId here is just a unique ID for RHF tracking, not a tempStoragePath
          setError("Faltan datos para subir el archivo.");
          return;
      }
      if (!proveedorId) {
          setError("ID de proveedor no disponible para la subida de archivos.");
          return;
      }

      setError(null);
      setFileUploadProgress(prev => ({
          ...prev,
          [tempFileId]: { progress: 0, status: 'uploading', errorMsg: null, finalUrl: null, storagePath: null }
      }));

      // Use a permanent path directly for dashboard uploads
      const uniqueFileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const RUTA_STORAGE_PERMANENT = `${PERMANENT_STORAGE_BASE_PATH}/${proveedorId}/${pathSuffix}/${uniqueFileName}`;

      const storageRefInstance = ref(storage, RUTA_STORAGE_PERMANENT);
      const uploadTask = uploadBytesResumable(storageRefInstance, file);

      uploadTask.on('state_changed',
          (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setFileUploadProgress(prev => ({
                  ...prev,
                  [tempFileId]: { ...prev[tempFileId], progress: Math.round(progress), status: 'uploading' }
              }));
          },
          (error) => {
              console.error(`Error uploading file ${file.name}:`, error);
              setFileUploadProgress(prev => ({
                  ...prev,
                  [tempFileId]: { ...prev[tempFileId], progress: 0, status: 'error', errorMsg: error.code || 'upload_failed' }
              }));
              setError("Error al subir archivo: " + (error.message || error.code));
              uploadQueueRef.current.delete(tempFileId);
          },
          async () => {
              try {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  setFileUploadProgress(prev => ({
                      ...prev,
                      [tempFileId]: { ...prev[tempFileId], progress: 100, status: 'success', finalUrl: downloadURL, storagePath: RUTA_STORAGE_PERMANENT }
                  }));
                  // Update RHF state with the final URL and permanent path
                  if (fileMetadata.rhfPathForStatusUpdate) {
                    setValue(fileMetadata.rhfPathForStatusUpdate, 'loaded', { shouldDirty: true });
                  }
                  if (fileMetadata.rhfPathForUrlUpdate) {
                    setValue(fileMetadata.rhfPathForUrlUpdate, downloadURL, { shouldDirty: true });
                  }
                  if (fileMetadata.rhfPathForPermanentStorage) {
                      setValue(fileMetadata.rhfPathForPermanentStorage, RUTA_STORAGE_PERMANENT, { shouldDirty: true });
                  }
                  if (fileMetadata.rhfPathForFileType) {
                    setValue(fileMetadata.rhfPathForFileType, file.type.startsWith('video/') ? 'video' : 'image', { shouldDirty: true });
                  }
                  if (fileMetadata.rhfPathForMimeType) {
                    setValue(fileMetadata.rhfPathForMimeType, file.type, { shouldDirty: true });
                  }

                  uploadQueueRef.current.delete(tempFileId);
              } catch (error) {
                  console.error(`Error getting download URL for ${file.name}:`, error);
                  setFileUploadProgress(prev => ({
                      ...prev,
                      [tempFileId]: { ...prev[tempFileId], progress: 100, status: 'error', errorMsg: 'Error al obtener URL' }
                  }));
                  setError("Error al procesar archivo: " + (error.message || error.code));
                  uploadQueueRef.current.delete(tempFileId);
              }
          }
      );
  }, [currentUser, proveedorId, setValue]);

  // Handle RHF updates based on fileUploadProgress
  useEffect(() => {
    // Logo File update
    const watchedLogoFile = getValues('logoFile');
    if (watchedLogoFile?.tempId && fileUploadProgress[watchedLogoFile.tempId]?.status === 'success') {
      const progress = fileUploadProgress[watchedLogoFile.tempId];
      if (progress.finalUrl && watchedLogoFile.preview !== progress.finalUrl) { // Avoid unnecessary re-render/loop
        setValue('logoFile', {
          ...watchedLogoFile,
          preview: progress.finalUrl,
          permanentStoragePath: progress.storagePath,
          file: null,
          isExisting: true,
          status: 'loaded',
          type: progress.fileTypeOriginal || watchedLogoFile.type,
          mimeType: progress.mimeTypeOriginal || watchedLogoFile.mimeType,
        }, { shouldDirty: true });
        uploadQueueRef.current.delete(watchedLogoFile.tempId);
      }
    } else if (watchedLogoFile?.tempId && fileUploadProgress[watchedLogoFile.tempId]?.status === 'error') {
      setValue('logoFile.status', 'error_upload', { shouldDirty: true });
      uploadQueueRef.current.delete(watchedLogoFile.tempId);
    }

    // Carrusel Media Items update
    const currentCarruselItems = getValues('carruselMediaItems') || [];
    let carruselUpdated = false;
    const newCarruselItems = currentCarruselItems.map(item => {
      if (item.tempId && fileUploadProgress[item.tempId]?.status === 'success') {
        const progress = fileUploadProgress[item.tempId];
        if (progress.finalUrl && item.url !== progress.finalUrl) {
          carruselUpdated = true;
          uploadQueueRef.current.delete(item.tempId);
          return {
            ...item,
            url: progress.finalUrl,
            permanentStoragePath: progress.storagePath,
            file: null,
            isExisting: true,
            status: 'loaded',
            fileType: progress.fileTypeOriginal || item.fileType,
            mimeType: progress.mimeTypeOriginal || item.mimeType,
          };
        }
      } else if (item.tempId && fileUploadProgress[item.tempId]?.status === 'error') {
        carruselUpdated = true;
        uploadQueueRef.current.delete(item.tempId);
        return { ...item, status: 'error_upload' };
      }
      return item;
    });
    if (carruselUpdated) {
      setValue('carruselMediaItems', newCarruselItems, { shouldDirty: true });
    }

    // Galeria Products Update (if applicable)
    const currentGaleriaItems = getValues('galeria') || [];
    let galeriaUpdated = false;
    const newGaleriaItems = currentGaleriaItems.map(item => {
      if (item.imagenFile?.tempId && fileUploadProgress[item.imagenFile.tempId]?.status === 'success') {
        const progress = fileUploadProgress[item.imagenFile.tempId];
        if (progress.finalUrl && item.imagenFile.preview !== progress.finalUrl) {
          galeriaUpdated = true;
          uploadQueueRef.current.delete(item.imagenFile.tempId);
          return {
            ...item,
            imagenFile: {
              ...item.imagenFile,
              preview: progress.finalUrl,
              permanentStoragePath: progress.storagePath,
              file: null,
              isExisting: true,
              status: 'loaded',
              type: progress.fileTypeOriginal || item.imagenFile.type,
              mimeType: progress.mimeTypeOriginal || item.imagenFile.mimeType,
            }
          };
        }
      } else if (item.imagenFile?.tempId && fileUploadProgress[item.imagenFile.tempId]?.status === 'error') {
        galeriaUpdated = true;
        uploadQueueRef.current.delete(item.imagenFile.tempId);
        return { ...item, imagenFile: { ...item.imagenFile, status: 'error_upload' } };
      }
      return item;
    });
    if (galeriaUpdated) {
      setValue('galeria', newGaleriaItems, { shouldDirty: true });
    }

  }, [fileUploadProgress, getValues, setValue]);


  // --- Submit Logic (Saving Changes) ---
  const onSubmit = async (data) => {
    if (!isDirty && uploadQueueRef.current.size === 0) { // Check if there are actual changes or pending uploads
      setSaveSuccess(false);
      setError("No hay cambios para guardar.");
      return;
    }
    if (uploadQueueRef.current.size > 0) {
        setError("Por favor, espera a que todos los archivos terminen de subirse.");
        return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Reconstruct the full provider data structure expected by prepareProviderDataForFirestore
      // This merges form data with original fetched data (for fields not on this form)
      const fullProviderData = {
        ...providerData, // Start with original data to preserve non-editable fields
        // Override general fields that are editable on this page
        nombreProveedor: data.nombreProveedor,
        tipoRegistro: data.tipoRegistro,
        tipoProveedor: data.tipoProveedor,
        categoriaPrincipal: data.categoriaPrincipal,
        categoriasAdicionales: data.categoriasAdicionales,
        pais: data.pais,
        provincia: data.provincia,
        ciudad: data.ciudad,
        nombreContactoPersona: data.nombreContactoPersona,
        apellidoContactoPersona: data.apellidoContactoPersona,
        rolContactoPersona: data.rolContactoPersona,
        cuit: data.cuit,
        antiguedad: data.antiguedad,
        facturacion: data.facturacion,
        marcasOficiales: data.marcasOficiales,

        // Update card-specific fields based on form
        descripcionGeneral: data.descripcion,
        contacto: {
          email: data.email,
          sitioWeb: data.sitioWeb,
          whatsapp: data.whatsapp,
          telefono: data.telefono
        },
        marcasConfiguradas: data.marcasSeleccionadas,
        extrasConfigurados: data.extrasSeleccionados,

        // These _raw fields will be processed by prepareProviderDataForFirestore and saveProviderProfileToFirestore
        _rawLogoFile: data.logoFile,
        _rawCarruselFiles: data.carruselMediaItems,
        _rawGaleriaFiles: data.galeria, // This will be an array of {titulo, precio, imagenFile}
      };

      // Prepare data for Firestore (this will extract and structure media for permanent paths)
      const dataToSaveToFirestore = prepareProviderDataForFirestore(fullProviderData, currentUser.uid);

      // Call the updated saveProviderProfileToFirestore which now handles updates and media finalization
      await saveProviderProfileToFirestore(dataToSaveToFirestore, proveedorId);

      setSaveSuccess(true);
      // The listenToProviderById useEffect will automatically re-fetch and reset the form
      // with the newly saved data, effectively marking `isDirty` as false.
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      setError("Error al guardar los cambios: " + (err.message || err.code));
    } finally {
      setIsSaving(false);
    }
  };


  // --- Prepare Data for Previewer ---
  const buildPreviewData = (currentRHFData) => {
    if (!providerData) return null; // Don't preview until core data is loaded

    const ubicacionDetalle = `${currentRHFData.ciudad || ''}${currentRHFData.ciudad && currentRHFData.provincia ? ', ' : ''}${currentRHFData.provincia || ''}`;

    // Map RHF's logoFile to logoPreview for previewer
    const logoForPreview = currentRHFData.logoFile?.preview || null;

    // Map RHF's carruselMediaItems to carrusel for previewer
    const carruselForPreview = (currentRHFData.carruselMediaItems || []).map(item => ({
        url: item.url || item.preview,
        fileType: item.fileType,
        mimeType: item.mimeType,
        status: item.status // Pass status for previewer to handle loading/error states if it wants
    })).filter(item => item.url && item.status !== 'error_upload' && item.status !== 'removed');

    const galeriaForPreview = (currentRHFData.galeria || []).map(item => ({
        titulo: item.titulo,
        precio: item.precio ? `$${item.precio}` : '', // Format price for preview
        imagenPreview: item.imagenFile?.preview || null,
        status: item.imagenFile?.status
    })).filter(p => (p.titulo || p.precio || p.imagenPreview) && p.status !== 'error_upload' && p.status !== 'removed');


    return {
      nombre: currentRHFData.nombreProveedor, // Use RHF value
      ubicacionDetalle,
      tipoRegistro: currentRHFData.tipoRegistro, // Use RHF value
      tipoProveedor: currentRHFData.tipoProveedor, // Use RHF value
      selectedServices: (currentRHFData.tipoRegistro === 'servicios' ?
                         [currentRHFData.categoriaPrincipal, ...(currentRHFData.categoriasAdicionales || [])] :
                         (currentRHFData.extrasSeleccionados || currentRHFData.serviciosSeleccionados || [])
                        ).filter(Boolean), // Derive tags dynamically from form fields
      descripcion: currentRHFData.descripcion,
      logoPreview: logoForPreview,
      carrusel: carruselForPreview,
      marca: currentRHFData.marcasSeleccionadas,
      extras: currentRHFData.extrasSeleccionados,
      // Contact info
      sitioWeb: currentRHFData.sitioWeb,
      whatsapp: currentRHFData.whatsapp,
      telefono: currentRHFData.telefono,
      email: currentRHFData.email,
      galeriaProductos: galeriaForPreview, // Only relevant for TipoB
      // Add other fields relevant for preview as needed
    };
  };

  const previewData = buildPreviewData(watchedAllFields);


  if (loading || loadingFiltros) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando detalles de tu Card y filtros...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button onClick={() => navigate('/dashboard/mi-empresa')}>Volver a Mis Empresas</Button>
      </Alert>
    );
  }

  // Determine which preview card to render based on fetched providerData
  const renderPreviewCard = () => {
    if (!previewData) return null;
    if (providerData.cardType === 'tipoA') {
      return <CardHistoriaPreview proveedor={previewData} />;
    } else if (providerData.cardType === 'tipoB') {
      return <CardProductosPreview proveedor={previewData} />;
    }
    return <Typography>Tipo de Card no reconocido.</Typography>;
  };

  const esProveedorDeServicios = watchedAllFields.tipoRegistro === 'servicios';
  const categoriasDisponibles = esProveedorDeServicios ? filtrosData.servicios : filtrosData.categorias;
  const labelCategoriaPrincipal = esProveedorDeServicios ? 'Tipo de Servicio Principal' : 'Categoría Principal';
  const leyendaOtrasCategorias = esProveedorDeServicios ? 'Otros Servicios Ofrecidos (Hasta 5)' : 'Otras categorías (Elige hasta 5)';
  const descripcionMaxLength = providerData?.cardType === 'tipoA' ? DESCRIPCION_MAX_LENGTH_TIPO_A : DESCRIPCION_MAX_LENGTH_TIPO_B;

  const watchedTipoRegistro = watchedAllFields.tipoRegistro;
  const watchedTipoProveedor = watchedAllFields.tipoProveedor || []; // Ensure it's an array

  return (
    <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 4 }}>
        Personalizar Mi Card de Empresa: {providerData?.nombreProveedor} ({providerData?.cardType === 'tipoA' ? 'Historia' : 'Productos'})
      </Typography>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ¡Cambios guardados con éxito! Tu Card se ha actualizado.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Form Section */}
        <Grid item xs={12} md={7}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', mt: 3, mb: 2 }}>
              Información General del Negocio
            </Typography>
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12}>
                    <TextField
                        label="Nombre del Proveedor"
                        {...register("nombreProveedor", { required: "El nombre del proveedor es obligatorio" })}
                        fullWidth
                        error={!!errors.nombreProveedor}
                        helperText={errors.nombreProveedor?.message}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.tipoRegistro}>
                        <InputLabel id="tipo-registro-label">Tipo de Registro *</InputLabel>
                        <Controller
                            name="tipoRegistro"
                            control={control}
                            rules={{ required: "Selecciona el tipo de registro" }}
                            render={({ field }) => (
                                <Select labelId="tipo-registro-label" label="Tipo de Registro *" {...field}>
                                    <MenuItem value="productos">Proveedor de Productos</MenuItem>
                                    <MenuItem value="servicios">Proveedor de Servicios</MenuItem>
                                </Select>
                            )}
                        />
                        {errors.tipoRegistro && <FormHelperText>{errors.tipoRegistro.message}</FormHelperText>}
                    </FormControl>
                </Grid>

                {watchedTipoRegistro === 'productos' && (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.tipoProveedor}>
                            <InputLabel id="tipo-proveedor-label">Tipo de Proveedor *</InputLabel>
                            <Controller
                                name="tipoProveedor"
                                control={control}
                                rules={{ required: 'Selecciona al menos un tipo de proveedor' }}
                                render={({ field }) => (
                                    <Select labelId="tipo-proveedor-label" multiple {...field}
                                        input={<OutlinedInput label="Tipo de Proveedor *" />}
                                        renderValue={(selected) => (
                                            selected.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value) => (
                                                        <Chip key={value} label={value}
                                                            onDelete={() => field.onChange(field.value.filter((item) => item !== value))}
                                                            onMouseDown={(event) => event.stopPropagation()} />
                                                    ))}
                                                </Box>
                                            ) : (<em>Selecciona uno o más tipos</em>)
                                        )} sx={{ borderRadius: 1 }}>
                                        {(filtrosData.pproductos || []).map((tipo) => (<MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>))}
                                    </Select>
                                )} />
                            {errors.tipoProveedor && (<FormHelperText>{errors.tipoProveedor.message}</FormHelperText>)}
                        </FormControl>
                    </Grid>
                )}

                {watchedTipoRegistro === 'productos' && watchedTipoProveedor.includes('Distribuidores Oficiales') && (
                    <Grid item xs={12}>
                        <AutocompleteSection
                            rhfName="marcasOficiales"
                            control={control}
                            errors={errors}
                            options={filtrosData.marcas}
                            label="Marcas Distribuidor Oficial (Hasta 5)"
                            multiple
                            limit={5}
                            rules={{ validate: value => (value || []).length <= 5 || "Solo puedes seleccionar hasta 5 marcas."}}
                        />
                    </Grid>
                )}

                {watchedTipoRegistro && (
                    <>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!errors.categoriaPrincipal}>
                                <InputLabel id="categoria-principal-label">{labelCategoriaPrincipal} *</InputLabel>
                                <Controller
                                    name="categoriaPrincipal"
                                    control={control}
                                    rules={{ required: `Selecciona ${labelCategoriaPrincipal}` }}
                                    render={({ field }) => (
                                        <Select labelId="categoria-principal-label" label={labelCategoriaPrincipal + " *"} {...field}>
                                            <MenuItem value="">Selecciona...</MenuItem>
                                            {categoriasDisponibles.map((cat, i) => (<MenuItem key={i} value={cat}>{cat}</MenuItem>))}
                                        </Select>
                                    )}
                                />
                                {errors.categoriaPrincipal && <FormHelperText>{errors.categoriaPrincipal.message}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <AutocompleteSection
                                rhfName="categoriasAdicionales"
                                control={control}
                                errors={errors}
                                options={categoriasDisponibles.filter((cat) => cat !== watchedAllFields.categoriaPrincipal)}
                                label={leyendaOtrasCategorias}
                                multiple
                                limit={5}
                                rules={{ validate: value => !value || value.length <= 5 || "Solo puedes seleccionar hasta 5 opciones."}}
                            />
                        </Grid>
                    </>
                )}

                <Grid item xs={12} md={6}>
                    <TextField label="Ciudad" {...register("ciudad")} fullWidth />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel id="provincia-label">Provincia / Estado</InputLabel>
                        <Controller
                            name="provincia"
                            control={control}
                            render={({ field }) => (
                                <Select labelId="provincia-label" label="Provincia / Estado" {...field}>
                                    <MenuItem value="">Selecciona...</MenuItem>
                                    {(filtrosData.ubicaciones || []).map((loc, i) => <MenuItem key={i} value={loc}>{loc}</MenuItem>)}
                                </Select>
                            )}
                        />
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField label="Nombre Contacto" {...register("nombreContactoPersona", { required: "El nombre de contacto es obligatorio" })} fullWidth error={!!errors.nombreContactoPersona} helperText={errors.nombreContactoPersona?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Apellido Contacto" {...register("apellidoContactoPersona", { required: "El apellido de contacto es obligatorio" })} fullWidth error={!!errors.apellidoContactoPersona} helperText={errors.apellidoContactoPersona?.message} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Rol Contacto" {...register("rolContactoPersona", { required: "El rol de contacto es obligatorio" })} fullWidth error={!!errors.rolContactoPersona} helperText={errors.rolContactoPersona?.message} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="CUIT / RUT / Tax ID" {...register("cuit")} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField type="number" label="Antigüedad (años)" {...register("antiguedad", { valueAsNumber: true, min: { value: 0, message: "La antigüedad no puede ser negativa" } })} fullWidth error={!!errors.antiguedad} helperText={errors.antiguedad?.message} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField type="number" label="Facturación anual (USD)" {...register("facturacion", { valueAsNumber: true, min: { value: 0, message: "La facturación no puede ser negativa" } })} fullWidth error={!!errors.facturacion} helperText={errors.facturacion?.message} />
                </Grid>

            </Grid> {/* End of Información General Grid */}

            <LogoUploadSection
                control={control}
                errors={errors}
                rhfName="logoFile"
                watchedValue={watchedAllFields.logoFile}
                fileUploadProgress={fileUploadProgress}
                onInitiateUpload={({ file, tempId }) => uploadFileImmediately(file, tempId, 'logos', {
                    rhfPathForStatusUpdate: 'logoFile.status',
                    rhfPathForUrlUpdate: 'logoFile.preview',
                    rhfPathForPermanentStorage: 'logoFile.permanentStoragePath',
                    rhfPathForFileType: 'logoFile.type',
                    rhfPathForMimeType: 'logoFile.mimeType',
                })}
                onRemove={() => setValue('logoFile', null, { shouldDirty: true })}
                sectionLabel="Logo de la Empresa"
            />

            <CarruselUploadSection
                control={control}
                errors={errors}
                rhfName="carruselMediaItems"
                watchedValue={watchedAllFields.carruselMediaItems}
                fileUploadProgress={fileUploadProgress}
                onInitiateUpload={({ file, tempId, itemIndex }) => uploadFileImmediately(file, tempId, 'carrusel', {
                    rhfPathForStatusUpdate: `carruselMediaItems.${itemIndex}.status`,
                    rhfPathForUrlUpdate: `carruselMediaItems.${itemIndex}.url`,
                    rhfPathForPermanentStorage: `carruselMediaItems.${itemIndex}.permanentStoragePath`,
                    rhfPathForFileType: `carruselMediaItems.${itemIndex}.fileType`,
                    rhfPathForMimeType: `carruselMediaItems.${itemIndex}.mimeType`,
                })}
                onRemoveItem={(indexToRemove) => {
                    const currentItems = getValues("carruselMediaItems") || [];
                    const newItems = currentItems.filter((_, i) => i !== indexToRemove);
                    setValue('carruselMediaItems', newItems, { shouldDirty: true });
                }}
                limit={LIMITE_CARRUSEL}
                sectionLabel="Carrusel Multimedia"
            />

            <TextFieldSection
                rhfName="descripcion"
                control={control}
                errors={errors}
                label="Descripción del Negocio/Empresa *"
                rules={{
                    required: 'La descripción es requerida',
                    maxLength: { value: descripcionMaxLength, message: `Máx. ${descripcionMaxLength} caracteres.` }
                }}
                multiline
                rows={5}
                maxLength={descripcionMaxLength}
                placeholder="Describe tu empresa, historia, valores o productos..."
            />

            <AutocompleteSection
                rhfName="marcasSeleccionadas"
                control={control}
                errors={errors}
                options={filtrosData.marcas}
                label="Marcas que trabajás"
                multiple
            />

            {providerData?.cardType === 'tipoB' ? (
                <AutocompleteSection
                    rhfName="serviciosSeleccionados"
                    control={control}
                    errors={errors}
                    options={filtrosData.extras} // Assuming extras are used for additional services in TipoB
                    label="Servicios Adicionales (Tipo B)"
                    multiple
                />
            ) : (
                <AutocompleteSection
                    rhfName="extrasSeleccionados"
                    control={control}
                    errors={errors}
                    options={filtrosData.extras}
                    label="Extras que ofrecés (Tipo A)"
                    multiple
                />
            )}

            <ContactoFieldsSection
                register={register}
                errors={errors}
                sectionTitle="Información de Contacto (Visible en la Card)"
                // Make all contact fields required if it's a TipoB card, else optional
                sitioWebRequired={providerData?.cardType === 'tipoB'}
                whatsappRequired={providerData?.cardType === 'tipoB'}
                emailRequired={providerData?.cardType === 'tipoB'}
            />

            {providerData?.cardType === 'tipoB' && (
                <GaleriaProductosSection
                    control={control}
                    register={register}
                    errors={errors}
                    galeriaFields={galeriaFields}
                    watch={watch}
                    fileUploadProgress={fileUploadProgress}
                    onInitiateUpload={({ file, tempId, itemIndex }) => uploadFileImmediately(file, tempId, 'galeria', {
                        rhfPathForStatusUpdate: `galeria.${itemIndex}.imagenFile.status`,
                        rhfPathForUrlUpdate: `galeria.${itemIndex}.imagenFile.preview`,
                        rhfPathForPermanentStorage: `galeria.${itemIndex}.imagenFile.permanentStoragePath`,
                        rhfPathForFileType: `galeria.${itemIndex}.imagenFile.type`,
                        rhfPathForMimeType: `galeria.${itemIndex}.imagenFile.mimeType`,
                    })}
                    onRemoveImage={(index) => {
                        const rhfPath = `galeria.${index}.imagenFile`;
                        setValue(rhfPath, null, { shouldDirty: true });
                    }}
                    limiteProductos={LIMITE_GALERIA_PRODUCTOS}
                    productosObligatorios={PRODUCTOS_OBLIGATORIOS_GALERIA}
                />
            )}


            <Grid item xs={12} sx={{ mt: 4, textAlign: 'right' }}>
              <Button variant="contained" color="primary" type="submit" disabled={isSaving || !isDirty || uploadQueueRef.current.size > 0}>
                {isSaving ? <CircularProgress size={24} /> : (uploadQueueRef.current.size > 0 ? 'Subiendo archivos...' : 'Guardar Cambios')}
              </Button>
            </Grid>
          </form>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 20, p: 2, bgcolor: 'background.default', borderRadius: '8px', boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
              Vista Previa en Tiempo Real
            </Typography>
            {renderPreviewCard()}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MiEmpresaCardCustomization;