import { describe, it, expect } from 'vitest';
import { shuffle, createCards, checkMatch, isGameClear } from '../utils/gameLogic';

describe('shuffle', () => {
  it('같은 길이의 배열을 반환한다', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(5);
  });

  it('원본 배열을 변경하지 않는다', () => {
    const arr = [1, 2, 3];
    shuffle(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('같은 요소를 포함한다', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('빈 배열을 처리한다', () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe('createCards', () => {
  it('pairs * 2 개의 카드를 생성한다', () => {
    const emojis = ['🐶', '🐱', '🐰', '🦊'];
    const cards = createCards(emojis, 3);
    expect(cards).toHaveLength(6);
  });

  it('각 이모지가 정확히 2장씩 있다', () => {
    const emojis = ['🐶', '🐱', '🐰'];
    const cards = createCards(emojis, 3);
    const counts: Record<string, number> = {};
    cards.forEach((c) => {
      counts[c.emoji] = (counts[c.emoji] || 0) + 1;
    });
    Object.values(counts).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  it('모든 카드가 뒷면 상태로 시작한다', () => {
    const cards = createCards(['🐶', '🐱'], 2);
    cards.forEach((c) => {
      expect(c.isFlipped).toBe(false);
      expect(c.isMatched).toBe(false);
    });
  });

  it('카드 ID가 고유하다', () => {
    const cards = createCards(['🐶', '🐱', '🐰'], 3);
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(6);
  });

  it('이미지 기반 카드를 생성한다', () => {
    const emojis = ['pikachu', 'charmander'];
    const images = ['pic1.png', 'pic2.png'];
    const cards = createCards(emojis, 2, images);
    const withImage = cards.filter((c) => c.image);
    expect(withImage).toHaveLength(4);
    expect(cards.find((c) => c.emoji === 'pikachu')?.image).toBe('pic1.png');
  });

  it('pairs보다 emojis가 적어도 에러 없이 동작한다', () => {
    const cards = createCards(['🐶'], 1);
    expect(cards).toHaveLength(2);
  });
});

describe('checkMatch', () => {
  it('같은 이모지면 매치된다', () => {
    const card1 = { id: '0-a', emoji: '🐶', isFlipped: true, isMatched: false };
    const card2 = { id: '0-b', emoji: '🐶', isFlipped: true, isMatched: false };
    expect(checkMatch(card1, card2)).toBe(true);
  });

  it('다른 이모지면 매치되지 않는다', () => {
    const card1 = { id: '0-a', emoji: '🐶', isFlipped: true, isMatched: false };
    const card2 = { id: '1-a', emoji: '🐱', isFlipped: true, isMatched: false };
    expect(checkMatch(card1, card2)).toBe(false);
  });

  it('포켓몬 이름으로도 매치를 판정한다', () => {
    const card1 = { id: '0-a', emoji: 'pikachu', isFlipped: true, isMatched: false };
    const card2 = { id: '0-b', emoji: 'pikachu', isFlipped: true, isMatched: false };
    expect(checkMatch(card1, card2)).toBe(true);
  });
});

describe('isGameClear', () => {
  it('모든 카드가 매치되면 클리어', () => {
    const cards = [
      { id: '0-a', emoji: '🐶', isFlipped: true, isMatched: true },
      { id: '0-b', emoji: '🐶', isFlipped: true, isMatched: true },
    ];
    expect(isGameClear(cards)).toBe(true);
  });

  it('매치되지 않은 카드가 있으면 미클리어', () => {
    const cards = [
      { id: '0-a', emoji: '🐶', isFlipped: true, isMatched: true },
      { id: '1-a', emoji: '🐱', isFlipped: false, isMatched: false },
    ];
    expect(isGameClear(cards)).toBe(false);
  });

  it('빈 배열은 미클리어', () => {
    expect(isGameClear([])).toBe(false);
  });
});
