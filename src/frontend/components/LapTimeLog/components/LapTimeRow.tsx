import type { LapTimeLogWidgetSettings } from '@irdashies/types';

interface LapTimeRowProps {
  label: string;
  time: number | undefined; 
  delta?: number | undefined; 
  best?: number | undefined;
  overall?: number | undefined;
  settings?: LapTimeLogWidgetSettings
}

export const formatTime = (t: number | undefined) => {
  if (!t || t <= 0) return "00:00.000";
  const mins = Math.floor(t / 60);
  const secs = (Math.floor((t % 60) * 1000) / 1000).toFixed(3).padStart(6, '0');
  return `${mins.toString().padStart(2, '0')}:${secs}`;
};

export const formatDelta = (delta: number | undefined) => {
  if (delta === undefined || delta === 0) return "";
  const formatter = new Intl.NumberFormat('en-US', {
    signDisplay: 'always',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });    
  return formatter.format(delta);
};

export const LapTimeRow = ({ label, time, delta, best, overall, settings }: LapTimeRowProps) => {
  
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

  const deltaIsGreen = 
    delta !== undefined &&    
    delta < 0;

  const deltaIsRed = 
    delta !== undefined &&    
    delta > 0;

  return (
    <div className="flex w-full text-[1em] py-0.5 px-2 odd:bg-slate-800/40 even:bg-slate-900/40">
      <span className="flex-1 text-white tabular-nums uppercase">
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
      <span className={`flex-1 text-right tabular-nums ${
          isPurple 
            ? 'text-purple-400' 
            : (isGreen ? 'text-green-400' : 'text-zinc-100')
        }`}>
        {formatTime(time)}
      </span>
    </div>
  );
};