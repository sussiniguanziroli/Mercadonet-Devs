import React from 'react'
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
import { MdPlayArrow } from "react-icons/md";



const Footer = () => {
    return (
        <footer className='main-footer'>
            <div className="social-icons">
                <div className='line' />
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                    <FaFacebookF />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <FaInstagram />
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                    <FaXTwitter />
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                    <FaLinkedinIn />
                </a>
                <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                    <FaTiktok />
                </a>
                <div className='line' />
            </div>
            <img src="https://i.ibb.co/Z24ZXrp/Logo-Mercadonet.png" alt="logo en white" />
            <div className='newsletter'>
                <h2>Newsletter</h2>
                <p>Estás viendo la versión beta de MercadoNet. Suscríbete a nuestro newsletter para recibir las últimas actualizaciones y mejoras de la plataforma. </p>
                <p>¡Sé parte de esta evolución!</p>
                <div className='news-suscribe'>
                    <input type="email" placeholder='Tu mejor email'/>
                    <button>Suscribirse</button>
                </div>
                <section>
                    <h1>Links útiles</h1>

                </section>
            </div>
        </footer>
    )
}

export default Footer