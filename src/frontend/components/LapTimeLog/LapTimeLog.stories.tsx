import type { Meta, StoryObj } from '@storybook/react-vite';
import { LapTimeLogDisplay } from './LapTimeLog';
import type { BaseWidgetSettings, LapTimeLogConfig } from '@irdashies/types';

const meta: Meta<typeof LapTimeLogDisplay> = {
  title: 'widgets/LapTimeLog',
  component: LapTimeLogDisplay,
};

export default meta;

type Story = StoryObj<typeof LapTimeLogDisplay>;

const mockConfig = (
  overrides: Partial<LapTimeLogConfig> = {}
): LapTimeLogConfig => ({
  background: { opacity: 80 },
  scale: 1,
  showCurrentLap: true,
  showPredictedLap: true,
  showLastLap: true,
  showBestLap: true,
  delta: {
    enabled: true,
    method: 'bestlap',
  },
  history: {
    enabled: true,
    count: 10,
  },
  sessionVisibility: {
    race: true,
    loneQualify: true,
    openQualify: true,
    practice: true,
    offlineTesting: true,
  },
  ...overrides,
});

const mockSettings = (
  overrides: Partial<LapTimeLogConfig> = {}
): BaseWidgetSettings<LapTimeLogConfig> => ({
  enabled: true,
  config: mockConfig(overrides),
});

export const Test: Story = {
  args: {
    settings: mockSettings(),
  },
};

export const Demo: Story = {
  args: {
    settings: mockSettings(),
  },
};