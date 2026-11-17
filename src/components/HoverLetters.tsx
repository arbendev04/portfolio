import { useRef, type ElementType } from 'react';
import { useGradientLetterStyles } from '../lib/useGradientLetters';
import { useLetterEntrance } from '../lib/useLetterEntrance';
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

/** Splits on whitespace runs rather than every character so a leading/trailing
 * space (e.g. "Let's build ") survives as its own token instead of vanishing. */
function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}

export default function HoverLetters({ text, className, as: Tag = 'span', gradient = false }: HoverLettersProps) {
  const containerRef = useRef<HTMLElement>(null);
  const tokens = tokenize(text);
  const letterCount = tokens.reduce((count, token) => (/\s/.test(token) ? count : count + token.length), 0);
  const { letterRefs, styles } = useGradientLetterStyles(containerRef, gradient, letterCount);
  useLetterEntrance(containerRef, { selector: '.hover-letter', onScroll: true });

  let letterIndex = 0;

  return (
    <Tag
      ref={containerRef}
      className={className ? `hover-letters ${className}` : 'hover-letters'}
      aria-label={text}
    >
      <span className="hover-line">
        {tokens.map((token, ti) => {
          if (/^\s+$/.test(token)) {
            return <span key={ti}>{token}</span>;
          }

          return (
            <span key={ti} className="hover-word">
              {token.split('').map((ch) => {
                const i = letterIndex++;
                return (
                  <span
                    key={i}
                    ref={(el: HTMLSpanElement | null) => {
                      letterRefs.current[i] = el;
                    }}
                    className={gradient ? 'hover-letter hover-letter--gradient' : 'hover-letter'}
                    aria-hidden="true"
                    style={gradient ? styles[i] : undefined}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
