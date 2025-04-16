// src/services/firestoreService.js
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/config.js'; // <-- ¡Asegúrate que la ruta a tu config sea correcta!

// ID del documento y nombre de la colección según tu captura
const CATEGORIAS_DOC_ID = "aksjeiX4pQZXtU1OKgyI";
const FILTROS_COLLECTION_NAME = "filtros";

/**
 * Obtiene la lista de categorías principales desde Firestore.
 * Extrae las claves del mapa 'categorias' del documento específico en la colección 'filtros'.
 * Añade categorías manuales al final.
 * @returns {Promise<string[]>} Una promesa que resuelve a un array de strings con los nombres de las categorías. Devuelve un array vacío en caso de error.
 */
export const fetchCategoriasPrincipales = async () => {
    console.log(`[Service] Intentando obtener categorías desde ${FILTROS_COLLECTION_NAME}/${CATEGORIAS_DOC_ID}...`);
    const docRef = doc(db, FILTROS_COLLECTION_NAME, CATEGORIAS_DOC_ID);

    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("[Service] Documento de filtros encontrado.");
            const data = docSnap.data();

            if (data.categorias && typeof data.categorias === 'object') {
                const mainCategories = Object.keys(data.categorias);
                mainCategories.sort(); // Ordenar alfabéticamente

                // Añadir manualmente las categorías especiales si es necesario
                const finalCategoryList = [
                    ...mainCategories,
                    "Crea tu propia marca",
                    "Nueva Categoria"
                ];

                console.log("[Service] Categorías principales procesadas:", finalCategoryList);
                return finalCategoryList; // Devuelve la lista exitosamente
            } else {
                console.error("[Service] El documento existe pero falta el campo 'categorias' o no es un objeto.");
                return []; // Devuelve vacío si el formato es incorrecto
            }
        } else {
            console.error(`[Service] No se encontró el documento con ID ${CATEGORIAS_DOC_ID}`);
            return []; // Devuelve vacío si el documento no existe
        }
    } catch (error) {
        console.error("[Service] Error al obtener categorías desde Firestore:", error);
        // En lugar de lanzar el error, devolvemos un array vacío.
        // El componente que llama manejará el estado de error si es necesario.
        return []; // Devuelve vacío en caso de error de conexión/lectura
    }
};

// --- Podrías añadir aquí otras funciones de servicio para Firestore ---
// export const otraFuncionFirestore = async () => { ... };