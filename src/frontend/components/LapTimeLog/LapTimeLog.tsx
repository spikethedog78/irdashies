/**
 * Main Lap Time Log Component
 * Displays a widget showing the current lap, last lap, and best lap times
 */
import React, { useState, useEffect, useMemo } from 'react';
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
import { TimerIcon } from '@phosphor-icons/react';
import { LapTimeRow } from './components/LapTimeRow';
import type { LapTimeLogWidgetSettings } from '@irdashies/types';

export const LapTimeLog = () => {
  const { isDemoMode } = useDashboard();
  const settings = useLapTimeLogSettings();

  const isSessionVisible = useSessionVisibility(
    settings?.config?.sessionVisibility
  );
  const playerIndex = useFocusCarIdx();
  const { isDriving } = useDrivingState();
  
  // get telemetry
  const lapCompleted = useTelemetryValue<number>('LapCompleted') ?? 0;
  const currentLapTime = useTelemetryValue<number>('LapCurrentLapTime') ?? 0;
  const lastLapTime = useTelemetryValue<number>('LapLastLapTime') ?? 0;
  const bestLapTime = useTelemetryValue<number>('LapBestLapTime') ?? 0;
  const carIdxBestLapTime = useTelemetryValues<number[]>('CarIdxBestLapTime');

  const sessionBestOverall = useMemo(() => {
    if (!carIdxBestLapTime?.length) return undefined;
    const validLaps = carIdxBestLapTime.filter((lap) => lap > 0);
    if (validLaps.length === 0) return undefined;
    return Math.min(...validLaps);
  }, [carIdxBestLapTime]);

  const [history, setHistory] = useState<LapEntry[]>([]);

  useEffect(() => {
    if (lapCompleted > 0 && lastLapTime > 0) {
      setHistory((prev) => {
        if (prev.find(entry => entry.lap === lapCompleted)) return prev;
        const newEntry: LapEntry = { lap: lapCompleted, time: lastLapTime };
        return [newEntry, ...prev].slice(0, 10);
      });
    }
  }, [lapCompleted, lastLapTime]);

  if (isDemoMode) {
    const demoData = getDemoLapTimeLogData();
    return (
      <LapTimeLogDisplay 
        settings={settings}
        status={demoData.status} 
        current={demoData.current} 
        lastlap={demoData.lastlap} 
        bestlap={demoData.bestlap} 
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
      status={'Live'} 
      current={currentLapTime} 
      lastlap={lastLapTime} 
      bestlap={bestLapTime} 
      overall={sessionBestOverall}
      history={history}
    />
  );
};

export const LapTimeLogDisplay = ({
  settings,
  status,
  current,
  lastlap,
  bestlap,
  overall,
  history,
}: {
  settings: LapTimeLogWidgetSettings;
  status?: 'Live' | 'Demo';
  current?: number;
  lastlap?: number;
  bestlap?: number;
  overall?: number;
  history?: LapEntry[];
}) => {

  const formatTime = (time: number | undefined) => {
    if (time === undefined || time <= 0) return "00:00.000";
    const mins = Math.floor(time / 60);
    const secs = (time % 60).toFixed(3).padStart(6, '0');
    const formattedMins = mins.toString().padStart(2, '0');
    return `${formattedMins}:${secs}`;
  };

  const sortedHistory = useMemo(() => {
    if (!history) return [];
    return [...history].sort((a, b) => b.lap - a.lap);
  }, [history]);
  
  return (
    <div
      className="w-full text-sm flex flex-col items-center bg-slate-800/[var(--bg-opacity)] rounded-md px-2 py-2 text-white"
      style={{ '--bg-opacity': `${settings.config.background.opacity}%` } as React.CSSProperties}
    >
      {/* Current Lap Timer (The Big One) */}
      <div className="text-[1.8em] w-full p-1 mb-2 bg-slate-800 flex relative items-center justify-center rounded-sm">
        <div className="absolute left-2">
          <TimerIcon weight="bold" />
        </div>
        <div className="w-full text-center tabular-nums">
          {formatTime(current !== undefined && current > 5 ? current : lastlap)}
        </div>
      </div>

      {/* Main Stats */}
      <LapTimeRow label="LAST" time={lastlap} best={bestlap} overall={overall} />
      <LapTimeRow label="BEST" time={bestlap} best={bestlap} overall={overall} />
      
      {/* History List */}
      <div className="w-full mt-1">
        {sortedHistory.map((entry) => (
          <LapTimeRow
            key={entry.lap} // Critical for React performance
            label={`LAP ${entry.lap}`}
            time={entry.time}
            best={bestlap}
            overall={overall}
          />
        ))}
      </div>

      {/* Debug/Status info */}
      <div className="mt-2 text-xs uppercase opacity-40 w-full flex justify-between">
        <span>{status} Mode</span>
        <span>{formatTime(overall)}</span>
        <span>A: {settings.config.testOptionA ? 'ON' : 'OFF'} | B: {settings.config.testOptionB ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  );
};