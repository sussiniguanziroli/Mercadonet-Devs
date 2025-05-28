// src/context/FiltersContext.jsx
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { db } from "../firebase/config"; // Adjust path if needed
import { collection, onSnapshot } from "firebase/firestore"; // onSnapshot for real-time providers
import { fetchFiltrosGlobales } from "../services/firestoreService"; // Import your service

const FiltersContext = createContext();

// This function transforms a single provider document from Firestore 
// to the structure expected by your card components.
const transformProviderDataForDisplay = (firestoreDocWithId) => {
    if (!firestoreDocWithId || !firestoreDocWithId.id) return null;

    const id = firestoreDocWithId.id;
    // Assuming firestoreDocWithId contains the spread data already
    const data = firestoreDocWithId; 

    const ubicacionDetalle = `${data.ciudad || ''}${data.ciudad && data.provincia ? ', ' : ''}${data.provincia || ''}`.trim() || 'Ubicación no especificada';

    let displayCardType = data.cardType; 
    if (data.cardType === 'tipoB') {
        displayCardType = 'cardProductos';
    } else if (data.cardType === 'tipoA') {
        displayCardType = 'cardHistoria';
    }

    return {
        id: id,
        nombre: data.nombreProveedor || 'Nombre no disponible',
        logo: data.logoUrl || '',
        descripcion: data.descripcionGeneral || '', // Mapped from descripcionGeneral
        ubicacionDetalle: ubicacionDetalle,
        ciudad: data.ciudad || '', 
        provincia: data.provincia || '', 
        contacto: data.contacto || {},
        carrusel: data.carruselUrls || [], // Unified carousel data
        
        // For Tags.jsx and specific filters
        tipo: data.tipoProveedor || [], 
        servicios: data.serviciosClaveParaTags || [], 
        
        // For textual display in cards & marca filter
        marca: data.marcasConfiguradas || [], 
        
        // For textual display & extras filter
        extras: data.extrasConfigurados || [], 
        
        // For ProductsCarousel
        productos: data.galeriaProductos || [],
        
        tipoRegistro: data.tipoRegistro,
        cardType: displayCardType,
        categoriaPrincipal: data.categoriaPrincipal || '',
        categoriasAdicionales: data.categoriasAdicionales || [],
    };
};

export const FiltersProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [allProveedores, setAllProveedores] = useState([]); // Stores transformed providers
    const [selectedCategoria, setSelectedCategoria] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState("");
    const [selectedUbicacion, setSelectedUbicacion] = useState("");
    const [checkedServices, setCheckedServices] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState("");
    const [isLoadingProviders, setIsLoadingProviders] = useState(true);
    const [isLoadingFilterOptions, setIsLoadingFilterOptions] = useState(true); // Separate loading for options
    const [selectedPProductos, setSelectedPProductos] = useState([]);

    const [filtrosOpciones, setFiltrosOpciones] = useState({
        ubicaciones: [], // From fetchFiltrosGlobales
        categorias: [],  // From fetchFiltrosGlobales
        marcas: [],      // From fetchFiltrosGlobales (note: plural 'marcas' vs 'marca' for selected)
        servicios: [],   // From fetchFiltrosGlobales
        extras: [],      // From fetchFiltrosGlobales
        pproductos: [],  // From fetchFiltrosGlobales
    });

    // Fetch All Static Filter Options using your firestoreService
    useEffect(() => {
        const loadFilterOptions = async () => {
            setIsLoadingFilterOptions(true);
            try {
                const options = await fetchFiltrosGlobales();
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
                // Set empty arrays on error to prevent crashes in filter components
                setFiltrosOpciones({ ubicaciones: [], categorias: [], marcas: [], servicios: [], extras: [], pproductos: [] });
            }
            setIsLoadingFilterOptions(false);
        };
        loadFilterOptions();
    }, []);

    // Fetch Providers and transform them
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
            
            const cumpleMarca = !selectedMarca || (proveedor.marca && proveedor.marca.includes(selectedMarca));
            
            const cumpleUbicacion = !selectedUbicacion || proveedor.provincia === selectedUbicacion;

            const cumplePProductos =
                !selectedPProductos.length ||
                selectedPProductos.every(pproductoFiltro => proveedor.tipo?.includes(pproductoFiltro));

            const cumpleServicios = 
                !checkedServices.length ||
                checkedServices.every(servicioFiltro => proveedor.servicios?.includes(servicioFiltro));

            const cumpleExtras = 
                !selectedExtras || 
                (proveedor.extras && proveedor.extras.includes(selectedExtras));

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

    // Combined loading state for the context consumer
    const isLoading = isLoadingProviders || isLoadingFilterOptions;

    const contextValue = useMemo(() => ({
        searchTerm,
        proveedoresFiltrados,
        filtrosOpciones, // This now comes entirely from fetchFiltrosGlobales
        updateFilters,
        selectedCategoria,
        selectedUbicacion,
        selectedMarca,
        checkedServices,
        selectedExtras,
        isLoading,
        allProveedores, // Pass all (transformed) providers
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