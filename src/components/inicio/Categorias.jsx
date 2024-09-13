import React from 'react'
import categoriaspopulares from './json/cat-populares.json'

const Categorias = () => {


  return (
    <main className='main-categorias'>
        <h1>El directorio B2B Líder de Argentina</h1>
        <h3>Conéctese con los principales proveedores mayoristas y encuentre productos que se vendan.</h3>
        <section >
            <h4>CATEGORÍAS POPULARES</h4>
            <div className='div-de-grid'>

                {categoriaspopulares.map((categoriapopular) => <div key={categoriapopular.id} className='categorias-contenido' >
                    <img src={categoriapopular.imagen} alt={categoriapopular.titulo} />
                    <p>{categoriapopular.titulo}</p>
                </div>)}

            </div>
        </section>
    </main>
  )
}

export default Categorias