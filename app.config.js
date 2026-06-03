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

    userInterfaceStyle: 'light',

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    {
      "ios": {
        "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
        }
      }
    },
    android: {
      package: ANDROID_PACKAGE,
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
    },

    web: {
      favicon: './assets/favicon.png',
    },

    plugins: [
      'expo-secure-store',
      'expo-build-properties',
    ],

    extra: {
      appEnv: APP_ENV,
      eas: {
        projectId: '0414bab3-4fd3-4eb8-9e23-f7ba52b8c0d3',
      },
    },
  },
};