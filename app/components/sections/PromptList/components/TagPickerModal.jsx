'use client'

const ALL_TAGS = [
    "Svelte", "Vue", "React", "Angular", "Next.js",
    "Python", "Node.js", "TypeScript", "GraphQL", "Docker",
    "LLM", "ChatGPT", "Coding", "Writing", "Marketing"
]

export function TagPickerModal({ modalRef, selectedTags, maxTags, title, onToggle, onClose }) {
    return (
        <dialog ref={modalRef} className='modal'>
            <div className='modal-box'>
                <h3 className='font-bold text-lg mb-1'>{title}</h3>
                <p className='text-sm opacity-50 mb-4'>
                    {selectedTags.length}/{maxTags} selected
                </p>
                <div className='flex flex-wrap gap-2'>
                    {ALL_TAGS.map(tag => {
                        const isSelected = selectedTags.includes(tag)
                        const isDisabled = !isSelected && selectedTags.length >= maxTags
                        return (
                            <button
                                key={tag}
                                type='button'
                                className={`btn btn-sm ${isSelected ? 'btn-soft' : 'btn-ghost'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                onClick={() => !isDisabled && onToggle(tag)}
                            >
                                {tag}
                            </button>
                        )
                    })}
                </div>
                <div className='modal-action'>
                    <button type='button' className='btn btn-soft' onClick={onClose}>Done</button>
                </div>
            </div>
            <button type='button' className='modal-backdrop' onClick={onClose} />
        </dialog>
    )
}

export { ALL_TAGS }
