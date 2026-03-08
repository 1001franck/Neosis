/**
 * PRESENTATION - MESSAGE REACTIONS COMPONENT
 * Displays and manages reactions on messages
 * Dark theme compatible
 */

import React from 'react';
import type { MessageReaction } from '@domain/messages/types';

export interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export function MessageReactions({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  const handleReactionClick = (emoji: string, userIds: string[]) => {
    if (userIds.includes(currentUserId)) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
  };

  if (reactions.length === 0 && !showEmojiPicker) {
    return (
      <div className="mt-1">
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          + Add reaction
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {reactions.map((reaction) => {
        const isUserReaction = reaction.userIds.includes(currentUserId);
        return (
          <button
            key={reaction.emoji}
            onClick={() => handleReactionClick(reaction.emoji, reaction.userIds)}
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
              transition-all duration-200 border
              ${
                isUserReaction
                  ? 'bg-primary/20 border-primary/50 text-primary'
                  : 'bg-secondary border-border text-muted-foreground hover:bg-secondary/80'
              }
            `}
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs font-medium">{reaction.count}</span>
          </button>
        );
      })}

      {showEmojiPicker ? (
        <div className="relative">
          <div className="absolute bottom-full mb-2 bg-card border border-border shadow-lg rounded-lg p-2 flex gap-1 z-10">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onAddReaction(emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-2"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
          title="Ajouter une réaction"
        >
          <span className="text-sm">+</span>
        </button>
      )}
    </div>
  );
}
