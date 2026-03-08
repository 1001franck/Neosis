/**
 * INFRASTRUCTURE - SUPABASE STORAGE
 * Upload de fichiers vers Supabase Storage (persistant, cross-deploy)
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import path from 'path';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../../shared/config/env.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = 'uploads';

/**
 * Upload un fichier vers Supabase Storage
 * @returns URL publique du fichier
 */
export async function uploadToSupabase(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string = 'files'
): Promise<string> {
  const ext = path.extname(originalName);
  const filename = `${folder}/${randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Supprime un fichier depuis son URL publique Supabase
 */
export async function deleteFromSupabase(publicUrl: string): Promise<void> {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return; // pas une URL Supabase, on ignore

  const filePath = publicUrl.substring(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([filePath]);
}
