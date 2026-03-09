import { useState, useEffect } from 'react';
import { BaseSettingsSection } from '../components/BaseSettingsSection';
import {
  LapTimeLogWidgetSettings,
  SettingsTabType,
  getWidgetDefaultConfig,
} from '@irdashies/types';
import { useDashboard } from '@irdashies/context';
import { SessionVisibility } from '../components/SessionVisibility';
import { TabButton } from '../components/TabButton';
import { SettingsSection } from '../components/SettingSection';
import { SettingSliderRow } from '../components/SettingSliderRow';
import { SettingToggleRow } from '../components/SettingToggleRow';

const SETTING_ID = 'laptimelog';

const defaultConfig = getWidgetDefaultConfig('laptimelog');

export const LapTimeLogSettings = () => {
  const { currentDashboard } = useDashboard();
  const savedSettings = currentDashboard?.widgets.find(
    (w) => w.id === SETTING_ID
  ) as LapTimeLogWidgetSettings | undefined;
  const [settings, setSettings] = useState<LapTimeLogWidgetSettings>({
    enabled: savedSettings?.enabled ?? false,
    config:
      (savedSettings?.config as LapTimeLogWidgetSettings['config']) ??
      defaultConfig,
  });

  // Tab state with persistence
  const [activeTab, setActiveTab] = useState<SettingsTabType>(
    () => (localStorage.getItem('lapTimeTab') as SettingsTabType) || 'options'
  );

  useEffect(() => {
    localStorage.setItem('lapTimeTab', activeTab);
  }, [activeTab]);

  if (!currentDashboard) {
    return <>Loading...</>;
  }

  return (
    <BaseSettingsSection
      title="Lap Time Log"
      description="Configure settings for the Lap Time Log widget. Note: The widget automatically hides while you're in the garage, in a pit stall, or on pit road."
      settings={settings}
      onSettingsChange={setSettings}
      widgetId={SETTING_ID}
    >
      {(handleConfigChange) => (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-slate-700/50">
            <TabButton
              id="options"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            >
              Options
            </TabButton>
            <TabButton
              id="visibility"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            >
              Visibility
            </TabButton>
          </div>

          <div className="pt-4">
            {/* DISPLAY TAB */}
            {activeTab === 'options' && (
              <SettingsSection title="Options">
             
                {/* Background Opacity */}
                <SettingSliderRow
                  title="Background Opacity"
                  value={settings.config.background?.opacity ?? 30}
                  units="%"
                  min={0}
                  max={100}
                  step={5}
                  onChange={(v) =>
                    handleConfigChange({
                      background: { opacity: v },
                    })
                  }
                />       

                <SettingToggleRow
                  title="Test option A"
                  description="Work in progress"
                  enabled={settings.config.testOptionA ?? true}
                  onToggle={(newValue) =>
                    handleConfigChange({ testOptionA: newValue })
                  }
                />     

                <SettingToggleRow
                  title="Test option B"
                  description="Work in progress"
                  enabled={settings.config.testOptionB ?? true}
                  onToggle={(newValue) =>
                    handleConfigChange({ testOptionB: newValue })
                  }
                />       
                           
              </SettingsSection>
            )}

            {/* VISIBILITY TAB */}
            {activeTab === 'visibility' && (
              <SettingsSection title="Session Visibility">
                <SessionVisibility
                  sessionVisibility={settings.config.sessionVisibility}
                  handleConfigChange={handleConfigChange}
                />
              </SettingsSection>
            )}
          </div>
        </div>
      )}
    </BaseSettingsSection>
  );
};
