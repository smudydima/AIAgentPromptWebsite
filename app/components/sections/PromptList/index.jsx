'use client'
import { useState, useRef, useEffect } from 'react'
import { useToast } from '@/app/hooks/useToast'
import { useAuthModal } from '@/app/context/AuthModalContext'
import { usePrompts } from './hooks/usePrompts'
import { useSearch } from './hooks/useSearch'
import { PromptCard } from './components/PromptCard'
import { ViewModal } from './components/ViewModal'
import { EditModal } from './components/EditModal'
import { TagPickerModal } from './components/TagPickerModal'
import { SearchBar } from './components/SearchBar'
import Link from 'next/link'

export default function PromptList() {
    const { addToast, ToastContainer } = useToast()
    const { openLogin } = useAuthModal()
    const [activeTab, setActiveTab] = useState('private')
    const [page, setPage] = useState(1)
    const { posts, pagination, fetchPosts, deletePost, updatePost } = usePrompts(activeTab, page)
    const { searchQuery, searchTags, toggleTag, clearTags, setSearch, clearSearch, clearAll, MAX_SEARCH_TAGS } = useSearch()
    const [selectedPost, setSelectedPost] = useState(null)
    const [editingPost, setEditingPost] = useState(null)
    const [user, setUser] = useState(null)
    const searchTagModalRef = useRef(null)

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => setUser(null))
    }, [])

    useEffect(() => { fetchPosts() }, [fetchPosts])
    useEffect(() => { setPage(1); clearAll() }, [activeTab, clearAll])

    const handleTabChange = (tab) => {
        if (tab === 'private' && !user) {
            openLogin()
            return
        }
        setActiveTab(tab)
    }

    const filteredPosts = posts.filter(post => {
        const matchesTitle = post.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTags = searchTags.length === 0 || searchTags.some(tag => post.tags.includes(tag))
        return matchesTitle && matchesTags
    })

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            addToast('Copied to clipboard')
        } catch {
            addToast('Failed to copy', 'error')
        }
    }

    const handleDelete = async (postId, e) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this prompt?')) return
        const success = await deletePost(postId)
        addToast(success ? 'Prompt deleted successfully' : 'Failed to delete prompt', success ? 'success' : 'error')
    }

    const handleUpdate = async (postId, data) => {
        const success = await updatePost(postId, data)
        addToast(success ? 'Prompt updated successfully' : 'Failed to update prompt', success ? 'success' : 'error')
        return success
    }

    const openViewModal = (post) => setSelectedPost(post)
    const openEditModal = (post, e) => { e.stopPropagation(); setEditingPost(post) }
    const closeViewModal = () => setSelectedPost(null)
    const closeEditModal = () => setEditingPost(null)

    const isFiltering = searchQuery || searchTags.length > 0
    const showPagination = pagination && pagination.totalPages > 1 && !isFiltering

    return (
        <div className='p-8'>
            <ToastContainer />

            <div className='flex gap-2 mb-6'>
                <button className={`btn btn-sm ${activeTab === 'private' ? 'bg-base-300' : 'btn-ghost'}`} onClick={() => handleTabChange('private')}>
                    My Prompts
                </button>
                <button className={`btn btn-sm ${activeTab === 'public' ? 'bg-base-300' : 'btn-ghost'}`} onClick={() => handleTabChange('public')}>
                    Public Prompts
                </button>
            </div>

            <SearchBar
                searchQuery={searchQuery}
                searchTags={searchTags}
                maxSearchTags={MAX_SEARCH_TAGS}
                tagModalRef={searchTagModalRef}
                onSearchChange={setSearch}
                onClearSearch={clearSearch}
                onToggleTag={toggleTag}
                onClearTags={clearTags}
            />

            {filteredPosts.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredPosts.map(post => (
                        <PromptCard
                            key={post.id}
                            post={post}
                            activeTab={activeTab}
                            onView={openViewModal}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onCopy={handleCopy}
                        />
                    ))}
                </div>
            ) : (
                <div className='text-center py-16'>
                    <div className='opacity-60 mb-6'>
                        {isFiltering ? (
                            <p className='text-lg'>No prompts found</p>
                        ) : (
                            <>
                                <p className='text-xl mb-2'>No prompts yet</p>
                                <p className='text-sm opacity-70'>Create your first prompt to get started</p>
                            </>
                        )}
                    </div>
                    {!isFiltering && activeTab === 'private' && (
                        user ? (
                            <Link href='/write-prompt' className='btn btn-soft'>Create your prompts</Link>
                        ) : (
                            <button className='btn btn-soft' onClick={openLogin}>Create your prompts</button>
                        )
                    )}
                    {isFiltering && (
                        <button className='btn btn-ghost' onClick={clearAll}>Clear filters</button>
                    )}
                </div>
            )}

            {showPagination && (
                <div className='flex justify-center items-center gap-4 mt-8'>
                    <button className='btn btn-sm btn-soft' disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                    <button className='btn btn-sm btn-soft' disabled={!pagination.hasMore} onClick={() => setPage(p => p + 1)}>
                        Next
                    </button>
                </div>
            )}

            <ViewModal post={selectedPost} onClose={closeViewModal} onCopy={handleCopy} activeTab={activeTab} />
            <EditModal post={editingPost} onClose={closeEditModal} onSave={handleUpdate} />
            <TagPickerModal
                modalRef={searchTagModalRef}
                selectedTags={searchTags}
                maxTags={MAX_SEARCH_TAGS}
                title="Filter by tags"
                onToggle={toggleTag}
                onClose={() => searchTagModalRef.current?.close()}
            />
        </div>
    )
}
