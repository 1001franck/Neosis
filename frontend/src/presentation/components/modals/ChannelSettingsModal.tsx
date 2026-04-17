/**
 * MODAL - CHANNEL SETTINGS
 * Modal de personnalisation du channel (ADMIN/OWNER uniquement)
 *
 * Fonctionnalités :
 * - Modifier le nom du channel (1-100 caractères)
 * - Modifier le topic/description (0-1024 caractères)
 * - Aperçu en temps réel
 * - Validation côté client
 */

'use client';

import React, { useState } from 'react';
import type { Channel } from '@domain/channels/types';

interface ChannelSettingsModalProps {
  channel: Channel;
  canManage: boolean; // ADMIN ou OWNER
  onClose: () => void;
  onSave: (data: { name?: string; topic?: string }) => Promise<void>;
}

export function ChannelSettingsModal({
  channel,
  canManage,
  onClose,
  onSave,
}: ChannelSettingsModalProps): React.ReactElement {
  const [name, setName] = useState(channel.name || '');
  const [topic, setTopic] = useState(channel.topic || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation en temps réel
  const nameError = name.trim().length === 0 ? 'Le nom est requis' :
                    name.trim().length > 100 ? 'Maximum 100 caractères' : null;
  const topicError = topic.length > 1024 ? 'Maximum 1024 caractères' : null;
  const hasChanges = name !== channel.name || topic !== (channel.topic || '');

  const handleSave = async () => {
    if (nameError || topicError) return;

    setIsSaving(true);
    setError(null);

    try {
      const updateData: { name?: string; topic?: string } = {};

      if (name !== channel.name) {
        updateData.name = name.trim();
      }

      if (topic !== (channel.topic || '')) {
        updateData.topic = topic.trim();
      }

      await onSave(updateData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Si pas les permissions, afficher message d'erreur
  if (!canManage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-card border border-border rounded-2xl p-6 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Permission refusée</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Seuls les administrateurs et le propriétaire du serveur peuvent modifier ce channel.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Paramètres du channel</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Personnalisez l&apos;apparence et le contenu de #{channel.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Nom du channel */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nom du channel
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  #
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="general"
                  maxLength={100}
                  className={`
                    w-full pl-8 pr-4 py-3 rounded-lg
                    bg-secondary border
                    ${nameError ? 'border-red-500' : 'border-border'}
                    text-foreground placeholder-muted-foreground
                    focus:outline-none focus:ring-2
                    ${nameError ? 'focus:ring-red-500' : 'focus:ring-primary/50'}
                    transition-all
                  `}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                {nameError ? (
                  <p className="text-sm text-red-500">{nameError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Le nom du channel visible par tous</p>
                )}
                <span className="text-xs text-muted-foreground">
                  {name.length}/100
                </span>
              </div>
            </div>

            {/* Topic du channel */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Description du channel
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ajoutez une description pour aider les membres à comprendre l'objectif de ce channel... (optionnel)"
                maxLength={1024}
                rows={4}
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-secondary border
                  ${topicError ? 'border-red-500' : 'border-border'}
                  text-foreground placeholder-muted-foreground
                  focus:outline-none focus:ring-2
                  ${topicError ? 'focus:ring-red-500' : 'focus:ring-primary/50'}
                  transition-all
                  resize-none
                `}
              />
              <div className="flex items-center justify-between mt-2">
                {topicError ? (
                  <p className="text-sm text-red-500">{topicError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Une courte description de ce channel</p>
                )}
                <span className="text-xs text-muted-foreground">
                  {topic.length}/1024
                </span>
              </div>
            </div>

            {/* Info sur le channel "general" */}
            {channel.name === 'general' && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-400 mb-1">Channel par défaut</p>
                    <p className="text-sm text-blue-300/80">
                      Le channel &quot;general&quot; est le channel par défaut de votre serveur. Il ne peut pas être supprimé, mais vous pouvez le renommer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Erreur globale */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? 'Modifications non sauvegardées' : 'Aucune modification'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !!nameError || !!topicError}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
