import Constants from 'expo-constants';

const appVariant = Constants.expoConfig?.extra?.appVariant ?? 'production';

const Config = {
  appVariant,
  isDev: appVariant === 'development',
  isPreview: appVariant === 'preview',
  isProduction: appVariant === 'production',
};

export default Config;
