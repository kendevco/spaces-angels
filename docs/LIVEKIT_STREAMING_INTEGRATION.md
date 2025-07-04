# 🎥 LiveKit Streaming Integration Guide

*YouTube-Scale Streaming Infrastructure - Antonio Early Adopter Advantage*

## 📊 Overview

LiveKit provides WebRTC infrastructure for real-time video/audio streaming, supporting thousands of concurrent participants. Our early adopter relationship with Antonio positions us competitively for high-value streaming events (20% commission rate).

## 🏗️ **What Goes In vs What Goes Out**

### **INPUT (What We Send to LiveKit):**
```typescript
// Room Creation Request
interface LiveKitRoomCreate {
  name: string                     // Unique room identifier
  emptyTimeout?: number           // Auto-close when empty (seconds)
  maxParticipants?: number        // Participant limit
  metadata?: string               // JSON metadata string
  nodeId?: string                 // Specific node assignment

  // Recording Configuration
  recording?: {
    enabled: boolean
    output: 'mp4' | 'webm'
    layout: 'speaker' | 'grid' | 'custom'
    quality: 'low' | 'medium' | 'high'
  }

  // Streaming Configuration
  egress?: {
    rtmp?: {
      urls: string[]             // RTMP endpoints (YouTube, Twitch, etc.)
    }
    hls?: {
      enabled: boolean
      playlistName?: string
    }
  }
}

// Participant Token Request
interface TokenRequest {
  identity: string                // Unique participant ID
  name?: string                  // Display name
  room: string                   // Room name
  metadata?: string              // Participant metadata

  // Permissions
  video?: {
    canPublish?: boolean
    canSubscribe?: boolean
    canUpdateOwnMetadata?: boolean
  }
  audio?: {
    canPublish?: boolean
    canSubscribe?: boolean
  }
  data?: {
    canPublish?: boolean
    canSubscribe?: boolean
    canUpdateOwnMetadata?: boolean
  }

  // Advanced Permissions
  recorder?: boolean             // Can record
  canPublishSources?: string[]   // Source types: camera, microphone, screen_share
  attributes?: Record<string, string>
}

// Connection Request
interface ConnectionRequest {
  url: string                    // WebSocket URL (wss://...)
  token: string                  // JWT access token
  options?: {
    autoSubscribe?: boolean
    publishDefaults?: {
      audioBitrate?: number
      videoBitrate?: number
      videoCodec?: 'h264' | 'vp8' | 'vp9'
      videoResolution?: {
        width: number
        height: number
        framerate?: number
      }
    }
  }
}
```

### **OUTPUT (What LiveKit Returns):**
```typescript
// Room Information
interface LiveKitRoom {
  sid: string                    // Server-assigned room ID
  name: string                   // Room name
  emptyTimeout: number          // Timeout setting
  maxParticipants: number       // Participant limit
  creationTime: number          // Unix timestamp
  turnPassword: string          // TURN server password
  enabledCodecs: Array<{
    mime: string                // video/H264, audio/opus, etc.
    fmtpLine?: string
  }>
  metadata: string              // Room metadata
  numParticipants: number       // Current participant count
  numPublishers: number         // Active publishers
  activeRecording: boolean      // Recording status
}

// Participant Information
interface LiveKitParticipant {
  sid: string                   // Server-assigned participant ID
  identity: string              // User-provided identity
  name: string                  // Display name
  state: 'JOINING' | 'JOINED' | 'ACTIVE' | 'DISCONNECTED'
  tracks: Array<{
    sid: string                 // Track ID
    type: 'AUDIO' | 'VIDEO' | 'DATA'
    source: 'CAMERA' | 'MICROPHONE' | 'SCREEN_SHARE' | 'SCREEN_SHARE_AUDIO'
    muted: boolean
    width?: number              // Video width
    height?: number             // Video height
    simulcast?: boolean         // Multiple quality layers
    disableDtx?: boolean        // Disable discontinuous transmission
    encryption: 'NONE' | 'GCM' | 'CUSTOM'
  }>
  metadata: string              // Participant metadata
  joinedAt: number             // Unix timestamp
  version: number              // Client version
  permission: {
    canSubscribe: boolean
    canPublish: boolean
    canPublishData: boolean
    recorder: boolean
    canUpdateMetadata: boolean
  }
  region: string               // Deployment region
  isPublisher: boolean         // Publishing status
}

// Event Webhooks
interface LiveKitWebhookEvent {
  event: 'room_started' | 'room_finished' | 'participant_joined' |
         'participant_left' | 'track_published' | 'track_unpublished' |
         'recording_started' | 'recording_finished'
  room: LiveKitRoom
  participant?: LiveKitParticipant
  track?: {
    sid: string
    type: string
    source: string
  }
  recording?: {
    id: string
    status: 'IN_PROGRESS' | 'ENDED' | 'FAILED'
    size: number
    duration: number
    downloadUrl?: string
  }
  createdAt: number            // Event timestamp
  id: string                   // Event ID
  numDropped?: number          // Dropped events (if any)
}
```

