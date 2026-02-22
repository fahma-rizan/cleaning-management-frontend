import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User as UserIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  serviceLinks?: { id: number; name: string }[];
}

export default function ChatbotFinder() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! 👋 I\'m here to help you find the perfect cleaning service. What would you like to get cleaned today?',
      options: ['Home/Office', 'Shampoo Vacuum', 'Laundry', 'Curtains', 'Not sure'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (sender: 'bot' | 'user', text: string, options?: string[], serviceLinks?: any[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      options,
      serviceLinks,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleOptionClick = (option: string) => {
    addMessage('user', option);

    setTimeout(() => {
      if (option === 'Home/Office') {
        addMessage(
          'bot',
          'Great! Are you looking for a regular cleaning or something more intensive?',
          ['Regular Cleaning', 'Deep Cleaning', 'Office Cleaning']
        );
      } else if (option === 'Regular Cleaning') {
        addMessage(
          'bot',
          'Perfect! I found these services for you:',
          undefined,
          [
            { id: 1, name: 'Home Cleaning - From LKR 2,500' },
            { id: 5, name: 'Office Cleaning - From LKR 5,000' },
          ]
        );
      } else if (option === 'Deep Cleaning') {
        addMessage(
          'bot',
          'Excellent choice! Here\'s our deep cleaning service:',
          undefined,
          [{ id: 6, name: 'Deep Cleaning - From LKR 8,000' }]
        );
      } else if (option === 'Office Cleaning') {
        addMessage(
          'bot',
          'Here\'s our office cleaning service:',
          undefined,
          [{ id: 5, name: 'Office Cleaning - From LKR 5,000' }]
        );
      } else if (option === 'Shampoo Vacuum') {
        addMessage(
          'bot',
          'We offer professional shampoo vacuum services for carpets and upholstery!',
          undefined,
          [{ id: 7, name: 'Shampoo Vacuum - From LKR 5,000' }]
        );
      } else if (option === 'Laundry') {
        addMessage(
          'bot',
          'What type of laundry service do you need?',
          ['Dry Cleaning', 'Washing and Pressing', 'Pressing Only']
        );
      } else if (option === 'Dry Cleaning') {
        addMessage(
          'bot',
          'Perfect! Here\'s our dry cleaning service:',
          undefined,
          [{ id: 9, name: 'Dry Cleaning - From LKR 600/piece' }]
        );
      } else if (option === 'Washing and Pressing') {
        addMessage(
          'bot',
          'Great choice! Here\'s our washing and pressing service:',
          undefined,
          [{ id: 10, name: 'Washing and Pressing - From LKR 400/kg' }]
        );
      } else if (option === 'Pressing Only') {
        addMessage(
          'bot',
          'Here\'s our pressing only service:',
          undefined,
          [{ id: 11, name: 'Pressing Only - From LKR 150/piece' }]
        );
      } else if (option === 'Curtains') {
        addMessage(
          'bot',
          'We provide expert curtain cleaning including removal and reinstallation:',
          undefined,
          [{ id: 4, name: 'Curtain Cleaning - From LKR 1,500' }]
        );
      } else if (option === 'Not sure') {
        addMessage(
          'bot',
          'No problem! Here are all our services. Which one catches your eye?',
          ['Home Cleaning', 'Laundry', 'Furniture', 'Curtains', 'View All Services']
        );
      } else if (option === 'View All Services') {
        addMessage(
          'bot',
          'Here are all our available services:',
          undefined,
          [
            { id: 1, name: 'Home Cleaning - From LKR 2,500' },
            { id: 2, name: 'Laundry Service - From LKR 400/kg' },
            { id: 3, name: 'Sofa & Mattress - From LKR 3,500' },
            { id: 4, name: 'Curtain Cleaning - From LKR 1,500' },
            { id: 5, name: 'Office Cleaning - From LKR 5,000' },
            { id: 6, name: 'Deep Cleaning - From LKR 8,000' },
          ]
        );
      } else if (option === 'Start Over') {
        setMessages([
          {
            id: '1',
            sender: 'bot',
            text: 'Hello! 👋 I\'m here to help you find the perfect cleaning service. What would you like to get cleaned today?',
            options: ['Home/Office', 'Furniture', 'Laundry', 'Curtains', 'Not sure'],
          },
        ]);
      }
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    addMessage('user', inputText);
    const userMessage = inputText.toLowerCase();
    setInputText('');

    setTimeout(() => {
      // Simple keyword-based responses
      if (userMessage.includes('home') || userMessage.includes('house')) {
        addMessage(
          'bot',
          'I found home cleaning services for you:',
          undefined,
          [
            { id: 1, name: 'Home Cleaning - From LKR 2,500' },
            { id: 6, name: 'Deep Cleaning - From LKR 8,000' },
          ]
        );
      } else if (userMessage.includes('laundry') || userMessage.includes('clothes') || userMessage.includes('wash')) {
        addMessage(
          'bot',
          'Here\'s our laundry service:',
          undefined,
          [{ id: 2, name: 'Laundry Service - From LKR 400/kg' }]
        );
      } else if (userMessage.includes('sofa') || userMessage.includes('couch') || userMessage.includes('mattress')) {
        addMessage(
          'bot',
          'Here\'s our furniture cleaning service:',
          undefined,
          [{ id: 3, name: 'Sofa & Mattress Cleaning - From LKR 3,500' }]
        );
      } else if (userMessage.includes('curtain') || userMessage.includes('drape')) {
        addMessage(
          'bot',
          'Here\'s our curtain cleaning service:',
          undefined,
          [{ id: 4, name: 'Curtain Cleaning - From LKR 1,500' }]
        );
      } else if (userMessage.includes('office')) {
        addMessage(
          'bot',
          'Here\'s our office cleaning service:',
          undefined,
          [{ id: 5, name: 'Office Cleaning - From LKR 5,000' }]
        );
      } else if (userMessage.includes('price') || userMessage.includes('cost') || userMessage.includes('how much')) {
        addMessage(
          'bot',
          'Our prices start from LKR 1,500 depending on the service. Would you like to see specific services?',
          ['Home Cleaning', 'Laundry', 'Furniture', 'View All']
        );
      } else {
        addMessage(
          'bot',
          'I can help you find the right cleaning service! What are you looking to clean?',
          ['Home/Office', 'Furniture', 'Laundry', 'Curtains', 'View All Services']
        );
      }
    }, 500);
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 flex items-center justify-center"
      >
        {isOpen ? (
          <span className="text-2xl">×</span>
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-purple-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg">Service Finder Bot</h3>
                <p className="text-sm text-purple-100">Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'bot' ? 'bg-purple-100' : 'bg-gray-200'
                }`}>
                  {message.sender === 'bot' ? (
                    <Bot className="w-5 h-5 text-purple-600" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className={`flex-1 ${message.sender === 'user' ? 'flex justify-end' : ''}`}>
                  <div
                    className={`inline-block p-3 rounded-2xl max-w-[80%] ${
                      message.sender === 'bot'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {message.text}
                  </div>

                  {/* Options */}
                  {message.options && (
                    <div className="mt-2 space-y-2">
                      {message.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Service Links */}
                  {message.serviceLinks && (
                    <div className="mt-2 space-y-2">
                      {message.serviceLinks.map((service) => (
                        <Link
                          key={service.id}
                          to={`/services/${service.id}`}
                          className="block px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-blue-800">{service.name}</span>
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </div>
                        </Link>
                      ))}
                      <button
                        onClick={() => handleOptionClick('Start Over')}
                        className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm mt-3"
                      >
                        Start Over
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}