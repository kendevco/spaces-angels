"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Settings,
  Hash,
  Volume2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Bell,
  Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/utilities/ui"
import type { Space, User as PayloadUser } from "@/payload-types"

// Local interface for Channel since it doesn't exist in payload-types yet
interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'video'
  description?: string
}

// Extended Space interface for missing properties
interface ExtendedSpace extends Space {
  channels?: Channel[]
  avatar?: {
    url?: string
  } | string
}

interface SpacesSidebarProps {
  spaces: ExtendedSpace[]
  activeSpace?: ExtendedSpace
  activeChannel?: Channel
  currentUser?: PayloadUser
  isCollapsed: boolean
  onToggle: () => void
  onSpaceSelect: (space: ExtendedSpace) => void
  onChannelSelect: (space: ExtendedSpace, channel: Channel) => void
  className?: string
}

export function SpacesSidebar({
  spaces,
  activeSpace,
  activeChannel,
  currentUser,
  isCollapsed,
  onToggle,
  onSpaceSelect,
  onChannelSelect,
  className
}: SpacesSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    textChannels: true,
    voiceChannels: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Get channels for active space
  const getChannelsForSpace = (space: ExtendedSpace): Channel[] => {
    return space.channels || []
  }

  // Collapsed sidebar view
  if (isCollapsed) {
    return (
      <div className={cn("w-16 bg-[#2f3136] flex flex-col items-center py-3", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="mb-4 w-10 h-10 p-0 hover:bg-[#393c43]"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Button>

        {spaces.map((space) => (
          <div
            key={space.id}
            onClick={() => onSpaceSelect(space)}
            className={cn(
              "w-12 h-12 mb-2 rounded-xl flex items-center justify-center cursor-pointer transition-all",
              activeSpace?.id === space.id
                ? "bg-[#5865f2] text-white"
                : "bg-[#36393f] text-gray-300 hover:bg-[#5865f2] hover:text-white"
            )}
          >
            <span className="text-lg font-bold">
              {space.name.charAt(0).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Expanded sidebar view
  return (
    <div className={cn("w-80 bg-[#2f3136] flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 border-b border-[#202225] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={
                activeSpace?.avatar && typeof activeSpace.avatar === 'object'
                  ? activeSpace.avatar.url || undefined
                  : undefined
              } />
              <AvatarFallback className="bg-[#5865f2] text-white text-xs">
                {activeSpace?.name.charAt(0).toUpperCase() || 'S'}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-white truncate">
              {activeSpace?.name || 'Select a Space'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-6 h-6 p-0 hover:bg-[#393c43]"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </Button>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-8 bg-[#202225] border-none text-gray-300 placeholder-gray-500 focus:ring-0 focus:border-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSpace ? (
          <div className="p-2">
            {/* Text Channels */}
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={() => toggleSection('textChannels')}
                className="w-full justify-between p-1 h-6 text-xs font-semibold text-gray-400 hover:text-gray-300"
              >
                <div className="flex items-center space-x-1">
                  {expandedSections.textChannels ?
                    <ChevronDown className="w-3 h-3" /> :
                    <ChevronRight className="w-3 h-3" />
                  }
                  <span>TEXT CHANNELS</span>
                </div>
                <Plus className="w-3 h-3" />
              </Button>

              {expandedSections.textChannels && (
                <div className="ml-2 space-y-0.5">
                  {getChannelsForSpace(activeSpace)
                    .filter(channel => channel.type === 'text')
                    .map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => onChannelSelect(activeSpace, channel)}
                        className={cn(
                          "flex items-center justify-between p-1.5 rounded cursor-pointer text-sm",
                          activeChannel?.id === channel.id
                            ? "bg-[#393c43] text-white"
                            : "text-gray-400 hover:bg-[#393c43] hover:text-gray-300"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4" />
                          <span>{channel.name}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Voice Channels */}
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={() => toggleSection('voiceChannels')}
                className="w-full justify-between p-1 h-6 text-xs font-semibold text-gray-400 hover:text-gray-300"
              >
                <div className="flex items-center space-x-1">
                  {expandedSections.voiceChannels ?
                    <ChevronDown className="w-3 h-3" /> :
                    <ChevronRight className="w-3 h-3" />
                  }
                  <span>VOICE CHANNELS</span>
                </div>
                <Plus className="w-3 h-3" />
              </Button>

              {expandedSections.voiceChannels && (
                <div className="ml-2 space-y-0.5">
                  {getChannelsForSpace(activeSpace)
                    .filter(channel => channel.type === 'voice')
                    .map((channel) => (
                      <div
                        key={channel.id}
                        onClick={() => onChannelSelect(activeSpace, channel)}
                        className={cn(
                          "flex items-center space-x-2 p-1.5 rounded cursor-pointer text-sm",
                          activeChannel?.id === channel.id
                            ? "bg-[#393c43] text-white"
                            : "text-gray-400 hover:bg-[#393c43] hover:text-gray-300"
                        )}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{channel.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-400 mb-2">YOUR SPACES</div>
            {spaces.map((space) => (
              <div
                key={space.id}
                onClick={() => onSpaceSelect(space)}
                className="flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-[#393c43] text-gray-300"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={
                    space.avatar && typeof space.avatar === 'object'
                      ? space.avatar.url || undefined
                      : undefined
                  } />
                  <AvatarFallback className="bg-[#5865f2] text-white">
                    {space.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{space.name}</div>
                  <div className="text-xs text-gray-400">
                    {space.channels?.length || 0} channels
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Panel */}
      <div className="p-2 border-t border-[#202225] bg-[#292b2f]">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={
              currentUser?.profileImage && typeof currentUser.profileImage === 'object'
                ? currentUser.profileImage.url || undefined
                : undefined
            } />
            <AvatarFallback email={currentUser?.email} className="bg-green-600 text-white">
              {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              {currentUser?.email || 'User'}
            </div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-[#393c43]">
              <Mic className="w-4 h-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-[#393c43]">
              <Settings className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
