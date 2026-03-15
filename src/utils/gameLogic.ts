import type { CardData } from '../types';

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createCards(emojis: string[], pairs: number, images?: string[]): CardData[] {
  const selected = emojis.slice(0, pairs);
  const selectedImages = images?.slice(0, pairs);
  const doubled = selected.flatMap((emoji, i) => [
    { id: `${i}-a`, emoji, image: selectedImages?.[i], isFlipped: false, isMatched: false },
    { id: `${i}-b`, emoji, image: selectedImages?.[i], isFlipped: false, isMatched: false },
  ]);
  return shuffle(doubled);
}

export function checkMatch(card1: CardData, card2: CardData): boolean {
  return card1.emoji === card2.emoji;
}

export function isGameClear(cards: CardData[]): boolean {
  return cards.length > 0 && cards.every((c) => c.isMatched);
}

export function getStars(attempts: number, pairs: number): number {
  if (attempts <= pairs * 1.5) return 3;
  if (attempts <= pairs * 2) return 2;
  return 1;
}