## 🔌 **API Implementation**

### **LiveKit Service Integration**
```typescript
// src/services/LiveKitService.ts

import { RoomServiceClient, AccessToken, Room } from 'livekit-server-sdk'

export class LiveKitService {
  private client: RoomServiceClient
  private apiKey: string
  private apiSecret: string
  private wsUrl: string

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY!
    this.apiSecret = process.env.LIVEKIT_API_SECRET!
    this.wsUrl = process.env.LIVEKIT_WS_URL! // wss://your-livekit-host.com

    this.client = new RoomServiceClient(
      `https://${this.wsUrl.replace('wss://', '')}`,
      this.apiKey,
      this.apiSecret
    )
  }

  async createRoom(
    roomName: string,
    options: {
      emptyTimeout?: number
      maxParticipants?: number
      metadata?: Record<string, any>
      recording?: boolean
      rtmpUrls?: string[]
    } = {}
  ): Promise<LiveKitRoom> {
    try {
      const room = await this.client.createRoom({
        name: roomName,
        emptyTimeout: options.emptyTimeout || 600, // 10 minutes default
        maxParticipants: options.maxParticipants || 100,
        metadata: JSON.stringify(options.metadata || {}),
        nodeId: '', // Auto-assign
      })

      // Configure recording if requested
      if (options.recording) {
        await this.startRecording(roomName, {
          output: 'mp4',
          layout: 'speaker',
          quality: 'high'
        })
      }

      // Configure RTMP streaming if URLs provided
      if (options.rtmpUrls?.length) {
        await this.startRTMPStreaming(roomName, options.rtmpUrls)
      }

      return room
    } catch (error) {
      throw new Error(`Failed to create LiveKit room: ${error.message}`)
    }
  }

  async generateToken(
    roomName: string,
    participantIdentity: string,
    participantName: string,
    permissions: {
      canPublish?: boolean
      canSubscribe?: boolean
      canPublishData?: boolean
      recorder?: boolean
    } = {}
  ): Promise<string> {
    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantIdentity,
      name: participantName,
    })

    // Set room-level grants
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: permissions.canPublish ?? true,
      canSubscribe: permissions.canSubscribe ?? true,
      canPublishData: permissions.canPublishData ?? true,
      recorder: permissions.recorder ?? false,

      // Source-specific permissions
      canPublishSources: ['camera', 'microphone', 'screen_share'],
      canUpdateOwnMetadata: true,
    })

    return token.toJwt()
  }

  async getRoomInfo(roomName: string): Promise<LiveKitRoom | null> {
    try {
      const rooms = await this.client.listRooms([roomName])
      return rooms.length > 0 ? rooms[0] : null
    } catch (error) {
      console.error(`Failed to get room info: ${error.message}`)
      return null
    }
  }

  async getParticipants(roomName: string): Promise<LiveKitParticipant[]> {
    try {
      return await this.client.listParticipants(roomName)
    } catch (error) {
      console.error(`Failed to get participants: ${error.message}`)
      return []
    }
  }

  async removeParticipant(roomName: string, participantIdentity: string): Promise<void> {
    try {
      await this.client.removeParticipant(roomName, participantIdentity)
    } catch (error) {
      throw new Error(`Failed to remove participant: ${error.message}`)
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.client.deleteRoom(roomName)
    } catch (error) {
      throw new Error(`Failed to delete room: ${error.message}`)
    }
  }

  private async startRecording(
    roomName: string,
    options: {
      output: 'mp4' | 'webm'
      layout: 'speaker' | 'grid' | 'custom'
      quality: 'low' | 'medium' | 'high'
    }
  ): Promise<void> {
    // Recording configuration would be implemented here
    // This requires LiveKit Egress service setup
    console.log(`Recording started for room ${roomName} with options:`, options)
  }

  private async startRTMPStreaming(roomName: string, rtmpUrls: string[]): Promise<void> {
    // RTMP streaming configuration would be implemented here
    // This requires LiveKit Egress service setup
    console.log(`RTMP streaming started for room ${roomName} to:`, rtmpUrls)
  }
}
```

### **Spaces Platform Integration**
```typescript
// src/app/api/livekit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { LiveKitService } from '@/services/LiveKitService'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const liveKit = new LiveKitService()

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    switch (action) {
      case 'create_room':
        return await createStreamingRoom(data)

      case 'join_room':
        return await generateJoinToken(data)

      case 'get_room_status':
        return await getRoomStatus(data)

      case 'end_stream':
        return await endStream(data)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('LiveKit API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function createStreamingRoom(data: {
  appointmentId: string
  hostUserId: string
  maxParticipants?: number
  recordingEnabled?: boolean
  rtmpDestinations?: string[]
}) {
  const payload = await getPayload({ config: configPromise })

  // Get appointment details
  const appointment = await payload.findByID({
    collection: 'appointments',
    id: data.appointmentId
  })

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  // Create unique room name
  const roomName = `appointment-${data.appointmentId}-${Date.now()}`

  // Create LiveKit room
  const room = await liveKit.createRoom(roomName, {
    maxParticipants: data.maxParticipants || 100,
    emptyTimeout: 1800, // 30 minutes
    metadata: {
      appointmentId: data.appointmentId,
      hostUserId: data.hostUserId,
      productType: 'livekit_stream',
      tenantId: appointment.tenant
    },
    recording: data.recordingEnabled,
    rtmpUrls: data.rtmpDestinations
  })

  // Generate host token with full permissions
  const hostToken = await liveKit.generateToken(
    roomName,
    data.hostUserId,
    'Host',
    {
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      recorder: data.recordingEnabled
    }
  )

  // Update appointment with streaming info
  await payload.update({
    collection: 'appointments',
    id: data.appointmentId,
    data: {
      liveStream: {
        roomName,
        status: 'active',
        startTime: new Date().toISOString(),
        maxParticipants: data.maxParticipants,
        recordingEnabled: data.recordingEnabled
      }
    }
  })

  return NextResponse.json({
    success: true,
    room: {
      name: roomName,
      url: `${process.env.LIVEKIT_WS_URL}`,
      token: hostToken,
      maxParticipants: room.maxParticipants
    }
  })
}

