/**
 * PRESENTATION - TYPING INDICATOR COMPONENT
 * Displays typing indicators for active users
 */

import React from 'react';

export interface TypingIndicatorProps {
  usernames: string[];
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null;

  const formatTypingText = () => {
    if (usernames.length === 1) {
      return `${usernames[0]} is typing`;
    } else if (usernames.length === 2) {
      return `${usernames[0]} and ${usernames[1]} are typing`;
    } else if (usernames.length === 3) {
      return `${usernames[0]}, ${usernames[1]}, and ${usernames[2]} are typing`;
    } else {
      return `${usernames[0]}, ${usernames[1]}, and ${usernames.length - 2} others are typing`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-500">
      <span>{formatTypingText()}</span>
      <span className="typing-dots">
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </span>
      <style jsx>{`
        .typing-dots {
          display: inline-block;
          margin-left: 2px;
        }
        .dot {
          animation: typing 1.4s infinite;
          opacity: 0;
        }
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

