import React, { useState } from 'react'

const FiltrosComponent = ({setIsMenuHidden, isMenuHidden}) => {

    const [filtros, setFiltros] = useState([]);


  return (
    <main className={`main-filters-component ${isMenuHidden ? 'hidden' : 'visible'}`}>
        <button onClick={()=>setIsMenuHidden(true)}>X</button>
        <p>Soy el menu de prueba</p>
    </main>
  )
}

export default FiltrosComponent