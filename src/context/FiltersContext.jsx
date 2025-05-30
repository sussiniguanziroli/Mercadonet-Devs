// src/context/FiltersContext.jsx
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { db } from "../firebase/config"; // Adjust path if needed
import { collection, onSnapshot } from "firebase/firestore"; // onSnapshot for real-time providers
import { fetchFiltrosGlobales } from "../services/firestoreService"; // Import your service

const FiltersContext = createContext();

const transformProviderDataForDisplay = (firestoreDocWithId) => {
    if (!firestoreDocWithId || !firestoreDocWithId.id) return null;

    const id = firestoreDocWithId.id;
    const data = firestoreDocWithId; 

    const ubicacionDetalle = `${data.ciudad || ''}${data.ciudad && data.provincia ? ', ' : ''}${data.provincia || ''}`.trim() || 'Ubicación no especificada';

    let displayCardType = data.cardType; // Original type from Firestore: 'tipoA' or 'tipoB'
    if (data.cardType === 'tipoB') {
        displayCardType = 'cardProductos'; // For frontend logic in Proveedor.jsx
    } else if (data.cardType === 'tipoA') {
        displayCardType = 'cardHistoria'; // For frontend logic
    }

    return {
        id: id,
        nombre: data.nombreProveedor || 'Nombre no disponible',
        
        // --- CORRECTED FILE OBJECT MAPPINGS ---
        logo: data.logo || null, // Pass the entire logo object from Firestore
                                 // It now contains { url: "permanent_https_url", isPermanent: true, ... }
        
        carrusel: data.carrusel || [], // Pass the entire carrusel array of objects from Firestore
                                       // Each item contains { url: "permanent_https_url", ... }

        // For CardTypeB (V2 cards), they will use 'galeria' for their products carousel
        // The 'productos' alias was from an older structure. We'll use 'galeria' directly.
        galeria: data.galeria || [],   // Pass the entire galeria array of objects from Firestore
                                       // Each item contains { url: "permanent_https_url", imagenURL: "permanent_https_url", ... }
        // --- END OF CORRECTED MAPPINGS ---
        
        descripcionGeneral: data.descripcionGeneral || '', // Use the field name from Firestore
        ubicacionDetalle: ubicacionDetalle,
        ciudad: data.ciudad || '', 
        provincia: data.provincia || '', 
        contacto: data.contacto || {},
        
        // Fields for Tags.jsx and specific filters
        // Ensure these field names match what's in your Firestore 'proveedor' documents
        tipoProveedor: data.tipoProveedor || [], 
        serviciosClaveParaTags: data.serviciosClaveParaTags || [], 
        
        marcasConfiguradas: data.marcasConfiguradas || [], 
        extrasConfigurados: data.extrasConfigurados || [], 
        
        tipoRegistro: data.tipoRegistro,
        cardType: displayCardType, // For Proveedor.jsx to choose card component
        originalCardType: data.cardType, // Keep original 'tipoA'/'tipoB' if needed
        categoriaPrincipal: data.categoriaPrincipal || '',
        categoriasAdicionales: data.categoriasAdicionales || [],

        // Pass other relevant fields directly
        planSeleccionado: data.planSeleccionado,
        estadoCuenta: data.estadoCuenta,
        // Ensure all fields needed by Tags or other parts of the card are included
    };
};

