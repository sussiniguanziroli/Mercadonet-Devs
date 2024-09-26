import React from 'react'
import { IoRemoveOutline } from "react-icons/io5";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";


const Footer = () => {
    return (
        <footer className='main-footer'>
            <div className="social-icons">
                <IoRemoveOutline className='line-icon' />
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
                <IoRemoveOutline className='line-icon' />
            </div>

        </footer>
    )
}

export default Footer