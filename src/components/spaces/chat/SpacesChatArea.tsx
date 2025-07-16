"use client"

import { useState, useEffect, useRef } from "react"
import { Hash, Volume2, Video, Users, Settings, Phone, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatInput } from "@/components/ui/ChatInput"
import { ChatMessage } from "@/components/ui/ChatMessage"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/utilities/ui"
import type { Space, Message, User as PayloadUser } from "@/payload-types"

// Local interface for Channel until we have a proper Channels collection
interface Channel {
  id: string
  name: string
  type?: 'text' | 'voice' | 'video'
  description?: string
}

interface SpacesChatAreaProps {
  space?: Space
  channel?: Channel
  messages: Message[]
  currentUser?: PayloadUser
  onSendMessage: (content: string, channelId: string) => void
  onFileUpload?: (files: FileList, channelId: string) => void
  isConnected?: boolean
  className?: string
}

export function SpacesChatArea({
  space,
  channel,
  messages,
  currentUser,
  onSendMessage,
  onFileUpload,
  isConnected = true,
  className
}: SpacesChatAreaProps) {
  const [showMemberList, setShowMemberList] = useState(true)
  const [isCallActive, setIsCallActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (content: string) => {
    if (channel?.id) {
      onSendMessage(content, channel.id)
    }
  }

  const handleFileUpload = (files: FileList) => {
    if (channel?.id && onFileUpload) {
      onFileUpload(files, channel.id)
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return Volume2
      case 'video':
        return Video
      default:
        return Hash
    }
  }

  if (!channel) {
    return (
      <div className={cn("flex-1 flex items-center justify-center bg-[#36393f]", className)}>
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <div className="text-xl font-semibold text-white mb-2">Welcome to {space?.name || 'Spaces'}!</div>
          <div className="text-gray-400">Select a channel to start chatting.</div>
        </div>
      </div>
    )
  }

  const ChannelIcon = getChannelIcon(channel.type || 'text')

  return (
    <div className={cn("flex-1 flex flex-col bg-[#36393f]", className)}>
      {/* Channel Header */}
      <div className="h-16 border-b border-[#202225] bg-[#36393f] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ChannelIcon className="w-6 h-6 text-gray-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">{channel.name}</h2>
            <p className="text-sm text-gray-400">
              {space?.name} • {(space as any)?.members?.length || 0} members
              {!isConnected && <span className="text-red-400 ml-2">• Disconnected</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Voice/Video Controls for voice channels */}
          {(channel.type === 'voice' || channel.type === 'video') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCallActive(!isCallActive)}
                className={cn(
                  "hover:bg-[#393c43]",
                  isCallActive ? "bg-green-600 hover:bg-green-700" : ""
                )}
              >
                {isCallActive ? (
                  <PhoneOff className="w-5 h-5 text-white" />
                ) : (
                  <Phone className="w-5 h-5 text-gray-400" />
                )}
              </Button>

              {channel.type === 'video' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-[#393c43]"
                >
                  <Video className="w-5 h-5 text-gray-400" />
                </Button>
              )}
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMemberList(!showMemberList)}
            className="hover:bg-[#393c43]"
          >
            <Users className="w-5 h-5 text-gray-400" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-[#393c43]"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-0">
            {/* Channel Welcome Message */}
            <div className="p-4 border-b border-[#202225]">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-16 h-16 bg-[#5865f2] rounded-full flex items-center justify-center">
                  <ChannelIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Welcome to #{channel.name}!</h3>
                  <p className="text-gray-400">
                    {channel.description || `This is the start of the #${channel.name} channel.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-0">
              {messages.map((message, index) => {
                const showAvatar = index === 0 ||
                  (messages[index - 1] &&
                   (typeof messages[index - 1]?.sender === 'object' ? (messages[index - 1]?.sender as any)?.id : messages[index - 1]?.sender) !==
                   (typeof message.sender === 'object' ? (message.sender as any)?.id : message.sender))

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    showAvatar={showAvatar}
                    className={!showAvatar ? "ml-14" : ""}
                  />
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#202225]">
            <ChatInput
              placeholder={`Message #${channel.name}`}
              onSubmit={handleSendMessage}
              onFileUpload={handleFileUpload}
              channelId={channel.id}
              spaceId={space?.id?.toString()}
              disabled={!isConnected}
            />
          </div>
        </div>

        {/* Member List */}
        {showMemberList && (
          <div className="w-60 bg-[#2f3136] border-l border-[#202225] p-4">
            <div className="text-xs font-semibold text-gray-400 mb-3">
              MEMBERS — {(space as any)?.members?.length || 0}
            </div>

            <div className="space-y-2">
              {(space as any)?.members?.map((member: any) => {
                const memberUser = typeof member === 'object' ? member : null
                return (
                  <div key={memberUser?.id || member} className="flex items-center space-x-2 p-1 rounded hover:bg-[#393c43]">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={
                        memberUser?.profileImage && typeof memberUser.profileImage === 'object'
                          ? memberUser.profileImage.url
                          : undefined
                      } />
                      <AvatarFallback email={memberUser?.email} className="bg-green-600 text-white">
                        {typeof member === 'string' ? 'U' : memberUser?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm text-white">
                        {typeof member === 'string' ? member : memberUser?.email || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-400">Online</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
