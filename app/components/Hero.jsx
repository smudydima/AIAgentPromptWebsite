import React from 'react'

function Hero() {
  return (
  <div className="hero bg-base-100 min-h-[calc(100vh-68px)]">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold">AI Prompt Creator/Browser</h1>
        <p className="py-6">
          Generate prompts for AI models and reuse them or just browse other users prompts
        </p>
        <button className="btn btn-soft mx-2">Write a prompt for AI</button>
        <button className="btn btn-soft mx-2">Browse prompts</button>
      </div>
    </div>
</div>
  )
}

export default Hero