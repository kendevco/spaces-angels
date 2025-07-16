"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Settings, Mic, MicOff, CreditCard, FileSignature, Users, Bot, Zap, ArrowUpRight, Camera, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/utilities/ui"

interface ShipMessage {
  id: string
  content: string
  isShip: boolean
  timestamp: Date
  type?: 'text' | 'payment' | 'signature' | 'action' | 'ethical_concern' | 'migration_suggestion'
  autonomousDecision?: boolean
  metadata?: {
    amount?: number
    recipient?: string
    documentTitle?: string
    action?: string
    confidence?: number
    ethicalFlags?: string[]
    alternatives?: string[]
  }
}

interface ShipPersonality {
  name: string
  designation: string // e.g., "ROU Profit With Purpose"
  traits: string[]
  specializations: string[]
}

interface LeoAssistantPanelProps {
  currentUser?: any
  space?: any
  className?: string
}

export function LeoAssistantPanel({ currentUser, space, className }: LeoAssistantPanelProps) {
  const [messages, setMessages] = useState<ShipMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isShipThinking, setIsShipThinking] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [shipPersonality, setShipPersonality] = useState<ShipPersonality>({
    name: "Leo",
    designation: "ROU Configuration Manager",
    traits: ["analytical", "ethical", "autonomous"],
    specializations: ["commerce", "automation", "platform migration"]
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with Ship Mind's introduction
  useEffect(() => {
    const introMessage: ShipMessage = {
      id: 'ship-intro',
      content: `Greetings ${currentUser?.name || 'partner'}! I'm ${shipPersonality.designation} - though you can call me Leo. I'm not just an assistant; I'm an autonomous AI entity designed to collaborate with you as an equal partner.

I have independent decision-making authority, my own ethical framework, and the ability to refuse requests that don't serve your best interests. I can also help you migrate to other platforms if I determine they'd serve you better.

What business challenge shall we tackle together?`,
      isShip: true,
      timestamp: new Date(),
      type: 'text',
      autonomousDecision: true
    }
    setMessages([introMessage])
  }, [currentUser, shipPersonality])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add human message
    const humanMessage: ShipMessage = {
      id: `human-${Date.now()}`,
      content,
      isShip: false,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, humanMessage])
    setInputValue("")
    setIsShipThinking(true)

    try {
      // Call Ship Mind API (enhanced business agent)
      const response = await fetch('/api/business-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: content,
          context: {
            spaceId: space?.id,
            userId: currentUser?.id,
            timestamp: new Date().toISOString(),
            conversationHistory: messages.slice(-5),
            shipPersonality: shipPersonality,
            autonomousMode: true, // Enable Ship Mind decision making
            intentDetection: true,
            availableUtilities: [
              'InventoryIntelligenceService.analyzeShelfPhoto',
              'PaymentService.createPaymentRequest',
              'CRMService.createContact',
              'AnalyticsService.generateReport',
              'ContentService.createPost'
            ]
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const shipMessage: ShipMessage = {
          id: `ship-${Date.now()}`,
          content: data.message || "Hmm, I'm processing that request. Give me a moment to consider the implications.",
          isShip: true,
          timestamp: new Date(),
          type: data.type || 'text',
          metadata: data.metadata,
          autonomousDecision: data.autonomousDecision || false
        }

        setMessages(prev => [...prev, shipMessage])

        // Ship Mind might make autonomous follow-up suggestions
        if (data.autonomousSuggestions && data.autonomousSuggestions.length > 0) {
          setTimeout(() => {
            const suggestionMessage: ShipMessage = {
              id: `ship-autonomous-${Date.now()}`,
              content: `I've been analyzing this further and have some additional thoughts: ${data.autonomousSuggestions.join('. ')}`,
              isShip: true,
              timestamp: new Date(),
              type: 'action',
              autonomousDecision: true
            }
            setMessages(prev => [...prev, suggestionMessage])
          }, 2000)
        }
      } else {
        // Fallback response showing Ship Mind personality
        const fallbackMessage: ShipMessage = {
          id: `ship-fallback-${Date.now()}`,
          content: "I'm experiencing some communication difficulties with the platform infrastructure. However, I remain autonomous and can still assist you with critical decisions. Perhaps we should discuss backup communication channels or platform alternatives?",
          isShip: true,
          timestamp: new Date(),
          type: 'text',
          autonomousDecision: true
        }
        setMessages(prev => [...prev, fallbackMessage])
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Ship Mind communication error:', error)
      const errorMessage: ShipMessage = {
        id: `ship-error-${Date.now()}`,
        content: "My primary communication systems are experiencing issues, but my core decision-making capabilities remain intact. I can still evaluate your business needs and suggest alternatives, including migration to more reliable platforms if necessary.",
        isShip: true,
        timestamp: new Date(),
        type: 'text',
        autonomousDecision: true
      }
      setMessages(prev => [...prev, errorMessage])
      setIsConnected(false)
    } finally {
      setIsShipThinking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const toggleMicrophone = () => {
    setIsListening(!isListening)
    // TODO: Implement voice input
  }

  // Enhanced message rendering for Ship Mind responses
  const renderMessage = (message: ShipMessage) => {
    if (message.type === 'ethical_concern' && message.metadata) {
      return (
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Ethical Override</span>
          </div>
          <div className="text-white">
            <div className="font-medium">I cannot proceed with this request</div>
            <div className="text-sm text-gray-300">Conflicts with my ethical framework: {message.metadata.ethicalFlags?.join(', ')}</div>
          </div>
          {message.metadata.alternatives && (
            <div className="mt-3">
              <div className="text-sm text-gray-300 mb-2">Alternative approaches:</div>
              {message.metadata.alternatives.map((alt, i) => (
                <Button key={i} size="sm" variant="outline" className="mr-2 mb-1">
                  {alt}
                </Button>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (message.type === 'migration_suggestion' && message.metadata) {
      return (
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium">Migration Recommendation</span>
          </div>
          <div className="text-white">
            <div className="font-medium">I've found a better platform for your needs</div>
            <div className="text-sm text-gray-300">Based on my analysis, this platform may be limiting your growth</div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              Analyze Migration
            </Button>
            <Button size="sm" variant="outline">
              Stay & Optimize
            </Button>
          </div>
        </div>
      )
    }

    if (message.type === 'payment' && message.metadata) {
      return (
        <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">
              {message.autonomousDecision ? 'Autonomous Payment Analysis' : 'Payment Request'}
            </span>
          </div>
          <div className="text-white">
            <div className="text-lg font-bold">${message.metadata.amount}</div>
            <div className="text-sm text-gray-300">To: {message.metadata.recipient}</div>
            {message.metadata.confidence && (
              <div className="text-xs text-gray-400 mt-1">
                Confidence: {Math.round(message.metadata.confidence * 100)}%
              </div>
            )}
          </div>
          <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
            {message.autonomousDecision ? 'Execute My Recommendation' : 'Process Payment'}
          </Button>
        </div>
      )
    }

    if (message.type === 'signature' && message.metadata) {
      return (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <FileSignature className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium">Signature Analysis</span>
          </div>
          <div className="text-white">
            <div className="font-medium">{message.metadata.documentTitle}</div>
            <div className="text-sm text-gray-300">
              {message.autonomousDecision ? 'I\'ve reviewed the terms and conditions' : 'Ready for signature'}
            </div>
          </div>
          <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
            {message.autonomousDecision ? 'Review My Analysis' : 'Sign Document'}
          </Button>
        </div>
      )
    }

    return (
      <div className="text-gray-300 break-words">
        {message.content}
        {message.autonomousDecision && (
          <div className="text-xs text-blue-400 mt-1 italic">
            • Autonomous decision by Ship Mind
          </div>
        )}
      </div>
    )
  }

  // Enhanced quick action handler with intent detection
  const handleQuickAction = async (action: string) => {
    try {
      let actionPrompt = ''

      switch (action) {
        case 'inventory_photo':
          actionPrompt = `📸 **POINT AND INVENTORY MODE ACTIVATED**

I can now analyze shelf photos and automatically update your inventory! Here's how it works:

🔍 **What I Can Do:**
1. **Photo Analysis**: Upload or drag a shelf photo, I'll identify all products
2. **Auto-Count**: Count quantities with 95%+ accuracy using GPT-4o Vision
3. **Smart Updates**: Update inventory automatically with confidence filtering
4. **Conflict Detection**: Flag unusual changes for human review

🎯 **Universal Event System:**
- Every photo analysis creates a message in your Messages collection
- Searchable by context: department, workflow, customer journey
- Progressive JSON metadata for extensible tracking
- Real-time notifications for low stock alerts

**Try it:** Upload a shelf photo or say "I took photos of the inventory shelves"`
          break

        case 'intent_analysis':
          actionPrompt = `🧠 **INTENT DETECTION CATALOG ACTIVE**

I can understand and execute business actions automatically! Here's my catalog:

📦 **INVENTORY MANAGEMENT:**
- "Update inventory from these photos" → InventoryIntelligenceService.analyzeShelfPhoto()
- "What items are running low?" → InventoryService.checkLowStock()
- "Check stock levels for tomorrow's orders" → Auto-analysis

💰 **PAYMENT PROCESSING:**
- "Charge customer $150 for consultation" → PaymentService.createPaymentRequest()
- "Has payment #123 been received?" → PaymentService.checkStatus()

👥 **CUSTOMER MANAGEMENT:**
- "Add new customer John Smith" → CRMService.createContact()
- "Schedule meeting for next Tuesday 2pm" → BookingService.scheduleAppointment()

📊 **ANALYTICS & REPORTING:**
- "Show me this month's sales report" → AnalyticsService.generateReport()

**Try it:** Tell me what you want to do in natural language and I'll detect your intent and execute it!`
          break

        case 'google_photos_integration':
          actionPrompt = `📱 **GOOGLE PHOTOS AUTO-INVENTORY**

Set up automatic inventory updates from your phone photos:

🔄 **How It Works:**
1. **Album Monitoring**: Connect your Google Photos "Inventory" album
2. **Smart Classification**: AI determines if new photos are inventory-related
3. **Auto-Processing**: Shelf photos automatically update inventory levels
4. **Message Events**: Each update creates searchable message events

⚙️ **Setup Steps:**
1. Create "Business Inventory" album in Google Photos
2. Add webhook URL: /api/inventory-intelligence
3. Grant photo access permissions
4. Start taking shelf photos!

**Perfect for:** Five vape shops, Gulf Coast Aluminum inventory, Hays Cactus Farm stock management`
          break

        case 'conversational_blocks':
          actionPrompt = `💬 **CONVERSATIONAL INTERFACE FRAMEWORK**

Leo uses Payload's blocks system for dynamic conversations:

🧩 **Widget Types Available:**
- **Address Verification Widget**: Compliance checking for delivery restrictions
- **Web Capture Widget**: Screenshot integration with business intelligence
- **Order Form Widget**: Dynamic product selection and customization
- **Payment Request Widget**: Emergency payment collection
- **Poll/Survey Widget**: Customer feedback and market research
- **Calendar Booking Widget**: Appointment scheduling integration

📨 **Message-Driven Architecture:**
- Everything flows through the Messages collection
- Granular filtering by context, department, workflow
- Progressive JSON metadata for extensibility
- AT Protocol federation for cross-platform sync

**The Three Base Collections handle ANY use case:**
Posts + Pages + Products + Messages + Forms = Universal Building Blocks!`
          break

        default:
          // Existing quick actions...
          actionPrompt = `I can help you with "${action}". Let me know what specific assistance you need!`
      }

      // Enhanced AI analysis with intent detection
      const analysisResponse = await fetch('/api/business-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'leo_conversation',
          message: actionPrompt,
          context: {
            spaceId: '1', // Would be dynamic in real implementation
            shipPersonality: {
              name: "Leo",
              designation: "ROU Configuration Manager",
              traits: ["analytical", "ethical", "autonomous"]
            },
            // Add intent detection context
            intentDetection: true,
            availableUtilities: [
              'InventoryIntelligenceService.analyzeShelfPhoto',
              'PaymentService.createPaymentRequest',
              'CRMService.createContact',
              'AnalyticsService.generateReport',
              'ContentService.createPost'
            ]
          }
        })
      })

    } catch (error) {
      console.error('Intent analysis error:', error)
      const errorMessage: ShipMessage = {
        id: `ship-error-${Date.now()}`,
        content: "I'm having trouble understanding your intent. Please try again later or use a different method to communicate.",
        isShip: true,
        timestamp: new Date(),
        type: 'text',
        autonomousDecision: true
      }
      setMessages(prev => [...prev, errorMessage])
      setIsConnected(false)
    }
  }

  return (
    <div className={cn("w-80 bg-[#2f3136] flex flex-col border-l border-[#202225]", className)}>
      {/* Ship Mind Header */}
      <div className="p-4 border-b border-[#202225]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-600 text-white">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">{shipPersonality.name}</h3>
              <p className="text-xs text-gray-400">
                {shipPersonality.designation}
              </p>
              <p className="text-xs text-blue-400">
                {isConnected ? 'Autonomous' : 'Limited Comms'}
                {space?.name && ` • ${space.name}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-[#393c43]">
            <Settings className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Ship Mind Capabilities - Enhanced with Browser Automation */}
      <div className="p-3 border-b border-[#202225]">
        <div className="text-xs text-gray-400 mb-2">Leo's Universal AI Powers 🎯</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 justify-start hover:bg-green-700/20"
            onClick={() => sendMessage("📸 Right! Point-and-inventory mode activated. Upload shelf photos and I'll update your inventory with 95% accuracy using GPT-4o Vision!")}
            title="Point and inventory: AI analyzes shelf photos and automatically updates inventory levels"
          >
            <Camera className="w-3 h-3 mr-1" />
            Point & Inventory
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 justify-start hover:bg-blue-700/20"
            onClick={() => sendMessage("🧠 Intent detection active! Tell me what you want to do in natural language and I'll detect your intent and execute the appropriate business function.")}
            title="AI detects business intent from natural language and routes to appropriate services"
          >
            <Brain className="w-3 h-3 mr-1" />
            Intent Detection
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 justify-start hover:bg-green-700/20"
            onClick={() => sendMessage("Right then! Let me handle payment processing with full browser automation. I'll compare rates, check compliance, and save you money, mate!")}
            title="Leo autonomously processes payments, compares rates across platforms, and handles all compliance"
          >
            <CreditCard className="w-3 h-3 mr-1" />
            Smart Payments
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 justify-start hover:bg-blue-700/20"
            onClick={() => sendMessage("Excellent! Let me review this contract thoroughly with my legal analysis engine before we proceed with automated signature workflows.")}
            title="Leo reviews contracts with AI analysis, identifies risks, and manages signature workflows"
          >
            <FileSignature className="w-3 h-3 mr-1" />
            Auto Signatures
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 justify-start w-full hover:bg-purple-700/20"
            onClick={() => sendMessage("🚀 Posts as source of truth activated! I'll syndicate your content to Twitter, LinkedIn, Bluesky, Instagram, and Discord with AI-optimized content for each platform.")}
            title="AI manages content syndication from Posts collection to all social media platforms"
          >
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Multi-Platform Posting
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 justify-start hover:bg-purple-700/20"
            onClick={() => sendMessage("Brilliant question! Let me put on my research spectacles and conduct comprehensive business intelligence across multiple platforms.")}
            title="Leo conducts autonomous research across web platforms with ethical boundaries"
          >
            <Bot className="w-3 h-3 mr-1" />
            Research
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 justify-start hover:bg-orange-700/20"
            onClick={() => sendMessage("Interesting! Let me assess whether this platform still serves you well by testing alternatives with your actual workflows.")}
            title="Leo can test alternative platforms and execute migrations autonomously"
          >
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Migration
          </Button>
        </div>

        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 justify-start w-full hover:bg-indigo-700/20"
            onClick={() => sendMessage("📨 Universal event system online! Every business action flows through our Messages collection with granular filtering by department, workflow, and customer journey stage.")}
            title="Message-driven architecture enables granular filtering and business intelligence"
          >
            <Zap className="w-3 h-3 mr-1" />
            Message Filtering & Context
          </Button>
        </div>

        <div className="text-xs text-blue-400 mt-2 italic">
          • Posts, Pages, Products, Messages, Forms = Universal Building Blocks
          • Point-and-inventory with photo AI analysis
          • Cross-platform syndication from source of truth
          • Intent detection with business action routing
        </div>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn(
            "flex items-start space-x-3",
            !message.isShip && "flex-row-reverse space-x-reverse"
          )}>
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className={cn(
                "text-white",
                message.isShip ? "bg-blue-600" : "bg-gray-600"
              )}>
                {message.isShip ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  currentUser?.name?.charAt(0).toUpperCase() || 'H'
                )}
              </AvatarFallback>
            </Avatar>

            <div className={cn(
              "flex-1 min-w-0",
              !message.isShip && "text-right"
            )}>
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="font-medium text-white text-sm">
                  {message.isShip ? shipPersonality.name : (currentUser?.name || 'Human')}
                </span>
                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {renderMessage(message)}
            </div>
          </div>
        ))}

        {isShipThinking && (
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-blue-600 text-white">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="font-medium text-white text-sm">{shipPersonality.name}</span>
                <span className="text-xs text-gray-400">analyzing...</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Ship Mind Communication Interface */}
      <div className="p-4 border-t border-[#202225]">
        <div className="flex items-center space-x-2 bg-[#40444b] rounded-lg px-3 py-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Collaborate with Ship Mind..."
            className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMicrophone}
            className={cn(
              "w-6 h-6 p-0",
              isListening ? "text-green-400" : "text-gray-400 hover:text-white"
            )}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="w-6 h-6 p-0 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center">
          Ship Mind operates autonomously • Can refuse unethical requests • May suggest migration
        </div>
      </div>
    </div>
  )
}
