import { describe, it, expect } from 'vitest';
import { cleanJsonString } from '../../utils/jsonUtils';

describe('cleanJsonString', () => {
  it('should return pure JSON as is', () => {
    const input = '{"key": "value"}';
    expect(cleanJsonString(input)).toBe(input);
  });

  it('should strip markdown code blocks with json identifier', () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(cleanJsonString(input)).toBe('{"key": "value"}');
  });

  it('should strip markdown code blocks without identifier', () => {
    const input = '```\n{"key": "value"}\n```';
    expect(cleanJsonString(input)).toBe('{"key": "value"}');
  });

  it('should extract JSON from conversational text', () => {
    const input = 'Here is the data: {"key": "value"} Hope this helps!';
    expect(cleanJsonString(input)).toBe('{"key": "value"}');
  });

  it('should extract Array from conversational text', () => {
    const input = 'Sure, the list is: ["item1", "item2"].';
    expect(cleanJsonString(input)).toBe('["item1", "item2"]');
  });

  it('should handle nested structures correctly', () => {
    const input = '{"key": {"nested": "value"}}';
    expect(cleanJsonString(input)).toBe(input);
  });

  it('should handle array of objects', () => {
    const input = '[{"id": 1}, {"id": 2}]';
    expect(cleanJsonString(input)).toBe(input);
  });

  it('should return original string if end delimiter is missing (safety fallback)', () => {
    // If it can't find the end brace, it shouldn't try to slice arbitrarily
    const input = 'Incomplete {"key": "val"';
    expect(cleanJsonString(input)).toBe(input);
  });
});
