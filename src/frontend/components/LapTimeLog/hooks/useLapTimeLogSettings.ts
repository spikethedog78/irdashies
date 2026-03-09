import { useDashboard } from '@irdashies/context';
import type { LapTimeLogWidgetSettings } from '@irdashies/types';

const DEFAULT_CONFIG: LapTimeLogWidgetSettings = {
  enabled: false,
  config: {
    testOptionA: true,
    testOptionB: true,
    background: {
      opacity: 30,
    },
    sessionVisibility: {
      race: true,
      loneQualify: true,
      openQualify: true,
      practice: true,
      offlineTesting: true,
    },
  },
};

export const useLapTimeLogSettings = () => {
  const { currentDashboard } = useDashboard();

  const saved = currentDashboard?.widgets.find((w) => w.id === 'laptimelog') as
    | LapTimeLogWidgetSettings
    | undefined;

  if (saved && typeof saved === 'object') {
    return {
      ...DEFAULT_CONFIG,
      enabled: saved.enabled ?? DEFAULT_CONFIG.enabled,
      config: {
        ...DEFAULT_CONFIG.config,
        background: {
          opacity:
            saved.config.background?.opacity ??
            DEFAULT_CONFIG.config.background.opacity,
        },
        testOptionA: saved.config?.testOptionA ?? DEFAULT_CONFIG.config.testOptionA,
        testOptionB: saved.config?.testOptionB ?? DEFAULT_CONFIG.config.testOptionB,       
        sessionVisibility: saved.config?.sessionVisibility ?? DEFAULT_CONFIG.config.sessionVisibility,
      },
    } as LapTimeLogWidgetSettings;
  }

  return DEFAULT_CONFIG;
};