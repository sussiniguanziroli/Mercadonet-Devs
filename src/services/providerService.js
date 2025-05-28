// src/services/providerService.js
import { db } from '../firebase/config'; // Adjust path to your Firebase config
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const prepareProviderDataForFirestore = (formData, userId) => {
  const {
    datosGenerales,
    tipoCard, // This will be 'tipoA' or 'tipoB'
    datosPersonalizados,
    planSeleccionado
  } = formData;

  const cardSpecificData = datosPersonalizados[tipoCard] || {};
  
  const cleanTempIdFromFileObjects = (fileArray) => 
    (fileArray || []).map(item => {
      if (typeof item !== 'object' || item === null) return item; // Handle cases where item might not be an object
      const { tempId, ...restOfItem } = item;
      return restOfItem;
    });

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

    logoUrl: cardSpecificData.logoURL || '', 
    carruselUrls: cleanTempIdFromFileObjects(cardSpecificData.carruselURLs),
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

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    estadoCuenta: "pendienteRevision"
  };

  if (tipoCard === 'tipoB' && cardSpecificData.galeria) {
    providerData.galeriaProductos = cleanTempIdFromFileObjects(cardSpecificData.galeria);
  } else if (tipoCard === 'tipoB') {
    providerData.galeriaProductos = [];
  }
  
  if (providerData.cardType !== 'tipoB') {
    delete providerData.galeriaProductos;
  }

  return providerData;
};

// ADD THIS FUNCTION:
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
    // Using setDoc with { merge: true } will create the document if it doesn't exist,
    // or update it if it does. This is useful if a user might partially complete
    // and then come back to update/complete their provider profile.
    // If you want to strictly create only, you can remove { merge: true }
    // but then you might need to handle cases where the doc already exists differently.
    await setDoc(providerDocRef, providerData, { merge: true }); 
    console.log("Perfil de proveedor guardado/actualizado en Firestore con ID: ", userId);
    return { success: true, id: userId };
  } catch (error) {
    console.error("Error guardando perfil de proveedor en Firestore: ", error);
    throw error; // Re-throw error to be caught by the calling function in the component
  }
};