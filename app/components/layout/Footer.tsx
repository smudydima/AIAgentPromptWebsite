import React from 'react'
import { FiGithub, FiHeart } from 'react-icons/fi'

export default function Footer() {
    return (
        <footer className="footer footer-center bg-base-200 p-4 text-base-content">
            <aside>
                <p>Made in 2026 - With <FiHeart className="w-4 h-4 inline hover:text-red-500 transition-colors duration-200" /> by <a href="https://github.com/Smudy-ux" target='_blank' rel='noopener noreferrer' className='link text-blue-400 hover:text-blue-300'>Smudy</a> and <a href="https://github.com/schr0cat" target='_blank' rel='noopener noreferrer' className='link text-blue-400 hover:text-blue-300'>Schr0cat</a></p>
            </aside>
        </footer>
    )
}