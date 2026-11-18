import { describe, expect, it } from 'vitest';
import { messages } from './messages';

/** Every leaf path of a nested message object, e.g. "contact.form.submit". */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key));
}

function leafValues(value: unknown): unknown[] {
  if (typeof value !== 'object' || value === null) return [value];
  return Object.values(value).flatMap(leafValues);
}

describe('messages', () => {
  it('has exactly the same keys in English and Spanish', () => {
    expect(leafPaths(messages.es).sort()).toEqual(leafPaths(messages.en).sort());
  });

  it('has no empty strings in either language', () => {
    [messages.en, messages.es].forEach((dictionary) => {
      leafValues(dictionary).forEach((leaf) => {
        expect(typeof leaf).toBe('string');
        expect((leaf as string).trim()).not.toBe('');
      });
    });
  });
});
