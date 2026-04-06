'use client'

export function PromptCard({ post, activeTab, onView, onEdit, onDelete, onCopy }) {
    return (
        <div className='card bg-base-200 shadow-xl'>
            <div className='card-body'>
                <div className='flex justify-between items-start'>
                    <h2 className='card-title line-clamp-1'>{post.title}</h2>
                    <button
                        className='btn btn-xs btn-ghost'
                        onClick={() => onCopy(post.description)}
                        title='Copy to clipboard'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>

                <div className='flex flex-wrap gap-2 mt-2'>
                    {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className='badge badge-sm'>{tag}</span>
                    ))}
                    {post.tags.length > 3 && (
                        <span className='badge badge-sm'>+{post.tags.length - 3}</span>
                    )}
                </div>

                <p className='mt-4 text-sm opacity-80 break-words line-clamp-3'>
                    {post.description}
                </p>

                <div className='card-actions justify-end mt-4 gap-2'>
                    {activeTab === 'private' && (
                        <>
                            <button className='btn btn-sm btn-soft' onClick={(e) => onEdit(post, e)}>
                                Edit
                            </button>
                            <button
                                className='btn btn-sm bg-red-500/20 hover:bg-red-500/50 text-red-400 border-none transition-all'
                                onClick={(e) => onDelete(post.id, e)}
                            >
                                Delete
                            </button>
                        </>
                    )}
                    <button className='btn btn-sm btn-soft' onClick={() => onView(post)}>
                        View Full
                    </button>
                </div>
            </div>
        </div>
    )
}
