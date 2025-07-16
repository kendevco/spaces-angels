"use client"

import { useState, useEffect } from "react"
import { SpacesSidebar } from "./navigation/SpacesSidebar"
import { SpacesChatArea } from "./chat/SpacesChatArea"
import { LeoAssistantPanel } from "./LeoAssistantPanel"
import { cn } from "@/utilities/ui"
import type { Space, Message, User as PayloadUser } from "@/payload-types"

// Local Channel interface until we have a proper Channels collection
interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'video'
  description?: string
}

// Extended Space interface for missing properties
interface ExtendedSpace extends Space {
  channels?: Channel[]
}

interface SpacesInterfaceProps {
  initialSpaces?: ExtendedSpace[]
  currentUser?: PayloadUser
  initialActiveSpaceId?: string | number
  className?: string
}

export function SpacesInterface({
  initialSpaces = [],
  currentUser,
  initialActiveSpaceId,
  className
}: SpacesInterfaceProps) {
  // State management
  const [spaces, setSpaces] = useState<ExtendedSpace[]>(initialSpaces)
  const [activeSpace, setActiveSpace] = useState<ExtendedSpace | undefined>()
  const [activeChannel, setActiveChannel] = useState<Channel | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [showLeoPanel, setShowLeoPanel] = useState(true)

    // Initialize with specified space or first space if available
  useEffect(() => {
    if (spaces.length > 0 && !activeSpace) {
      let targetSpace = spaces[0]

      // If initialActiveSpaceId is provided, try to find that space
      if (initialActiveSpaceId) {
        const foundSpace = spaces.find(s => s.id === initialActiveSpaceId)
        if (foundSpace) {
          targetSpace = foundSpace
        }
      }

      if (targetSpace) {
        setActiveSpace(targetSpace)

        // Auto-select first text channel
        const firstTextChannel = targetSpace.channels?.find(ch => ch.type === 'text')
        if (firstTextChannel) {
          setActiveChannel(firstTextChannel)
        }
      }
    }
  }, [spaces, activeSpace, initialActiveSpaceId])

  // Load messages when channel changes
  useEffect(() => {
    if (activeChannel?.id) {
      loadMessagesForChannel(activeChannel.id)
    }
  }, [activeChannel])

  const loadSpaces = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/spaces', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setSpaces(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to load spaces:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessagesForChannel = async (channelId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/messages?where[channel][equals]=${channelId}&sort=-createdAt&limit=50`, {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((data.docs || []).reverse()) // Reverse to show oldest first
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpaceSelect = (space: ExtendedSpace) => {
    setActiveSpace(space)

    // Auto-select first text channel in the space
    const firstTextChannel = space.channels?.find(ch => ch.type === 'text')
    if (firstTextChannel) {
      setActiveChannel(firstTextChannel)
    } else {
      setActiveChannel(undefined)
    }
  }

  const handleChannelSelect = (space: ExtendedSpace, channel: Channel) => {
    setActiveSpace(space)
    setActiveChannel(channel)
  }

  const handleSendMessage = async (content: string, channelId: string) => {
    if (!currentUser || !activeSpace) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: [
            {
              type: 'paragraph',
              children: [{ text: content }]
            }
          ],
          summary: content,
          channel: channelId,
          space: activeSpace.id,
          author: currentUser.id,
          businessMetadata: {
            department: 'general',
            priority: 'normal',
          },
          embeds: {
            media: []
          }
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, newMessage])
      } else {
        console.error('Failed to send message:', response.statusText)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsConnected(false)
    }
  }

  const handleFileUpload = async (files: FileList, channelId: string) => {
    if (!currentUser || !activeSpace) return

    // Handle file upload logic here
    // This would typically involve uploading to Payload's media endpoint
    // and then creating a message with the file attachment
    console.log('File upload not yet implemented:', files)
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Load spaces on component mount
  useEffect(() => {
    if (initialSpaces.length === 0) {
      loadSpaces()
    }
  }, [initialSpaces.length])

  return (
    <div className={cn("flex h-screen bg-[#1e2124] text-white", className)}>
      {/* Sidebar */}
      <SpacesSidebar
        spaces={spaces}
        activeSpace={activeSpace}
        activeChannel={activeChannel}
        currentUser={currentUser}
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        onSpaceSelect={handleSpaceSelect}
        onChannelSelect={handleChannelSelect}
      />

      {/* Main Chat Area */}
      <SpacesChatArea
        space={activeSpace}
        channel={activeChannel}
        messages={messages}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isConnected={isConnected}
      />

      {/* Leo Assistant Panel */}
      {showLeoPanel && (
        <LeoAssistantPanel
          currentUser={currentUser}
          space={activeSpace}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#36393f] p-6 rounded-lg text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#5865f2] border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-white">Loading...</div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Reconnecting...</span>
          </div>
        </div>
      )}
    </div>
  )
}
