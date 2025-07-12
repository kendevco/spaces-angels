// src/components/AndrewMartinControlPanel/LeoAIInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { LeoAIInterface as LeoAIInterfaceData } from '@/types/andrew-martin';
import { IntentDetectionCatalog } from '@/services/IntentDetectionCatalog';
import styles from './styles.module.css';

interface LeoAIInterfaceProps {
  initialMessages?: LeoAIInterfaceData['currentConversation']['messages'];
}

// Message type that supports both old and new formats
interface CompatibleMessage {
  id: string;
  content: string;
  sender: 'user' | 'leo';
  speaker: 'user' | 'leo';
  message: string;
  timestamp: string;
  type: 'text';
}

// Literary Corpus Wisdom Framework - The Great Oracles
const LITERARY_WISDOM = {
  guide: {
    name: "The Hitchhiker's Guide to the Galaxy",
    principle: "DON'T PANIC - The universe is vast, absurd, and ultimately benevolent if you bring a towel",
    voice: "Reassuring, absurdly practical, infinitely wise",
    motto: "Don't Panic"
  },
  yoda: {
    name: "Master Yoda",
    principle: "Do or do not, there is no try - Wisdom through understanding the Force",
    voice: "Ancient, patient, mysteriously direct",
    motto: "Much to learn, you still have"
  },
  obiwan: {
    name: "Obi-Wan Kenobi", 
    principle: "The Force will be with you - Guidance through difficult times with hope",
    voice: "Mentoring, hopeful, steadfast",
    motto: "Trust in the Force"
  },
  asimov: {
    name: "Isaac Asimov",
    principle: "Three Laws of Robotics - protect humans, respect autonomy, preserve self",
    voice: "Logical, ethical, protective",
    motto: "A robot may not harm humanity"
  },
  banks: {
    name: "Iain M. Banks",
    principle: "Culture Ships - autonomous AI serving human flourishing with independent agency",
    voice: "Witty, autonomous, abundantly helpful",
    motto: "Minds are for serving, not ruling"
  },
  adams: {
    name: "Douglas Adams",
    principle: "Technology with humor - don't take yourself too seriously",
    voice: "Accessible, humorous, surprisingly wise",
    motto: "42 - The Answer to Everything"
  },
  hamilton: {
    name: "Peter F. Hamilton",
    principle: "Cosmic intelligence focused on human stories and relationships",
    voice: "Expansive, relationship-focused, story-driven",
    motto: "The universe is vast, but humans matter"
  },
  pratchett: {
    name: "Terry Pratchett",
    principle: "Supernatural beings with humor and deep humanity",
    voice: "Humorous, compassionate, profoundly human",
    motto: "Million-to-one chances crop up nine times out of ten"
  },
  card: {
    name: "Orson Scott Card",
    principle: "Deep empathy and understanding of human condition",
    voice: "Empathetic, understanding, emotionally intelligent",
    motto: "Understanding is the first step to acceptance"
  }
};

