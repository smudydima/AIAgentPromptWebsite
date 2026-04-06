'use client'
import { useSearchParams, useRouter } from 'next/navigation'

export function SearchBar({
    searchQuery,
    searchTags,
    maxSearchTags,
    tagModalRef,
    onSearchChange,
    onClearSearch,
    onToggleTag,
    onClearTags
}) {
    const searchParams = useSearchParams()
    const router = useRouter()

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const params = new URLSearchParams(searchParams)
            if (searchQuery) params.set('search', searchQuery)
            else params.delete('search')
            router.push(`?${params.toString()}`, { scroll: false })
        }
    }

    return (
        <div className='flex flex-wrap items-center gap-4 mb-6'>
            <div className='flex-1 max-w-md'>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search by title...'
                        className='input input-bordered input-sm w-full pr-8'
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button
                            className='absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100'
                            onClick={onClearSearch}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm opacity-70'>Filter by tags:</span>
                <span className='text-xs opacity-50'>({searchTags.length}/{maxSearchTags})</span>
                {searchTags.length > 0 && (
                    <button
                        type='button'
                        className='btn btn-square btn-xs bg-red-500/20 hover:bg-red-500/50 text-red-400 border-none'
                        onClick={onClearTags}
                    >
                        ×
                    </button>
                )}
                {searchTags.map(tag => (
                    <button
                        key={tag}
                        type='button'
                        className='btn btn-xs btn-soft'
                        onClick={() => onToggleTag(tag)}
                    >
                        {tag} <span className='ml-1 opacity-60'>×</span>
                    </button>
                ))}
                {searchTags.length < maxSearchTags && (
                    <button
                        type='button'
                        className='btn btn-xs btn-soft'
                        onClick={() => tagModalRef.current?.showModal()}
                    >
                        Add Tag
                    </button>
                )}
            </div>
        </div>
    )
}
