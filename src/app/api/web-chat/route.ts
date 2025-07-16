import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from '@/services/BusinessAgent'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { action, sessionId, spaceId, message, visitorInfo } = body

    switch (action) {
      case 'start_session':
        return await startChatSession(payload, { sessionId, spaceId, visitorInfo })

      case 'send_message':
        return await sendMessage(payload, { sessionId, message })

      case 'end_session':
        return await endChatSession(payload, { sessionId })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Web chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function startChatSession(payload: any, { sessionId, spaceId, visitorInfo }: any) {
  // Create web chat session
  const session = await payload.create({
    collection: 'webChatSessions',
    data: {
      sessionId,
      space: spaceId,
      status: 'active',
      visitorInfo,
      analytics: {
        startTime: new Date().toISOString(),
        messageCount: 0,
      }
    }
  })

  // Get space for tenant context
  const space = await payload.findByID({
    collection: 'spaces',
    id: spaceId,
  })

  return NextResponse.json({
    success: true,
    sessionId: session.sessionId,
    spaceId,
    tenantId: space.tenant,
    message: 'Chat session started successfully'
  })
}

async function sendMessage(payload: any, { sessionId, message }: any) {
  // Find the chat session
  const sessions = await payload.find({
    collection: 'webChatSessions',
    where: {
      sessionId: { equals: sessionId }
    }
  })

  if (sessions.docs.length === 0) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const session = sessions.docs[0]

  // Create message in Messages collection
  const messageDoc = await payload.create({
    collection: 'messages',
    data: {
      content: message.content,
      messageType: message.fromUser ? 'web_chat' : 'ai_agent',
      space: session.space,
      author: message.fromUser ? null : 1, // System user for AI responses
      channel: 'web-chat',
      businessContext: {
        department: 'support',
        workflow: 'support',
        priority: 'normal',
        customerJourney: 'discovery',
        integrationSource: 'web_widget',
      },
      metadata: {
        webChat: {
          sessionId,
          pageUrl: session.visitorInfo?.pageUrl,
          requiresHumanResponse: message.fromUser,
        }
      },
      timestamp: new Date().toISOString(),
    }
  })

  // Update session with new message
  await payload.update({
    collection: 'webChatSessions',
    id: session.id,
    data: {
      messages: [...(session.messages || []), messageDoc.id],
      analytics: {
        ...session.analytics,
        messageCount: (session.analytics?.messageCount || 0) + 1,
      }
    }
  })

  // Process with BusinessAgent if from user
  if (message.fromUser) {
    try {
      const agent = new BusinessAgent(session.space.tenant, 'friendly')
      const analysis = await agent.processMessage(messageDoc)

      // If AI should respond, it will create its own message
      return NextResponse.json({
        success: true,
        messageId: messageDoc.id,
        analysis,
        requiresHumanResponse: analysis.priority === 'urgent' || analysis.intent === 'complaint'
      })
    } catch (error) {
      console.error('BusinessAgent processing error:', error)
    }
  }

  return NextResponse.json({
    success: true,
    messageId: messageDoc.id
  })
}

async function endChatSession(payload: any, { sessionId }: any) {
  const sessions = await payload.find({
    collection: 'webChatSessions',
    where: {
      sessionId: { equals: sessionId }
    }
  })

  if (sessions.docs.length === 0) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const session = sessions.docs[0]
  const endTime = new Date()
  const startTime = new Date(session.analytics?.startTime || session.createdAt)
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

  await payload.update({
    collection: 'webChatSessions',
    id: session.id,
    data: {
      status: 'resolved',
      analytics: {
        ...session.analytics,
        endTime: endTime.toISOString(),
        duration,
      }
    }
  })

  return NextResponse.json({
    success: true,
    sessionId,
    duration,
    message: 'Chat session ended successfully'
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const sessions = await payload.find({
      collection: 'webChatSessions',
      where: {
        sessionId: { equals: sessionId }
      },
      depth: 2,
    })

    if (sessions.docs.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const session = sessions.docs[0]

    // Get messages for this session
    const messages = await payload.find({
      collection: 'messages',
      where: {
        id: { in: session?.messages || [] }
      },
      sort: 'createdAt',
      depth: 1,
    })

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        messages: messages.docs,
      }
    })
  } catch (error) {
    console.error('Web chat GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
