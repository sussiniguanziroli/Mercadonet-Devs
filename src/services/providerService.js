// src/services/providerService.js
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const prepareProviderDataForFirestore = (formData, userId) => {
  const {
    datosGenerales,
    tipoCard,
    datosPersonalizados,
    planSeleccionado
  } = formData;

  const cardSpecificData = datosPersonalizados[tipoCard] || {};
  
  const cleanTempIdFromFileObjects = (fileArray) => {
    return (fileArray || []).map(item => {
      if (typeof item !== 'object' || item === null) return item;
      const { tempId, status, ...restOfItem } = item; // also removing status if it's client-side only
      return restOfItem;
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

    cardType: tipoCard,

    logo: cardSpecificData.logo 
      ? { 
          url: cardSpecificData.logo.url || '', 
          tempStoragePath: cardSpecificData.logo.tempPath || '',
          permanentStoragePath: '',
          isPermanent: false
        } 
      : null,
    
    carrusel: cleanTempIdFromFileObjects(cardSpecificData.carruselURLs).map(item => ({
        url: item.url || '',
        tempStoragePath: item.tempPath || '',
        fileType: item.fileType || '',
        mimeType: item.mimeType || '',
        permanentStoragePath: '',
        isPermanent: false
    })),

    descripcionGeneral: cardSpecificData.descripcion || '',
    contacto: {
      email: cardSpecificData.email || '',
      sitioWeb: cardSpecificData.sitioWeb || '',
      whatsapp: cardSpecificData.whatsapp || '',
      telefono: cardSpecificData.telefono || ''
    },
    
    marcasConfiguradas: cardSpecificData.marca || cardSpecificData.marcas || [],
    extrasConfigurados: cardSpecificData.extras || cardSpecificData.servicios || [],

    planSeleccionado: planSeleccionado || null,

    fileProcessingStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    estadoCuenta: "pendienteRevision"
  };

  if (tipoCard === 'tipoB') {
    providerData.galeria = cleanTempIdFromFileObjects(cardSpecificData.galeria).map(item => ({
        titulo: item.titulo || '',
        precio: item.precio || '',
        imagenURL: item.imagenURL || item.url || '', // Use imagenURL or url
        url: item.url || item.imagenURL || '', // Ensure consistency
        tempStoragePath: item.tempPath || '',
        fileType: item.fileType || '',
        mimeType: item.mimeType || '',
        permanentStoragePath: '',
        isPermanent: false
    }));
  } else {
    delete providerData.galeria;
  }
  
  return providerData;
};

export const saveProviderProfileToFirestore = async (userId, providerData) => {
  if (!userId) {
    console.error("User ID es requerido para guardar el perfil del proveedor.");
    throw new Error("User ID es requerido para guardar el perfil del proveedor.");
  }
  if (!providerData) {
    console.error("Datos del proveedor son requeridos.");
    throw new Error("Datos del proveedor son requeridos.");
  }

  try {
    const providerDocRef = doc(db, "proveedores", userId);
    await setDoc(providerDocRef, providerData, { merge: true }); 
    console.log("Perfil de proveedor guardado/actualizado en Firestore con ID: ", userId);
    return { success: true, id: userId };
  } catch (error) {
    console.error("Error guardando perfil de proveedor en Firestore: ", error);
    throw error; 
  }
};