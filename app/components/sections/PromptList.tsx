'use client'
import { useState, useEffect, useRef, MouseEvent, KeyboardEvent, FormEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/app/hooks/useToast'

const ALL_TAGS = [
    "Svelte", "Vue", "React", "Angular", "Next.js",
    "Python", "Node.js", "TypeScript", "GraphQL", "Docker",
    "LLM", "ChatGPT", "Coding", "Writing", "Marketing"
]

const MAX_TAGS = 5
const MAX_SEARCH_TAGS = 5

interface Post {
    id: string
    title: string
    tags: string[]
    description: string
}

interface Pagination {
    page: number
    totalPages: number
    hasMore: boolean
}

interface FormErrors {
    title: string
    description: string
}

export default function PromptList() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { addToast, ToastContainer } = useToast()
    const [posts, setPosts] = useState<Post[]>([])
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [activeTab, setActiveTab] = useState('private')
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [editSelectedTags, setEditSelectedTags] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTags, setSearchTags] = useState<string[]>([])
    const [editForm, setEditForm] = useState({ title: '', description: '' })
    const [editErrors, setEditErrors] = useState<FormErrors>({ title: '', description: '' })
    const modalRef = useRef<HTMLDialogElement>(null)
    const editModalRef = useRef<HTMLDialogElement>(null)
    const tagModalRef = useRef<HTMLDialogElement>(null)
    const searchTagModalRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const urlSearch = searchParams.get('search') || ''
        setSearchQuery(urlSearch)
        const urlTags = searchParams.get('tags')
        if (urlTags) {
            setSearchTags(urlTags.split(',').filter(Boolean))
        }
    }, [searchParams])

    useEffect(() => {
        fetchPosts()
    }, [page, activeTab])

    useEffect(() => {
        setSearchQuery('')
        setSearchTags([])
    }, [activeTab])

    const fetchPosts = async () => {
        try {
            const res = await fetch(`/api/prompts?visibility=${activeTab}&page=${page}&limit=12`)
            const data = await res.json()
            setPosts(data.posts)
            setPagination(data.pagination)
        } catch (err) {
            console.error(err)
        }
    }

    const filteredPosts = posts.filter(post => {
        const matchesTitle = post.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTags = searchTags.length === 0 || searchTags.some(tag => post.tags.includes(tag))
        return matchesTitle && matchesTags
    })

    const openModal = (post: Post) => {
        setSelectedPost(post)
        modalRef.current?.showModal()
    }

    const closeModal = () => {
        modalRef.current?.close()
        setSelectedPost(null)
    }

    const openEditModal = (post: Post, e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setEditingPost(post)
        setEditForm({
            title: post.title,
            description: post.description
        })
        setEditSelectedTags(post.tags)
        setEditErrors({ title: '', description: '' })
        editModalRef.current?.showModal()
    }

    const closeEditModal = () => {
        editModalRef.current?.close()
        setEditingPost(null)
        setEditForm({ title: '', description: '' })
        setEditSelectedTags([])
        setEditErrors({ title: '', description: '' })
    }

    const openTagModal = () => {
        tagModalRef.current?.showModal()
    }

    const closeTagModal = () => {
        tagModalRef.current?.close()
    }

    const openSearchTagModal = () => {
        searchTagModalRef.current?.showModal()
    }

    const closeSearchTagModal = () => {
        searchTagModalRef.current?.close()
    }

    const toggleEditTag = (tag: string) => {
        if (editSelectedTags.includes(tag)) {
            setEditSelectedTags(editSelectedTags.filter(t => t !== tag))
        } else if (editSelectedTags.length < MAX_TAGS) {
            setEditSelectedTags([...editSelectedTags, tag])
        }
    }

    const toggleSearchTag = (tag: string) => {
        if (searchTags.includes(tag)) {
            const newTags = searchTags.filter(t => t !== tag)
            setSearchTags(newTags)
            updateUrlSearch(newTags)
        } else if (searchTags.length < MAX_SEARCH_TAGS) {
            const newTags = [...searchTags, tag]
            setSearchTags(newTags)
            updateUrlSearch(newTags)
        }
    }

    const clearEditTags = () => setEditSelectedTags([])

    const clearSearchTags = () => {
        setSearchTags([])
        updateUrlSearch([])
    }

    const availableToAdd = ALL_TAGS.filter(t => !editSelectedTags.includes(t))

    const updateUrlSearch = (tags: string[]) => {
        const params = new URLSearchParams(searchParams)
        if (tags.length > 0) {
            params.set('tags', tags.join(','))
        } else {
            params.delete('tags')
        }
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const validateEditForm = () => {
        const errors: FormErrors = { title: '', description: '' }
        let isValid = true

        if (!editForm.title.trim()) {
            errors.title = 'Title is required'
            isValid = false
        }
        if (!editForm.description.trim()) {
            errors.description = 'Description is required'
            isValid = false
        }

        setEditErrors(errors)
        return isValid
    }

    const handleEdit = async (e: FormEvent) => {
        e.preventDefault()
        if (!validateEditForm()) return
        if (!editingPost) return

        try {
            const res = await fetch(`/api/prompts/${editingPost.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title,
                    tags: editSelectedTags,
                    description: editForm.description
                })
            })
            if (res.ok) {
                closeEditModal()
                fetchPosts()
                addToast('Prompt updated successfully')
            } else {
                addToast('Failed to update prompt', 'error')
            }
        } catch (err) {
            console.error(err)
            addToast('Failed to update prompt', 'error')
        }
    }

    const handleDelete = async (postId: string, e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this prompt?')) return
        try {
            const res = await fetch(`/api/prompts/${postId}`, { method: 'DELETE' })
            if (res.ok) {
                fetchPosts()
                addToast('Prompt deleted successfully')
            } else {
                addToast('Failed to delete prompt', 'error')
            }
        } catch (err) {
            console.error(err)
            addToast('Failed to delete prompt', 'error')
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            addToast('Copied to clipboard')
        } catch (err) {
            addToast('Failed to copy', 'error')
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
    }

    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const params = new URLSearchParams(searchParams)
            if (searchQuery) {
                params.set('search', searchQuery)
            } else {
                params.delete('search')
            }
            router.push(`?${params.toString()}`, { scroll: false })
        }
    }

    return (
        <div className='p-8'>
            <ToastContainer />
            <div className='flex flex-wrap items-center gap-4 mb-6'>
                <div className='flex gap-2'>
                    <button
                        className={`btn btn-sm ${activeTab === 'private' ? 'bg-base-300 hover:bg-base-300 border-base-300' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('private')}
                    >
                        My Prompts
                    </button>
                    <button
                        className={`btn btn-sm ${activeTab === 'public' ? 'bg-base-300 hover:bg-base-300 border-base-300' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('public')}
                    >
                        Public Prompts
                    </button>
                </div>

                <div className='flex-1 max-w-md'>
                    <div className='relative'>
                        <input
                            type='text'
                            placeholder='Search by title...'
                            className='input input-bordered input-sm w-full pr-8'
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                        />
                        {searchQuery && (
                            <button
                                className='absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100'
                                onClick={() => {
                                    setSearchQuery('')
                                    const params = new URLSearchParams(searchParams)
                                    params.delete('search')
                                    router.push(`?${params.toString()}`, { scroll: false })
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className='mb-6'>
                <div className='flex items-center gap-2 mb-2'>
                    <span className='text-sm opacity-70'>Filter by tags:</span>
                    <span className='text-xs opacity-50'>({searchTags.length}/{MAX_SEARCH_TAGS})</span>
                </div>
                <div className='flex flex-row flex-wrap gap-2 items-center'>
                    {searchTags.length > 0 && (
                        <button
                            type='button'
                            className='btn btn-square btn-sm bg-red-500/20 hover:bg-red-500/50 text-red-400 border-none transition-all'
                            onClick={clearSearchTags}
                        >
                            ×
                        </button>
                    )}
                    {searchTags.map(tag => (
                        <button
                            key={tag}
                            type='button'
                            className='btn btn-sm btn-soft'
                            onClick={() => toggleSearchTag(tag)}
                        >
                            {tag} <span className='ml-1 opacity-60'>×</span>
                        </button>
                    ))}
                    {searchTags.length < MAX_SEARCH_TAGS && (
                        <button
                            type='button'
                            className='btn btn-sm btn-soft'
                            onClick={openSearchTagModal}
                        >
                            Add Tag
                        </button>
                    )}
                </div>
            </div>

            {filteredPosts.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredPosts.map((post) => (
                        <div key={post.id} className='card bg-base-200 shadow-xl'>
                            <div className='card-body'>
                                <div className='flex justify-between items-start'>
                                    <h2 className='card-title line-clamp-1'>{post.title}</h2>
                                    <button
                                        className='btn btn-xs btn-ghost'
                                        onClick={() => copyToClipboard(post.description)}
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
                                            <button
                                                className='btn btn-sm btn-soft'
                                                onClick={(e) => openEditModal(post, e)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className='btn btn-sm bg-red-500/20 hover:bg-red-500/50 text-red-400 border-none transition-all'
                                                onClick={(e) => handleDelete(post.id, e)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className='btn btn-sm btn-soft'
                                        onClick={() => openModal(post)}
                                    >
                                        View Full
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='text-center py-16'>
                    <div className='opacity-60 mb-6'>
                        {searchQuery || searchTags.length > 0 ? (
                            <p className='text-lg'>No prompts found</p>
                        ) : (
                            <>
                                <p className='text-xl mb-2'>No prompts yet</p>
                                <p className='text-sm opacity-70'>Create your first prompt to get started</p>
                            </>
                        )}
                    </div>
                    {!searchQuery && searchTags.length === 0 && activeTab === 'private' && (
                        <Link href='/write-prompt' className='btn btn-soft'>
                            Create your prompts
                        </Link>
                    )}
                    {(searchQuery || searchTags.length > 0) && (
                        <button
                            className='btn btn-ghost'
                            onClick={() => {
                                setSearchQuery('')
                                setSearchTags([])
                                router.push('?', { scroll: false })
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && searchTags.length === 0 && !searchQuery && (
                <div className='flex justify-center items-center gap-4 mt-8'>
                    <button
                        className='btn btn-sm btn-soft'
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </button>

                    <span>Page {pagination.page} of {pagination.totalPages}</span>

                    <button
                        className='btn btn-sm btn-soft'
                        disabled={!pagination.hasMore}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            <dialog ref={modalRef} className='modal'>
                <div
                    className='modal-box flex flex-col overflow-hidden'
                    style={{ maxWidth: '90vw', width: '900px', maxHeight: '85vh' }}
                >
                    {selectedPost && (
                        <>
                            <h3 className='font-bold text-2xl mb-4'>{selectedPost.title}</h3>

                            <div className='mb-4'>
                                <div className='flex justify-between items-center mb-2'>
                                    <p className='text-sm opacity-60'>Tags:</p>
                                    <button
                                        type='button'
                                        className='btn btn-xs btn-soft'
                                        onClick={() => copyToClipboard(selectedPost.description)}
                                    >
                                        Copy text
                                    </button>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {selectedPost.tags.map(tag => (
                                        <span key={tag} className='badge badge-sm badge-soft'>{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div className='bg-base-100 p-4 rounded-lg flex-1 overflow-y-auto overflow-x-hidden min-h-0'>
                                <p className='whitespace-pre-wrap' style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                    {selectedPost.description}
                                </p>
                            </div>

                            <div className='modal-action mt-6 pt-4 border-t border-base-300'>
                                <button
                                    type='button'
                                    className='btn btn-soft'
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <button type='button' className='modal-backdrop' onClick={closeModal} />
            </dialog>

            <dialog ref={editModalRef} className='modal'>
                <div className='modal-box' style={{ maxWidth: '90vw', width: '700px' }}>
                    <h3 className='font-bold text-2xl mb-6'>Edit Prompt</h3>
                    <form onSubmit={handleEdit}>
                        <div className='form-control mb-4'>
                            <label className='label'>
                                <span className='label-text'>Title <span className='text-xs opacity-50'>({editForm.title.length}/30)</span></span>
                            </label>
                            <input
                                type='text'
                                className={`input input-bordered w-full ${editErrors.title ? 'input-error' : ''}`}
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                maxLength={30}
                            />
                            {editErrors.title && <span className='text-error text-sm mt-1'>{editErrors.title}</span>}
                        </div>

                        <div className='form-control mb-4'>
                            <label className='label'>
                                <span className='label-text'>Tags <span className='text-xs opacity-50'>({editSelectedTags.length}/{MAX_TAGS})</span></span>
                            </label>
                            <div className='flex flex-row flex-wrap gap-2 items-center'>
                                <button
                                    type='button'
                                    className='btn btn-square btn-sm bg-red-500/20 hover:bg-red-500/50 text-red-400 border-none transition-all'
                                    onClick={clearEditTags}
                                >
                                    ×
                                </button>

                                {editSelectedTags.map(tag => (
                                    <button
                                        key={tag}
                                        type='button'
                                        className='btn btn-sm btn-soft'
                                        onClick={() => toggleEditTag(tag)}
                                    >
                                        {tag} <span className='ml-1 opacity-60'>×</span>
                                    </button>
                                ))}

                                {editSelectedTags.length < MAX_TAGS && (
                                    <button
                                        type='button'
                                        className='btn btn-sm btn-soft'
                                        onClick={openTagModal}
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className='form-control mb-6'>
                            <label className='label'>
                                <span className='label-text'>Description <span className='text-xs opacity-50'>({editForm.description.length}/10000)</span></span>
                            </label>
                            <textarea
                                className={`textarea textarea-bordered w-full h-48 ${editErrors.description ? 'textarea-error' : ''}`}
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                maxLength={10000}
                            />
                            {editErrors.description && <span className='text-error text-sm mt-1'>{editErrors.description}</span>}
                        </div>

                        <div className='modal-action'>
                            <button type='button' className='btn btn-ghost' onClick={closeEditModal}>Cancel</button>
                            <button type='submit' className='btn btn-soft'>Save Changes</button>
                        </div>
                    </form>
                </div>
                <button type='button' className='modal-backdrop' onClick={closeEditModal} />
            </dialog>

            <dialog ref={tagModalRef} className='modal'>
                <div className='modal-box'>
                    <h3 className='font-bold text-lg mb-1'>Pick tags</h3>
                    <p className='text-sm opacity-50 mb-4'>
                        {editSelectedTags.length}/{MAX_TAGS} selected
                    </p>
                    <div className='flex flex-wrap gap-2'>
                        {ALL_TAGS.map(tag => {
                            const isSelected = editSelectedTags.includes(tag)
                            const isDisabled = !isSelected && editSelectedTags.length >= MAX_TAGS
                            return (
                                <button
                                    key={tag}
                                    type='button'
                                    className={`btn btn-sm ${isSelected ? 'btn-soft' : 'btn-ghost'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    onClick={() => !isDisabled && toggleEditTag(tag)}
                                >
                                    {tag}
                                </button>
                            )
                        })}
                    </div>
                    <div className='modal-action'>
                        <button type='button' className='btn btn-soft' onClick={closeTagModal}>Done</button>
                    </div>
                </div>
                <button type='button' className='modal-backdrop' onClick={closeTagModal} />
            </dialog>

            <dialog ref={searchTagModalRef} className='modal'>
                <div className='modal-box'>
                    <h3 className='font-bold text-lg mb-1'>Filter by tags</h3>
                    <p className='text-sm opacity-50 mb-4'>
                        {searchTags.length}/{MAX_SEARCH_TAGS} selected
                    </p>
                    <div className='flex flex-wrap gap-2'>
                        {ALL_TAGS.map(tag => {
                            const isSelected = searchTags.includes(tag)
                            const isDisabled = !isSelected && searchTags.length >= MAX_SEARCH_TAGS
                            return (
                                <button
                                    key={tag}
                                    type='button'
                                    className={`btn btn-sm ${isSelected ? 'btn-soft' : 'btn-ghost'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    onClick={() => !isDisabled && toggleSearchTag(tag)}
                                >
                                    {tag}
                                </button>
                            )
                        })}
                    </div>
                    <div className='modal-action'>
                        <button type='button' className='btn btn-soft' onClick={closeSearchTagModal}>Done</button>
                    </div>
                </div>
                <button type='button' className='modal-backdrop' onClick={closeSearchTagModal} />
            </dialog>
        </div>
    )
}
