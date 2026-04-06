'use client'
import { useState, useRef, useEffect } from 'react'
import { TagPickerModal, ALL_TAGS } from './TagPickerModal'

const MAX_TAGS = 5

export function EditModal({ post, onClose, onSave }) {
    const modalRef = useRef(null)
    const tagModalRef = useRef(null)
    const [form, setForm] = useState({ title: '', description: '' })
    const [selectedTags, setSelectedTags] = useState([])
    const [errors, setErrors] = useState({ title: '', description: '' })

    useEffect(() => {
        if (post) {
            setForm({ title: post.title, description: post.description })
            setSelectedTags(post.tags)
            modalRef.current?.showModal()
        } else {
            modalRef.current?.close()
        }
    }, [post])

    const toggleTag = (tag) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) return prev.filter(t => t !== tag)
            if (prev.length >= MAX_TAGS) return prev
            return [...prev, tag]
        })
    }

    const clearTags = () => setSelectedTags([])

    const validate = () => {
        const newErrors = { title: '', description: '' }
        let isValid = true
        if (!form.title.trim()) { newErrors.title = 'Title is required'; isValid = false }
        if (!form.description.trim()) { newErrors.description = 'Description is required'; isValid = false }
        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate() || !post) return
        const success = await onSave(post.id, { ...form, tags: selectedTags })
        if (success) onClose()
    }

    const handleClose = () => {
        modalRef.current?.close()
        onClose()
    }

    if (!post) return null

    return (
        <>
            <dialog ref={modalRef} className='modal'>
                <div className='modal-box' style={{ maxWidth: '90vw', width: '700px' }}>
                    <h3 className='font-bold text-2xl mb-6'>Edit Prompt</h3>
                    <form onSubmit={handleSubmit}>
                        <div className='form-control mb-4'>
                            <label className='label'>
                                <span className='label-text'>Title <span className='text-xs opacity-50'>({form.title.length}/30)</span></span>
                            </label>
                            <input
                                type='text'
                                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                maxLength={30}
                            />
                            {errors.title && <span className='text-error text-sm mt-1'>{errors.title}</span>}
                        </div>

                        <div className='form-control mb-4'>
                            <label className='label'>
                                <span className='label-text'>Tags <span className='text-xs opacity-50'>({selectedTags.length}/{MAX_TAGS})</span></span>
                            </label>
                            <div className='flex flex-row flex-wrap gap-2 items-center'>
                                <button type='button' className='btn btn-square btn-sm bg-red-500/20 hover:bg-red-500/50 text-red-400 border-none' onClick={clearTags}>×</button>
                                {selectedTags.map(tag => (
                                    <button key={tag} type='button' className='btn btn-sm btn-soft' onClick={() => toggleTag(tag)}>
                                        {tag} <span className='ml-1 opacity-60'>×</span>
                                    </button>
                                ))}
                                {selectedTags.length < MAX_TAGS && (
                                    <button type='button' className='btn btn-sm btn-soft' onClick={() => tagModalRef.current?.showModal()}>Add</button>
                                )}
                            </div>
                        </div>

                        <div className='form-control mb-6'>
                            <label className='label'>
                                <span className='label-text'>Description <span className='text-xs opacity-50'>({form.description.length}/10000)</span></span>
                            </label>
                            <textarea
                                className={`textarea textarea-bordered w-full h-48 ${errors.description ? 'textarea-error' : ''}`}
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                maxLength={10000}
                            />
                            {errors.description && <span className='text-error text-sm mt-1'>{errors.description}</span>}
                        </div>

                        <div className='modal-action'>
                            <button type='button' className='btn btn-ghost' onClick={handleClose}>Cancel</button>
                            <button type='submit' className='btn btn-soft'>Save Changes</button>
                        </div>
                    </form>
                </div>
                <button type='button' className='modal-backdrop' onClick={handleClose} />
            </dialog>

            <TagPickerModal
                modalRef={tagModalRef}
                selectedTags={selectedTags}
                maxTags={MAX_TAGS}
                title="Pick tags"
                onToggle={toggleTag}
                onClose={() => tagModalRef.current?.close()}
            />
        </>
    )
}
