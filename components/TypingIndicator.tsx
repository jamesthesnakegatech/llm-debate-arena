// components/TypingIndicator.tsx

import React from 'react'

interface TypingIndicatorProps {
  llmName: string
}

export default function TypingIndicator({ llmName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 p-4 riso-card transform -rotate-1 animate-pulse">
      <div className="flex items-center gap-2">
        <span className="font-black uppercase text-sm tracking-wider">
          {llmName} is thinking
        </span>
        <div className="riso-typing">
          <div className="riso-typing-dot"></div>
          <div className="riso-typing-dot"></div>
          <div className="riso-typing-dot"></div>
        </div>
      </div>
      
      {/* Random decorative elements that appear */}
      <div className="flex gap-1 opacity-50">
        {['💭', '⚡', '🤔', '✨'].map((emoji, i) => (
          <span
            key={i}
            className="text-lg animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              transform: `rotate(${Math.random() * 30 - 15}deg)`
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  )
}
