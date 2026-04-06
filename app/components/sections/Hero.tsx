import React from 'react'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="hero bg-base-100 min-h-[calc(100vh-68px)]">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">AI Prompt Creator/Browser</h1>
          <p className="py-6">
            Generate prompts for AI models and reuse them or just browse other users prompts
          </p>
          <Link className="btn btn-soft mx-2" href="/write-prompt">Write a prompt for AI</Link>
          <Link className="btn btn-soft mx-2" href="/my-prompts">Browse prompts</Link>
        </div>
      </div>
    </div>
  )
}
