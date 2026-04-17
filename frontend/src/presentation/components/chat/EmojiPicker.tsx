/**
 * EMOJI PICKER
 * Sélecteur d'emoji simple
 * 
 * Responsabilités:
 * - Afficher une grille d'emojis
 * - Permettre la sélection
 */

'use client';

import { memo } from 'react';
import { EMOJI_CATEGORIES } from '@shared/constants/emojis';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPickerComponent = ({ onSelect, onClose }: EmojiPickerProps): React.ReactNode => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Picker */}
      <div className="absolute bottom-full right-0 mb-2 w-80 bg-card rounded-lg shadow-2xl z-50 border border-border">
        <div className="p-3 max-h-96 overflow-y-auto">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">{category}</h3>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSelect(emoji);
                      onClose();
                    }}
                    className="text-2xl p-1 hover:bg-background rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const EmojiPicker = memo(EmojiPickerComponent);
