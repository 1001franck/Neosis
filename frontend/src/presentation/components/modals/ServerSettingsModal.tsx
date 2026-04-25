/**
 * MODAL - SERVER SETTINGS
 * Modal de personnalisation du serveur (OWNER uniquement)
 *
 * Fonctionnalités :
 * - Modifier le nom du serveur (1-100 caractères)
 * - Modifier la description (0-500 caractères)
 * - Uploader/modifier l'image du serveur
 * - Aperçu en temps réel
 * - Validation côté client
 */

'use client';

import React, { useState, useRef } from 'react';
import type { Server } from '@domain/servers/types';
import { useLocale } from '@shared/hooks/useLocale';

interface ServerSettingsModalProps {
  server: Server;
  isOwner: boolean;
  onClose: () => void;
  onSave: (data: { name?: string; description?: string; imageFile?: File }) => Promise<void>;
}

export function ServerSettingsModal({
  server,
  isOwner,
  onClose,
  onSave,
}: ServerSettingsModalProps): React.ReactElement {
  const { t } = useLocale();
  const [name, setName] = useState(server.name || '');
  const [description, setDescription] = useState(server.description || '');
  const [imagePreview, setImagePreview] = useState<string | null>(server.imageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameError = name.trim().length === 0 ? t('servers.settings.nameRequired') :
                    name.trim().length > 100 ? t('servers.settings.nameMax') : null;
  const descError = description.length > 500 ? t('servers.settings.descMax') : null;
  const hasChanges = name !== server.name ||
                     description !== (server.description || '') ||
                     imageFile !== null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setError(t('common.imageInvalid'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t('common.imageTooBig'));
      return;
    }

    setImageFile(file);
    setError(null);

    // Aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (nameError || descError) return;

    setIsSaving(true);
    setError(null);

    try {
      const updateData: { name?: string; description?: string; imageFile?: File } = {};

      if (name !== server.name) {
        updateData.name = name.trim();
      }

      if (description !== (server.description || '')) {
        updateData.description = description.trim();
      }

      // Passer le fichier image si sélectionné
      if (imageFile) {
        updateData.imageFile = imageFile;
      }

      await onSave(updateData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  // Si pas owner, afficher message d'erreur
  if (!isOwner) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-card border border-border rounded-2xl p-6 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('common.permissionDenied')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('servers.settings.ownerOnly')}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('common.close')}
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
          <h2 className="text-xl font-bold text-foreground">{t('servers.settings.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Image du serveur */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                {t('servers.settings.imageLabel')}
              </label>
              <div className="flex items-center gap-4">
                {/* Aperçu */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {name.substring(0, 2).toUpperCase() || 'SV'}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    {t('servers.settings.chooseImage')}
                  </button>
                  {imagePreview && (
                    <button
                      onClick={handleRemoveImage}
                      className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                    >
                      {t('servers.settings.removeImage')}
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('servers.settings.imageHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Nom du serveur */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('servers.settings.nameLabel')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('servers.settings.namePlaceholder')}
                maxLength={100}
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-secondary border
                  ${nameError ? 'border-red-500' : 'border-border'}
                  text-foreground placeholder-muted-foreground
                  focus:outline-none focus:ring-2
                  ${nameError ? 'focus:ring-red-500' : 'focus:ring-primary/50'}
                  transition-all
                `}
              />
              <div className="flex items-center justify-between mt-2">
                {nameError ? (
                  <p className="text-sm text-red-500">{nameError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('servers.settings.nameHint')}</p>
                )}
                <span className="text-xs text-muted-foreground">
                  {name.length}/100
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t('servers.settings.descLabel')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('servers.settings.descPlaceholder')}
                maxLength={500}
                rows={4}
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-secondary border
                  ${descError ? 'border-red-500' : 'border-border'}
                  text-foreground placeholder-muted-foreground
                  focus:outline-none focus:ring-2
                  ${descError ? 'focus:ring-red-500' : 'focus:ring-primary/50'}
                  transition-all
                  resize-none
                `}
              />
              <div className="flex items-center justify-between mt-2">
                {descError ? (
                  <p className="text-sm text-red-500">{descError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('servers.settings.descHint')}</p>
                )}
                <span className="text-xs text-muted-foreground">
                  {description.length}/500
                </span>
              </div>
            </div>

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
            {hasChanges ? t('common.unsavedChanges') : t('common.noChanges')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !!nameError || !!descError}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
