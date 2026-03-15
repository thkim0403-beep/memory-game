import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadRecords,
  saveRecord,
  formatRecord,
  getRanking,
  checkRankPosition,
  addRankingEntry,
  loadNickname,
  saveNickname,
  formatTime,
  formatDate,
} from '../utils/records';

beforeEach(() => {
  localStorage.clear();
});

describe('Best Records', () => {
  it('초기 상태는 빈 객체', () => {
    expect(loadRecords()).toEqual({});
  });

  it('새 기록을 저장하면 true 반환', () => {
    expect(saveRecord('easy', 6, 30)).toBe(true);
  });

  it('저장된 기록을 불러올 수 있다', () => {
    saveRecord('easy', 6, 30);
    const records = loadRecords();
    expect(records.easy).toEqual({ attempts: 6, time: 30 });
  });

  it('더 좋은 기록으로 갱신하면 true 반환', () => {
    saveRecord('normal', 10, 60);
    expect(saveRecord('normal', 8, 45)).toBe(true);
    expect(loadRecords().normal).toEqual({ attempts: 8, time: 45 });
  });

  it('더 나쁜 기록은 갱신하지 않고 false 반환', () => {
    saveRecord('normal', 8, 45);
    expect(saveRecord('normal', 10, 60)).toBe(false);
    expect(loadRecords().normal).toEqual({ attempts: 8, time: 45 });
  });

  it('같은 시도에 더 빠른 시간이면 갱신', () => {
    saveRecord('hard', 10, 60);
    expect(saveRecord('hard', 10, 50)).toBe(true);
    expect(loadRecords().hard).toEqual({ attempts: 10, time: 50 });
  });

  it('난이도별로 독립적으로 저장', () => {
    saveRecord('easy', 6, 30);
    saveRecord('normal', 8, 45);
    saveRecord('hard', 10, 60);
    const records = loadRecords();
    expect(records.easy?.attempts).toBe(6);
    expect(records.normal?.attempts).toBe(8);
    expect(records.hard?.attempts).toBe(10);
  });
});

describe('formatRecord', () => {
  it('기록이 없으면 - 반환', () => {
    expect(formatRecord(undefined)).toBe('-');
  });

  it('기록을 올바른 형식으로 표시', () => {
    expect(formatRecord({ attempts: 8, time: 65 })).toBe('8회 / 1:05');
  });

  it('0초도 올바르게 표시', () => {
    expect(formatRecord({ attempts: 6, time: 0 })).toBe('6회 / 0:00');
  });
});

describe('Ranking System', () => {
  it('초기 랭킹은 빈 배열', () => {
    expect(getRanking('easy')).toEqual([]);
  });

  it('빈 랭킹에 새 기록은 1위', () => {
    expect(checkRankPosition('easy', 6, 30)).toBe(1);
  });

  it('랭킹에 기록을 추가하면 순위를 반환', () => {
    const entry = {
      nickname: '테스터',
      attempts: 8,
      time: 45,
      theme: 'animals' as const,
      themeName: '동물',
      difficulty: 'easy' as const,
      date: '2026-03-14T00:00:00.000Z',
    };
    const rank = addRankingEntry('easy', entry);
    expect(rank).toBe(1);
    expect(getRanking('easy')).toHaveLength(1);
  });

  it('더 좋은 기록이 상위에 위치', () => {
    const makeEntry = (attempts: number, time: number, name: string) => ({
      nickname: name,
      attempts,
      time,
      theme: 'animals' as const,
      themeName: '동물',
      difficulty: 'easy' as const,
      date: '2026-03-14T00:00:00.000Z',
    });

    addRankingEntry('easy', makeEntry(10, 60, 'C'));
    addRankingEntry('easy', makeEntry(6, 30, 'A'));
    addRankingEntry('easy', makeEntry(8, 45, 'B'));

    const ranking = getRanking('easy');
    expect(ranking[0].nickname).toBe('A');
    expect(ranking[1].nickname).toBe('B');
    expect(ranking[2].nickname).toBe('C');
  });

  it('같은 시도에 빠른 시간이 상위', () => {
    const makeEntry = (time: number, name: string) => ({
      nickname: name,
      attempts: 8,
      time,
      theme: 'animals' as const,
      themeName: '동물',
      difficulty: 'normal' as const,
      date: '2026-03-14T00:00:00.000Z',
    });

    addRankingEntry('normal', makeEntry(60, 'Slow'));
    addRankingEntry('normal', makeEntry(30, 'Fast'));

    const ranking = getRanking('normal');
    expect(ranking[0].nickname).toBe('Fast');
    expect(ranking[1].nickname).toBe('Slow');
  });

  it('최대 10개까지만 저장', () => {
    for (let i = 0; i < 15; i++) {
      addRankingEntry('hard', {
        nickname: `Player${i}`,
        attempts: 10 + i,
        time: 60,
        theme: 'animals',
        themeName: '동물',
        difficulty: 'hard',
        date: '2026-03-14T00:00:00.000Z',
      });
    }
    expect(getRanking('hard')).toHaveLength(10);
  });

  it('11위 이하는 checkRankPosition이 null 반환', () => {
    for (let i = 0; i < 10; i++) {
      addRankingEntry('easy', {
        nickname: `P${i}`,
        attempts: 6,
        time: 30 + i,
        theme: 'animals',
        themeName: '동물',
        difficulty: 'easy',
        date: '2026-03-14T00:00:00.000Z',
      });
    }
    // 10위보다 나쁜 기록
    expect(checkRankPosition('easy', 100, 999)).toBe(null);
  });
});

describe('Nickname', () => {
  it('초기 닉네임은 빈 문자열', () => {
    expect(loadNickname()).toBe('');
  });

  it('닉네임 저장 후 불러오기', () => {
    saveNickname('홍길동');
    expect(loadNickname()).toBe('홍길동');
  });
});

describe('formatTime', () => {
  it('0초', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('59초', () => {
    expect(formatTime(59)).toBe('0:59');
  });

  it('1분', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('1분 5초', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('10분 30초', () => {
    expect(formatTime(630)).toBe('10:30');
  });
});

describe('formatDate', () => {
  it('ISO 날짜를 YYYY.MM.DD 형식으로 변환', () => {
    expect(formatDate('2026-03-14T00:00:00.000Z')).toMatch(/2026\.03\.14/);
  });
});
