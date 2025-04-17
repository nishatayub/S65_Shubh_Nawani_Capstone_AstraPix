import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Loader2, Bot, Mail } from 'lucide-react';
import axios from 'axios';

const systemPrompt = `AstraPix is a cutting-edge AI image generation platform that combines the power of DALL-E 3 and Stable Diffusion XL. Key features:

1. Image Generation:
- Ultra-high resolution up to 8K
- Multiple art styles and photorealistic options
- Real-time preview and variations
- Custom style training

2. Pricing Plans:
- Starter (Free): 15 generations/month, 720p
- Creator (₹999): 150 generations/month, 2K resolution
- Professional (₹2,499): 500 generations/month, 4K resolution
- Enterprise: Custom solutions, 8K resolution

3. Technical Features:
- Cloud-based processing
- Secure storage and encryption
- Commercial licensing
- API access (Enterprise)

4. Usage:
- Simple text-to-image interface
- Style customization
- Batch processing
- Export in multiple formats

Please help users navigate these features and provide specific, accurate information about AstraPix's capabilities.`;

const suggestedPrompts = [
  {
    category: "Getting Started",
    prompts: [
      "How do I create my first image?",
      "What's included in the free plan?",
      "How to choose art styles?",
    ]
  },
  {
    category: "Features",
    prompts: [
      "Compare DALL-E vs Stable Diffusion",
      "Maximum resolution options",
      "Available export formats",
    ]
  },
  {
    category: "Pricing",
    prompts: [
      "Explain all pricing plans",
      "Enterprise features",
      "Payment methods accepted",
    ]
  }
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      content: 'Hi! I\'m AstraBot 👋 How can I assist you today?',
      timestamp: new Date()
    },
    {
      type: 'bot',
      content: 'I can help you with image generation, pricing plans, and technical features. Feel free to ask anything!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  const handleSend = async (messageContent = inputMessage.trim()) => {
    if (!messageContent || isLoading) return;

    const userMessage = { type: 'user', content: messageContent, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URI}/api/chat`,
        { 
          message: messageContent,
          systemPrompt: systemPrompt
        },
        { timeout: 10000 }
      );

      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: response.data.reply, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again later.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSuggestedPrompt = (prompt) => {
    setInputMessage(prompt);
    handleSend(prompt);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-2 sm:right-4 bottom-20 z-50 w-[90vw] sm:w-[380px] h-[480px] bg-black/90 backdrop-blur-lg rounded-xl border border-purple-500/30 shadow-lg overflow-hidden cursor-default max-w-full"
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-600/20 to-pink-600/20">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <h3 className="text-sm sm:text-base text-white font-medium">AstraBot</h3>
                {isTyping && (
                  <span className="text-xs text-purple-400 animate-pulse">typing...</span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer touch-manipulation"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex flex-col h-[calc(100%-64px)]">
              {/* Messages */}
              <div ref={chatRef} className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent cursor-default">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-white/90'
                      }`}
                    >
                      <div className="text-xs sm:text-sm">{message.content}</div>
                      <div className="text-[10px] sm:text-xs text-white/50 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2">
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-purple-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Suggestions */}
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black/50 border-t border-white/5">
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
                  {suggestedPrompts.flatMap(category => 
                    category.prompts.map((prompt, index) => (
                      <button
                        key={`${category.category}-${index}`}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs sm:text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap cursor-pointer touch-manipulation"
                      >
                        {prompt}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Input Area with Support Link */}
              <div className="p-3 sm:p-4 border-t border-white/10 bg-black/50">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <a
                    href="mailto:shunaw2006@gmail.com?subject=AstraPix Support"
                    className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 hover:bg-white/10 rounded-full text-xs sm:text-sm text-white/70 hover:text-white transition-colors cursor-pointer touch-manipulation"
                    aria-label="Contact Support via Email"
                  >
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Contact Support</span>
                  </a>
                </div>
                
                <div className="flex space-x-1.5 sm:space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything about AstraPix..."
                    className="flex-1 bg-white/10 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-text"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-1.5 sm:p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-white transition-colors cursor-pointer touch-manipulation"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-3 sm:right-4 bottom-3 sm:bottom-4 z-50 p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white shadow-lg hover:shadow-purple-500/25 transition-shadow cursor-pointer touch-manipulation"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </motion.button>
    </>
  );
};

export default ChatBot;
