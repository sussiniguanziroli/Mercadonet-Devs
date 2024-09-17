import React from 'react'
import categoriaspopulares from './json/cat-populares.json'
import categoriasiconos from './json/icon-cat.json'

const Categorias = () => {


  return (
    <main className='main-categorias'>
        <h1>El directorio B2B Líder de Argentina</h1>
        <h3>Conéctese con los principales proveedores mayoristas y encuentre productos que se vendan.</h3>
        <section >
            <h4>CATEGORÍAS POPULARES</h4>
            <div className='div-de-grid'>

                {categoriaspopulares.map((categoriapopular) => <div key={categoriapopular.id} className='bg categorias-contenido' >
                    <img src={categoriapopular.imagen} alt={categoriapopular.titulo} />
                    <p>{categoriapopular.titulo}</p>
                </div>)}



            </div>
        </section>
        <section >
            <h4>MÁS CATEGORÍAS</h4>
            <div className='div-de-grid'>

                {categoriasiconos.map((categoriaicono) => <div key={categoriaicono.id} className='categorias-contenido cat-iconos' >
                    <img src={categoriaicono.imagen} alt={categoriaicono.titulo} />
                    <p>{categoriaicono.titulo}</p>
                </div>)}



            </div>
        </section>
    </main>
  )
}

export default Categorias