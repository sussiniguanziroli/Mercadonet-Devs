import { db, storage } from '../firebase/config';
import { collection, doc, serverTimestamp, addDoc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, deleteObject, getDownloadURL, listAll } from "firebase/storage";

const PERMANENT_STORAGE_BASE_PATH = 'proveedores_media';

export const prepareProviderDataForFirestore = (formData, userId) => {
  const isRegistrationFlow = !!formData.datosGenerales;

  const datosGenerales = isRegistrationFlow ? formData.datosGenerales : formData;
  const tipoCard = isRegistrationFlow ? formData.tipoCard : formData.cardType;
  const planSeleccionado = isRegistrationFlow ? formData.planSeleccionado : formData.planSeleccionado;
  const datosPersonalizados = isRegistrationFlow ? (formData.datosPersonalizados?.[tipoCard] || {}) : formData;

  const providerData = {
    userId: userId,
    nombreProveedor: datosGenerales.nombreProveedor || '',
    tipoRegistro: datosGenerales.tipoRegistro || '',
    tipoProveedor: datosGenerales.tipoProveedor || [],
    categoriaPrincipal: datosGenerales.categoriaPrincipal || '',
    categoriasAdicionales: datosGenerales.categoriasAdicionales || [],
    pais: datosGenerales.pais || 'Argentina',
    provincia: datosGenerales.provincia || '',
    ciudad: datosGenerales.ciudad || '',
    nombreContactoPersona: datosGenerales.nombre || datosGenerales.nombreContactoPersona || '',
    apellidoContactoPersona: datosGenerales.apellido || datosGenerales.apellidoContactoPersona || '',
    rolContactoPersona: datosGenerales.rol || datosGenerales.rolContactoPersona || '',
    cuit: datosGenerales.cuit || '',
    antiguedad: datosGenerales.antiguedad ? Number(datosGenerales.antiguedad) : null,
    facturacion: datosGenerales.facturacion ? Number(datosGenerales.facturacion) : null,
    marcasOficiales: datosGenerales.marcasOficiales || [],
    serviciosClaveParaTags: datosGenerales.serviciosClaveParaTags || [],
    cardType: tipoCard,
    descripcionGeneral: datosPersonalizados.descripcion || formData.descripcion || '',
    contacto: {
      email: datosPersonalizados.email || formData.email || '',
      sitioWeb: datosPersonalizados.sitioWeb || formData.sitioWeb || '',
      whatsapp: datosPersonalizados.whatsapp || formData.whatsapp || '',
      telefono: datosPersonalizados.telefono || formData.telefono || '',
    },
    marcasConfiguradas: datosPersonalizados.marcasSeleccionadas || formData.marcasSeleccionadas || [],
    extrasConfigurados: datosPersonalizados.extrasSeleccionados || formData.extrasSeleccionados || [],
    serviciosConfigurados: datosPersonalizados.serviciosSeleccionados || formData.serviciosSeleccionados || [],
    planSeleccionado: planSeleccionado || null,
    _rawLogoFile: formData.logoFile,
    _rawCarruselFiles: formData.carruselMediaItems,
    _rawGaleriaFiles: formData.galeria,
    logo: isRegistrationFlow ? datosPersonalizados.logo : undefined,
    carrusel: isRegistrationFlow ? datosPersonalizados.carruselURLs : undefined,
    galeria: isRegistrationFlow ? datosPersonalizados.galeria : undefined,
  };

  return providerData;
};

