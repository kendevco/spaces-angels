// src/components/AndrewMartinControlPanel/LeoAIInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { LeoAIInterface as LeoAIInterfaceData } from '@/types/andrew-martin'; // Using the specific type
import styles from './styles.module.css';

interface LeoAIInterfaceProps {
  initialMessages?: LeoAIInterfaceData['conversationHistory']; // Making it optional
}

const LeoAIInterface: React.FC<LeoAIInterfaceProps> = ({ initialMessages = [] }) => {
  const [messages, setMessages] = useState<LeoAIInterfaceData['conversationHistory']>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      speaker: 'user' as 'user', // Type assertion
      message: inputValue,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate LEO AI response
    // In a real application, this would be an API call
    setTimeout(() => {
      const leoResponse = {
        speaker: 'leo' as 'leo', // Type assertion
        message: `Thinking about "${userMessage.message}"... Okay, here's a thought: ${Math.random().toString(36).substring(7)}.`,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, leoResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <div className={styles.leoAIInterface}>
      <h3 className={styles.widgetTitle}>Leo AI Assistant</h3>
      <div className={styles.chatWindow}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.chatMessage} ${styles[msg.speaker]}`}>
            <span className={styles.messageSpeaker}>{msg.speaker === 'user' ? 'You' : 'Leo AI'}:</span>
            <p className={styles.messageText}>{msg.message}</p>
            <span className={styles.messageTimestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.chatMessage} ${styles.leo}`}>
            <span className={styles.messageSpeaker}>Leo AI:</span>
            <p className={styles.messageText}><i>typing...</i></p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Leo anything..."
          className={styles.chatInput}
          aria-label="Chat with Leo AI"
        />
        <button type="submit" className={styles.sendButton}>Send</button>
      </form>
    </div>
  );
};

export default LeoAIInterface;
