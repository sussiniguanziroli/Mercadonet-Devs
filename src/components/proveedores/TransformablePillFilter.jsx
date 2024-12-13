import React, { useState, useEffect } from "react";
import { useFiltersContext } from "../../context/FiltersContext";

const TransformablePillFilter = () => {
    const {
        updateFilters,
        selectedPProductos,
        checkedServices,
        selectedExtras,
        selectedUbicacion,
        selectedMarca,
        proveedores,
        selectedCategoria,
    } = useFiltersContext();
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            setIsSticky(scrollTop > 200); // Cambia el valor si necesitas otro umbral
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            className={`transformable-pill-filter-container ${isSticky ? "is-sticky" : ""
                }`}
        >
            <div className="transformable-pill-filter">
                <button
                    className={`transformable-pill-button ${selectedPProductos.includes("Fabricantes") ? "is-active" : ""
                        }`}
                    onClick={() =>
                        updateFilters(
                            "pproductos",
                            selectedPProductos.includes("Fabricantes")
                                ? selectedPProductos.filter((item) => item !== "Fabricantes")
                                : [...selectedPProductos, "Fabricantes"]
                        )
                    }
                >
                    Fabricantes
                </button>
                <button
                    className={`transformable-pill-button ${selectedPProductos.includes("Distribuidores Oficiales")
                            ? "is-active"
                            : ""
                        }`}
                    onClick={() =>
                        updateFilters(
                            "pproductos",
                            selectedPProductos.includes("Distribuidores Oficiales")
                                ? selectedPProductos.filter(
                                    (item) => item !== "Distribuidores Oficiales"
                                )
                                : [...selectedPProductos, "Distribuidores Oficiales"]
                        )
                    }
                >
                    Distribuidores Oficiales
                </button>
                <button
                    className={`transformable-pill-button ${selectedPProductos.includes("Mayoristas") ? "is-active" : ""
                        }`}
                    onClick={() =>
                        updateFilters(
                            "pproductos",
                            selectedPProductos.includes("Mayoristas")
                                ? selectedPProductos.filter((item) => item !== "Mayoristas")
                                : [...selectedPProductos, "Mayoristas"]
                        )
                    }
                >
                    Mayoristas
                </button>
            </div>
        </div>
    );
};

export default TransformablePillFilter;
