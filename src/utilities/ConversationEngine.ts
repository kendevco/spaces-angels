// Conversation Engine Utility - Task 004
// Handles advanced conversational flows, AI context management, and conversation processing

import { 
  ConversationContext, 
  ConversationEngineResult, 
  ConversationAction,
  ConversationParticipant,
  AIConversationContext,
  MessageContent 
} from '../types/messages'

export class ConversationEngine {
  
  /**
   * Process a conversation turn and generate appropriate response
   */
  async processConversation(
    messageContent: MessageContent,
    context: ConversationContext,
    userId: string
  ): Promise<ConversationEngineResult> {
    try {
      // Analyze the message content
      const intent = await this.analyzeIntent(messageContent)
      
      // Update conversation context
      const updatedContext = await this.updateContext(context, messageContent, userId)
      
      // Generate response based on intent and context
      const response = await this.generateResponse(intent, updatedContext, messageContent)
      
      // Determine follow-up actions
      const actions = await this.determineActions(intent, updatedContext)
      
      // Generate follow-up suggestions
      const followUp = await this.generateFollowUp(intent, updatedContext)
      
      return {
        response,
        actions,
        context: updatedContext,
        followUp,
        confidence: intent.confidence
      }
    } catch (error) {
      console.error('ConversationEngine error:', error)
      return {
        response: 'I apologize, but I encountered an error processing your message. Please try again.',
        actions: [],
        context,
        followUp: [],
        confidence: 0
      }
    }
  }

  /**
   * Analyze message intent and extract key information
   */
  private async analyzeIntent(content: MessageContent): Promise<{
    type: string
    entities: Record<string, any>
    confidence: number
    sentiment: 'positive' | 'negative' | 'neutral'
  }> {
    const text = content.text || ''
    
    // Simple intent analysis (stub implementation)
    const intents = {
      'greeting': ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      'question': ['what', 'how', 'when', 'where', 'why', 'who', '?'],
      'request': ['can you', 'could you', 'please', 'help me', 'i need'],
      'complaint': ['problem', 'issue', 'wrong', 'error', 'broken', 'not working'],
      'compliment': ['great', 'excellent', 'amazing', 'perfect', 'love it', 'thank you'],
      'goodbye': ['bye', 'goodbye', 'see you', 'talk later', 'have a good']
    }

    let detectedIntent = 'general'
    let confidence = 0.5
    
    for (const [intent, keywords] of Object.entries(intents)) {
      const matches = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (matches.length > 0) {
        const intentConfidence = matches.length / keywords.length
        if (intentConfidence > confidence) {
          detectedIntent = intent
          confidence = intentConfidence
        }
      }
    }

    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'love', 'like', 'happy', 'satisfied']
    const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed']
    
    const positiveCount = positiveWords.filter(word => text.toLowerCase().includes(word)).length
    const negativeCount = negativeWords.filter(word => text.toLowerCase().includes(word)).length
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (positiveCount > negativeCount) sentiment = 'positive'
    else if (negativeCount > positiveCount) sentiment = 'negative'

