/**
 * CHAT INPUT COMPONENT
 * Zone de saisie de message avec emoji picker et upload de fichiers
 * 
 * Responsabilités:
 * - Input de saisie avec placeholder dynamique
 * - Emoji picker avec toggle
 * - Upload de fichiers (images, vidéos, documents)
 * - Preview des fichiers sélectionnés avant envoi
 * - Gestion typing indicators
 * - Envoi message avec Enter
 */

'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { EmojiPicker } from './EmojiPicker';
import { GifPicker } from './GifPicker';
import { useTypingIndicator } from '@presentation/hooks/useTypingIndicator';
import { uploadApi } from '@infrastructure/api/upload.api';
import type { Attachment } from '@domain/messages/types';
import { logger } from '@shared/utils/logger';
import { useLocale } from '@shared/hooks/useLocale';

interface BanInfo {
  expiresAt?: string | null;
  reason?: string | null;
}

interface ChatInputProps {
  recipientName?: string;
  channelId?: string;
  onSendMessage?: (content: string, attachments?: Attachment[]) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  banInfo?: BanInfo;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ChatInputComponent = ({
  recipientName,
  channelId,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  banInfo,
}: ChatInputProps): React.ReactElement => {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocale();

  // Typing indicator avec debounce automatique
  useTypingIndicator({
    value: messageInput,
    onTypingStart,
    onTypingStop,
    debounceMs: 3000
  });

  // Focus automatique sur l'input au chargement
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError(null);

    // Vérifier le nombre de fichiers
    if (files.length + selectedFiles.length > MAX_FILES) {
      setUploadError(t('chat.maxFiles'));
      return;
    }

    // Vérifier la taille
    const tooBig = files.find(f => f.size > MAX_FILE_SIZE);
    if (tooBig) {
      setUploadError(t('chat.fileTooLarge'));
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    // Reset l'input pour permettre de re-sélectionner le même fichier
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Re-focus sur l'input texte pour que Enter envoie le message
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [selectedFiles.length]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadError(null);
  }, []);

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || !onSendMessage) return;

    let uploadedAttachments: Attachment[] | undefined;

    // Upload les fichiers si présents
    if (selectedFiles.length > 0 && channelId) {
      setIsUploading(true);
      setUploadError(null);
      try {
        uploadedAttachments = await uploadApi.uploadFiles(selectedFiles, channelId);
        logger.info('Files uploaded', { count: uploadedAttachments.length });
      } catch (err) {
        setUploadError(t('chat.uploadFailed'));
        logger.error('Upload failed', err);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Envoyer le message (avec contenu textuel ou juste des pièces jointes)
    const content = messageInput.trim();
    if (content || uploadedAttachments) {
      onSendMessage(content, uploadedAttachments);
    }

    setMessageInput('');
    setSelectedFiles([]);
    if (onTypingStop) onTypingStop();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  // Envoyer le GIF directement comme message
  const handleGifSelect = useCallback((gifUrl: string) => {
    if (onSendMessage) {
      onSendMessage(gifUrl);
    }
    setShowGifPicker(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [onSendMessage]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Afficher la notice de ban si l'utilisateur est banni temporairement
  if (banInfo) {
    const expiryText = banInfo.expiresAt
      ? new Date(banInfo.expiresAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
      : null;
    return (
      <div className="px-3 sm:px-4 pb-4 sm:pb-6">
        <div className="flex items-center gap-3 px-4 py-3 bg-red-950/40 border border-red-800/50 rounded-lg text-sm">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div>
            <p className="text-red-300 font-medium">
              {expiryText
                ? `${t('chat.bannedTemporary')} ${expiryText}`
                : t('chat.bannedPermanent')}
            </p>
            {banInfo.reason && (
              <p className="text-red-400/70 text-xs mt-0.5">{t('chat.banReason')} {banInfo.reason}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 pb-4 sm:pb-6">
      {/* Preview des fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 p-2 sm:p-3 bg-muted/50 rounded-lg border border-border">
          {selectedFiles.map((file, index) => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            const isAudio = file.type.startsWith('audio/');
            return (
              <div
                key={`${file.name}-${index}`}
                className="relative group"
              >
                {/* Bouton remove */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1.5 -right-1.5 z-10 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  aria-label={`Retirer ${file.name}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {isImage ? (
                  /* Image thumbnail */
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob URL local pour preview attachment, next/image ne supporte pas blob: */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                  </div>
                ) : isVideo ? (
                  /* Video thumbnail */
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border bg-background relative flex items-center justify-center">
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                ) : isAudio ? (
                  /* Audio card */
                  <div className="w-36 sm:w-44 h-16 sm:h-20 rounded-lg border border-border bg-background flex flex-col items-center justify-center gap-1 px-2">
                    <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="text-[10px] text-foreground truncate max-w-full text-center">{file.name}</span>
                    <span className="text-[9px] text-muted-foreground">{formatFileSize(file.size)}</span>
                  </div>
                ) : (
                  /* Generic file card */
                  <div className="w-36 sm:w-44 h-16 sm:h-20 rounded-lg border border-border bg-background flex flex-col items-center justify-center gap-1 px-2">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[10px] text-foreground truncate max-w-full text-center">{file.name}</span>
                    <span className="text-[9px] text-muted-foreground">{formatFileSize(file.size)}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bouton ajouter plus (si < MAX_FILES) */}
          {selectedFiles.length < MAX_FILES && (
            <button
              onClick={() => { fileInputRef.current?.click(); }}
              onMouseDown={(e) => e.preventDefault()}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 hover:bg-muted/30 transition-colors"
              aria-label={t('chat.addFile')}
              tabIndex={-1}
            >
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Erreur d'upload */}
      {uploadError && (
        <p className="text-xs text-destructive mb-1 px-1">{uploadError}</p>
      )}

      <div className="relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {/* GIF Picker */}
        {showGifPicker && (
          <GifPicker
            onSelect={handleGifSelect}
            onClose={() => setShowGifPicker(false)}
          />
        )}

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
        />

        <input
          ref={inputRef}
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isUploading ? t('chat.uploading') : `Message @${recipientName || 'ici'}`}
          disabled={isUploading}
          className="w-full pl-10 sm:pl-11 pr-28 sm:pr-32 py-2.5 sm:py-3 bg-muted text-foreground placeholder-muted-foreground rounded-lg focus:outline-none disabled:opacity-50 text-sm sm:text-base"
        />
        
        {/* Bouton Upload à gauche */}
        <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={t('chat.attachFile')}
            tabIndex={-1}
          >
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
        </div>

        {/* Boutons à droite : Emoji + Spinner + Send */}
        <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isUploading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          )}
          {/* Bouton GIF */}
          <button
            type="button"
            onClick={() => { setShowGifPicker(prev => !prev); setShowEmojiPicker(false); }}
            className={`text-xs font-bold px-1.5 py-0.5 rounded transition-colors ${
              showGifPicker
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground border border-muted-foreground/40 hover:border-foreground/60'
            }`}
            aria-label="GIF"
            tabIndex={-1}
          >
            GIF
          </button>
          <button
            type="button"
            onClick={() => { setShowEmojiPicker(prev => !prev); setShowGifPicker(false); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('chat.emoji')}
            tabIndex={-1}
          >
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" />
              <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" />
              <path d="M15.5 10C16.3284 10 17 9.32843 17 8.5C17 7.67157 16.3284 7 15.5 7C14.6716 7 14 7.67157 14 8.5C14 9.32843 14.6716 10 15.5 10Z" />
              <path d="M16 13H8C8 15.206 9.794 17 12 17C14.206 17 16 15.206 16 13Z" />
            </svg>
          </button>
          {/* Bouton Send */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isUploading || (!messageInput.trim() && selectedFiles.length === 0)}
            className="text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
            aria-label={t('chat.sendMessage')}
            tabIndex={-1}
          >
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
