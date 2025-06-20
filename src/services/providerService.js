import { db, storage } from '../firebase/config';
import { collection, doc, serverTimestamp, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";

const PERMANENT_STORAGE_BASE_PATH = 'proveedores_media';

export const prepareProviderDataForFirestore = (formData, userId) => {
  const isRegistrationFlow = !!formData.datosGenerales;

  const sourceData = isRegistrationFlow ? formData.datosGenerales : formData;
  const cardType = isRegistrationFlow ? formData.tipoCard : formData.cardType;
  const personalizadosSource = isRegistrationFlow ? formData.datosPersonalizados?.[cardType] : formData;

  const providerData = {
    userId: userId,
    nombreProveedor: sourceData.nombreProveedor || '',
    tipoRegistro: sourceData.tipoRegistro || '',
    tipoProveedor: sourceData.tipoProveedor || [],
    categoriaPrincipal: sourceData.categoriaPrincipal || '',
    categoriasAdicionales: sourceData.categoriasAdicionales || [],
    pais: sourceData.pais || 'Argentina',
    provincia: sourceData.provincia || '',
    ciudad: sourceData.ciudad || '',
    nombreContactoPersona: sourceData.nombre || sourceData.nombreContactoPersona || '',
    apellidoContactoPersona: sourceData.apellido || sourceData.apellidoContactoPersona || '',
    rolContactoPersona: sourceData.rol || sourceData.rolContactoPersona || '',
    cuit: sourceData.cuit || '',
    antiguedad: sourceData.antiguedad ? Number(sourceData.antiguedad) : null,
    facturacion: sourceData.facturacion ? Number(sourceData.facturacion) : null,
    marcasOficiales: sourceData.marcasOficiales || [],
    serviciosClaveParaTags: sourceData.serviciosClaveParaTags || [],
    cardType: cardType,
    planSeleccionado: sourceData.planSeleccionado || null,
    
    descripcionGeneral: personalizadosSource?.descripcion || '',
    contacto: {
      email: personalizadosSource?.email || '',
      sitioWeb: personalizadosSource?.sitioWeb || '',
      whatsapp: personalizadosSource?.whatsapp || '',
      telefono: personalizadosSource?.telefono || '',
    },
    marcasConfiguradas: personalizadosSource?.marcasSeleccionadas || [],
    extrasConfigurados: personalizadosSource?.extrasSeleccionados || [],

    logo: personalizadosSource?.logoFile || personalizadosSource?.logo || null,
    carrusel: personalizadosSource?.carruselMediaItems || personalizadosSource?.carruselURLs || [],
    galeria: (personalizadosSource?.galeria || []).map(g => {
        if (!g) return null;
        const hasImage = g.imagenFile;
        const baseItem = hasImage ? g.imagenFile : g;
        return {
            ...baseItem,
            titulo: g.titulo,
            precio: g.precio,
        };
    }).filter(Boolean),
  };
  
  return providerData;
};


export const saveProviderProfileToFirestore = async (providerData, providerDocId = null) => {
  if (!providerData || !providerData.userId) {
    throw new Error("Provider data or userId is required.");
  }
  
  let dataToSave = { ...providerData };
  Object.keys(dataToSave).forEach(key => {
      if (dataToSave[key] === undefined) delete dataToSave[key];
  });

  if (providerDocId) {
    const docRef = doc(db, "proveedores", providerDocId);
    
    await updateDoc(docRef, { 
      ...dataToSave, 
      fileProcessingStatus: 'pending_update_move', 
      updatedAt: serverTimestamp() 
    });
    
    return { success: true, id: providerDocId };

  } else {
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