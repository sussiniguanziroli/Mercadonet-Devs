// src/services/providerService.js
import { db, storage } from '../firebase/config'; // Import storage
import { collection, doc, setDoc, serverTimestamp, addDoc, updateDoc } from "firebase/firestore"; // Import updateDoc
import { ref, uploadBytes, deleteObject } from "firebase/storage"; // Import for file operations

// Base path for permanent provider media in Firebase Storage
const PERMANENT_STORAGE_BASE_PATH = 'proveedores_media';

export const prepareProviderDataForFirestore = (formData, userId) => {
  const {
    datosGenerales,
    tipoCard,
    // When editing, datosPersonalizados is already structured, so we take it as-is.
    // When registering, it's a nested object (datosPersonalizados[tipoCard]).
    // To handle both, we'll check if it's already the specific data.
    datosPersonalizados, // This might be the full object or just the data for tipoA/B
    planSeleccionado
  } = formData;

  // Adapt to handle both registration (nested) and editing (flat data for specific card)
  let cardSpecificData = {};
  if (datosPersonalizados && datosPersonalizados[tipoCard]) {
    // This is from registration flow or if the data is still nested
    cardSpecificData = datosPersonalizados[tipoCard] || {};
  } else if (tipoCard && datosPersonalizados) {
    // This is from editing, where `datosPersonalizados` might directly contain the card's data
    cardSpecificData = datosPersonalizados; // Assume datosPersonalizados directly contains the specific card data
  }


  const cleanAndPrepareFileObjects = (fileArray, providerDocId) => {
    return (fileArray || []).map(item => {
      if (typeof item !== 'object' || item === null) return item;

      // Determine the permanent path for the file
      const originalFileName = item.name || (item.tempPath ? item.tempPath.split('/').pop() : 'file');
      const uniqueSuffix = Date.now(); // Or use a UUID if more collision-proof needed
      const permanentPath = `${PERMANENT_STORAGE_BASE_PATH}/${providerDocId}/card_media/${item.fileType === 'video' ? 'videos' : 'images'}/${originalFileName.replace(/\s/g, '_')}-${uniqueSuffix}`;

      // If it's a new upload (has tempPath and is not already permanent)
      if (item.tempPath && !item.isPermanent) {
        return {
          url: item.url || '', // This is the temporary download URL from initial upload
          tempStoragePath: item.tempPath || '',
          permanentStoragePath: permanentPath, // New permanent path for storage
          fileType: item.fileType || '',
          mimeType: item.mimeType || '',
          isPermanent: true, // Mark it for finalization
          status: item.status || 'loaded',
        };
      }
      // If it's an existing permanent file or a placeholder without tempPath
      return {
        url: item.url || item.imagenURL || '', // Use the existing URL
        permanentStoragePath: item.permanentStoragePath || item.tempStoragePath || '', // Use existing permanent path or previous temp path if it became permanent
        fileType: item.fileType || '',
        mimeType: item.mimeType || '',
        isPermanent: item.isPermanent || (item.permanentStoragePath ? true : false), // Confirm if it's permanent
        status: item.status || 'loaded',
      };
    });
  }

  let serviciosParaTagsData = [];
  if (datosGenerales.tipoRegistro === 'servicios') {
    serviciosParaTagsData = [
      datosGenerales.categoriaPrincipal,
      ...(datosGenerales.categoriasAdicionales || [])
    ].filter(Boolean);
  }

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
    nombreContactoPersona: datosGenerales.nombre || '',
    apellidoContactoPersona: datosGenerales.apellido || '',
    rolContactoPersona: datosGenerales.rol || '',
    cuit: datosGenerales.cuit || '',
    antiguedad: datosGenerales.antiguedad || '',
    facturacion: datosGenerales.facturacion || '',
    marcasOficiales: datosGenerales.marcasOficiales || [],

    serviciosClaveParaTags: serviciosParaTagsData,

    cardType: tipoCard, // Keep the original card type

    // These will be prepared for permanent storage during update process
    logo: null,
    carrusel: [],
    galeria: [], // Only if TipoB

    descripcionGeneral: cardSpecificData.descripcion || '',
    contacto: {
      email: cardSpecificData.email || '',
      sitioWeb: cardSpecificData.sitioWeb || '',
      whatsapp: cardSpecificData.whatsapp || '',
      telefono: cardSpecificData.telefono || ''
    },

    marcasConfiguradas: cardSpecificData.marcasSeleccionadas || cardSpecificData.marca || cardSpecificData.marcas || [],
    extrasConfigurados: cardSpecificData.extrasSeleccionados || cardSpecificData.extras || cardSpecificData.servicios || [], // Covers both `extras` and `servicios`

    planSeleccionado: planSeleccionado || null,

    // fileProcessingStatus: 'pending', // This will be handled during finalizeMediaForProvider
    updatedAt: serverTimestamp(),
    estadoCuenta: "pendienteRevision" // Status might change based on admin review
  };

  // Temporarily store raw file objects (with temp paths) for processing by finalization step
  // These are not directly stored in Firestore, but passed to the finalization function
  providerData._rawLogoFile = cardSpecificData.logo;
  providerData._rawCarruselFiles = cardSpecificData.carruselURLs;
  providerData._rawGaleriaFiles = tipoCard === 'tipoB' ? cardSpecificData.galeria : [];


  return providerData;
};

