import React, { useState } from 'react'
import Proveedor from './Proveedor'

const ProveedoresList = ({ proveedores }) => {


    return (
        <main className='proveedores-list-container'>
            <div className='proveedores-list'>


                {proveedores.map((proveedor =>

                    <Proveedor proveedor={proveedor} key={proveedor.id} />

                ))}


            </div>

           
            
        </main>
    )
}

export default ProveedoresList