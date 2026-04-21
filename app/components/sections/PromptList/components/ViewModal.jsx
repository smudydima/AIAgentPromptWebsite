'use client'
import { useRef, useEffect } from 'react'

export function ViewModal({ post, onClose, onCopy, activeTab }) {
    const modalRef = useRef(null)

    useEffect(() => {
        if (post) {
            modalRef.current?.showModal()
        } else {
            modalRef.current?.close()
        }
    }, [post])

    if (!post) return null

    return (
        <dialog ref={modalRef} className='modal'>
            <div
                className='modal-box flex flex-col overflow-hidden'
                style={{ maxWidth: '90vw', width: '900px', maxHeight: '85vh' }}
            >
                <h3 className='font-bold text-2xl mb-4'>{post.title}</h3>

                <div className='mb-4'>
                    <div className='flex justify-between items-center mb-2'>
                        <p className='text-sm opacity-60'>Tags:</p>
                        <button
                            type='button'
                            className='btn btn-xs btn-soft'
                            onClick={() => onCopy(post.description)}
                        >
                            Copy text
                        </button>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                        {post.tags.map(tag => (
                            <span key={tag} className='badge badge-sm badge-soft'>{tag}</span>
                        ))}
                    </div>
                </div>

                <div className='bg-base-100 p-4 rounded-lg flex-1 overflow-y-auto overflow-x-hidden min-h-0'>
                    <p className='whitespace-pre-wrap' style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {post.description}
                    </p>
                </div>

                {activeTab === 'public' && (
                    <p className='text-sm opacity-60 mt-4'>
                        Author: {post.user?.name || 'anonymous'}
                    </p>
                )}

                <div className='modal-action mt-6 pt-4 border-t border-base-300'>
                    <button type='button' className='btn btn-soft' onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
            <button type='button' className='modal-backdrop' onClick={onClose} />
        </dialog>
    )
}
