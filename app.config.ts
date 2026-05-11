import { ExpoConfig, ConfigContext } from 'expo/config';
import packageJson from './package.json';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.cisspquiz.dev';
  if (IS_PREVIEW) return 'com.cisspquiz.preview';
  return 'com.cisspquiz';
};

const getAppName = () => {
  if (IS_DEV) return 'CISSP Quiz (Dev)';
  if (IS_PREVIEW) return 'CISSP Quiz (Preview)';
  return 'CISSP Quiz';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'cisspquiz',
  version: packageJson.version,
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  scheme: 'cisspquiz',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,
  splash: {
    image: './src/assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1e293b',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#1e293b',
    },
    package: getUniqueIdentifier(),
    versionCode: 1,
  },
  extra: {
    appVariant: process.env.APP_VARIANT ?? 'production',
    eas: {
      projectId: '7d1a8533-6c5d-43ec-af4e-0e433cbb8b9f',
    },
  },
  plugins: ['expo-router', 'expo-sqlite'],
});