export const FiltersProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [allProveedores, setAllProveedores] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState("");
    const [selectedUbicacion, setSelectedUbicacion] = useState("");
    const [checkedServices, setCheckedServices] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState("");
    const [isLoadingProviders, setIsLoadingProviders] = useState(true);
    const [isLoadingFilterOptions, setIsLoadingFilterOptions] = useState(true);
    const [selectedPProductos, setSelectedPProductos] = useState([]);

    const [filtrosOpciones, setFiltrosOpciones] = useState({
        ubicaciones: [], 
        categorias: [],  
        marcas: [],      
        servicios: [],   
        extras: [],      
        pproductos: [],  
    });

    useEffect(() => {
        const loadFilterOptions = async () => {
            setIsLoadingFilterOptions(true);
            try {
                const options = await fetchFiltrosGlobales(); //
                setFiltrosOpciones({
                    ubicaciones: options.ubicaciones || [],
                    categorias: options.categorias || [],
                    marcas: options.marcas || [],
                    servicios: options.servicios || [],
                    extras: options.extras || [],
                    pproductos: options.pproductos || [],
                });
            } catch (error) {
                console.error("Error fetching global filter options:", error);
                setFiltrosOpciones({ ubicaciones: [], categorias: [], marcas: [], servicios: [], extras: [], pproductos: [] });
            }
            setIsLoadingFilterOptions(false);
        };
        loadFilterOptions();
    }, []);

    useEffect(() => {
        setIsLoadingProviders(true);
        const proveedoresColRef = collection(db, "proveedores");
        const unsubscribeProveedores = onSnapshot(proveedoresColRef, (querySnapshot) => {
            const fetchedProveedoresRaw = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const transformedData = fetchedProveedoresRaw.map(transformProviderDataForDisplay).filter(p => p !== null);
            setAllProveedores(transformedData);
            setIsLoadingProviders(false);
        }, (error) => {
            console.error("Error obteniendo los proveedores: ", error);
            setIsLoadingProviders(false);
        });
        return () => unsubscribeProveedores();
    }, []);
    
    const proveedoresFiltrados = useMemo(() => {
        return allProveedores.filter((proveedor) => {
            if (!proveedor) return false;

            const cumpleSearchTerm =
                !searchTerm || (proveedor.nombre && proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

            const proveedorCategoriasDirectas = [proveedor.categoriaPrincipal, ...(proveedor.categoriasAdicionales || [])].filter(Boolean);
            const cumpleCategorias =
                !selectedCategoria.length ||
                selectedCategoria.some(catFiltro => proveedorCategoriasDirectas.includes(catFiltro));
            
            // proveedor.marcasConfiguradas should be used here as per transformProviderDataForDisplay
            const cumpleMarca = !selectedMarca || (proveedor.marcasConfiguradas && proveedor.marcasConfiguradas.includes(selectedMarca));
            
            const cumpleUbicacion = !selectedUbicacion || proveedor.provincia === selectedUbicacion;

            // proveedor.tipoProveedor should be used here
            const cumplePProductos =
                !selectedPProductos.length ||
                selectedPProductos.every(pproductoFiltro => proveedor.tipoProveedor?.includes(pproductoFiltro));

            // proveedor.serviciosClaveParaTags should be used here
            const cumpleServicios = 
                !checkedServices.length ||
                checkedServices.every(servicioFiltro => proveedor.serviciosClaveParaTags?.includes(servicioFiltro));

            // proveedor.extrasConfigurados should be used here
            const cumpleExtras = 
                !selectedExtras || 
                (proveedor.extrasConfigurados && proveedor.extrasConfigurados.includes(selectedExtras));

            return cumpleCategorias && cumpleMarca && cumpleUbicacion && cumpleSearchTerm && cumplePProductos && cumpleServicios && cumpleExtras;
        });
    }, [allProveedores, searchTerm, selectedCategoria, selectedMarca, selectedUbicacion, selectedPProductos, checkedServices, selectedExtras]);

    const updateFilters = useCallback((key, value) => {
        switch (key) {
            case "categoria": setSelectedCategoria(value); break;
            case "marca": setSelectedMarca(value); break;
            case "ubicacion": setSelectedUbicacion(value); break;
            case "search": setSearchTerm(value); break;
            case "extras": setSelectedExtras(value); break;
            case "servicio": setCheckedServices(value); break;
            case "pproductos": setSelectedPProductos(value); break;
            default: console.warn("Filtro desconocido:", key);
        }
    }, []); 

    const isLoading = isLoadingProviders || isLoadingFilterOptions;

    const contextValue = useMemo(() => ({
        searchTerm,
        proveedoresFiltrados,
        filtrosOpciones, 
        updateFilters,
        selectedCategoria,
        selectedUbicacion,
        selectedMarca,
        checkedServices,
        selectedExtras,
        isLoading,
        allProveedores, 
        selectedPProductos
    }), [
        searchTerm, proveedoresFiltrados, filtrosOpciones, updateFilters,
        selectedCategoria, selectedUbicacion, selectedMarca, checkedServices,
        selectedExtras, isLoading, allProveedores, selectedPProductos
    ]);

    return (
        <FiltersContext.Provider value={contextValue}>
            {children}
        </FiltersContext.Provider>
    );
};

export const useFiltersContext = () => useContext(FiltersContext);