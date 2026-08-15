import { useRef, type ElementType } from 'react';
import { useGradientLetterStyles } from '../lib/useGradientLetters';
import './HoverLetters.css';

interface HoverLettersProps {
  text: string;
  className?: string;
  /** Element the split text renders as — 'h2' when this *is* the heading, 'span'
   * when it's nested inside a heading that already has other content. */
  as?: ElementType;
  /** Preserves the brand gradient across the split letters (measured per-letter
   * background position) instead of the flat hover-cyan swap used elsewhere,
   * and inverts to solid white on hover instead. */
  gradient?: boolean;
}

const NBSP = ' ';

export default function HoverLetters({ text, className, as: Tag = 'span', gradient = false }: HoverLettersProps) {
  const containerRef = useRef<HTMLElement>(null);
  const chars = text.split('');
  const { letterRefs, styles } = useGradientLetterStyles(containerRef, gradient, chars.length);

  return (
    <Tag
      ref={containerRef}
      className={className ? `hover-letters ${className}` : 'hover-letters'}
      aria-label={text}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          ref={(el: HTMLSpanElement | null) => {
            letterRefs.current[i] = el;
          }}
          className={gradient ? 'hover-letter hover-letter--gradient' : 'hover-letter'}
          aria-hidden="true"
          style={gradient ? styles[i] : undefined}
        >
          {/* a literal space collapses to nothing once it's alone inside its own
              inline-block span, so it's swapped for a non-breaking space */}
          {ch === ' ' ? NBSP : ch}
        </span>
      ))}
    </Tag>
  );
}
