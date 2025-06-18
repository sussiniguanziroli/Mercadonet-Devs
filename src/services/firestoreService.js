// src/services/firestoreService.js
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore"; // Import onSnapshot
import { db } from '../firebase/config';

// --- Definiciones de Filtros ---
const FILTROS_COLLECTION_NAME = "filtros";

// 1. Categorías (Mapa)
const CATEGORIAS_DOC_ID = "VZThZs2CU982Okg62ehm";
const CATEGORIAS_FIELD_NAME = "categorias"; // Campo es un Mapa/Objeto

// 2. PProductos (Array)
const PPRODUCTOS_DOC_ID = "4HxfJnKzceGKJ52xk99C";
const PPRODUCTOS_FIELD_NAME = "pproductos"; // Campo es un Array

// 3. Ubicación (Provincias) (Array)
const UBICACION_DOC_ID = "BIrx8fwltPjI1SUblNCa";
const UBICACION_FIELD_NAME = "ubicacion"; // Campo es un Array

// 4. Extras (Array)
const EXTRAS_DOC_ID = "FXcoATymfqELMl9bdJpa";
const EXTRAS_FIELD_NAME = "extras"; // Campo es un Array

// 5. Servicios (Array)
const SERVICIOS_DOC_ID = "VeT6KON7y2f6THN4wv6t";
const SERVICIOS_FIELD_NAME = "servicios"; // Campo es un Array

// 6. Marca (Array)
const MARCAS_DOC_ID = "uvs44BL6bVHKFXTgmIXv";
const MARCAS_FIELD_NAME = "marca"; // Campo es un Array

/**
 * Obtiene todos los datos de filtros globales necesarios para los formularios.
 * Lee los documentos específicos de la colección 'filtros' y extrae las listas/mapas.
 * @returns {Promise<object>} Una promesa que resuelve a un objeto con todas las listas:
 * {
 * categorias: string[],
 * pproductos: string[],
 * ubicaciones: string[],
 * extras: string[],
 * servicios: string[],
 * marcas: string[]
 * }
 * Devuelve un objeto con arrays vacíos si hay errores o faltan datos.
 */
export const fetchFiltrosGlobales = async () => {
    console.log(`[Service] Iniciando carga de todos los filtros desde '${FILTROS_COLLECTION_NAME}'...`);

    const docRefs = [
        doc(db, FILTROS_COLLECTION_NAME, CATEGORIAS_DOC_ID),
        doc(db, FILTROS_COLLECTION_NAME, PPRODUCTOS_DOC_ID),
        doc(db, FILTROS_COLLECTION_NAME, UBICACION_DOC_ID),
        doc(db, FILTROS_COLLECTION_NAME, EXTRAS_DOC_ID),
        doc(db, FILTROS_COLLECTION_NAME, SERVICIOS_DOC_ID),
        doc(db, FILTROS_COLLECTION_NAME, MARCAS_DOC_ID),
    ];

    const resultados = {
        categorias: [], pproductos: [], ubicaciones: [], extras: [], servicios: [], marcas: []
    };

    try {
        const snapshots = await Promise.all(docRefs.map(ref => getDoc(ref)));
        console.log(`[Service] Se obtuvieron ${snapshots.length} snapshots.`);

        const categoriasDocSnap = snapshots[0];
        if (categoriasDocSnap.exists()) {
            const data = categoriasDocSnap.data();
            if (data[CATEGORIAS_FIELD_NAME] && typeof data[CATEGORIAS_FIELD_NAME] === 'object') {
                const mainCategories = Object.keys(data[CATEGORIAS_FIELD_NAME]);
                mainCategories.sort();
                resultados.categorias = [...mainCategories];
                console.log(`[Service] Procesado: Categorías (${resultados.categorias.length})`);
            } else {
                console.warn(`[Service] Campo '${CATEGORIAS_FIELD_NAME}' no encontrado o no es objeto en Doc ID: ${CATEGORIAS_DOC_ID}`);
            }
        } else {
            console.warn(`[Service] No se encontró Documento para Categorías (ID: ${CATEGORIAS_DOC_ID})`);
        }

        const processArrayField = (snapshot, fieldName, docId) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data[fieldName] && Array.isArray(data[fieldName])) {
                    const stringArray = data[fieldName].filter(item => typeof item === 'string');
                    console.log(`[Service] Procesado: ${fieldName} (${stringArray.length})`);
                    return stringArray;
                } else {
                    console.warn(`[Service] Campo '${fieldName}' no encontrado o no es array en Doc ID: ${docId}`);
                    return [];
                }
            } else {
                console.warn(`[Service] No se encontró Documento para ${fieldName} (ID: ${docId})`);
                return [];
            }
        };

        resultados.pproductos = processArrayField(snapshots[1], PPRODUCTOS_FIELD_NAME, PPRODUCTOS_DOC_ID);
        resultados.ubicaciones = processArrayField(snapshots[2], UBICACION_FIELD_NAME, UBICACION_DOC_ID);
        resultados.extras = processArrayField(snapshots[3], EXTRAS_FIELD_NAME, EXTRAS_DOC_ID);
        resultados.servicios = processArrayField(snapshots[4], SERVICIOS_FIELD_NAME, SERVICIOS_DOC_ID);
        resultados.marcas = processArrayField(snapshots[5], MARCAS_FIELD_NAME, MARCAS_DOC_ID);

        console.log("[Service] Todos los filtros globales procesados.");
        return resultados;

    } catch (error) {
        console.error("[Service] Error general al obtener filtros globales desde Firestore:", error);
        return resultados;
    }
};

