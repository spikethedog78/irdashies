/**
 * Main Lap Time Log Component
 * Displays a widget showing the current lap, last lap, and best lap times
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  useTelemetryValue,
  useTelemetryValues,
  useFocusCarIdx,
  useDrivingState,
  useSessionVisibility,
  useDashboard,
} from '@irdashies/context';
import { useLapTimeLogSettings } from './hooks/useLapTimeLogSettings';
import { getDemoLapTimeLogData, LapEntry } from './demoData';
import { TimerIcon, TargetIcon } from '@phosphor-icons/react';
import { LapTimeRow } from './components/LapTimeRow';
import type { LapTimeLogWidgetSettings } from '@irdashies/types';
import { formatTime, formatDelta } from './components/LapTimeRow'

export const LapTimeLog = () => {
  const { isDemoMode } = useDashboard();
  const settings = useLapTimeLogSettings();
  const isSessionVisible = useSessionVisibility(
    settings?.config?.sessionVisibility
  );
  const playerIndex = useFocusCarIdx();
  const { isDriving } = useDrivingState();
  const [history, setHistory] = useState<LapEntry[]>([]);
  
  // get telemetry
  const lapCompleted = useTelemetryValue<number>('LapCompleted') ?? 0;
  const currentLapTime = useTelemetryValue<number>('LapCurrentLapTime') ?? 0;
  const lastLapTime = useTelemetryValue<number>('LapLastLapTime') ?? 0;
  const bestLapTime = useTelemetryValue<number>('LapBestLapTime') ?? 0;
  const carIdxBestLapTime = useTelemetryValues<number[]>('CarIdxBestLapTime') ?? 0;
  const sessionNum = useTelemetryValue<number>('SessionNum') ?? 0;
  const sessionTime = useTelemetryValue<number>('SessionTime') ?? 0;

  // Refs for tracking state changes
  const lastLoggedLap = useRef<number>(-1);
  const lastLoggedTime = useRef<number>(-1);
  const prevSessionNum = useRef<number>(sessionNum);
  const prevSessionTime = useRef<number>(sessionTime);

  // calculate overall best
  const sessionBestOverall = useMemo(() => {
    if (!carIdxBestLapTime?.length) return undefined;
    const validLaps = carIdxBestLapTime.filter((lap) => lap > 0);
    if (validLaps.length === 0) return undefined;
    return Math.min(...validLaps);
  }, [carIdxBestLapTime]);

  // calculate predicted
  let deltaLap;
  if (settings.config.delta?.method == 'lastlap') {
    deltaLap = lastLapTime;
  } else if (settings.config.delta?.method == 'overall') {
    deltaLap = sessionBestOverall;
  } else {
    deltaLap = bestLapTime;
  }
  const deltas = {
    lastlap: useTelemetryValue<number>('LapDeltaToSessionLastlLap') ?? 0,    
    bestlap: useTelemetryValue<number>('LapDeltaToBestLap') ?? 0,
    overall: useTelemetryValue<number>('LapDeltaToSessionBestLap') ?? 0,
  };
  const liveDelta = deltas[settings.config.delta?.method] ?? deltas.bestlap;
  const predictedLap = (deltaLap !== undefined && deltaLap > 0) ? (deltaLap + liveDelta) : 0;

  // history
  useEffect(() => {
    const sessionChanged = sessionNum !== prevSessionNum.current;
    const sessionRestarted = sessionTime < prevSessionTime.current - 5;
    const isNewLap = lapCompleted > 0 && lapCompleted > lastLoggedLap.current;
    const isValidTime = lastLapTime > 0 && lastLapTime !== lastLoggedTime.current;
    setHistory((prev) => {
      // Reset history if session changed
      if (sessionChanged || sessionRestarted) {
        lastLoggedLap.current = -1;
        lastLoggedTime.current = -1;
        return [];
      }
      // Log new lap
      if (!isNewLap || !isValidTime) return prev;
      if (prev.some((entry) => entry.lap === lapCompleted)) return prev;
      const newEntry: LapEntry = {
        lap: lapCompleted,
        time: lastLapTime,
        delta: bestLapTime > 0 ? lastLapTime - bestLapTime : 0,
      };
      lastLoggedLap.current = lapCompleted;
      lastLoggedTime.current = lastLapTime;
      return [newEntry, ...prev].slice(0, 10);
    });
    prevSessionNum.current = sessionNum;
    prevSessionTime.current = sessionTime;
  }, [sessionNum, sessionTime, lapCompleted, lastLapTime, bestLapTime]);

  // demo mode
  if (isDemoMode) {
    const demoData = getDemoLapTimeLogData();
    return (
      <LapTimeLogDisplay 
        settings={settings}
        current={demoData.current} 
        lastlap={demoData.lastlap} 
        bestlap={demoData.bestlap} 
        predicted={demoData.predicted}
        overall={demoData.overall}
        history={demoData.history}
      />
    );
  }

  if (!settings || !settings.enabled || playerIndex === undefined || !isSessionVisible || !isDriving) {
    return null;
  }
 
  return (
    <LapTimeLogDisplay 
      settings={settings} 
      current={currentLapTime} 
      lastlap={lastLapTime} 
      bestlap={bestLapTime} 
      predicted={predictedLap}
      overall={sessionBestOverall}
      history={history}
    />
  );
};

export const LapTimeLogDisplay = ({
  settings,
  current,
  lastlap,
  bestlap,
  predicted,
  overall,
  history,
}: {
  settings: LapTimeLogWidgetSettings;
  current?: number;
  lastlap?: number;
  bestlap?: number;
  predicted?: number;
  overall?: number;
  history?: LapEntry[];
}) => {

  // sort laps
  const sortedHistory = useMemo(() => {
    if (!history) return [];
    return [...history]
    .sort((a, b) => b.lap - a.lap)
    .slice(0, settings.config.history.count);
  }, [history, settings]);

  // predicted delta
  const deltalap =
  settings.config.delta.method === 'lastlap'
    ? lastlap
    : settings.config.delta.method === 'overall'
    ? overall
    : bestlap;
  const delta = (predicted ?? 0) - (deltalap ?? 0);
  const deltaIsGreen = 
    delta !== undefined &&    
    delta < 0;
  const deltaIsRed = 
    delta !== undefined &&    
    delta > 0;

  // for the flash
  let bgColor = "bg-slate-800";
  if (current !== undefined && current <= 5) {
    const isSessionBest = lastlap !== undefined && lastlap > 0 && overall !== undefined && overall > 0 && Math.abs(lastlap - overall) < 0.001;
    const isPersonalBest = lastlap !== undefined && lastlap > 0 && bestlap !== undefined && bestlap > 0 && Math.abs(lastlap - bestlap) < 0.001;
    bgColor = "bg-yellow-800";
    if (isPersonalBest) bgColor = "bg-green-800";
    if (isSessionBest) bgColor = "bg-purple-800";
  }
  
  return (
    <div
      className="w-full text-sm flex flex-col items-center bg-slate-800/[var(--bg-opacity)] rounded-md px-2 py-2 text-white"
      style={{ '--bg-opacity': `${settings.config.background.opacity}%` } as React.CSSProperties}
    >
      <div className="w-full"
      style={{ 'font-size': `${settings.config.scale}%` } as React.CSSProperties}>

        {/* Current Lap Timer (The Big One) */}
        {settings.config.showCurrentLap && (
        <div 
          className={`text-[1.8em] w-full p-1 mb-2 ${bgColor}/[var(--bg-opacity)] flex relative items-center justify-center rounded-sm transition-colors duration-500`}
          style={{ '--bg-opacity': `${settings.config.background.opacity}%` } as React.CSSProperties}
        >
          <div className="absolute left-2">
            <TimerIcon weight="bold" />
          </div>
          <div className="w-full text-center tabular-nums">
            {formatTime(current !== undefined && current > 5 ? current : lastlap)}
          </div>
        </div>
        )}

        {/* Predicted (With Delta) */}
        {settings.config.showPredictedLap && (
        <div className="text-[1.3em] w-full p-1 mb-2 bg-slate-800/[var(--bg-opacity)] flex relative items-center justify-center rounded-sm"
        style={{ '--bg-opacity': `${settings.config.background.opacity}%` } as React.CSSProperties}
        >
          <div className="absolute left-2">
            <TargetIcon weight="bold" />
          </div>
          <div className="w-full text-center tabular-nums">
            {formatTime(current !== undefined && current > 5 ? predicted : deltalap)}
          </div>
          {settings.config.delta?.enabled && (
          <div className={`absolute right-2 text-center tabular-nums ${
              deltaIsGreen 
                ? 'text-green-400' 
                : (deltaIsRed ? 'text-red-400' : 'text-zinc-500')
            }`}>
            {formatDelta(current !== undefined && current > 5 ? delta : 0)}
          </div>
          )}
        </div>
        )}

        {/* Main Stats */}
        {settings.config.showLastLap && (
        <LapTimeRow label="LAST" time={lastlap} delta={(lastlap ?? 0) - (deltalap ?? 0)} best={bestlap} overall={overall} />
        )}
        {settings.config.showBestLap && (
        <LapTimeRow label="BEST" time={bestlap} delta={(bestlap ?? 0) - (deltalap ?? 0)} best={bestlap} overall={overall} />
        )}
        
        {/* History List */}
        {settings.config.history?.enabled && (
        <div className="w-full mt-1">
          {sortedHistory.map((entry) => (
            <LapTimeRow
              key={entry.lap} // Critical for React performance
              label={`LAP ${entry.lap}`}
              time={entry.time}
              delta={entry.delta}
              best={bestlap}
              overall={overall}
              settings={settings}
            />
          ))}
        </div>
        )}

      </div>
    </div>
  );
};