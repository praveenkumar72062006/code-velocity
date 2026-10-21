import { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../services/soundEngine';

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  errorChars: number;
  totalKeystrokes: number;
  timeElapsed: number;
  combo: number;
  nitroProgress: number; // 0 to 100
  isNitroReady: boolean;
  burstWpm: number;
}

export interface ProblemKeyMap {
  [char: string]: { hits: number; misses: number };
}

interface UseTypingEngineProps {
  targetText: string;
  isStrict?: boolean;
  onFinish?: (finalStats: TypingStats) => void;
  onNitroDeploy?: () => void;
  disabled?: boolean;
}

export function useTypingEngine({
  targetText,
  isStrict = true,
  onFinish,
  onNitroDeploy,
  disabled = false,
}: UseTypingEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorChar, setErrorChar] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [nitroProgress, setNitroProgress] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [burstWpm, setBurstWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [problemKeys, setProblemKeys] = useState<ProblemKeyMap>({});

  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const recentKeystrokeTimes = useRef<number[]>([]);

  // Reset engine when target text changes
  const resetEngine = useCallback((newText?: string) => {
    setCurrentIndex(0);
    setErrorChar(null);
    setHasError(false);
    setIsStarted(false);
    setIsFinished(false);
    setCorrectCount(0);
    setErrorCount(0);
    setTotalKeystrokes(0);
    setCombo(0);
    setNitroProgress(0);
    setWpm(0);
    setBurstWpm(0);
    setAccuracy(100);
    setTimeElapsed(0);
    startTimeRef.current = null;
    recentKeystrokeTimes.current = [];
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Automatically reset engine state whenever target text changes
  useEffect(() => {
    resetEngine();
  }, [targetText, resetEngine]);

  // Timer & WPM calculation loop
  useEffect(() => {
    if (isStarted && !isFinished) {
      timerIntervalRef.current = window.setInterval(() => {
        if (!startTimeRef.current) return;
        const now = Date.now();
        const seconds = Math.max(0.5, (now - startTimeRef.current) / 1000);
        setTimeElapsed(Math.floor(seconds));

        // Standard WPM = (correct chars / 5) / (seconds / 60)
        const minutes = seconds / 60;
        const calculatedWpm = Math.round((correctCount / 5) / minutes);
        setWpm(Math.max(0, calculatedWpm));

        // Burst WPM calculation over last 3 seconds
        const threeSecAgo = now - 3000;
        recentKeystrokeTimes.current = recentKeystrokeTimes.current.filter(t => t > threeSecAgo);
        const burstCalculated = Math.round((recentKeystrokeTimes.current.length / 5) / (3 / 60));
        setBurstWpm(prev => Math.max(prev, burstCalculated));

        // Accuracy
        if (totalKeystrokes > 0) {
          const acc = Math.round((correctCount / totalKeystrokes) * 1000) / 10;
          setAccuracy(acc);
        }
      }, 250);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isStarted, isFinished, correctCount, totalKeystrokes]);

  // Key recording helper
  const recordKeyTelemetry = useCallback((char: string, isHit: boolean) => {
    setProblemKeys(prev => {
      const existing = prev[char] || { hits: 0, misses: 0 };
      return {
        ...prev,
        [char]: {
          hits: existing.hits + (isHit ? 1 : 0),
          misses: existing.misses + (isHit ? 0 : 1),
        },
      };
    });
  }, []);

  // Nitro deploy
  const deployNitro = useCallback(() => {
    if (nitroProgress >= 100) {
      soundEngine.playNitro();
      setNitroProgress(0);
      onNitroDeploy?.();
    }
  }, [nitroProgress, onNitroDeploy]);

  // Handle Keystrokes with Multi-Line & Auto-Indentation Support
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled || isFinished) return;

      // Ignore if user is currently typing inside an input, textarea or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Deploy Nitro with Enter when nitro is fully ready and NOT at a newline character
      const expectedChar = targetText[currentIndex];
      if (e.key === 'Enter' && nitroProgress >= 100 && expectedChar !== '\n') {
        e.preventDefault();
        deployNitro();
        return;
      }

      // Ignore navigation / system control keys, but allow Tab and Enter
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      // Prevent default scrolling on Space, Tab, or Backspace
      if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab') {
        e.preventDefault();
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        if (hasError) {
          setHasError(false);
          setErrorChar(null);
        } else if (!isStrict && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
        return;
      }

      // Start timer on first valid keypress
      if (!isStarted) {
        setIsStarted(true);
        startTimeRef.current = Date.now();
      }

      setTotalKeystrokes(prev => prev + 1);
      recentKeystrokeTimes.current.push(Date.now());

      // If strict mode and already has error, cannot advance without backspace
      if (isStrict && hasError) {
        soundEngine.playError();
        setShakeError(true);
        setTimeout(() => setShakeError(false), 150);
        return;
      }

      // MATCH VALIDATION: Check if key matches expectedChar
      // Case 1: Expected is a newline '\n' and user presses 'Enter'
      // Case 2: Expected is a character that matches e.key directly
      const isEnterForNewline = expectedChar === '\n' && e.key === 'Enter';
      const isDirectMatch = e.key === expectedChar;

      if (isEnterForNewline || isDirectMatch) {
        // Correct Keystroke!
        soundEngine.playKeystroke();
        recordKeyTelemetry(expectedChar, true);

        let advancedChars = 1;
        let nextIndex = currentIndex + 1;

        // Smart Code Auto-Indentation:
        // If we just completed a newline ('\n'), automatically consume and skip the leading spaces of the new line!
        if (isEnterForNewline) {
          while (nextIndex < targetText.length && targetText[nextIndex] === ' ') {
            advancedChars++;
            nextIndex++;
          }
        }

        setCorrectCount(prev => prev + advancedChars);
        setCombo(prev => {
          const next = prev + 1;
          if (next % 8 === 0) {
            setNitroProgress(np => Math.min(100, np + 20));
          }
          return next;
        });

        setCurrentIndex(nextIndex);
        setHasError(false);
        setErrorChar(null);

        // Check if finished
        if (nextIndex >= targetText.length) {
          setIsFinished(true);
          soundEngine.playVictory();
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

          const finalSeconds = startTimeRef.current ? Math.max(1, (Date.now() - startTimeRef.current) / 1000) : 1;
          const finalWpm = Math.round(((correctCount + advancedChars) / 5) / (finalSeconds / 60));
          const finalAcc = Math.round(((correctCount + advancedChars) / (totalKeystrokes + 1)) * 1000) / 10;

          const stats: TypingStats = {
            wpm: finalWpm,
            rawWpm: Math.round(((totalKeystrokes + 1) / 5) / (finalSeconds / 60)),
            accuracy: finalAcc,
            correctChars: correctCount + advancedChars,
            errorChars: errorCount,
            totalKeystrokes: totalKeystrokes + 1,
            timeElapsed: Math.floor(finalSeconds),
            combo: combo + 1,
            nitroProgress,
            isNitroReady: nitroProgress >= 100,
            burstWpm: Math.max(burstWpm, finalWpm),
          };

          onFinish?.(stats);
        }
      } else {
        // Mistake / Typo
        soundEngine.playError();
        recordKeyTelemetry(expectedChar, false);
        setErrorCount(prev => prev + 1);
        setCombo(0);
        setHasError(true);
        setErrorChar(e.key);
        setShakeError(true);
        setTimeout(() => setShakeError(false), 150);
      }
    },
    [
      disabled,
      isFinished,
      nitroProgress,
      deployNitro,
      targetText,
      currentIndex,
      hasError,
      isStrict,
      isStarted,
      recordKeyTelemetry,
      correctCount,
      combo,
      totalKeystrokes,
      errorCount,
      burstWpm,
      onFinish,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const progressPercent = targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0;

  return {
    currentIndex,
    hasError,
    errorChar,
    shakeError,
    isStarted,
    isFinished,
    progressPercent,
    stats: {
      wpm,
      rawWpm: Math.round((totalKeystrokes / 5) / (Math.max(0.5, timeElapsed) / 60)) || 0,
      accuracy,
      correctChars: correctCount,
      errorChars: errorCount,
      totalKeystrokes,
      timeElapsed,
      combo,
      nitroProgress,
      isNitroReady: nitroProgress >= 100,
      burstWpm,
    },
    problemKeys,
    resetEngine,
    deployNitro,
  };
}
