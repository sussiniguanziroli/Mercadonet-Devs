import React, { useState } from 'react'
import { FaSearch } from "react-icons/fa";

const SearchBox = ({searchTerm, setSearchTerm, filtrosOpciones, setSelectedMarca, setSelectedTipo, setSelectedUbicacion, selectedTipo, selectedMarca, selectedUbicacion}) => {

    const [tempSearchTerm, setTempSearchTerm] = useState('');
    const handleSearchClick = () => {
        setSearchTerm(tempSearchTerm);
    };

  return (
    <main className='search-box hiddenInMobile'>
        <h1>El directorio B2B líder de Argentina</h1>
        <section className='search-section'>
            <input 
                type="text"
                placeholder='Buscá tu proveedor'
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value.toLowerCase())}
                aria-label="Buscar proveedores"
            />
            <button onClick={handleSearchClick}><FaSearch className='search-icon'/></button>
        </section>
    </main>
  )
}

export default SearchBox