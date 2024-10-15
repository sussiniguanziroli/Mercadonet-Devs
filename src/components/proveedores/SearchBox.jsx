import React from 'react'
import { FaSearch } from "react-icons/fa";

const SearchBox = () => {
  return (
    <main className='search-box'>
        <h1>El directorio B2B líder de Argentina</h1>
        <section className='search-section'>
            <input type="text" placeholder='Buscá tu proveedor' />
            <button><FaSearch className='search-icon'/></button>
        </section>
    </main>
  )
}

export default SearchBox