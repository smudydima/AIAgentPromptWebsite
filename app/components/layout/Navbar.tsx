import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <div className="navbar shadow-sm top-0 z-50">
      <div className="navbar-start ml-5">
        <Link href="/" className='flex items-center gap-2 text-white/80 hover:text-white transition-colors group'>
          <div className='brightness-90 group-hover:brightness-110 transition-all'>
            <Image src="/Logo.png" alt="Logo" width={50} height={50} />
          </div>
          <span className='text-xl font-bold justify-center'>Cue</span>
        </Link>
      </div>
      <div className='navbar-center hidden md:flex gap-4'>
        <Link href="/write-prompt" className='btn btn-ghost'>Create</Link>
        <Link href="/my-prompts" className='btn btn-ghost'>Prompts</Link>
      </div>
      <div className='navbar-end gap-2'>
        <Link href="/login" className='btn'>Login</Link>
        <Link href="/signup" className='btn btn-ghost'>Signup</Link>
      </div>
    </div>
  )
}
