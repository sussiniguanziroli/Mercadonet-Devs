import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Paper, Button, Grid, CircularProgress, Alert, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useAuth } from '../../../context/AuthContext';
import { listenToProviderById, fetchFiltrosGlobales } from '../../../services/firestoreService';
import { prepareProviderDataForFirestore, saveProviderProfileToFirestore } from '../../../services/providerService';
import { storage } from '../../../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import CardHistoriaPreview from '../../registroProveedor/card_simulators/CardHistoriaPreview';
import CardProductosPreview from '../../registroProveedor/card_simulators/CardProductosPreview';
import LogoUploadSection from '../../registroProveedor/steps/formSections/LogoUploadSection';
import CarruselUploadSection from '../../registroProveedor/steps/formSections/CarruselUploadSection';
import TextFieldSection from '../../registroProveedor/steps/formSections/TextFieldSection';
import AutocompleteSection from '../../registroProveedor/steps/formSections/AutocompleteSection';
import ContactoFieldsSection from '../../registroProveedor/steps/formSections/ContactoFieldsSection';
import GaleriaProductosSection from '../../registroProveedor/steps/formSections/GaleriaProductosSection';

const MiEmpresaCardCustomization = () => {
  const { proveedorId } = useParams();
  const { currentUser, loadingAuth } = useAuth();

  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filtrosData, setFiltrosData] = useState({});
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [fileUploadProgress, setFileUploadProgress] = useState({});

  const mapFetchedDataToForm = useCallback((data) => {
    if (!data) return {};
    
    const mapGaleria = (galeriaItems) => {
        const fullGaleria = Array(6).fill(null);
        (galeriaItems || []).forEach((item, index) => {
            if (index < 6) {
                fullGaleria[index] = { ...item, imagenFile: item.url || item.imagenURL ? { ...item, isExisting: true, preview: item.url || item.imagenURL } : null };
            }
        });
        return fullGaleria.map(g => g || { titulo: '', precio: '', imagenFile: null });
    };

    return {
        cardType: data.cardType,
        nombreProveedor: data.nombreProveedor || '',
        tipoRegistro: data.tipoRegistro || '',
        tipoProveedor: data.tipoProveedor || [],
        categoriaPrincipal: data.categoriaPrincipal || '',
        categoriasAdicionales: data.categoriasAdicionales || [],
        marcasOficiales: data.marcasOficiales || [],
        descripcion: data.descripcionGeneral || '',
        sitioWeb: data.contacto?.sitioWeb || '',
        whatsapp: data.contacto?.whatsapp || '',
        telefono: data.contacto?.telefono || '',
        email: data.contacto?.email || '',
        marcasSeleccionadas: data.marcasConfiguradas || [],
        extrasSeleccionados: data.extrasConfigurados || [],
        logoFile: data.logo ? { ...data.logo, isExisting: true, preview: data.logo.url } : null,
        carruselMediaItems: (data.carrusel || []).map(media => ({ ...media, isExisting: true, preview: media.url })),
        galeria: mapGaleria(data.galeria),
    };
  }, []);

  const { control, handleSubmit, watch, reset, setValue, getValues, register, formState: { errors, isDirty } } = useForm({
    mode: 'onChange',
  });
  
  const { fields: galeriaFields } = useFieldArray({ control, name: "galeria" });

  useEffect(() => {
    fetchFiltrosGlobales().then(setFiltrosData).finally(() => setLoadingFiltros(false));
  }, []);

  useEffect(() => {
    if (!proveedorId || loadingAuth || !currentUser) return;
    const unsubscribe = listenToProviderById(proveedorId, (snapshot) => {
        if (snapshot?.data?.userId === currentUser.uid) {
            setProviderData(snapshot.data);
            reset(mapFetchedDataToForm(snapshot.data));
        } else {
            setError("Proveedor no encontrado o sin permisos.");
        }
        setLoading(false);
    }, (err) => {
        setError("Error al cargar datos.");
        setLoading(false);
    });
    return () => unsubscribe();
  }, [proveedorId, currentUser, loadingAuth, reset, mapFetchedDataToForm]);

  const handleFileUploadProgress = useCallback((tempId, progress) => {
    setFileUploadProgress(prev => ({ ...prev, [tempId]: progress }));
  }, []);

  const handleFileUploaded = useCallback((tempId, { downloadURL, storagePath, fileType, mimeType, fieldType, itemIndex }) => {
    setFileUploadProgress(prev => ({...prev, [tempId]: 100}));
    const fileData = { url: downloadURL, tempPath: storagePath, fileType, mimeType, preview: downloadURL };
    if (fieldType === 'logoFile') setValue('logoFile', fileData, { shouldDirty: true });
    else if (fieldType === 'carruselMediaItems') setValue('carruselMediaItems', [...(getValues('carruselMediaItems') || []), fileData], { shouldDirty: true });
    else if (fieldType === 'galeria') setValue(`galeria.${itemIndex}.imagenFile`, fileData, { shouldDirty: true });
  }, [setValue, getValues]);

  const uploadFileImmediately = useCallback(async (file, fieldType, itemIndex = null) => {
    if (!currentUser?.uid || !file) return;
    const tempId = `${Date.now()}-${file.name}`;
    handleFileUploadProgress(tempId, 0);
    const RUTA_STORAGE = `temp_uploads_edit/${currentUser.uid}/${fieldType}/${tempId}`;
    const storageRef = ref(storage, RUTA_STORAGE);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',
        (s) => handleFileUploadProgress(tempId, (s.bytesTransferred / s.totalBytes) * 100),
        () => handleFileUploadProgress(tempId, -1),
        async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            handleFileUploaded(tempId, { downloadURL: url, storagePath: RUTA_STORAGE, fileType: file.type.startsWith('video/') ? 'video' : 'image', mimeType: file.type, fieldType, itemIndex });
        }
    );
  }, [currentUser, handleFileUploadProgress, handleFileUploaded]);

  const onSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
        const dataToSave = { ...providerData, ...formData };
        const preparedData = prepareProviderDataForFirestore(dataToSave, currentUser.uid);
        await saveProviderProfileToFirestore(preparedData, proveedorId);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
        reset(formData, { keepValues: true }); 
    } catch (err) {
        setError("Error al guardar: " + err.message);
    } finally {
        setIsSaving(false);
    }
  };
  
  const buildPreviewData = (data) => {
      if (!data || !providerData) return null;
      return {
          nombre: data.nombreProveedor,
          tipoRegistro: data.tipoRegistro,
          tipoProveedor: data.tipoProveedor,
          selectedServices: [data.categoriaPrincipal, ...(data.categoriasAdicionales || [])].filter(Boolean),
          ubicacionDetalle: `${providerData.ciudad || ''}, ${providerData.provincia || ''}`,
          descripcion: data.descripcion,
          logoPreview: data.logoFile?.preview,
          carrusel: (data.carruselMediaItems || []).map(i => ({ url: i.preview, fileType: i.fileType })),
          marca: data.marcasSeleccionadas,
          extras: data.extrasSeleccionados,
          sitioWeb: data.sitioWeb,
          whatsapp: data.whatsapp,
          telefono: data.telefono,
          email: data.email,
          galeriaProductos: (data.galeria || []).map(g => ({ titulo: g.titulo, precio: g.precio ? `$${g.precio}`: '', imagenPreview: g.imagenFile?.preview })).filter(p => p.titulo || p.precio || p.imagenPreview),
      };
  };
  
  const watchedAllFields = watch();
  const previewData = buildPreviewData(watchedAllFields);
  const esServicios = watchedAllFields.tipoRegistro === 'servicios';

  if (loading || loadingFiltros) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>Personalizar Perfil</Typography>
      {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>¡Cambios guardados! Tu perfil será actualizado en breve.</Alert>}
      
      <Grid container spacing={5}>
        <Grid item xs={12} md={7}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextFieldSection rhfName="nombreProveedor" label="Nombre del Proveedor *" control={control} errors={errors} rules={{ required: 'El nombre es requerido' }} />
            <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de Registro</InputLabel>
                <Select label="Tipo de Registro" value={watchedAllFields.tipoRegistro || ''} disabled>
                    <MenuItem value="productos">Proveedor de Productos</MenuItem>
                    <MenuItem value="servicios">Proveedor de Servicios</MenuItem>
                </Select>
            </FormControl>

            {watchedAllFields.tipoRegistro === 'productos' && (
                <AutocompleteSection rhfName="tipoProveedor" control={control} errors={errors} options={filtrosData.pproductos || []} label="Tipo de Proveedor *" multiple rules={{ required: 'Debes seleccionar un tipo' }} />
            )}
            
            <FormControl fullWidth margin="normal" error={!!errors.categoriaPrincipal}>
              <InputLabel>{esServicios ? "Servicio Principal *" : "Categoría Principal *"}</InputLabel>
              <Controller name="categoriaPrincipal" control={control} rules={{ required: "La categoría es requerida" }}
                render={({ field }) => (
                  <Select {...field} label={esServicios ? "Servicio Principal *" : "Categoría Principal *"}>
                    {(esServicios ? filtrosData.servicios : filtrosData.categorias || []).map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </Select>
                )}
              />
              {errors.categoriaPrincipal && <FormHelperText>{errors.categoriaPrincipal.message}</FormHelperText>}
            </FormControl>
            
            <AutocompleteSection rhfName="categoriasAdicionales" control={control} errors={errors} options={(esServicios ? filtrosData.servicios : filtrosData.categorias || []).filter(c => c !== watchedAllFields.categoriaPrincipal)} label={esServicios ? "Otros Servicios" : "Otras Categorías"} multiple />

            <LogoUploadSection control={control} errors={errors} rhfName="logoFile" watchedValue={watch('logoFile')} fileUploadProgress={fileUploadProgress} onInitiateUpload={({ file, tempId }) => uploadFileImmediately(file, 'logoFile')} onRemove={() => setValue('logoFile', null, { shouldDirty: true })} />
            <CarruselUploadSection control={control} errors={errors} rhfName="carruselMediaItems" watchedValue={watch('carruselMediaItems')} fileUploadProgress={fileUploadProgress} onInitiateUpload={({ file, tempId }) => uploadFileImmediately(file, 'carruselMediaItems')} onRemoveItem={(index) => setValue('carruselMediaItems', getValues('carruselMediaItems').filter((_, i) => i !== index), { shouldDirty: true })} />
            <TextFieldSection rhfName="descripcion" control={control} errors={errors} label="Descripción *" rules={{ required: true }} multiline rows={5} />
            <AutocompleteSection rhfName="marcasSeleccionadas" control={control} errors={errors} options={filtrosData.marcas || []} label="Marcas que trabajas" multiple />
            <AutocompleteSection rhfName="extrasSeleccionados" control={control} errors={errors} options={filtrosData.extras || []} label="Extras / Servicios Adicionales" multiple />
            <ContactoFieldsSection register={register} errors={errors} />

            {watchedAllFields.cardType === 'tipoB' && <GaleriaProductosSection control={control} register={register} errors={errors} galeriaFields={galeriaFields} watch={watch} fileUploadProgress={fileUploadProgress} onInitiateUpload={({file, tempId, itemIndex}) => uploadFileImmediately(file, 'galeria', itemIndex)} onRemoveImage={(index) => setValue(`galeria.${index}.imagenFile`, null, { shouldDirty: true })} />}

            <Box sx={{ mt: 4, textAlign: 'right' }}><Button variant="contained" type="submit" disabled={isSaving || !isDirty}>{isSaving ? <CircularProgress size={24} /> : 'Guardar Cambios'}</Button></Box>
          </form>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>Vista Previa</Typography>
            {previewData && (watchedAllFields.cardType === 'tipoA' 
              ? <CardHistoriaPreview proveedor={previewData} /> 
              : <CardProductosPreview proveedor={previewData} />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MiEmpresaCardCustomization;

