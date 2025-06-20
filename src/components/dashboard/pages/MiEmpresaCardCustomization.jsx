import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip, FormHelperText, Checkbox, ListItemText } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useAuth } from '../../../context/AuthContext';
import { listenToProviderById, fetchFiltrosGlobales } from '../../../services/firestoreService';
import { prepareProviderDataForFirestore, saveProviderProfileToFirestore } from '../../../services/providerService';
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
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();

  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [filtrosData, setFiltrosData] = useState({ categorias: [], pproductos: [], ubicaciones: [], extras: [], servicios: [], marcas: [] });
  const [loadingFiltros, setLoadingFiltros] = useState(true);

  const { control, handleSubmit, watch, reset, setValue, getValues, register, formState: { errors, isDirty } } = useForm({
    mode: 'onChange',
    defaultValues: {}
  });

  const { fields: galeriaFields, append: appendGaleria, remove: removeGaleria } = useFieldArray({ control, name: "galeria" });
  
  const watchedAllFields = watch();
  const watchedTipoRegistro = watch('tipoRegistro');

  useEffect(() => {
    const loadFiltros = async () => {
      setLoadingFiltros(true);
      try {
        const data = await fetchFiltrosGlobales();
        setFiltrosData(data);
      } catch (err) {
        setError("Error al cargar las opciones de categorías/marcas.");
      } finally {
        setLoadingFiltros(false);
      }
    };
    loadFiltros();
  }, []);

  const mapFetchedDataToForm = useCallback((fetchedData) => {
    return {
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
        cardType: fetchedData.cardType || 'tipoA',
        descripcion: fetchedData.descripcionGeneral || '',
        sitioWeb: fetchedData.contacto?.sitioWeb || '',
        whatsapp: fetchedData.contacto?.whatsapp || '',
        telefono: fetchedData.contacto?.telefono || '',
        email: fetchedData.contacto?.email || '',
        marcasSeleccionadas: fetchedData.marcasConfiguradas || [],
        extrasSeleccionados: fetchedData.extrasConfigurados || [],
        serviciosSeleccionados: fetchedData.serviciosConfigurados || [],
        logoFile: fetchedData.logo?.url ? {
            file: null, preview: fetchedData.logo.url, isExisting: true,
            name: 'logo_cargado', type: fetchedData.logo.mimeType,
            status: 'loaded', permanentStoragePath: fetchedData.logo.permanentStoragePath
        } : null,
        carruselMediaItems: (fetchedData.carrusel || []).map(item => ({
            file: null, url: item.url, fileType: item.fileType,
            mimeType: item.mimeType, isExisting: true, name: 'media_cargado',
            status: 'loaded', permanentStoragePath: item.permanentStoragePath
        })),
        galeria: (fetchedData.galeria || []).map(item => ({
            titulo: item.titulo || '',
            precio: item.precio || '',
            imagenFile: item.imagenURL ? {
                file: null, preview: item.imagenURL, isExisting: true,
                name: `prod_cargado`, type: item.mimeType,
                status: 'loaded', permanentStoragePath: item.permanentStoragePath
            } : null,
        })),
      };
  }, []);

  useEffect(() => {
    if (!proveedorId || loadingAuth || !currentUser || loadingFiltros) return;
    setLoading(true);
    setError(null);
    const unsubscribe = listenToProviderById(
      proveedorId,
      (snapshot) => {
        if (snapshot && snapshot.data) {
          const fetchedData = snapshot.data;
          if (fetchedData.userId !== currentUser.uid) {
            setError("No tienes permiso para editar este proveedor.");
            setLoading(false);
            return;
          }
          setProviderData(fetchedData);
          const formValues = mapFetchedDataToForm(fetchedData);
          reset(formValues);
        } else {
          setError("Perfil de proveedor no encontrado.");
        }
        setLoading(false);
      },
      (err) => {
        setError("Error al cargar los datos del proveedor: " + err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [proveedorId, currentUser, loadingAuth, loadingFiltros, reset, mapFetchedDataToForm]);
  
  const handleFileUpload = (file, rhfPath) => {
    if (file) {
        setValue(rhfPath, {
            file: file, preview: URL.createObjectURL(file), isExisting: false,
            mimeType: file.type, fileType: file.type.startsWith('video') ? 'video' : 'image',
        }, { shouldDirty: true });
    }
  };
  
  const handleCarruselUpload = (file) => {
    if (file) {
        const currentItems = getValues('carruselMediaItems') || [];
        const newItem = {
            file: file, url: URL.createObjectURL(file), isExisting: false,
            mimeType: file.type, fileType: file.type.startsWith('video') ? 'video' : 'image',
        };
        setValue('carruselMediaItems', [...currentItems, newItem], { shouldDirty: true });
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const preparedData = prepareProviderDataForFirestore(data, currentUser.uid);
      await saveProviderProfileToFirestore(preparedData, proveedorId);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
      reset(data); 
    } catch (err) {
      setError("Error al guardar los cambios: " + (err.message || err.code));
    } finally {
      setIsSaving(false);
    }
  };
  
  const buildPreviewData = (currentRHFData) => {
    if (!currentRHFData || Object.keys(currentRHFData).length === 0) return null;
    const logoForPreview = currentRHFData.logoFile?.preview || null;
    const carruselForPreview = (currentRHFData.carruselMediaItems || []).map(item => ({
        url: item.url || item.preview, fileType: item.fileType,
    })).filter(item => item.url);
    const galeriaForPreview = (currentRHFData.galeria || []).map(item => ({
        titulo: item.titulo, precio: item.precio ? `$${item.precio}` : '', imagenPreview: item.imagenFile?.preview || null,
    })).filter(p => p.titulo || p.precio || p.imagenPreview);
    
    return {
      nombre: currentRHFData.nombreProveedor,
      ubicacionDetalle: `${currentRHFData.ciudad || ''}, ${currentRHFData.provincia || ''}`,
      tipoRegistro: currentRHFData.tipoRegistro, tipoProveedor: currentRHFData.tipoProveedor,
      selectedServices: (currentRHFData.tipoRegistro === 'servicios' ?
                         [currentRHFData.categoriaPrincipal, ...(currentRHFData.categoriasAdicionales || [])] :
                         (currentRHFData.extrasSeleccionados || [])).filter(Boolean),
      descripcion: currentRHFData.descripcion, logoPreview: logoForPreview, carrusel: carruselForPreview,
      marca: currentRHFData.marcasSeleccionadas, extras: currentRHFData.extrasSeleccionados,
      sitioWeb: currentRHFData.sitioWeb, whatsapp: currentRHFData.whatsapp,
      telefono: currentRHFData.telefono, email: currentRHFData.email, galeriaProductos: galeriaForPreview,
    };
  };

  const previewData = buildPreviewData(watchedAllFields);

  if (loading || loadingFiltros) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!providerData) return <Alert severity="warning" sx={{ m: 2 }}>Datos del proveedor no encontrados.</Alert>;
  
  const descripcionMaxLength = providerData.cardType === 'tipoA' ? 1600 : 1300;
  const esDeServicios = watchedTipoRegistro === 'servicios';
  const opcionesCategoria = esDeServicios ? filtrosData.servicios : filtrosData.categorias;
  const categoriaPrincipalLabel = esDeServicios ? "Servicio Principal *" : "Categoría Principal *";
  const categoriasAdicionalesLabel = esDeServicios ? "Otros Servicios (hasta 5)" : "Otras Categorías (hasta 5)";

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom>Personalizar Card: {providerData.nombreProveedor}</Typography>
      {saveSuccess && <Alert severity="success" sx={{ mb: 3 }}>¡Cambios guardados con éxito!</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Typography variant="h6" gutterBottom>Información del Negocio</Typography>
            <Grid container spacing={2} sx={{mb: 3}}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nombre del Proveedor" {...register("nombreProveedor", { required: true })} error={!!errors.nombreProveedor} helperText={errors.nombreProveedor && "El nombre es requerido."} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="tipo-registro-label">Tipo de Registro *</InputLabel>
                  <Controller name="tipoRegistro" control={control} rules={{ required: "Debes seleccionar un tipo" }}
                    render={({ field }) => (
                      <Select labelId="tipo-registro-label" label="Tipo de Registro *" {...field}>
                        <MenuItem value="productos">Proveedor de Productos</MenuItem>
                        <MenuItem value="servicios">Proveedor de Servicios</MenuItem>
                      </Select>
                  )}/>
                </FormControl>
              </Grid>
              {watchedTipoRegistro === 'productos' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.tipoProveedor}>
                      <InputLabel id="tipo-proveedor-label">Tipo de Proveedor *</InputLabel>
                      <Controller name="tipoProveedor" control={control} rules={{ required: 'Selecciona al menos un tipo' }}
                        render={({ field }) => (
                          <Select labelId="tipo-proveedor-label" label="Tipo de Proveedor *" multiple {...field}
                            input={<OutlinedInput label="Tipo de Proveedor *" />}
                            renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map(v => <Chip key={v} label={v} />)}</Box>}
                          >
                            {filtrosData.pproductos.map(tipo => <MenuItem key={tipo} value={tipo}><Checkbox checked={(field.value || []).indexOf(tipo) > -1} /> <ListItemText primary={tipo} /></MenuItem>)}
                          </Select>
                        )}
                      />
                      {errors.tipoProveedor && <FormHelperText>{errors.tipoProveedor.message}</FormHelperText>}
                  </FormControl>
                </Grid>
              )}
               <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="cat-principal-label">{categoriaPrincipalLabel}</InputLabel>
                    <Controller name="categoriaPrincipal" control={control} rules={{ required: "Debes seleccionar una opción" }}
                        render={({ field }) => (
                            <Select labelId="cat-principal-label" label={categoriaPrincipalLabel} {...field}>
                                {opcionesCategoria.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                            </Select>
                        )}
                    />
                  </FormControl>
               </Grid>
               <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.categoriasAdicionales}>
                        <InputLabel id="cat-adicionales-label">{categoriasAdicionalesLabel}</InputLabel>
                        <Controller name="categoriasAdicionales" control={control}
                            rules={{ validate: v => !v || v.length <= 5 || "Máximo 5 selecciones."}}
                            render={({ field }) => (
                            <Select labelId="cat-adicionales-label" label={categoriasAdicionalesLabel} multiple {...field}
                                input={<OutlinedInput label={categoriasAdicionalesLabel} />}
                                renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map(v => <Chip key={v} label={v} />)}</Box>}
                            >
                                {opcionesCategoria.filter(c => c !== watchedAllFields.categoriaPrincipal).map(cat => (
                                    <MenuItem key={cat} value={cat}>
                                        <Checkbox checked={(field.value || []).indexOf(cat) > -1} />
                                        <ListItemText primary={cat} />
                                    </MenuItem>
                                ))}
                            </Select>
                            )}
                        />
                        {errors.categoriasAdicionales && <FormHelperText>{errors.categoriasAdicionales.message}</FormHelperText>}
                    </FormControl>
               </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Contenido de la Card</Typography>
            <LogoUploadSection control={control} errors={errors} rhfName="logoFile" watchedValue={watchedAllFields.logoFile} onInitiateUpload={(e) => handleFileUpload(e.target.files[0], 'logoFile')} onRemove={() => setValue('logoFile', null, { shouldDirty: true })} />
            <CarruselUploadSection control={control} errors={errors} rhfName="carruselMediaItems" watchedValue={watchedAllFields.carruselMediaItems} onInitiateUpload={(e) => handleCarruselUpload(e.target.files[0])} onRemoveItem={(index) => setValue('carruselMediaItems', getValues('carruselMediaItems').filter((_, i) => i !== index), { shouldDirty: true })} limit={7} />
            <TextFieldSection rhfName="descripcion" control={control} errors={errors} label="Descripción *" rules={{ required: 'La descripción es requerida', maxLength: { value: descripcionMaxLength, message: `Máx ${descripcionMaxLength} caracteres.` } }} multiline rows={5} maxLength={descripcionMaxLength} />
            <AutocompleteSection rhfName="marcasSeleccionadas" control={control} errors={errors} options={filtrosData.marcas} label="Marcas que trabajás" multiple />
            {providerData.cardType === 'tipoB' ? <AutocompleteSection rhfName="serviciosSeleccionados" control={control} errors={errors} options={filtrosData.servicios} label="Servicios Adicionales" multiple /> : <AutocompleteSection rhfName="extrasSeleccionados" control={control} errors={errors} options={filtrosData.extras} label="Extras que ofrecés" multiple />}
            <ContactoFieldsSection register={register} errors={errors} sectionTitle="Información de Contacto" sitioWebRequired={providerData.cardType === 'tipoB'} whatsappRequired={providerData.cardType === 'tipoB'} emailRequired={providerData.cardType === 'tipoB'} />
            {providerData.cardType === 'tipoB' && <GaleriaProductosSection control={control} register={register} errors={errors} galeriaFields={galeriaFields} watch={watch} onInitiateUpload={(e, index) => handleFileUpload(e.target.files[0], `galeria.${index}.imagenFile`)} onRemoveImage={(index) => setValue(`galeria.${index}.imagenFile`, null, { shouldDirty: true })} limiteProductos={6} />}
            <Grid item xs={12} sx={{ mt: 4, textAlign: 'right' }}>
              <Button variant="contained" color="primary" type="submit" disabled={isSaving || !isDirty}>
                {isSaving ? <CircularProgress size={24} /> : 'Guardar Cambios'}
              </Button>
            </Grid>
          </form>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>Vista Previa en Tiempo Real</Typography>
            {previewData && (providerData.cardType === 'tipoA' ? <CardHistoriaPreview proveedor={previewData} /> : <CardProductosPreview proveedor={previewData} />)}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MiEmpresaCardCustomization;