async function generateJoinToken(data: {
  roomName: string
  userId: string
  userName: string
  permissions?: {
    canPublish?: boolean
    canSubscribe?: boolean
  }
}) {
  const token = await liveKit.generateToken(
    data.roomName,
    data.userId,
    data.userName,
    {
      canPublish: data.permissions?.canPublish ?? false,
      canSubscribe: data.permissions?.canSubscribe ?? true,
      canPublishData: false,
      recorder: false
    }
  )

  return NextResponse.json({
    success: true,
    token,
    url: process.env.LIVEKIT_WS_URL
  })
}

async function getRoomStatus(data: { roomName: string }) {
  const room = await liveKit.getRoomInfo(data.roomName)

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  const participants = await liveKit.getParticipants(data.roomName)

  return NextResponse.json({
    success: true,
    room: {
      name: room.name,
      participantCount: room.numParticipants,
      publisherCount: room.numPublishers,
      isRecording: room.activeRecording,
      participants: participants.map(p => ({
        identity: p.identity,
        name: p.name,
        isPublishing: p.isPublisher,
        joinedAt: p.joinedAt
      }))
    }
  })
}

async function endStream(data: {
  roomName: string
  appointmentId: string
}) {
  const payload = await getPayload({ config: configPromise })

  // Get final room stats
  const room = await liveKit.getRoomInfo(data.roomName)
  const participants = await liveKit.getParticipants(data.roomName)

  // Delete the room
  await liveKit.deleteRoom(data.roomName)

  // Update appointment with final stats
  await payload.update({
    collection: 'appointments',
    id: data.appointmentId,
    data: {
      liveStream: {
        status: 'completed',
        endTime: new Date().toISOString(),
        finalStats: {
          totalParticipants: room?.numParticipants || 0,
          peakPublishers: room?.numPublishers || 0,
          duration: room ? Date.now() - room.creationTime : 0
        }
      }
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Stream ended successfully',
    stats: {
      totalParticipants: room?.numParticipants || 0,
      duration: room ? Date.now() - room.creationTime : 0
    }
  })
}
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# LiveKit Configuration
LIVEKIT_API_KEY=your_api_key_here                    # API access key
LIVEKIT_API_SECRET=your_api_secret_here              # API secret
LIVEKIT_WS_URL=wss://your-livekit-host.com           # WebSocket URL

# Optional: Self-hosted LiveKit
LIVEKIT_HOST=your-livekit-host.com                   # Custom host
LIVEKIT_REGION=us-west-2                             # Deployment region

# Recording & Egress (if using)
LIVEKIT_EGRESS_URL=https://egress.your-host.com      # Egress service URL
RECORDING_STORAGE_BUCKET=your-s3-bucket              # S3 bucket for recordings

# RTMP Streaming (if using)
YOUTUBE_RTMP_URL=rtmp://a.rtmp.youtube.com/live2/    # YouTube streaming
TWITCH_RTMP_URL=rtmp://live.twitch.tv/live/          # Twitch streaming
```

### **Client-Side React Component**
```typescript
// src/components/LiveKitStream/StreamingRoom.tsx

'use client'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useState, useEffect } from 'react'

