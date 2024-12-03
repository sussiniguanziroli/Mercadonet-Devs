import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import { db } from "../firebase/config";
import { collection, query, getDocs } from "firebase/firestore";

const FiltersContext = createContext();

export const FiltersProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [proveedores, setProveedores] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState("");
    const [selectedUbicacion, setSelectedUbicacion] = useState("");
    const [checkedServices, setCheckedServices] = useState([]);
    const [selectedExtras, setSelectedExtras] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPProductos, setSelectedPProductos] = useState([]);

    const [filtrosOpciones, setFiltrosOpciones] = useState({
        ubicacion: [],
        categoria: [],
        marca: [],
        servicios: [],
        extras: [],
        pproductos: [],
    });

    // **Obtener proveedores desde Firebase**
    useEffect(() => {
        const obtenerProveedores = async () => {
            try {
                const q = query(collection(db, "proveedores"));
                const snapshot = await getDocs(q);
                const proveedoresFirebase = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProveedores(proveedoresFirebase);
            } catch (error) {
                console.error("Error obteniendo los proveedores: ", error);
            } finally {
                setIsLoading(false); // Ocultar loader una vez finalizado
            }
        };

        obtenerProveedores();
    }, []);

    // **Obtener opciones de filtros desde Firebase**
    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const q = query(collection(db, "filtros"));
                const snapshot = await getDocs(q);

                let ubicacion = [];
                let categoria = [];
                let marca = [];
                let servicios = [];
                let extras = [];
                let pproductos = [];

                snapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    if (data.ubicacion) ubicacion = data.ubicacion;
                    if (data.categoria) categoria = data.categoria;
                    if (data.marca) marca = data.marca;
                    if (data.servicios) servicios = data.servicios;
                    if (data.extras) extras = data.extras;
                    if (data.pproductos) pproductos = data.pproductos;
                });

                setFiltrosOpciones({
                    ubicacion,
                    categoria,
                    marca,
                    servicios,
                    extras,
                    pproductos,
                });
            } catch (error) {
                console.error("Error obteniendo los filtros: ", error);
            }
        };

        fetchFiltros();
    }, []);

    

    // **Filtrar proveedores**
    const proveedoresFiltrados = useMemo(() => {
        return proveedores.filter((proveedor) => {
            const cumpleCategorias =
                !selectedCategoria.length ||
                selectedCategoria.some((categoria) => proveedor.categoria?.includes(categoria));

            const cumpleMarca = !selectedMarca || proveedor.marca?.includes(selectedMarca);
            const cumpleUbicacion = !selectedUbicacion || proveedor.ubicacion === selectedUbicacion;
            const cumpleSearchTerm =
                !searchTerm || proveedor.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

            return cumpleCategorias && cumpleMarca && cumpleUbicacion && cumpleSearchTerm;
        });
    }, [proveedores, searchTerm, selectedMarca, selectedCategoria, selectedUbicacion]);


    // **Centralizar actualizaciones de filtros**
    const updateFilters = (key, value) => {
        switch (key) {
            case "categoria":
                setSelectedCategoria(value);
                break;
            case "marca":
                setSelectedMarca(value);
                break;
            case "ubicacion":
                setSelectedUbicacion(value);
                break;
            case "search":
                setSearchTerm(value);
                break;
            case "extras":
                setSelectedExtras(value);
                break
            case "servicio": 
                setCheckedServices(value);
                break
            case "pproductos":
                setSelectedPProductos(value);
                break
            default:
                console.warn("Filtro desconocido:", key);
        }
    };

    return (
        <FiltersContext.Provider
            value={{
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
                proveedores,
                selectedPProductos
            }}
        >
            {children}
        </FiltersContext.Provider>
    );
};

export const useFiltersContext = () => useContext(FiltersContext);
