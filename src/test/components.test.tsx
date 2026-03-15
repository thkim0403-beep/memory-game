import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import ComboPopup from '../components/ComboPopup';
import { themes } from '../utils/themes';

describe('Header', () => {
  it('테마, 시도, 짝, 시간을 표시한다', () => {
    render(
      <Header
        theme={themes.animals}
        attempts={5}
        matchedPairs={3}
        totalPairs={8}
        elapsedTime={65}
      />,
    );
    expect(screen.getByText('동물')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3/8')).toBeInTheDocument();
    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('시도 0, 경과 0초를 올바르게 표시', () => {
    render(
      <Header
        theme={themes.fruits}
        attempts={0}
        matchedPairs={0}
        totalPairs={6}
        elapsedTime={0}
      />,
    );
    expect(screen.getByText('과일')).toBeInTheDocument();
    expect(screen.getByText('0/6')).toBeInTheDocument();
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });
});

describe('ComboPopup', () => {
  it('combo가 null이면 아무것도 표시하지 않는다', () => {
    const { container } = render(<ComboPopup combo={null} />);
    expect(container.textContent).toBe('');
  });

  it('combo가 1이면 표시하지 않는다', () => {
    const { container } = render(<ComboPopup combo={1} />);
    expect(container.textContent).toBe('');
  });

  it('combo가 2 이상이면 콤보 텍스트를 표시한다', () => {
    render(<ComboPopup combo={3} />);
    expect(screen.getByText(/3콤보!/)).toBeInTheDocument();
  });
});