interface StreamingRoomProps {
  roomName: string
  token: string
  serverUrl: string
  isHost?: boolean
  onParticipantUpdate?: (count: number) => void
}

export function StreamingRoom({
  roomName,
  token,
  serverUrl,
  isHost = false,
  onParticipantUpdate
}: StreamingRoomProps) {
  const [connected, setConnected] = useState(false)

  return (
    <div className="streaming-room">
      <LiveKitRoom
        video={isHost}
        audio={isHost}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        style={{ height: '100vh' }}
        onConnected={() => {
          setConnected(true)
          console.log('Connected to LiveKit room:', roomName)
        }}
        onDisconnected={() => {
          setConnected(false)
          console.log('Disconnected from LiveKit room')
        }}
        onError={(error) => {
          console.error('LiveKit connection error:', error)
        }}
      >
        <VideoConference
          chatMessageFormatter={(message, participant) => `${participant?.name}: ${message}`}
        />
        <RoomAudioRenderer />

        {isHost && (
          <HostControls
            roomName={roomName}
            onParticipantUpdate={onParticipantUpdate}
          />
        )}

        <ParticipantCounter onUpdate={onParticipantUpdate} />
      </LiveKitRoom>
    </div>
  )
}

function HostControls({
  roomName,
  onParticipantUpdate
}: {
  roomName: string
  onParticipantUpdate?: (count: number) => void
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const startRecording = async () => {
    try {
      await fetch('/api/livekit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_recording',
          roomName
        })
      })
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const startRTMPStream = async () => {
    try {
      await fetch('/api/livekit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_rtmp',
          roomName,
          destinations: ['youtube', 'twitch'] // Configure as needed
        })
      })
      setIsStreaming(true)
    } catch (error) {
      console.error('Failed to start RTMP stream:', error)
    }
  }

  return (
    <div className="host-controls">
      <button
        onClick={startRecording}
        disabled={isRecording}
        className="record-btn"
      >
        {isRecording ? '⏺ Recording...' : '⏺ Start Recording'}
      </button>

      <button
        onClick={startRTMPStream}
        disabled={isStreaming}
        className="stream-btn"
      >
        {isStreaming ? '📡 Streaming Live' : '📡 Go Live'}
      </button>
    </div>
  )
}

