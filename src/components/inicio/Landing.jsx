import React from 'react'
import Categorias from './Categorias'
import Qsmnet from './Qsmnet'
import Sliders from './Sliders'
import Header from '../header/Header'
import Footer from '../footer/Footer'

const Landing = () => {



  return (
    <main className='landing-container'>
        <Header />
        <Categorias />
        <Qsmnet />
        <Sliders />
        <Footer />
    </main>
  )
}

export default Landing