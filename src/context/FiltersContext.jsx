import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { fetchFiltrosGlobales } from "../services/firestoreService";

const FiltersContext = createContext();

const transformProviderDataForDisplay = (firestoreDocWithId) => {
    if (!firestoreDocWithId || !firestoreDocWithId.id) return null;

    const id = firestoreDocWithId.id;
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
        logo: data.logo || null,
        carrusel: data.carrusel || [],
        galeria: data.galeria || [],
        descripcionGeneral: data.descripcionGeneral || '',
        ubicacionDetalle: ubicacionDetalle,
        ciudad: data.ciudad || '', 
        provincia: data.provincia || '', 
        contacto: data.contacto || {},
        tipoProveedor: data.tipoProveedor || [], 
        serviciosClaveParaTags: data.serviciosClaveParaTags || [], 
        marcasConfiguradas: data.marcasConfiguradas || [], 
        extrasConfigurados: data.extrasConfigurados || [], 
        tipoRegistro: data.tipoRegistro,
        cardType: displayCardType,
        originalCardType: data.cardType,
        categoriaPrincipal: data.categoriaPrincipal || '',
        categoriasAdicionales: data.categoriasAdicionales || [],
        planSeleccionado: data.planSeleccionado,
        estadoCuenta: data.estadoCuenta,
    };
};

const checkProviderAgainstSearchTerm = (proveedor, term) => {
    if (!term) return true;
    const lowerCaseTerm = term.toLowerCase();

    const fieldsToSearch = [
        proveedor.nombre,
        proveedor.categoriaPrincipal,
        proveedor.ciudad,
        proveedor.provincia,
        ...(proveedor.categoriasAdicionales || []),
        ...(Array.isArray(proveedor.tipoProveedor) ? proveedor.tipoProveedor : (typeof proveedor.tipoProveedor === 'string' ? [proveedor.tipoProveedor] : [])),
        ...(proveedor.serviciosClaveParaTags || []),
        ...(proveedor.marcasConfiguradas || [])
    ];

    for (const fieldValue of fieldsToSearch) {
        if (fieldValue && typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(lowerCaseTerm)) {
            return true;
        }
    }
    return false;
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
            setIsLoadingProviders(false);
        });
        return () => unsubscribeProveedores();
    }, []);
    
    const proveedoresFiltrados = useMemo(() => {
        return allProveedores.filter((proveedor) => {
            if (!proveedor) return false;

            const cumpleSearchTerm = checkProviderAgainstSearchTerm(proveedor, searchTerm);

            const proveedorCategoriasDirectas = [proveedor.categoriaPrincipal, ...(proveedor.categoriasAdicionales || [])].filter(Boolean);
            const cumpleCategorias =
                !selectedCategoria.length ||
                selectedCategoria.some(catFiltro => proveedorCategoriasDirectas.includes(catFiltro));
            
            const cumpleMarca = !selectedMarca || (proveedor.marcasConfiguradas && proveedor.marcasConfiguradas.includes(selectedMarca));
            
            const cumpleUbicacion = !selectedUbicacion || proveedor.provincia === selectedUbicacion;

            const proveedorTipo = Array.isArray(proveedor.tipoProveedor) ? proveedor.tipoProveedor : (typeof proveedor.tipoProveedor === 'string' ? [proveedor.tipoProveedor] : []);
            const cumplePProductos =
                !selectedPProductos.length ||
                selectedPProductos.every(pproductoFiltro => proveedorTipo.includes(pproductoFiltro));

            const cumpleServicios = 
                !checkedServices.length ||
                (Array.isArray(proveedor.serviciosClaveParaTags) && checkedServices.every(servicioFiltro => proveedor.serviciosClaveParaTags.includes(servicioFiltro)));

            const cumpleExtras = 
                !selectedExtras || 
                (proveedor.extrasConfigurados && proveedor.extrasConfigurados.includes(selectedExtras));

            return cumpleSearchTerm && cumpleCategorias && cumpleMarca && cumpleUbicacion && cumplePProductos && cumpleServicios && cumpleExtras;
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
            default: break;
        }
    }, []); 

    const isLoading = isLoadingProviders || isLoadingFilterOptions;

    const contextValue = useMemo(() => ({
        searchTerm,
        allProveedores,
        proveedoresFiltrados,
        filtrosOpciones, 
        updateFilters,
        selectedCategoria,
        selectedUbicacion,
        selectedMarca,
        checkedServices,
        selectedExtras,
        isLoading,
        selectedPProductos
    }), [
        searchTerm, allProveedores, proveedoresFiltrados, filtrosOpciones, updateFilters,
        selectedCategoria, selectedUbicacion, selectedMarca, checkedServices,
        selectedExtras, isLoading, selectedPProductos
    ]);

    return (
        <FiltersContext.Provider value={contextValue}>
            {children}
        </FiltersContext.Provider>
    );
};

export const useFiltersContext = () => useContext(FiltersContext);