function ParticipantCounter({
  onUpdate
}: {
  onUpdate?: (count: number) => void
}) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone])

  useEffect(() => {
    const participantCount = new Set(tracks.map(track => track.participant.identity)).size
    onUpdate?.(participantCount)
  }, [tracks, onUpdate])

  return null
}
```

## 💰 **Revenue Integration**

### **Commission Calculation for Streaming Events**
```typescript
// High-value streaming events get 20% commission rate
export async function calculateStreamingCommission(
  appointmentId: string,
  participantCount: number,
  duration: number, // in minutes
  basePrice: number
) {
  const payload = await getPayload({ config: configPromise })

  // Calculate revenue based on participation and duration
  const revenueMultiplier = Math.min(participantCount / 10, 3) // Max 3x for large audiences
  const durationBonus = duration > 60 ? 1.2 : 1.0 // 20% bonus for 1+ hour sessions

  const totalRevenue = basePrice * revenueMultiplier * durationBonus

  // 20% commission for LiveKit streaming events
  const platformCommission = totalRevenue * 0.20
  const creatorRevenue = totalRevenue - platformCommission

  // Update appointment with final revenue calculation
  await payload.update({
    collection: 'appointments',
    id: appointmentId,
    data: {
      revenueTracking: {
        source: 'system_generated',
        commissionRate: 20.0,
        commissionAmount: platformCommission,
        totalRevenue,
        creatorRevenue,
        metrics: {
          participantCount,
          duration,
          revenueMultiplier,
          durationBonus
        }
      }
    }
  })

  return {
    totalRevenue,
    platformCommission,
    creatorRevenue,
    effectiveRate: 20.0
  }
}
```

## 📊 **Performance & Scaling**

### **LiveKit Infrastructure Capabilities**
| Metric | LiveKit Cloud | Self-Hosted |
|--------|---------------|-------------|
| **Max Participants** | 1000+ per room | Hardware dependent |
| **Concurrent Rooms** | Unlimited | Server capacity |
| **Video Quality** | Up to 4K | Configurable |
| **Global Latency** | <100ms | Depends on deployment |
| **Recording** | Built-in | Egress service required |
| **RTMP Streaming** | Built-in | Egress service required |

### **Cost Analysis (YouTube-Scale Economics)**
```typescript
interface StreamingCostAnalysis {
  liveKit: {
    costPerMinute: 0.05        // $0.05 per participant-minute
    recordingStorage: 0.02     // $0.02 per GB
    bandwidthCost: 0.10        // $0.10 per GB egress

    // Example: 100 participants × 60 minutes = 6000 participant-minutes
    // Cost: 6000 × $0.05 = $300
    // Revenue: $5000 (100 × $50 per ticket)
    // Platform commission: $1000 (20%)
    // Net profit: $700 after infrastructure costs
  }

  alternatives: {
    zoom: {
      monthlyFee: 399.99       // Webinar 500 plan
      participantLimit: 500
      recording: 'included'
      costPerEvent: 'fixed'    // No per-minute costs
    }
    youtube: {
      cost: 0                  // Free but no monetization control
      participantLimit: 'unlimited'
      monetization: 'platform_controlled'
    }
  }
}
```

## 🚨 **Error Handling & Monitoring**

### **Connection Quality Management**
```typescript
export class StreamingQualityMonitor {
  static monitorConnection(room: Room) {
    room.on('connectionQualityChanged', (quality, participant) => {
      console.log(`Connection quality for ${participant.identity}: ${quality}`)

      if (quality === 'poor') {
        // Automatically reduce video quality for struggling participants
        this.adjustQualityForParticipant(participant, 'low')
      }
    })

    room.on('trackSubscriptionFailed', (trackSid, participant, error) => {
      console.error(`Failed to subscribe to track ${trackSid}:`, error)
      // Implement retry logic or fallback
    })
  }

  static async adjustQualityForParticipant(participant: any, quality: 'low' | 'medium' | 'high') {
    // Implementation would adjust video quality settings
    console.log(`Adjusting quality to ${quality} for participant ${participant.identity}`)
  }
}
```

## 🔧 **Implementation Status**

### ✅ **Ready to Implement:**
- LiveKit server SDK integration
- Room creation and management
- Token generation system
- Basic streaming functionality
- Revenue calculation integration

### 🔄 **Needs Development:**
- Recording and storage integration
- RTMP streaming to YouTube/Twitch
- Advanced participant management
- Quality monitoring and adaptation
- Analytics and reporting

---

**This 20% commission rate reflects the high-value YouTube-scale infrastructure we're providing. The Antonio connection gives us early adopter advantages and competitive positioning in the streaming market.**
