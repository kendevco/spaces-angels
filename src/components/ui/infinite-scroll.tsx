import React, { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface InfiniteScrollProps {
  hasMore: boolean
  loadMore?: () => void
  next?: () => Promise<void>
  isLoading?: boolean
  loader?: React.ReactNode
  threshold?: number
  className?: string
  children: React.ReactNode
}

export function InfiniteScroll({
  hasMore,
  loadMore,
  next,
  isLoading = false,
  loader,
  threshold = 100,
  className,
  children
}: InfiniteScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const handleLoadMore = useCallback(async () => {
    if (isLoading) return

    if (next) {
      await next()
    } else if (loadMore) {
      loadMore()
    }
  }, [next, loadMore, isLoading])

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (target.isIntersecting && hasMore && !isLoading) {
      handleLoadMore()
    }
  }, [hasMore, isLoading, handleLoadMore])

  useEffect(() => {
    if (!scrollRef.current) return

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: scrollRef.current,
      rootMargin: `${threshold}px`,
      threshold: 0,
    })

    const sentinelElement = scrollRef.current.querySelector('[data-sentinel]')
    if (sentinelElement) {
      observerRef.current.observe(sentinelElement)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver, threshold])

  const defaultLoader = (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
    </div>
  )

  return (
    <div ref={scrollRef} className={cn("overflow-y-auto", className)}>
      <div data-sentinel className="h-px"></div>
      {hasMore && isLoading && (loader || defaultLoader)}
      {children}
    </div>
  )
}
