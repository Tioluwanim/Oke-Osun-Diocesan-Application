const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || 'development';
const APP_NAME =
  APP_ENV === 'production'
    ? 'Oke Osun Diocese'
    : `Oke Osun Diocese (${APP_ENV})`;

const APP_SLUG = 'oke-osun-diocese';
const IOS_BUNDLE_ID =
  process.env.IOS_BUNDLE_IDENTIFIER || 'ng.okeosun.diocese';
const ANDROID_PACKAGE =
  process.env.ANDROID_PACKAGE || 'ng.okeosun.diocese';

export default {
  expo: {
    owner: 'tioluwanimi',
    name: APP_NAME,
    slug: APP_SLUG,
    version: '1.0.0',
    orientation: 'portrait',

    icon: './assets/icon.png',

    userInterfaceStyle: 'dark',

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0A0C10',
    },

    ios: {
      bundleIdentifier: IOS_BUNDLE_ID,
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: 'Used to upload sermon and event photos.',
        NSPhotoLibraryUsageDescription: 'Used to select photos for your profile and uploads.',
        NSMicrophoneUsageDescription: 'Used to record audio for sermons.',
        UIBackgroundModes: ['audio', 'fetch'],
      },
    },

    android: {
      package: ANDROID_PACKAGE,
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        backgroundColor: '#0A0C10',
      },
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#0A0C10',
      },
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.RECORD_AUDIO',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.VIBRATE',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
      ],
    },

    web: {
      favicon: './assets/favicon.png',
    },

    plugins: [
      'expo-secure-store',
      'expo-notifications',
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: false,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 24,
          },
          ios: {},
        },
      ],
      [
        'expo-av',
        {
          microphonePermission:
            'Allow Oke-Osun Diocese to access your microphone for sermon recording.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow Oke-Osun Diocese to access your photos for profile and uploads.',
          cameraPermission: 'Allow Oke-Osun Diocese to access your camera.',
        },
      ],
    ],

    extra: {
      appEnv: APP_ENV,
      eas: {
        projectId: '0414bab3-4fd3-4eb8-9e23-f7ba52b8c0d3',
      },
    },
  },
};