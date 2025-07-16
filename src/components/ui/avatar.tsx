"use client"

import * as React from "react"
import { cn } from "@/utilities/ui"

// Generate gravatar URL from email
const generateGravatarUrl = (email: string, size: number = 40): string => {
  if (!email) return ""

  // Simple hash function for gravatar (you might want to use a proper MD5 library)
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // For now, use a placeholder service similar to gravatar
  // In production, you'd want to use actual gravatar with MD5 hash
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&size=${size}&backgroundColor=5865f2&fontSize=36`
}

const Avatar = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  React.ElementRef<"img">,
  React.ComponentPropsWithoutRef<"img">
>(({ className, src, alt, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    src={src}
    alt={alt}
    onError={(e) => {
      // Hide image on error so fallback shows
      const target = e.target as HTMLImageElement
      target.style.display = 'none'
    }}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    email?: string
  }
>(({ className, children, email, ...props }, ref) => {
  // If email is provided and no children, generate gravatar
  const fallbackContent = React.useMemo(() => {
    if (children) return children
    if (email) {
      return (
        <img
          src={generateGravatarUrl(email, 40)}
          alt={`Avatar for ${email}`}
          className="h-full w-full object-cover"
          onError={(e) => {
            // If gravatar fails, show initials
            const target = e.target as HTMLImageElement
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = email.substring(0, 2).toUpperCase()
              parent.className = cn(
                "flex h-full w-full items-center justify-center rounded-full bg-[#5865f2] text-white font-medium text-sm",
                className
              )
            }
          }}
        />
      )
    }
    return "?"
  }, [children, email, className])

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-sm",
        !children && !email && "bg-[#5865f2] text-white",
        children && "bg-[#5865f2] text-white",
        className
      )}
      {...props}
    >
      {fallbackContent}
    </div>
  )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
