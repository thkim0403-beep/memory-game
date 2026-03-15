import { describe, it, expect } from 'vitest';
import { fallbackEmojis } from '../utils/api';

describe('fallbackEmojis', () => {
  const requiredKeys = ['smileys', 'flags', 'food', 'nature', 'pixel', 'monsters', 'lorelei'];

  it('모든 API 테마에 대한 fallback이 존재한다', () => {
    requiredKeys.forEach((key) => {
      expect(fallbackEmojis[key]).toBeDefined();
    });
  });

  it('각 fallback에 최소 10개의 이모지가 있다 (hard 난이도 10쌍 지원)', () => {
    requiredKeys.forEach((key) => {
      expect(fallbackEmojis[key].length).toBeGreaterThanOrEqual(10);
    });
  });

  it('각 fallback 내에 중복이 없다', () => {
    requiredKeys.forEach((key) => {
      const unique = new Set(fallbackEmojis[key]);
      expect(unique.size).toBe(fallbackEmojis[key].length);
    });
  });
});
