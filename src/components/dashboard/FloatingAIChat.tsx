import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { ChatInterface } from '@/components/features';
import { ChartConfig } from '@/types';

interface FloatingAIChatProps {
  headers: string[];
  rows: Record<string, unknown>[];
  onNewChart: (chart: ChartConfig) => void;
}

export const FloatingAIChat: React.FC<FloatingAIChatProps> = ({
  headers,
  rows,
  onNewChart,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleChat}
        />
      )}

      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open AI Chat"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Slide-up chat panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[400px] h-[500px] bg-white rounded-lg shadow-2xl transform transition-all duration-300 ease-out ${
          isOpen
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Chat panel header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-lg">AI Assistant</h3>
          </div>
          <button
            onClick={toggleChat}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat interface */}
        <div className="h-[calc(100%-64px)]">
          <ChatInterface
            headers={headers}
            rows={rows}
            onNewChart={onNewChart}
          />
        </div>
      </div>
    </>
  );
};
