import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spaces - Real-time Collaboration',
  description: 'Discord-style collaboration platform with AI-powered business intelligence',
}

export default function SpacesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen overflow-hidden bg-[#1e2124]">
      {children}
    </div>
  )
}
