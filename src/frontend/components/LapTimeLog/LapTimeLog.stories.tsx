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
  testOptionA: true,
  testOptionB: true,
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
    status: 'Test',
  },
};

export const Demo: Story = {
  args: {
    settings: mockSettings(),
    status: 'Demo',
  },
};