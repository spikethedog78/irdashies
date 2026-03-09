interface LapTimeRowProps {
  label: string;
  time: number | undefined; 
  best: number | undefined;
  overall: number | undefined;
}

export const LapTimeRow = ({ label, time, best, overall }: LapTimeRowProps) => {
  
  const formatTime = (t: number | undefined) => {
    if (!t || t <= 0) return "00:00.000";
    const mins = Math.floor(t / 60);
    const secs = (t % 60).toFixed(3).padStart(6, '0');
    return `${mins.toString().padStart(2, '0')}:${secs}`;
  };

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

  return (
    <div className="flex w-full text-md justify-between items-center p-1 border-b border-slate-600 last:border-0">
      <span className="text-white tabular-nums uppercase">
        {label}
      </span>
      <span className={`tabular-nums ${
          isPurple 
            ? 'text-purple-400' 
            : (isGreen ? 'text-green-400' : 'text-zinc-100')
        }`}>
        {formatTime(time)}
      </span>
    </div>
  );
};