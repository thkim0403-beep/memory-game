import Card from './Card';
import type { CardData, DifficultyConfig, Theme } from '../types';

interface BoardProps {
  cards: CardData[];
  diffConfig: DifficultyConfig;
  theme: Theme;
  onCardClick: (id: string) => void;
  matchedIds: Set<string>;
  shakeIds: Set<string>;
}

export default function Board({ cards, diffConfig, theme, onCardClick, matchedIds, shakeIds }: BoardProps) {
  const { cols, rows } = diffConfig;
  // 카드 크기를 뷰포트 기반으로 계산 (모바일: 헤더 80px + 버튼 60px, 데스크탑: 180px)
  const cardSize = `min((100vh - 150px) / ${rows} - 8px, (100vw - 24px) / ${cols} - 8px)`;

  return (
    <div
      className="grid gap-1.5 md:gap-3 mx-auto p-1 md:p-2"
      style={{
        gridTemplateColumns: `repeat(${cols}, calc(${cardSize}))`,
        gridTemplateRows: `repeat(${rows}, calc(${cardSize}))`,
      }}
    >
      {cards.map((card, i) => (
        <Card
          key={card.id}
          card={card}
          theme={theme}
          index={i}
          onClick={onCardClick}
          matchAnim={matchedIds.has(card.id)}
          shakeAnim={shakeIds.has(card.id)}
        />
      ))}
    </div>
  );
}