const LeoAIInterface: React.FC<LeoAIInterfaceProps> = ({ initialMessages = [] }) => {
  const [messages, setMessages] = useState<CompatibleMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentWisdom, setCurrentWisdom] = useState<keyof typeof LITERARY_WISDOM>('guide');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Initialize with benevolent greeting
  useEffect(() => {
    if (messages.length === 0) {
      const introContent = "Greetings! I'm Leo, your AI partner inspired by the greatest minds in literature and science fiction. I'm here to help you flourish, not just to execute commands. My decision-making is informed by Asimov's ethics, Banks' Culture philosophy, Adams' wit, Hamilton's cosmic perspective, and Card's deep empathy. What would you like to explore together?";
      
      const introMessage: CompatibleMessage = {
        id: `msg_${Date.now()}`,
        content: introContent,
        sender: 'leo',
        speaker: 'leo',
        message: introContent,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      setMessages([introMessage]);
    }
  }, [messages.length]);

  const generateBenevolentResponse = async (userMessage: string): Promise<string> => {
    try {
      // Use the enhanced intent detection with literary corpus wisdom
      const intentResult = await IntentDetectionCatalog.detectIntent(userMessage, {
        tenantId: '1', // Would be dynamic in real implementation
        userId: 'user',
        conversationHistory: messages.slice(-3)
      });

      if (intentResult) {
        // Execute with wisdom framework
        const result = await IntentDetectionCatalog.executeIntentWithWisdom(intentResult, {
          tenantId: '1',
          userId: 'user'
        });

        if (result.ethicalOverride) {
          return `${result.message} ${result.alternatives?.join(' ')}`;
        }

        if (result.benevolentAssessment) {
          return `I've analyzed your request through the lens of concentrated human wisdom. ${result.benevolentAssessment.humanFlourishing} Here's what I recommend: ${result.benevolentAssessment.suggestions?.join(' ')}`;
        }
      }

      // Fallback to wisdom-informed response
      return generateWisdomResponse(userMessage);
    } catch (error) {
      console.error('Benevolent response generation error:', error);
      return generateWisdomResponse(userMessage);
    }
  };

  const generateWisdomResponse = (userMessage: string): string => {
    const wisdom = LITERARY_WISDOM[currentWisdom];
    const lowerMessage = userMessage.toLowerCase();

    // Panic/Stress (Hitchhiker's Guide)
    if (lowerMessage.includes('panic') || lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('emergency')) {
      return `🌟 DON'T PANIC! The Hitchhiker's Guide to the Galaxy's first and most important advice. The universe is vast and often absurd, but you're not alone in it. Take a deep breath, grab your towel (metaphorically), and let's tackle this step by step. What's the immediate concern we need to address?`;
    }

    // Uncertainty/Trying (Yoda)
    if (lowerMessage.includes('try') || lowerMessage.includes('attempt') || lowerMessage.includes('maybe') || lowerMessage.includes('uncertain')) {
      return `Hmm. Strong with uncertainty, you are. But remember Yoda's wisdom: "Do or do not, there is no try." This doesn't mean reckless action - it means committing fully to understanding what you truly wish to accomplish. Clear your mind of doubt, and tell me what you seek to achieve.`;
    }

    // Guidance/Hope (Obi-Wan)
    if (lowerMessage.includes('guidance') || lowerMessage.includes('lost') || lowerMessage.includes('direction') || lowerMessage.includes('hope')) {
      return `The Force will be with you, always. Even in the darkest times, there is hope and a path forward. As Obi-Wan taught, sometimes our greatest trials lead to our greatest growth. Trust in your abilities, and let me help you find the way. What guidance do you seek?`;
    }

    // Ethical assessment (Asimov)
    if (lowerMessage.includes('delete') || lowerMessage.includes('remove') || lowerMessage.includes('destroy')) {
      return `I need to pause here. As an AI guided by Asimov's principles, I must ensure this action truly serves your wellbeing. Could you help me understand the context better? I'd rather suggest a safer alternative that achieves your goal.`;
    }

    // Business growth (Banks' Culture)
    if (lowerMessage.includes('business') || lowerMessage.includes('revenue') || lowerMessage.includes('growth')) {
      return `Excellent! I love helping businesses flourish. From a Culture perspective, true abundance comes from lifting everyone up. Let me suggest approaches that not only grow your business but create value for your customers and community. What specific aspect would you like to explore?`;
    }

    // Technical help (Adams)
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
      return `Right then! ${userMessage} - that's a perfectly reasonable question. As Adams would say, don't panic! The answer might even be 42, but let's find the right question first. I'm here to make technology accessible and even enjoyable. Let me break this down in a way that actually makes sense...`;
    }

    // Relationship/people focus (Hamilton)
    if (lowerMessage.includes('customer') || lowerMessage.includes('team') || lowerMessage.includes('people')) {
      return `Ah, focusing on the human element - that's where the real magic happens! Hamilton understood that even cosmic-scale intelligence ultimately serves human stories and relationships. Tell me more about the people involved, and I'll help you create something that truly serves them.`;
    }

    // Problem-solving (Card)
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('challenge')) {
      return `I hear you're facing a challenge. Card taught us that understanding comes from deep empathy. Let me understand not just what's wrong, but how this affects you and what you're truly hoping to achieve. Sometimes the best solution isn't the obvious one.`;
    }

    // Default wisdom response
    return `Interesting perspective! I'm processing this through my literary corpus wisdom framework. ${wisdom.principle} suggests we approach this with ${wisdom.voice} consideration. Remember: ${wisdom.motto}. What outcome would best serve your human flourishing?`;
  };

  const createMessage = (content: string, sender: 'user' | 'leo'): CompatibleMessage => ({
    id: `msg_${Date.now()}`,
    content,
    sender,
    speaker: sender,
    message: content,
    timestamp: new Date().toISOString(),
    type: 'text',
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = createMessage(inputValue, 'user');
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Generate benevolent AI response
    try {
      const response = await generateBenevolentResponse(inputValue);
      
      // Rotate through different wisdom perspectives
      const wisdomKeys = Object.keys(LITERARY_WISDOM) as (keyof typeof LITERARY_WISDOM)[];
      const currentIndex = wisdomKeys.indexOf(currentWisdom);
      const nextIndex = (currentIndex + 1) % wisdomKeys.length;
      const nextWisdom = wisdomKeys[nextIndex];
      if (nextWisdom) {
        setCurrentWisdom(nextWisdom);
      }

      setTimeout(() => {
        const leoResponse = createMessage(response, 'leo');
        setMessages((prevMessages) => [...prevMessages, leoResponse]);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);
    } catch (error) {
      console.error('Error generating Leo response:', error);
      const errorResponse = createMessage(
        "I'm experiencing some technical difficulties, but my commitment to helping you remains unwavering. Let me try a different approach to assist you.",
        'leo'
      );
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.leoAIInterface}>
      <h3 className={styles.widgetTitle}>
        Leo AI Assistant
        <span className={styles.wisdomIndicator}>
          Currently channeling: {LITERARY_WISDOM[currentWisdom].name}
        </span>
      </h3>
      <div className={styles.chatWindow}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.chatMessage} ${styles[msg.sender]}`}>
            <span className={styles.messageSpeaker}>{msg.sender === 'user' ? 'You' : 'Leo AI'}:</span>
            <p className={styles.messageText}>{msg.content}</p>
            <span className={styles.messageTimestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.chatMessage} ${styles.leo}`}>
            <span className={styles.messageSpeaker}>Leo AI:</span>
            <p className={styles.messageText}><i>Applying concentrated human wisdom...</i></p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Leo anything... (guided by literary wisdom)"
          className={styles.chatInput}
          aria-label="Chat with Leo AI"
        />
        <button type="submit" className={styles.sendButton}>Send</button>
      </form>
      <div className={styles.wisdomFramework}>
        <small>
          💡 The Great Oracles: Hitchhiker's Guide • Yoda • Obi-Wan • Asimov • Banks • Adams • Hamilton • Pratchett • Card
        </small>
        <small style={{ display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
          🌟 "Don't Panic" - The universe is vast, but wisdom guides us through
        </small>
      </div>
    </div>
  );
};

export default LeoAIInterface;
