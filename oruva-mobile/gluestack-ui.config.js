import { config as defaultConfig } from '@gluestack-ui/config';

export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      primary: '#6366F1',
      primary50: '#EEF2FF',
      primary100: '#E0E7FF',
      primary200: '#C7D2FE',
      primary300: '#A5B4FC',
      primary400: '#818CF8',
      primary500: '#6366F1',
      primary600: '#4F46E5',
      primary700: '#4338CA',
      primary800: '#3730A3',
      primary900: '#312E81',
      secondary: '#10B981',
      secondary500: '#10B981',
    },
  },
};

export default config;
