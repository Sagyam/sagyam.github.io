import type React from 'react';
import { ALL_TECH_KEYWORDS } from './data/tech-keywords';

/**
 * Highlights technology keywords in text with bold cyan styling
 * @param text - The text to process
 * @returns Array of React nodes with highlighted keywords
 */
export function highlightTechKeywords(text: string): React.ReactNode[] {
  // Sort keywords by length (longest first) to match compound terms before simple ones
  // e.g., "GitHub Actions" before "GitHub", "Next.js" before "Next"
  const sortedKeywords = [...ALL_TECH_KEYWORDS].sort(
    (a, b) => b.length - a.length,
  );

  // Escape special regex characters in keywords
  const escapedKeywords = sortedKeywords.map((keyword) =>
    keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );

  // Create regex pattern with word boundaries for exact matching
  const pattern = escapedKeywords.join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Find all matches and build array of text segments + highlighted spans
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add highlighted match with unique key
    parts.push(
      <span key={match.index} className="font-semibold text-primary">
        {match[0]}
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Return parts if we found any matches, otherwise return original text
  return parts.length > 0 ? parts : [text];
}