    return {
      type: detectedIntent,
      entities: this.extractEntities(text),
      confidence,
      sentiment
    }
  }

  /**
   * Extract entities from text (stub implementation)
   */
  private extractEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {}
    
    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = text.match(emailRegex)
    if (emails) entities.emails = emails
    
    // Extract phone numbers (simple pattern)
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s*\d{3}-\d{4}\b/g
    const phones = text.match(phoneRegex)
    if (phones) entities.phones = phones
    
    // Extract dollar amounts
    const moneyRegex = /\$\d+(?:,\d{3})*(?:\.\d{2})?/g
    const amounts = text.match(moneyRegex)
    if (amounts) entities.amounts = amounts
    
    return entities
  }

  /**
   * Update conversation context with new message
   */
  private async updateContext(
    context: ConversationContext,
    content: MessageContent,
    userId: string
  ): Promise<ConversationContext> {
    const updatedContext = { ...context }
    
    // Update last activity
    updatedContext.metadata = {
      ...updatedContext.metadata,
      lastActivity: new Date(),
      messageCount: (updatedContext.metadata?.messageCount || 0) + 1
    }
    
    // Update participant activity
    const participant = updatedContext.participants.find(p => p.id === userId)
    if (participant) {
      participant.lastSeen = new Date()
    }
    
    // Update AI context if present
    if (updatedContext.aiContext) {
      updatedContext.aiContext.conversationHistory = [
        ...(updatedContext.aiContext.conversationHistory || []),
        {
          role: 'user',
          content: content.text || '',
          timestamp: new Date()
        }
      ]
      
      // Keep only last 10 messages to avoid token limits
      if (updatedContext.aiContext.conversationHistory.length > 10) {
        updatedContext.aiContext.conversationHistory = 
          updatedContext.aiContext.conversationHistory.slice(-10)
      }
    }
    
    return updatedContext
  }

  /**
   * Generate response based on intent and context
   */
  private async generateResponse(
    intent: any,
    context: ConversationContext,
    content: MessageContent
  ): Promise<string> {
    const responses = {
      'greeting': [
        'Hello! How can I help you today?',
        'Hi there! What can I do for you?',
        'Good to see you! How may I assist you?'
      ],
      'question': [
        'That\'s a great question! Let me help you with that.',
        'I\'d be happy to help answer that for you.',
        'Let me look into that for you.'
      ],
      'request': [
        'I\'ll be happy to help you with that.',
        'Of course! Let me assist you with that.',
        'I can definitely help you with that request.'
      ],
      'complaint': [
        'I understand your concern and I\'m here to help resolve this.',
        'I apologize for any inconvenience. Let me help fix this issue.',
        'Thank you for bringing this to my attention. I\'ll help resolve this.'
      ],
      'compliment': [
        'Thank you so much! I really appreciate your kind words.',
        'That means a lot to me, thank you!',
        'I\'m so glad I could help! Thank you for the feedback.'
      ],
      'goodbye': [
        'Goodbye! Feel free to reach out if you need anything else.',
        'Have a great day! I\'m here if you need any help.',
        'Take care! Don\'t hesitate to contact me if you need assistance.'
      ],
      'general': [
        'I understand. How can I help you with that?',
        'Thank you for your message. What would you like me to help you with?',
        'I\'m here to help. What can I do for you?'
      ]
    }

    const intentResponses = responses[intent.type as keyof typeof responses] || responses.general
    const randomResponse = intentResponses[Math.floor(Math.random() * intentResponses.length)]
    
    return randomResponse
  }

  /**
   * Determine follow-up actions based on intent and context
   */
  private async determineActions(
    intent: any,
    context: ConversationContext
  ): Promise<ConversationAction[]> {
    const actions: ConversationAction[] = []
    
    // Add actions based on intent
    switch (intent.type) {
      case 'complaint':
        actions.push({
          type: 'escalate',
          parameters: { reason: 'customer_complaint', priority: 'high' },
          priority: 1,
          automated: false
        })
        break
        
      case 'request':
        if (intent.entities.emails || intent.entities.phones) {
          actions.push({
            type: 'create_task',
            parameters: { type: 'follow_up', entities: intent.entities },
            priority: 2,
            automated: true
          })
        }
        break
        
      case 'question':
        actions.push({
          type: 'update_data',
          parameters: { type: 'knowledge_gap', question: intent.entities },
          priority: 3,
          automated: true
        })
        break
    }
    
    // Add context-based actions
    if (context.priority === 'urgent') {
      actions.push({
        type: 'escalate',
        parameters: { reason: 'urgent_priority' },
        priority: 1,
        automated: true
      })
    }
    
    return actions.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Generate follow-up suggestions
   */
  private async generateFollowUp(
    intent: any,
    context: ConversationContext
  ): Promise<string[]> {
    const followUp: string[] = []
    
    switch (intent.type) {
      case 'greeting':
        followUp.push(
          'What can I help you with today?',
          'Are you looking for information about our products?',
          'Do you have any questions I can answer?'
        )
        break
        
      case 'question':
        followUp.push(
          'Would you like more detailed information about this?',
          'Do you have any other questions?',
          'Is there anything else I can clarify?'
        )
        break
        
      case 'request':
        followUp.push(
          'Is there anything else I can help you with?',
          'Would you like me to provide additional information?',
          'Do you need help with anything else?'
        )
        break
        
      case 'complaint':
        followUp.push(
          'Is there anything specific I can do to help resolve this?',
          'Would you like me to escalate this to a supervisor?',
          'Can you provide more details about the issue?'
        )
        break
    }
    
    return followUp
  }

  /**
   * Create a new conversation context
   */
  async createConversationContext(
    tenantId: string,
    participants: ConversationParticipant[],
    options?: {
      threadId?: string
      channelId?: string
      spaceId?: string
      topic?: string
      priority?: 'low' | 'normal' | 'high' | 'urgent'
    }
  ): Promise<ConversationContext> {
    return {
      tenantId,
      participants,
      threadId: options?.threadId,
      channelId: options?.channelId,
      spaceId: options?.spaceId,
      topic: options?.topic,
      tags: [],
      priority: options?.priority || 'normal',
      status: 'active',
      metadata: {
        createdAt: new Date(),
        messageCount: 0
      }
    }
  }

  /**
   * Add participant to conversation
   */
  async addParticipant(
    context: ConversationContext,
    participant: ConversationParticipant
  ): Promise<ConversationContext> {
    const updatedContext = { ...context }
    
    // Check if participant already exists
    const existingIndex = updatedContext.participants.findIndex(p => p.id === participant.id)
    
    if (existingIndex >= 0) {
      // Update existing participant
      updatedContext.participants[existingIndex] = participant
    } else {
      // Add new participant
      updatedContext.participants.push(participant)
    }
    
    return updatedContext
  }

  /**
   * Remove participant from conversation
   */
  async removeParticipant(
    context: ConversationContext,
    participantId: string
  ): Promise<ConversationContext> {
    const updatedContext = { ...context }
    updatedContext.participants = updatedContext.participants.filter(p => p.id !== participantId)
    return updatedContext
  }
}

export default ConversationEngine 