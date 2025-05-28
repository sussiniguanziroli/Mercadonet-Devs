// src/services/firestoreService.js
import { doc, getDoc } from "firebase/firestore";
// Asegúrate que la ruta a tu config sea correcta, la ajusté asumiendo una estructura común
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

    // Crear referencias a todos los documentos necesarios
    const docRefs = [
        doc(db, FILTROS_COLLECTION_NAME, CATEGORIAS_DOC_ID),    // Index 0
        doc(db, FILTROS_COLLECTION_NAME, PPRODUCTOS_DOC_ID),   // Index 1
        doc(db, FILTROS_COLLECTION_NAME, UBICACION_DOC_ID),    // Index 2
        doc(db, FILTROS_COLLECTION_NAME, EXTRAS_DOC_ID),       // Index 3
        doc(db, FILTROS_COLLECTION_NAME, SERVICIOS_DOC_ID),    // Index 4
        doc(db, FILTROS_COLLECTION_NAME, MARCAS_DOC_ID),       // Index 5
    ];

    // Objeto inicial para los resultados (importante para devolver algo en caso de error)
    const resultados = {
        categorias: [],
        pproductos: [],
        ubicaciones: [],
        extras: [],
        servicios: [],
        marcas: []
    };

    try {
        // Realizar todas las lecturas en paralelo
        const snapshots = await Promise.all(docRefs.map(ref => getDoc(ref)));
        console.log(`[Service] Se obtuvieron ${snapshots.length} snapshots.`);

        // --- Procesar cada snapshot (el orden se mantiene como en docRefs) ---

        // 1. Categorías (Index 0) - Mapa
        const categoriasDocSnap = snapshots[0];
        if (categoriasDocSnap.exists()) {
            const data = categoriasDocSnap.data();
            if (data[CATEGORIAS_FIELD_NAME] && typeof data[CATEGORIAS_FIELD_NAME] === 'object') {
                const mainCategories = Object.keys(data[CATEGORIAS_FIELD_NAME]);
                mainCategories.sort();
                resultados.categorias = [
                    ...mainCategories,
                    
                ];
                console.log(`[Service] Procesado: Categorías (${resultados.categorias.length})`);
            } else {
                console.warn(`[Service] Campo '${CATEGORIAS_FIELD_NAME}' no encontrado o no es objeto en Doc ID: ${CATEGORIAS_DOC_ID}`);
            }
        } else {
            console.warn(`[Service] No se encontró Documento para Categorías (ID: ${CATEGORIAS_DOC_ID})`);
        }

        // Función auxiliar para procesar los campos de tipo Array de forma segura
        const processArrayField = (snapshot, fieldName, docId) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data[fieldName] && Array.isArray(data[fieldName])) {
                    const stringArray = data[fieldName].filter(item => typeof item === 'string'); // Asegurar que sean strings
                    stringArray.sort(); // Ordenar alfabéticamente
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

        // 2. PProductos (Index 1) - Array
        resultados.pproductos = processArrayField(snapshots[1], PPRODUCTOS_FIELD_NAME, PPRODUCTOS_DOC_ID);

        // 3. Ubicación (Index 2) - Array
        resultados.ubicaciones = processArrayField(snapshots[2], UBICACION_FIELD_NAME, UBICACION_DOC_ID);

        // 4. Extras (Index 3) - Array
        resultados.extras = processArrayField(snapshots[3], EXTRAS_FIELD_NAME, EXTRAS_DOC_ID);

        // 5. Servicios (Index 4) - Array
        resultados.servicios = processArrayField(snapshots[4], SERVICIOS_FIELD_NAME, SERVICIOS_DOC_ID);

        // 6. Marcas (Index 5) - Array
        resultados.marcas = processArrayField(snapshots[5], MARCAS_FIELD_NAME, MARCAS_DOC_ID);

        console.log("[Service] Todos los filtros globales procesados.");
        return resultados; // Devuelve el objeto con todas las listas

    } catch (error) {
        console.error("[Service] Error general al obtener filtros globales desde Firestore:", error);
        // Devuelve el objeto con arrays vacíos en caso de error en Promise.all o similar
        return resultados;
    }
};

// La función fetchCategoriasPrincipales ya no es necesaria si solo usarás fetchFiltrosGlobales
// export const fetchCategoriasPrincipales = async () => { ... };