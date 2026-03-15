import { useState, useCallback } from 'react';
import { useGame } from './hooks/useGame';
import { useVsGame } from './hooks/useVsGame';
import { useTimeAttack } from './hooks/useTimeAttack';
import { useDarkMode } from './hooks/useDarkMode';
import StartScreen from './components/StartScreen';
import Board from './components/Board';
import Header from './components/Header';
import ClearScreen from './components/ClearScreen';
import ComboPopup from './components/ComboPopup';
import EncouragementPopup from './components/EncouragementPopup';
import StageIntro from './components/StageIntro';
import StageClearScreen from './components/StageClearScreen';
import VsSetup from './components/VsSetup';
import VsResult from './components/VsResult';
import RankingScreen from './components/RankingScreen';
import StatsScreen from './components/StatsScreen';
import TimeAttackSetup from './components/TimeAttackSetup';
import TimeAttackResult from './components/TimeAttackResult';
import AchievementsScreen from './components/AchievementsScreen';
import AchievementPopup from './components/AchievementPopup';
import { getDailyChallenge } from './utils/dailyChallenge';
import { formatTime } from './utils/records';
import type { ThemeKey, Difficulty } from './types';

type AppMode = 'solo' | 'vs' | 'timeattack';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('solo');
  const game = useGame();
  const vs = useVsGame();
  const ta = useTimeAttack();
  const { isDark, toggleDark } = useDarkMode();

  const handleStartTimeAttack = useCallback(() => {
    setAppMode('timeattack');
  }, []);

  const handleStartDaily = useCallback(() => {
    const challenge = getDailyChallenge();
    game.startGame(challenge.theme, challenge.difficulty, 'daily');
  }, [game]);

  // Time Attack mode
  if (appMode === 'timeattack') {
    if (ta.phase === 'setup') {
      return (
        <TimeAttackSetup
          onStart={(theme: ThemeKey, diff: Difficulty) => ta.startTimeAttack(theme, diff)}
          onBack={() => setAppMode('solo')}
        />
      );
    }

    if (ta.phase === 'loading') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <div className="text-8xl animate-bounce">{ta.theme.icon}</div>
          <p className="text-3xl font-bold animate-pulse dark:text-white">불러오는 중...</p>
          <button
            onClick={() => {
              ta.goToSetup();
              setAppMode('solo');
            }}
            className="px-10 py-4 rounded-xl font-bold text-2xl shadow-md transition-all duration-200 bg-white/80 dark:bg-gray-700/80 dark:text-white hover:bg-white dark:hover:bg-gray-600 hover:scale-105"
          >
            🏠 나가기
          </button>
        </div>
      );
    }

    if (ta.phase === 'clear' || ta.phase === 'timeout') {
      if (ta.result) {
        return (
          <TimeAttackResult
            result={ta.result}
            onRetry={() => ta.startTimeAttack(ta.themeKey, ta.difficulty)}
            onGoHome={() => {
              ta.goToSetup();
              setAppMode('solo');
            }}
          />
        );
      }
    }

    // Time Attack playing
    return (
      <div className="min-h-screen flex flex-col items-center px-2 py-4">
        {/* Countdown timer header */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 px-6 py-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-md mb-4 text-2xl md:text-3xl dark:text-white">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{ta.theme.icon}</span>
            <span className="font-bold">{ta.theme.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🔄</span>
            <span>시도: </span>
            <strong>{ta.attempts}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">✅</span>
            <span>짝: </span>
            <strong>{ta.matchedPairs}/{ta.totalPairs}</strong>
          </div>
          <div className={`flex items-center gap-2 font-bold ${ta.remainingTime <= 10 ? 'text-red-500 animate-pulse' : ta.remainingTime <= 30 ? 'text-orange-500' : ''}`}>
            <span className="text-3xl">⏰</span>
            <span>{formatTime(ta.remainingTime)}</span>
          </div>
        </div>

        <Board
          cards={ta.cards}
          diffConfig={ta.diffConfig}
          theme={ta.theme}
          onCardClick={ta.flipCard}
          matchedIds={ta.matchedAnimIds}
          shakeIds={ta.shakeAnimIds}
        />

        <div className="mt-4">
          <button
            onClick={() => {
              ta.goToSetup();
              setAppMode('solo');
            }}
            className="px-10 py-4 rounded-xl font-bold text-2xl shadow-md transition-all duration-200 bg-white/80 dark:bg-gray-700/80 dark:text-white hover:bg-white dark:hover:bg-gray-600 hover:scale-105"
          >
            🏠 나가기
          </button>
        </div>
      </div>
    );
  }

  // VS mode
  if (appMode === 'vs') {
    if (vs.phase === 'setup') {
      return (
        <VsSetup
          onStart={(theme, diff, names) => vs.startVsGame(theme, diff, names)}
          onBack={() => setAppMode('solo')}
        />
      );
    }

    if (vs.phase === 'loading') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <div className="text-8xl animate-bounce">{vs.theme.icon}</div>
          <p className="text-3xl font-bold animate-pulse dark:text-white">불러오는 중...</p>
          <button
            onClick={() => {
              vs.goToSetup();
              setAppMode('solo');
            }}
            className="px-10 py-4 rounded-xl font-bold text-2xl shadow-md transition-all duration-200 bg-white/80 dark:bg-gray-700/80 dark:text-white hover:bg-white dark:hover:bg-gray-600 hover:scale-105"
          >
            🏠 나가기
          </button>
        </div>
      );
    }

    if (vs.phase === 'result') {
      return (
        <VsResult
          playerNames={vs.playerNames}
          scores={vs.scores}
          elapsedTime={vs.elapsedTime}
          onGoToSetup={() => vs.goToSetup()}
          onGoHome={() => setAppMode('solo')}
        />
      );
    }

    // VS playing
    return (
      <div className="min-h-screen flex flex-col items-center px-2 py-4">
        {/* Player turn indicator */}
        <div className="flex gap-4 mb-3 w-full max-w-2xl px-4">
          {vs.playerNames.map((name, i) => (
            <div
              key={i}
              className={`flex-1 text-center py-3 rounded-xl font-bold text-2xl transition-all duration-300 ${
                vs.currentPlayer === i
                  ? i === 0
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'
              }`}
            >
              {i === 0 ? '🔵' : '🔴'} {name}: {vs.scores[i]}쌍
            </div>
          ))}
        </div>

        <Board
          cards={vs.cards}
          diffConfig={vs.diffConfig}
          theme={vs.theme}
          onCardClick={vs.flipCard}
          matchedIds={vs.matchedAnimIds}
          shakeIds={vs.shakeAnimIds}
        />

        <div className="mt-4">
          <button
            onClick={() => {
              vs.goToSetup();
              setAppMode('solo');
            }}
            className="px-10 py-4 rounded-xl font-bold text-2xl shadow-md transition-all duration-200 bg-white/80 dark:bg-gray-700/80 dark:text-white hover:bg-white dark:hover:bg-gray-600 hover:scale-105"
          >
            🏠 나가기
          </button>
        </div>
      </div>
    );
  }

  // Solo mode
  if (game.phase === 'start') {
    return (
      <StartScreen
        onStart={game.startGame}
        onStartStage={game.startStageMode}
        onStartVs={() => setAppMode('vs')}
        onStartTimeAttack={handleStartTimeAttack}
        onStartDaily={handleStartDaily}
        onShowRanking={game.goToRanking}
        onShowStats={game.goToStats}
        onShowAchievements={game.goToAchievements}
        isDark={isDark}
        onToggleDark={toggleDark}
      />
    );
  }

  if (game.phase === 'achievements') {
    return <AchievementsScreen onBack={game.goToStart} />;
  }

  if (game.phase === 'stats') {
    return <StatsScreen onBack={game.goToStart} />;
  }

  if (game.phase === 'ranking') {
    return (
      <RankingScreen
        onBack={game.goToStart}
        highlightEntry={game.rankHighlight}
      />
    );
  }

  if (game.phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-8xl animate-bounce">{game.theme.icon}</div>
        <p className="text-3xl font-bold animate-pulse">불러오는 중...</p>
        <button
          onClick={game.goToStart}
          className="px-10 py-4 rounded-xl font-bold text-2xl shadow-md transition-all duration-200 bg-white/80 dark:bg-gray-700/80 dark:text-white hover:bg-white dark:hover:bg-gray-600 hover:scale-105"
        >
          🏠 나가기
        </button>
      </div>
    );
  }

  if (game.phase === 'stage-intro') {
    return (
      <StageIntro
        stageIndex={game.stageIndex}
        onBegin={game.beginStage}
      />
    );
  }

  if (game.phase === 'stage-clear') {
    return (
      <StageClearScreen
        totalAttempts={game.stageTotalAttempts}
        totalTime={game.stageTotalTime}
        theme={game.theme}
        onGoToStart={game.goToStart}
      />
    );
  }

  if (game.phase === 'clear') {
    return (
      <>
        <AchievementPopup
          achievements={game.achievementPopup}
          onDone={() => game.setAchievementPopup([])}
        />
        <ClearScreen
          attempts={game.attempts}
          totalPairs={game.totalPairs}
          elapsedTime={game.elapsedTime}
          theme={game.theme}
          isNewRecord={game.isNewRecord}
          rankPosition={game.rankPosition}
          onRestart={game.restart}
          onGoToStart={game.goToStart}
          onNicknameSubmit={game.handleNicknameSubmit}
          onGoToRanking={game.goToRankingFromClear}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-1 md:px-2 py-2 md:py-4">
      <AchievementPopup
        achievements={game.achievementPopup}
        onDone={() => game.setAchievementPopup([])}
      />
      <ComboPopup combo={game.comboPopup} />
      <EncouragementPopup message={game.encouragement} />

      {game.mode === 'stage' && (
        <div className="mb-1 md:mb-2 text-lg md:text-2xl font-bold text-purple-700 dark:text-purple-300 bg-white/60 dark:bg-gray-800/60 px-4 py-1 md:px-6 md:py-2 rounded-full">
          Stage {game.stageIndex + 1} {game.diffConfig.icon}
        </div>
      )}

      <Header
        theme={game.theme}
        attempts={game.attempts}
        matchedPairs={game.matchedPairs}
        totalPairs={game.totalPairs}
        elapsedTime={game.elapsedTime}
      />

      <Board
        cards={game.cards}
        diffConfig={game.diffConfig}
        theme={game.theme}
        onCardClick={game.flipCard}
        matchedIds={game.matchedAnimIds}
        shakeIds={game.shakeAnimIds}
      />

      <div className="mt-2 md:mt-4 flex gap-2 md:gap-3">
        <button
          onClick={game.useHint}
          disabled={game.hintsLeft <= 0}
          className={`px-5 md:px-10 py-2 md:py-4 rounded-xl font-bold text-lg md:text-2xl shadow-md transition-all duration-200 ${
            game.hintsLeft > 0
              ? 'bg-yellow-400 hover:bg-yellow-500 text-white hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          💡 힌트 ({game.hintsLeft})
        </button>
        <button
          onClick={game.goToStart}
          className="px-5 md:px-10 py-2 md:py-4 rounded-xl font-bold text-lg md:text-2xl shadow-md transition-all duration-200 bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 hover:scale-105"
        >
          🏠 나가기
        </button>
      </div>
    </div>
  );
}

export default App;
