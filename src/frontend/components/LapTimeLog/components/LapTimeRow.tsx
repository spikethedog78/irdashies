import type { LapTimeLogWidgetSettings } from '@irdashies/types';
import { formatTime } from '@irdashies/utils/time';

interface LapTimeRowProps {
  label: string;
  time: number | undefined; 
  delta?: number | undefined; 
  dirty?: boolean;
  best?: number | undefined;
  overall?: number | undefined; 
  settings?: LapTimeLogWidgetSettings
}

export const formatDelta = (delta: number | undefined) => {
  if (delta === undefined || delta === 0) return "";
  const formatter = new Intl.NumberFormat('en-US', {
    signDisplay: 'always',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });    
  return formatter.format(delta);
};

export const LapTimeRow = ({ label, time, delta, dirty, best, overall, settings }: LapTimeRowProps) => {
  
  const isGreen = 
    time !== undefined && 
    best !== undefined && 
    time > 0 && 
    time <= best;

  const isPurple = 
    time !== undefined && 
    overall !== undefined && 
    time > 0 && 
    time <= overall;

  const isDirty = dirty ?? false;

  const deltaIsGreen = 
    delta !== undefined &&    
    delta < 0;

  const deltaIsRed = 
    delta !== undefined &&    
    delta > 0;  

  const opacity = settings?.config?.foreground?.opacity ?? 0;

  const getLapColor = () => {
    if (isDirty) return 'text-zinc-400';
    if (isPurple) return 'text-purple-400';
    if (isGreen) return 'text-green-400';
    return 'text-white';
  };

  return (
      <div
        className="flex w-full text-[1em] py-0.5 px-2 odd:bg-slate-800/[var(--fg-alpha)] even:bg-slate-900/[var(--fg-alpha)]"
        style={{ '--fg-alpha': `${opacity / 3}%` } as React.CSSProperties}       
      >
      <span className="flex-1 ${textColor} tabular-nums uppercase">
        {label}
      </span>
      {settings?.config.delta?.enabled && (
      <span className={`flex-1 text-center tabular-nums ${
          deltaIsGreen 
            ? 'text-green-400' 
            : (deltaIsRed ? 'text-red-400' : 'text-zinc-500')
        }`}>
        {formatDelta(delta)}
      </span>
      )}
      <span className={`flex-1 text-right tabular-nums ${getLapColor()}`}>
        {formatTime(time)}
      </span>
    </div>
  );
};