import React from 'react'
import Categorias from './Categorias'
import Qsmnet from './Qsmnet'
import Sliders from './Sliders'
import Header from '../header/Header'

const Landing = () => {



  return (
    <main className='landing-container'>
        <Header />
        <Categorias />
        <Qsmnet />
        <Sliders />
    </main>
  )
}

export default Landing