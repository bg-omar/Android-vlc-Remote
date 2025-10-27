import '@capacitor/core';

declare module '@capacitor/core' {
  interface CapacitorPlugins {
    SharedPrefsPlugin: SharedPrefsPlugin;
  }
}

export interface SharedPrefsPlugin {
  getPreference(options: { key: string }): Promise<{ value: string }>;
  setPreference(options: { key: string, value: string }): Promise<void>;
}
