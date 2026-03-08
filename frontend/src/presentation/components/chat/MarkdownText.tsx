/**
 * MARKDOWN RENDERER
 * Convertit le markdown en HTML
 * 
 * Support:
 * - **gras**
 * - *italique*
 * - `code inline`
 * - ```code block```
 * - [liens](url)
 */

'use client';

import React from 'react';
import { BRAND_COLORS } from '@shared/constants/colors';

interface MarkdownTextProps {
  content: string;
}

/**
 * Échappe les caractères HTML dangereux pour prévenir les attaques XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Valide qu'une URL est sûre (http/https uniquement)
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Parse simple markdown avec protection XSS
 * L'ordre est important: on échappe d'abord le HTML, puis on applique le markdown
 */
function parseMarkdown(text: string): string {
  // 1. Échapper tout le HTML d'abord
  let parsed = escapeHtml(text);

  // Mentions @username
  parsed = parsed.replace(/(^|\\s)@([a-zA-Z0-9_][\\w.-]{0,31})/g, (_match, prefix, name) => {
    return `${prefix}<span class="mention">@${name}</span>`;
  });

  // 2. Appliquer les transformations markdown sur le texte échappé

  // Code blocks ```code```
  parsed = parsed.replace(/```([\s\S]*?)```/g, '<pre class="bg-card p-2 rounded my-1 text-sm overflow-x-auto"><code>$1</code></pre>');

  // Inline code `code`
  parsed = parsed.replace(/`([^`]+)`/g, '<code class="bg-card px-1 py-0.5 rounded text-sm">$1</code>');

  // Bold **text**
  parsed = parsed.replace(/\*\*([^\*]+)\*\*/g, '<strong class="font-bold">$1</strong>');

  // Italic *text*
  parsed = parsed.replace(/\*([^\*]+)\*/g, '<em class="italic">$1</em>');

  // Links [text](url) - validate URL safety
  parsed = parsed.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (_match, linkText, url) => {
    if (isSafeUrl(url)) {
      return `<a href="${url}" class="text-[${BRAND_COLORS.LINK}] hover:underline" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    }
    return linkText;
  });

  return parsed;
}

export function MarkdownText({ content }: MarkdownTextProps): React.ReactNode {
  const htmlContent = parseMarkdown(content);
  
  return (
    <div 
      className="text-base text-foreground break-words leading-[22px]"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
