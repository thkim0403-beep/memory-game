import { describe, it, expect } from 'vitest';
import { themes, difficulties, themeKeys, staticThemeKeys, apiThemeKeys, STAGE_ORDER } from '../utils/themes';

describe('themes', () => {
  it('모든 themeKeys에 해당하는 테마가 정의되어 있다', () => {
    themeKeys.forEach((key) => {
      expect(themes[key]).toBeDefined();
      expect(themes[key].key).toBe(key);
      expect(themes[key].name).toBeTruthy();
      expect(themes[key].icon).toBeTruthy();
      expect(themes[key].gradientFrom).toBeTruthy();
      expect(themes[key].gradientTo).toBeTruthy();
    });
  });

  it('정적 테마는 16개 이상의 이모지를 가진다', () => {
    staticThemeKeys.forEach((key) => {
      expect(themes[key].emojis.length).toBeGreaterThanOrEqual(16);
      expect(themes[key].isApi).toBeFalsy();
    });
  });

  it('API 테마는 빈 이모지 배열과 isApi: true를 가진다', () => {
    apiThemeKeys.forEach((key) => {
      expect(themes[key].emojis).toEqual([]);
      expect(themes[key].isApi).toBe(true);
    });
  });

  it('themeKeys = staticThemeKeys + apiThemeKeys', () => {
    expect(themeKeys).toEqual([...staticThemeKeys, ...apiThemeKeys]);
  });
});

describe('difficulties', () => {
  it('3개 난이도가 정의되어 있다', () => {
    expect(Object.keys(difficulties)).toHaveLength(3);
  });

  it('각 난이도의 pairs가 rows * cols / 2와 일치한다', () => {
    Object.values(difficulties).forEach((d) => {
      expect(d.pairs).toBe((d.rows * d.cols) / 2);
    });
  });

  it('쉬움 < 보통 < 어려움 순으로 쌍 수가 증가', () => {
    expect(difficulties.easy.pairs).toBeLessThan(difficulties.normal.pairs);
    expect(difficulties.normal.pairs).toBeLessThan(difficulties.hard.pairs);
  });
});

describe('STAGE_ORDER', () => {
  it('쉬움 → 보통 → 어려움 순서', () => {
    expect(STAGE_ORDER).toEqual(['easy', 'normal', 'hard']);
  });
});
