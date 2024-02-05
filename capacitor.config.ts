import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.omariskandarani.vlcremote',
  appName: 'vlc-remote',
  webDir: 'www',
  server: {
    cleartext: true,
  },
  plugins: {
    Preferences:  {
        pass: {
            pass: "Empty Password"
          }
    },
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
