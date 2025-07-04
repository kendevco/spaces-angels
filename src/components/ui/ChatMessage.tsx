"use client"

import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/utilities/ui"
import type { Message, User as PayloadUser } from "@/payload-types"
import { WidgetMessage } from "./WidgetMessage"

interface ChatMessageProps {
  message: Message
  showAvatar?: boolean
  className?: string
}

export function ChatMessage({ message, showAvatar = true, className }: ChatMessageProps) {
  const author = typeof message.author === 'object' ? message.author : null
  const isWidget = (message as any).messageType === 'widget' || (message as any).widgetData

  return (
    <div className={cn("px-4 py-2 hover:bg-[#32353b]", className)}>
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={
              author?.profileImage && typeof author.profileImage === 'object'
                ? author.profileImage.url || undefined
                : undefined
            } />
            <AvatarFallback className="bg-blue-600 text-white">
              {author?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          {showAvatar && (
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="font-medium text-white">
                {author?.name || author?.email || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {isWidget ? (
            <WidgetMessage message={message} />
          ) : (
            <div className="text-gray-300 break-words">
              {message.content}
            </div>
          )}

          {/* Message reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-[#4c51584d] rounded-full px-2 py-1 text-xs"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-400">{reaction.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
