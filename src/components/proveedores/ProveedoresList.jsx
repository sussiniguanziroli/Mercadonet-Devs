import React from 'react'
import Proveedor from './Proveedor'
import { ScaleLoader } from 'react-spinners';

const ProveedoresList = ({ proveedores, filtrosOpciones, setSelectedMarca, setSelectedTipo, setSelectedUbicacion, selectedTipo, selectedMarca, selectedUbicacion }) => {

    console.log('proveedores', proveedores)

    const handleTipoChange = (e) => {
        setSelectedTipo(e.target.value);
    };

    const handleMarcaChange = (e) => {
        setSelectedMarca(e.target.value);
    };

    const handleUbicacionChange = (e) => {
        setSelectedUbicacion(e.target.value);
    };



    return (
        <main className='proveedores-list-container'>
            <div className='filtros-desktop hiddenInMobile'>
                {/* ACA IRIAN ESOS FILTROS DESKTOP */}
                {/* Filtro de Tipo */}
                <div className="filtro-tipos">
                    <div className='tipo-boton'>
                        <h3>Tipos de proveedores</h3>
                        <button onClick={() => setSelectedTipo('')}>Limpiar</button>
                    </div>
                    <ul className='filtro-tipos-checkboxes'>
                        {filtrosOpciones.tipo.map((tipo) => (
                            <li key={tipo}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={tipo}
                                        checked={selectedTipo === tipo}
                                        onChange={handleTipoChange}
                                    />
                                    {tipo}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Filtro de Ubicación */}
                <div className="filtro-ubicacion">
                    <h3>Ubicación</h3>
                    <select
                        value={selectedUbicacion}
                        onChange={handleUbicacionChange}
                    >
                        <option value="">Todo</option>
                        {filtrosOpciones.ubicacion.map((ubicacion) => (
                            <option className='ubicacion-option' key={ubicacion} value={ubicacion}>
                                {ubicacion}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtro de Marca */}
                <div className="filtro-marca">
                    <h3>Marca</h3>
                    <select
                        value={selectedMarca}
                        onChange={handleMarcaChange}
                    >
                        <option value="">Todas</option>
                        {filtrosOpciones.marca.map((marca) => (
                            <option className='marca-option' key={marca} value={marca}>
                                {marca}
                            </option>
                        ))}
                    </select>
                </div>

            </div>
            <div className='proveedores-list'>
                {proveedores.length > 0 ? (


                    proveedores.map((proveedor =>

                        <Proveedor proveedor={proveedor} key={proveedor.id} />

                    ))

                ) : selectedUbicacion || selectedMarca || selectedTipo ? (
                    <div className='no-criteria'>Ningun proveedor coincide con los filtros</div>
                ) : (
                    <div className='loader'>
                        <div className='hiddenInMobile'>
                            <ScaleLoader
                                color="#FF7F00"
                                height={200}
                                margin={7}
                                radius={8}
                                width={30}
                            />
                        </div>
                        <div className='hiddenInDesktop'>
                            <ScaleLoader
                                color="#FF7F00"
                                height={50}
                                margin={2}
                                radius={8}
                                width={7}
                            />
                        </div>
                    </div>
                )}





            </div>



        </main>
    )
}

export default ProveedoresList