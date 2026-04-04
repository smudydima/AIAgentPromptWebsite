'use client'
import { useState, useCallback } from 'react'

interface Toast {
    id: string
    message: string
    type: 'success' | 'error'
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const ToastContainer = () => (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg cursor-pointer transition-all animate-slide-up`}
                    onClick={() => removeToast(toast.id)}
                >
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    )

    return { addToast, ToastContainer }
}
