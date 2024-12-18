import React from 'react'
import Header from '../header/Header'

const LandingRegistroProveedor = ({nextStep}) => {
  return (
    <>
    <Header />
        <main className='landing-registro-proveedor'>
            <h1>Conviértete en Proveedor con MercadoNet y deja tu huella en Latinoamérica</h1>
            <h2>Haz que tu empresa sea visible para compradores de toda la región y crece sin límites.</h2>
            <button onClick={nextStep}>
                <p>Crear mi perfil de Proveedor</p>
            </button>
        </main>
    </>
  )
}

export default LandingRegistroProveedor