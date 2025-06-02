import React from 'react'
import { NavLink } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div>
        <h1>ACA SE VERIA ALOJADO EL DASH</h1>
        <button>
            <NavLink to="/proveedores">Volver a proveedores (solucion momentanea)</NavLink>
        </button>        
    </div>
  )
}

export default Dashboard