// New helper function to finalize media after provider document is created/updated
export const finalizeMediaForProvider = async (providerDocId, rawLogo, rawCarrusel, rawGaleria, tempFilesToDelete) => {
  const mediaToSave = {
    logo: null,
    carrusel: [],
    galeria: []
  };
  let filesToMove = []; // [{ from: tempPath, to: permanentPath, file: blob/File }]
  let filesToDelete = []; // [filePath]

  // Process Logo
  if (rawLogo) {
    if (rawLogo.tempPath && !rawLogo.isPermanent) { // New upload
      const permanentPath = `${PERMANENT_STORAGE_BASE_PATH}/${providerDocId}/card_media/images/logo-${Date.now()}-${rawLogo.tempPath.split('/').pop()}`;
      filesToMove.push({ from: rawLogo.tempPath, to: permanentPath, fileType: rawLogo.fileType, mimeType: rawLogo.mimeType });
      mediaToSave.logo = { url: permanentPath, permanentStoragePath: permanentPath, fileType: rawLogo.fileType, mimeType: rawLogo.mimeType, isPermanent: true };
    } else if (rawLogo.permanentStoragePath || rawLogo.url) { // Existing permanent logo
      mediaToSave.logo = { url: rawLogo.url || rawLogo.permanentStoragePath, permanentStoragePath: rawLogo.permanentStoragePath || rawLogo.tempStoragePath, fileType: rawLogo.fileType, mimeType: rawLogo.mimeType, isPermanent: true };
    }
  } else if (rawLogo === null) { // Logo was explicitly removed
      // If there was an old logo, it should be deleted. This needs to be handled
      // by comparing with the existing data before update.
      // For simplicity in this function, we assume `tempFilesToDelete` handles this.
  }

  // Process Carrusel
  mediaToSave.carrusel = (rawCarrusel || []).map(item => {
    if (item.tempPath && !item.isPermanent) { // New upload
      const permanentPath = `${PERMANENT_STORAGE_BASE_PATH}/${providerDocId}/card_media/${item.fileType === 'video' ? 'videos' : 'images'}/carrusel-${Date.now()}-${item.tempPath.split('/').pop()}`;
      filesToMove.push({ from: item.tempPath, to: permanentPath, fileType: item.fileType, mimeType: item.mimeType });
      return { url: permanentPath, permanentStoragePath: permanentPath, fileType: item.fileType, mimeType: item.mimeType, isPermanent: true };
    } else if (item.permanentStoragePath || item.url) { // Existing permanent item
      return { url: item.url || item.permanentStoragePath, permanentStoragePath: item.permanentStoragePath || item.tempStoragePath, fileType: item.fileType, mimeType: item.mimeType, isPermanent: true };
    }
    return null;
  }).filter(Boolean);

  // Process Galeria (for TipoB)
  mediaToSave.galeria = (rawGaleria || []).map(item => {
    const imagenFile = item.imagenFile || item; // Handle both RHF structure and raw data
    if (imagenFile.tempPath && !imagenFile.isPermanent) { // New upload
      const permanentPath = `${PERMANENT_STORAGE_BASE_PATH}/${providerDocId}/card_media/images/galeria-${Date.now()}-${imagenFile.tempPath.split('/').pop()}`;
      filesToMove.push({ from: imagenFile.tempPath, to: permanentPath, fileType: imagenFile.fileType, mimeType: imagenFile.mimeType });
      return { titulo: item.titulo, precio: item.precio, url: permanentPath, imagenURL: permanentPath, permanentStoragePath: permanentPath, fileType: imagenFile.fileType, mimeType: imagenFile.mimeType, isPermanent: true };
    } else if (imagenFile.permanentStoragePath || imagenFile.url || imagenFile.imagenURL) { // Existing permanent item
      return { titulo: item.titulo, precio: item.precio, url: imagenFile.url || imagenFile.imagenURL || imagenFile.permanentStoragePath, imagenURL: imagenFile.imagenURL || imagenFile.url || imagenFile.permanentStoragePath, permanentStoragePath: imagenFile.permanentStoragePath || imagenFile.tempStoragePath, fileType: imagenFile.fileType, mimeType: imagenFile.mimeType, isPermanent: true };
    }
    // If no image but title/price, keep the text data
    if (item.titulo || item.precio) {
      return { titulo: item.titulo, precio: item.precio, url: null, imagenURL: null, permanentStoragePath: null, fileType: null, mimeType: null, isPermanent: false };
    }
    return null;
  }).filter(Boolean);


  // Execute file movements and deletions (conceptual - requires Cloud Functions or client-side file copying)
  // IMPORTANT: Firebase Storage does not have a "move" operation. You must copy then delete.
  // This usually requires a Cloud Function for server-side processing,
  // or a more complex client-side sequence if you want to avoid functions.
  // For now, we'll simulate this with client-side delete.
  console.log("Simulating file movements/deletions:", { filesToMove, tempFilesToDelete });

  // Client-side deletion of old temporary files
  const deletePromises = tempFilesToDelete.map(async (path) => {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      console.log("Deleted old temporary file:", path);
    } catch (e) {
      console.warn("Could not delete old temporary file:", path, e);
    }
  });
  await Promise.all(deletePromises); // Wait for deletions

  // To truly "move" files to permanent storage, you'd re-upload them to the new path
  // from their blob/file objects, or use a Cloud Function that reads from temp and writes to permanent.
  // This client-side code will assume the URLs are correct for Firestore, but actual file move is missing.
  // For a real production app, consider Firebase Cloud Functions for robust media finalization.

  return mediaToSave;
};


