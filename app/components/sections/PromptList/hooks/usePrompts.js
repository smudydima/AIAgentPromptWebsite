'use client'
import { useState, useCallback } from 'react'

export function usePrompts(activeTab, page) {
    const [posts, setPosts] = useState([])
    const [pagination, setPagination] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchPosts = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/prompts?visibility=${activeTab}&page=${page}&limit=12`)
            const data = await res.json()
            setPosts(data.posts)
            setPagination(data.pagination)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [activeTab, page])

    const deletePost = useCallback(async (postId) => {
        try {
            const res = await fetch(`/api/prompts/${postId}`, { method: 'DELETE' })
            if (res.ok) {
                fetchPosts()
                return true
            }
            return false
        } catch (err) {
            console.error(err)
            return false
        }
    }, [fetchPosts])

    const updatePost = useCallback(async (postId, data) => {
        try {
            const res = await fetch(`/api/prompts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                fetchPosts()
                return true
            }
            return false
        } catch (err) {
            console.error(err)
            return false
        }
    }, [fetchPosts])

    return { posts, pagination, loading, fetchPosts, deletePost, updatePost }
}
