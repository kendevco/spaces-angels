// Message Processor Utility - Task 004
// Handles rich JSON content processing, widget extraction, and content validation

import { 
  MessageContent, 
  MessageProcessingResult, 
  MessageWidget, 
  MessageAttachment,
  MessageMention,
  MessageLink,
  MessageType 
} from '../types/messages'

export class MessageProcessor {
  
  /**
   * Process raw message content into structured MessageContent
   */
  async processMessage(
    rawContent: string | object, 
    messageType: MessageType,
    context?: Record<string, any>
  ): Promise<MessageProcessingResult> {
    try {
      const processedContent = await this.parseContent(rawContent, messageType)
      const extractedData = await this.extractMetadata(processedContent)
      
      return {
        success: true,
        processedContent,
        extractedData,
        errors: [],
        warnings: []
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown processing error'],
        warnings: []
      }
    }
  }

  /**
   * Parse raw content into structured MessageContent
   */
  private async parseContent(rawContent: string | object, messageType: MessageType): Promise<MessageContent> {
    if (typeof rawContent === 'string') {
      return this.parseTextContent(rawContent, messageType)
    } else if (typeof rawContent === 'object' && rawContent !== null) {
      return this.parseObjectContent(rawContent as Record<string, any>)
    }
    
    throw new Error('Invalid content type')
  }

  /**
   * Parse text content and extract structured elements
   */
  private async parseTextContent(text: string, messageType: MessageType): Promise<MessageContent> {
    const content: MessageContent = {
      text,
      metadata: { originalType: messageType }
    }

    // Extract mentions (@username)
    const mentions = this.extractMentions(text)
    if (mentions.length > 0) {
      content.mentions = mentions
    }

    // Extract links
    const links = this.extractLinks(text)
    if (links.length > 0) {
      content.links = links
    }

    // Extract markdown formatting
    if (this.hasMarkdownSyntax(text)) {
      content.markdown = text
      content.html = await this.markdownToHtml(text)
    }

    return content
  }

     /**
    * Parse object content (already structured)
    */
   private async parseObjectContent(obj: Record<string, any>): Promise<MessageContent> {
     const content: MessageContent = {
       text: obj.text || '',
       widgets: obj.widgets || [],
       attachments: obj.attachments || [],
       mentions: obj.mentions || [],
       links: obj.links || [],
       metadata: obj.metadata || {}
     }

     if (obj.html) content.html = obj.html
     if (obj.markdown) content.markdown = obj.markdown

    // Validate widgets
    if (content.widgets) {
      content.widgets = await this.validateWidgets(content.widgets)
    }

    return content
  }

  /**
   * Extract @mentions from text
   */
  private extractMentions(text: string): MessageMention[] {
    const mentionRegex = /@(\w+)/g
    const mentions: MessageMention[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
             mentions.push({
         id: `mention_${Date.now()}_${mentions.length}`,
         type: 'user',
         name: match[1],
         displayName: match[1],
         startIndex: match.index ?? 0,
         endIndex: (match.index ?? 0) + match[0].length
       })
    }

    return mentions
  }

  /**
   * Extract links from text
   */
  private extractLinks(text: string): MessageLink[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const links: MessageLink[] = []
    let match

         while ((match = urlRegex.exec(text)) !== null) {
       const url = match[1]
       const domain = this.extractDomain(url)
       
       links.push({
         url,
         domain,
         startIndex: match.index ?? 0,
         endIndex: (match.index ?? 0) + match[0].length
       })
     }

    return links
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return 'unknown'
    }
  }

  /**
   * Check if text contains markdown syntax
   */
  private hasMarkdownSyntax(text: string): boolean {
    const markdownPatterns = [
      /\*\*.*?\*\*/, // Bold
      /\*.*?\*/, // Italic
      /`.*?`/, // Code
      /^#{1,6}\s/, // Headers
      /^\*\s/, // Lists
      /^\d+\.\s/, // Numbered lists
      /\[.*?\]\(.*?\)/ // Links
    ]

    return markdownPatterns.some(pattern => pattern.test(text))
  }

  /**
   * Convert markdown to HTML (stub implementation)
   */
  private async markdownToHtml(markdown: string): Promise<string> {
    // TODO: Implement actual markdown to HTML conversion
    // This is a simple stub for now
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
  }

  /**
   * Validate and sanitize widgets
   */
  private async validateWidgets(widgets: MessageWidget[]): Promise<MessageWidget[]> {
    const validatedWidgets: MessageWidget[] = []

    for (const widget of widgets) {
      if (this.isValidWidget(widget)) {
        validatedWidgets.push(await this.sanitizeWidget(widget))
      }
    }

    return validatedWidgets
  }

  /**
   * Check if widget is valid
   */
  private isValidWidget(widget: MessageWidget): boolean {
    return !!(
      widget.id &&
      widget.type &&
      widget.data &&
      typeof widget.data === 'object'
    )
  }

  /**
   * Sanitize widget data
   */
  private async sanitizeWidget(widget: MessageWidget): Promise<MessageWidget> {
    // TODO: Implement proper widget sanitization
    // Remove potentially dangerous properties, validate data structure
    return {
      ...widget,
      data: this.sanitizeObject(widget.data)
    }
  }

  /**
   * Sanitize object data
   */
  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip potentially dangerous properties
      if (key.startsWith('__') || key.includes('script') || key.includes('eval')) {
        continue
      }
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  /**
   * Sanitize string content
   */
  private sanitizeString(str: string): string {
    // Remove potentially dangerous HTML/JS
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }

  /**
   * Extract metadata from processed content
   */
  private async extractMetadata(content: MessageContent): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {
      hasText: !!(content.text && content.text.trim()),
      hasMarkdown: !!content.markdown,
      hasHtml: !!content.html,
      hasWidgets: !!(content.widgets && content.widgets.length > 0),
      hasAttachments: !!(content.attachments && content.attachments.length > 0),
      hasMentions: !!(content.mentions && content.mentions.length > 0),
      hasLinks: !!(content.links && content.links.length > 0),
      wordCount: content.text ? content.text.split(/\s+/).length : 0,
      characterCount: content.text ? content.text.length : 0
    }

    if (content.widgets) {
      metadata.widgetTypes = content.widgets.map(w => w.type)
      metadata.interactiveWidgets = content.widgets.filter(w => w.interactive).length
    }

    if (content.links) {
      metadata.domains = [...new Set(content.links.map(l => l.domain))]
    }

    return metadata
  }

  /**
   * Process message for search indexing
   */
  async processForSearch(content: MessageContent): Promise<string> {
    const searchableText: string[] = []

    if (content.text) {
      searchableText.push(content.text)
    }

    if (content.mentions) {
      searchableText.push(...content.mentions.map(m => m.displayName || m.name))
    }

    if (content.widgets) {
      searchableText.push(...content.widgets.map(w => w.title || '').filter(Boolean))
    }

    return searchableText.join(' ').toLowerCase()
  }

  /**
   * Generate content preview
   */
  async generatePreview(content: MessageContent, maxLength: number = 150): Promise<string> {
    if (!content.text) {
      if (content.widgets && content.widgets.length > 0) {
        return `[${content.widgets[0].type.toUpperCase()}] ${content.widgets[0].title || 'Interactive content'}`
      }
      if (content.attachments && content.attachments.length > 0) {
        return `[ATTACHMENT] ${content.attachments.length} file(s)`
      }
      return '[No text content]'
    }

    const preview = content.text.substring(0, maxLength)
    return preview.length < content.text.length ? preview + '...' : preview
  }
}

export default MessageProcessor 