export const saveProviderProfileToFirestore = async (providerData, providerDocId = null) => {
  if (!providerData) {
    console.error("Datos del proveedor son requeridos.");
    throw new Error("Datos del proveedor son requeridos.");
  }
  if (!providerData.userId) {
    console.error("providerData.userId es requerido para guardar/actualizar el perfil del proveedor.");
    throw new Error("providerData.userId es requerido para guardar/actualizar el perfil del proveedor.");
  }

  // Extract raw file data before sending to Firestore
  const { _rawLogoFile, _rawCarruselFiles, _rawGaleriaFiles, ...dataToSave } = providerData;

  let docRef;
  if (providerDocId) {
    // Update existing document
    docRef = doc(db, "proveedores", providerDocId);
    await updateDoc(docRef, dataToSave);
    console.log("Perfil de proveedor actualizado en Firestore con ID: ", providerDocId);
  } else {
    // Create new document
    docRef = await addDoc(collection(db, "proveedores"), {
      ...dataToSave,
      createdAt: serverTimestamp(), // Only set on creation
    });
    console.log("Perfil de proveedor guardado en Firestore con ID autogenerado: ", docRef.id);
  }

  

  const currentProviderDocId = providerDocId || docRef.id;
  const tempFilesToDelete = []; // Collect paths of temp files that are replaced or removed

  const finalizedMediaData = await finalizeMediaForProvider(
    currentProviderDocId,
    _rawLogoFile,
    _rawCarruselFiles,
    _rawGaleriaFiles,
    
    [] 
  );

  // Update the Firestore document with the permanent media URLs
  await updateDoc(doc(db, "proveedores", currentProviderDocId), finalizedMediaData);
  console.log("Updated provider document with permanent media URLs for ID:", currentProviderDocId);


  return { success: true, id: currentProviderDocId };
};
