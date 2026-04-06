'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const MAX_SEARCH_TAGS = 5

export function useSearch() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTags, setSearchTags] = useState([])

    useEffect(() => {
        const urlSearch = searchParams.get('search') || ''
        setSearchQuery(urlSearch)
        const urlTags = searchParams.get('tags')
        if (urlTags) {
            setSearchTags(urlTags.split(',').filter(Boolean))
        }
    }, [searchParams])

    const updateUrl = useCallback((search, tags) => {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (tags.length > 0) params.set('tags', tags.join(','))
        router.push(`?${params.toString()}`, { scroll: false })
    }, [router])

    const toggleTag = useCallback((tag) => {
        setSearchTags(prev => {
            const exists = prev.includes(tag)
            const newTags = exists
                ? prev.filter(t => t !== tag)
                : prev.length < MAX_SEARCH_TAGS
                    ? [...prev, tag]
                    : prev
            updateUrl(searchQuery, newTags)
            return newTags
        })
    }, [searchQuery, updateUrl])

    const clearTags = useCallback(() => {
        setSearchTags([])
        updateUrl(searchQuery, [])
    }, [searchQuery, updateUrl])

    const clearSearch = useCallback(() => {
        setSearchQuery('')
        updateUrl('', searchTags)
    }, [searchTags, updateUrl])

    const setSearch = useCallback((value) => {
        setSearchQuery(value)
        updateUrl(value, searchTags)
    }, [searchTags, updateUrl])

    const clearAll = useCallback(() => {
        setSearchQuery('')
        setSearchTags([])
        router.push('?', { scroll: false })
    }, [router])

    return {
        searchQuery,
        searchTags,
        toggleTag,
        clearTags,
        clearSearch,
        setSearch,
        clearAll,
        MAX_SEARCH_TAGS
    }
}
