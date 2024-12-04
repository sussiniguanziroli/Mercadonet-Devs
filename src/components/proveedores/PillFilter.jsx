import React, { useRef } from "react";
import { useFiltersContext } from "../../context/FiltersContext";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

const PillFilter = () => {
    const {
        updateFilters,
        selectedPProductos,
        checkedServices,
        selectedExtras,
        selectedUbicacion,
        selectedMarca,
        selectedCategoria,
    } = useFiltersContext();

    
        const badgesContainerRef = useRef(null);

        const scrollLeft = () => {
            if (badgesContainerRef.current) {
                badgesContainerRef.current.scrollBy({ left: -150, behavior: "smooth" }); // Ajusta el valor de `left` según lo necesario
            }
        };

        const scrollRight = () => {
            if (badgesContainerRef.current) {
                badgesContainerRef.current.scrollBy({ left: 150, behavior: "smooth" });
            }
        };


        // Combinar todos los filtros en un único array para mostrar en los badges
        const combinedFilters = [
            ...(Array.isArray(selectedPProductos)
                ? selectedPProductos.map((filter) => ({ key: "pproductos", label: filter }))
                : []),
            ...(Array.isArray(checkedServices)
                ? checkedServices.map((filter) => ({ key: "servicio", label: filter }))
                : []),
            ...(selectedExtras
                ? [{ key: "extras", label: selectedExtras }]
                : []),
            ...(selectedUbicacion
                ? [{ key: "ubicacion", label: selectedUbicacion }]
                : []),
            ...(selectedMarca ? [{ key: "marca", label: selectedMarca }] : []),
            ...(Array.isArray(selectedCategoria)
                ? selectedCategoria.map((filter) => ({ key: "categoria", label: filter }))
                : []),
        ];

        // Eliminar un filtro específico según su tipo
        const handleRemoveBadge = (key, label) => {
            switch (key) {
                case "pproductos":
                    updateFilters(key, selectedPProductos.filter((item) => item !== label));
                    break;
                case "servicio":
                    updateFilters(key, checkedServices.filter((item) => item !== label));
                    break;
                case "extras":
                    updateFilters(key, '');
                    break;
                case "ubicacion":
                    updateFilters(key, ""); // Limpiar filtro único
                    break;
                case "marca":
                    updateFilters(key, ""); // Limpiar filtro único
                    break;
                case "categoria":
                    updateFilters(key, selectedCategoria.filter((item) => item !== label)); // Limpiar filtro único
                    break;
                default:
                    console.warn("Filtro desconocido:", key);
            }
        };

        const handleResetFilters = () => {
            updateFilters("pproductos", []);
            updateFilters("servicio", []);
            updateFilters("extras", '');
            updateFilters("ubicacion", "");
            updateFilters("marca", "");
            updateFilters("categoria", []);
        };

        return (
            <main className="main-pill-filter">
                <div className="pill-filter-container">
                    <h3>Proveedores de Productos</h3>
                    <div className="pill-filter">
                        <button
                            className={`pill-button ${selectedPProductos.includes("Fabricantes") ? "active" : ""
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
                            className={`pill-button ${selectedPProductos.includes("Distribuidores Oficiales")
                                ? "active"
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
                            className={`pill-button ${selectedPProductos.includes("Mayoristas") ? "active" : ""
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

                {
                    combinedFilters.length > 0
                        ? (
                            <div className="filter-list-badges-container">
                                <button onClick={scrollLeft} className="arrow-btn">
                                    <IoIosArrowBack />
                                </button>
                                <div className="badges-overflow-container">
                                    <div className="filter-list-badges" ref={badgesContainerRef}>
                                        {combinedFilters.map(({ key, label }) => (
                                            <span key={label} className="filter-badge">
                                                {label}
                                                <button
                                                    className="remove-badge-btn"
                                                    onClick={() => handleRemoveBadge(key, label)}
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={scrollRight} className="arrow-btn">
                                    <IoIosArrowForward />
                                </button>
                                <button className="reset-flt-btn" onClick={handleResetFilters}>
                                    Restablecer Filtros
                                </button>
                            </div>
                        ) :
                        <div></div>
                }


            </main>
        );
    };


    export default PillFilter;