const processMediaForUpdate = async (providerDocId, rawFiles, oldMediaData, mediaType) => {
    const filesToDelete = new Set((oldMediaData || []).map(item => item.permanentStoragePath).filter(Boolean));
    
    const uploadPromises = (rawFiles || []).map(async (item) => {
        if (!item) return null;

        if (item.file) {
            const subFolder = mediaType === 'logo' ? 'logos' : (mediaType === 'carrusel' ? 'carrusel_media' : 'galeria_productos');
            const path = `${PERMANENT_STORAGE_BASE_PATH}/${providerDocId}/${subFolder}/${Date.now()}-${item.file.name.replace(/\s/g, '_')}`;
            const fileRef = ref(storage, path);
            await uploadBytes(fileRef, item.file);
            const url = await getDownloadURL(fileRef);
            
            const newMediaObject = {
                titulo: item.titulo || null,
                precio: item.precio || null,
                url: url,
                permanentStoragePath: path,
                fileType: item.fileType || (item.file.type.startsWith('video') ? 'video' : 'image'),
                mimeType: item.mimeType || item.file.type,
                isPermanent: true,
            };
            if(mediaType === 'galeria') newMediaObject.imagenURL = url;
            return newMediaObject;
        }

        if (item.isExisting && item.permanentStoragePath) {
            filesToDelete.delete(item.permanentStoragePath);
            const existingMediaObject = {
                ...item,
                url: item.preview || item.url,
            };
            if (mediaType === 'galeria') {
              existingMediaObject.imagenURL = item.preview || item.url;
            }
            delete existingMediaObject.preview;
            return existingMediaObject;
        }
        return null; 
    });

    const newMediaItems = (await Promise.all(uploadPromises)).filter(item => item !== null);

    await Promise.all(Array.from(filesToDelete).map(async (path) => {
        try {
            await deleteObject(ref(storage, path));
        } catch (e) {
            console.warn(`Could not delete old file: ${path}`, e);
        }
    }));
    
    return newMediaItems;
};

export const saveProviderProfileToFirestore = async (providerData, providerDocId = null) => {
  if (!providerData || !providerData.userId) {
    throw new Error("Provider data or userId is required.");
  }

  const { _rawLogoFile, _rawCarruselFiles, _rawGaleriaFiles, ...dataToSave } = providerData;

  if (providerDocId) {
    const docRef = doc(db, "proveedores", providerDocId);
    const docSnap = await getDoc(docRef);
    const oldProviderData = docSnap.exists() ? docSnap.data() : {};
    
    const mediaUpdates = {};
    
    if (_rawLogoFile !== undefined) {
        const logoResult = await processMediaForUpdate(providerDocId, _rawLogoFile ? [_rawLogoFile] : [], oldProviderData.logo ? [oldProviderData.logo] : [], 'logo');
        mediaUpdates.logo = logoResult[0] || null;
    }
    if (_rawCarruselFiles !== undefined) {
        mediaUpdates.carrusel = await processMediaForUpdate(providerDocId, _rawCarruselFiles, oldProviderData.carrusel, 'carrusel');
    }
    if (_rawGaleriaFiles !== undefined) {
        mediaUpdates.galeria = await processMediaForUpdate(providerDocId, _rawGaleriaFiles, oldProviderData.galeria, 'galeria');
    }

    Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
            delete dataToSave[key];
        }
    });

    const finalData = { ...dataToSave, ...mediaUpdates, updatedAt: serverTimestamp() };

    await updateDoc(docRef, finalData);
    return { success: true, id: providerDocId };

  } else {
    Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
            delete dataToSave[key];
        }
    });

    const newProviderDocRef = await addDoc(collection(db, "proveedores"), {
      ...dataToSave,
      fileProcessingStatus: 'pending_move',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      estadoCuenta: "pendienteRevision"
    });
    return { success: true, id: newProviderDocRef.id };
  }
};

export const deleteProvider = async (providerId) => {
  if (!providerId) {
    throw new Error("Provider ID is required to delete.");
  }

  const docRef = doc(db, "proveedores", providerId);
  const storageFolderRef = ref(storage, `${PERMANENT_STORAGE_BASE_PATH}/${providerId}`);

  try {
    const deleteFilesInFolder = async (folderRef) => {
      const listResult = await listAll(folderRef);
      const deleteFilePromises = listResult.items.map(itemRef => deleteObject(itemRef));
      await Promise.all(deleteFilePromises);
      const deleteFolderPromises = listResult.prefixes.map(subfolderRef => deleteFilesInFolder(subfolderRef));
      await Promise.all(deleteFolderPromises);
    };
    
    await deleteFilesInFolder(storageFolderRef);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting provider ${providerId}:`, error);
    throw error;
  }
};
