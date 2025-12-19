'use client';

import React from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
}

export function HighlightedText({ text, highlight }: HighlightedTextProps) {
  if (!highlight?.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-primary/20 text-primary-foreground rounded-sm px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}