/**
 * Fetches ALL provider documents from Firestore associated with a specific user ID.
 * @param {string} userId The UID of the authenticated user.
 * @returns {Promise<Array<{id: string, data: object}>>} A promise that resolves to an array of objects,
 * each containing a provider's document ID and data. Returns an empty array if none found or on error.
 */
export const fetchProvidersByUserId = async (userId) => {
  if (!userId) {
    console.error("fetchProvidersByUserId: userId is required.");
    return [];
  }

  try {
    const q = query(collection(db, "proveedores"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q); // Use getDocs for a one-time fetch

    if (!querySnapshot.empty) {
      const providers = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        data: docSnap.data()
      }));
      console.log(`[Service] ${providers.length} provider(s) found for user ${userId}.`);
      return providers;
    } else {
      console.log(`[Service] No providers found for user ${userId}.`);
      return [];
    }
  } catch (error) {
    console.error(`[Service] Error fetching providers for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetches a single provider document from Firestore by its document ID.
 * @param {string} providerId The document ID of the provider.
 * @returns {Promise<{id: string, data: object}|null>} A promise that resolves to an object
 * containing the provider's document ID and data, or null if not found.
 */
export const fetchProviderById = async (providerId) => {
  if (!providerId) {
    console.error("fetchProviderById: providerId is required.");
    return null;
  }

  try {
    const docRef = doc(db, "proveedores", providerId);
    const docSnap = await getDoc(docRef); // Use getDoc for a one-time fetch

    if (docSnap.exists()) {
      console.log(`[Service] Provider found with ID: ${docSnap.id}`);
      return { id: docSnap.id, data: docSnap.data() };
    } else {
      console.log(`[Service] No provider found with ID: ${providerId}.`);
      return null;
    }
  } catch (error) {
    console.error(`[Service] Error fetching provider by ID ${providerId}:`, error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for a single provider document.
 * @param {string} providerId The document ID of the provider.
 * @param {function} callback A callback function (providerData, providerId) => void
 * that is called with the current data.
 * @param {function} onErrorCallback An optional callback (error) => void for listener errors.
 * @returns {function} An unsubscribe function to stop listening.
 */
export const listenToProviderById = (providerId, callback, onErrorCallback = (error) => console.error("Listener error:", error)) => {
    if (!providerId) {
        console.warn("listenToProviderById: providerId is required for listener.");
        return () => {}; // Return a no-op unsubscribe
    }

    const docRef = doc(db, "proveedores", providerId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, data: docSnap.data() });
        } else {
            callback(null); // Provider document no longer exists
        }
    }, (error) => {
        onErrorCallback(error);
    });

    return unsubscribe;
};

// The fetchCategoriasPrincipales function is commented out as it's not being used.
// export const fetchCategoriasPrincipales = async () => { ... };
