import React from 'react'
import Link from 'next/link'

export default function Navbar() {
  return (
    <div className="navbar shadow-sm top-0 z-50">
        <div className="navbar-start">
            <button className="btn btn-ghost text-xl">Logo</button>
        </div>
        <div className='navbar-center'>
            <Link href="/my-prompts" className='btn btn-ghost'>My prompts</Link>
            <Link href="/browse-prompts" className='btn btn-ghost'>Browse prompts 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
            </Link>
        </div>
        <div className='navbar-end'>
            <Link href="/login" className='btn'>Login</Link>
            <Link href="/signup" className='btn btn-ghost'>Signup</Link>
        </div>
    </div>
  )
}