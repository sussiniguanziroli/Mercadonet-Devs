import React from 'react'
import { NavLink } from 'react-router-dom'

const ProductosLanding = () => {
  return (
    <div>
        <h1>Placeholder page del catalogo de productos que será accesible proximamente</h1>
        <button>
        <NavLink to="/proveedores">Volver a proveedores (solucion momentanea)</NavLink>
        </button>
    </div>
  )
}

export default ProductosLanding