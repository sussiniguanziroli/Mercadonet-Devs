import React from 'react'
import Flickl from './Flickl'

const Sliders = () => {


    return (
        <main className='slider-main'>
            <section className='banner-section'>
                <div>
                    <p>Ya hemos alcanzado más de 1500 registros de nuevos proveedores.</p>
                    <p>¿Qué estás esperando para unirte?</p>
                </div>
                <button>Me quiero sumar</button>
            </section>
            <section className='slider-section'>
                <h1>Empresas que confían en Mercadonet</h1>
                <Flickl />
            </section>
        </main>
    )
}

export default Sliders