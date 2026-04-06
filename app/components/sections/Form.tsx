'use client'
import React, { useState, useRef, FormEvent } from 'react'
import { useToast } from '@/app/hooks/useToast'

const ALL_TAGS = [
    "Svelte", "Vue", "React", "Angular", "Next.js",
    "Python", "Node.js", "TypeScript", "GraphQL", "Docker",
    "LLM", "ChatGPT", "Coding", "Writing", "Marketing"
]

const MAX_TAGS = 5

interface FormErrors {
    title: string
    description: string
}

export default function Form() {
    const { addToast, ToastContainer } = useToast()
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [isPrivate, setIsPrivate] = useState(true)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [errors, setErrors] = useState<FormErrors>({ title: '', description: '' })
    const modalRef = useRef<HTMLDialogElement>(null)

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag))
        } else if (selectedTags.length < MAX_TAGS) {
            setSelectedTags([...selectedTags, tag])
        }
    }

    const clearTags = () => setSelectedTags([])
    const availableToAdd = ALL_TAGS.filter(t => !selectedTags.includes(t))

    const validateForm = () => {
        const newErrors: FormErrors = { title: '', description: '' }
        let isValid = true

        if (!title.trim()) {
            newErrors.title = 'Title is required'
            isValid = false
        }
        if (!description.trim()) {
            newErrors.description = 'Description is required'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        const data = {
            title: title.trim(),
            tags: selectedTags,
            description: description.trim(),
            isPrivate: isPrivate
        }

        try {
            const response = await fetch('/api/prompts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                throw new Error('Failed to create prompt')
            }
            setTitle('')
            setDescription('')
            setSelectedTags([])
            setIsPrivate(true)
            setErrors({ title: '', description: '' })
            addToast('Prompt created successfully')
        } catch (error) {
            console.error(error)
            addToast('Failed to create prompt', 'error')
        } finally {
            setLoading(false)
        }
    }

    const closeModal = () => {
        modalRef.current?.close()
    }

    if (loading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col items-center w-full p-8'>
            <ToastContainer />
            <div className='w-full max-w-[1000px] flex flex-col items-start gap-6'>
                <div className='flex flex-row gap-4 items-center'>
                    <label className='flex flex-row gap-2 items-center cursor-pointer'>
                        <input
                            type="radio"
                            name="isPrivate"
                            className="radio radio-error"
                            checked={isPrivate}
                            onChange={() => setIsPrivate(true)}
                        />
                        <p>Private</p>
                    </label>
                    <label className='flex flex-row gap-2 items-center cursor-pointer'>
                        <input
                            type="radio"
                            name="isPrivate"
                            className="radio radio-success"
                            checked={!isPrivate}
                            onChange={() => setIsPrivate(false)}
                        />
                        <p>Public</p>
                    </label>
                </div>

                <div className='flex flex-row gap-4 flex-wrap items-start'>
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-2xl font-bold'>Title <span className='text-xs opacity-50'>({title.length}/30)</span></h2>
                        <input
                            type="text"
                            placeholder="Type here"
                            className={`input input-bordered w-64 ${errors.title ? 'input-error' : ''}`}
                            maxLength={30}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        {errors.title && <span className='text-error text-sm'>{errors.title}</span>}
                    </div>

                    <div className='flex flex-col gap-2'>
                        <h2 className='text-2xl font-bold'>Tags <span className='text-xs opacity-50'>({selectedTags.length}/{MAX_TAGS})</span></h2>
                        <div className='flex flex-row flex-wrap gap-1 items-center'>
                            <button
                                type='button'
                                className='btn btn-square btn-sm bg-red-500/20 hover:bg-red-500/50 text-red-400 border-none transition-all'
                                onClick={clearTags}
                            >
                                ×
                            </button>

                            {selectedTags.map(tag => (
                                <button
                                    key={tag}
                                    type='button'
                                    className='btn btn-sm btn-soft'
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag} <span className='ml-1 opacity-60'>×</span>
                                </button>
                            ))}

                            {selectedTags.length < MAX_TAGS && availableToAdd.length > 0 && (
                                <button
                                    type='button'
                                    className='btn btn-sm btn-soft'
                                    onClick={() => modalRef.current?.showModal()}
                                >
                                    Add
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className='flex flex-col items-start gap-2 w-full'>
                    <h2 className='text-2xl font-bold'>Description for AI Agent <span className='text-xs opacity-50'>({description.length}/10000)</span></h2>
                    <textarea
                        className={`textarea textarea-bordered min-h-[800px] w-full ${errors.description ? 'textarea-error' : ''}`}
                        maxLength={10000}
                        placeholder="Type here"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    {errors.description && <span className='text-error text-sm'>{errors.description}</span>}
                </div>

                <div className='flex justify-end w-full pt-4'>
                    <button type="submit" className='btn btn-soft btn-lg'>Submit</button>
                </div>
            </div>

            <dialog ref={modalRef} className='modal'>
                <div className='modal-box'>
                    <h3 className='font-bold text-lg mb-1'>Pick tags</h3>
                    <p className='text-sm opacity-50 mb-4'>
                        {selectedTags.length}/{MAX_TAGS} selected
                    </p>
                    <div className='flex flex-wrap gap-2'>
                        {ALL_TAGS.map(tag => {
                            const isSelected = selectedTags.includes(tag)
                            const isDisabled = !isSelected && selectedTags.length >= MAX_TAGS
                            return (
                                <button
                                    key={tag}
                                    type='button'
                                    className={`btn btn-sm ${isSelected ? 'btn-soft' : 'btn-ghost'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    onClick={() => !isDisabled && toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            )
                        })}
                    </div>
                    <div className='modal-action'>
                        <button type='button' className='btn btn-soft' onClick={closeModal}>Done</button>
                    </div>
                </div>
                <button type='button' className='modal-backdrop' onClick={closeModal} />
            </dialog>
        </form>
    )
}
