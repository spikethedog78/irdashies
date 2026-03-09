// Demo data for Lap Time Log component
export interface LapEntry {
  lap: number;
  time: number;
}

export interface LapTimeLogDemoData {
  status: 'Demo';
  current: number;
  lastlap: number;
  bestlap: number;
  overall: number;
  history: LapEntry[];
}

// Demo data for pitlane helper
export const getDemoLapTimeLogData = (): LapTimeLogDemoData => {
  return {    
    status: 'Demo',
    current: 84.010,
    lastlap: 85.249,
    bestlap: 82.401,
    overall: 82.401,
    history: [
      { "lap": 1, "time": 82.401 },
      { "lap": 2, "time": 83.150 },
      { "lap": 3, "time": 84.254 },
      { "lap": 4, "time": 84.541 },
      { "lap": 5, "time": 84.211 },
      { "lap": 6, "time": 85.001 },
      { "lap": 7, "time": 84.999 },
      { "lap": 8, "time": 84.000 },
      { "lap": 9, "time": 83.123 },
      { "lap": 10, "time": 83.457 },
    ]
  };
};
