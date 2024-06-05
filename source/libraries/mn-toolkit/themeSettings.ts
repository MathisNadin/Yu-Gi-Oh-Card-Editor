import * as theme from './settings.json';

interface IThemeSettings {
  themeDefaultSpacing: number;
  themeDefaultItemHeight: number;
  themeDefaultBorderRadius: number;
  themeDefaultFontSize: number;
  themeMaxContentWidth: number;
  themeMaxListWidth: number;
}

export function themeSettings(): IThemeSettings {
  return theme as IThemeSettings;
}

export type TBaseColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'positive'
  | 'negative'
  | 'neutral'
  | 'warning'
  | 'info'
  | '1'
  | '2'
  | '3'
  | '4';

export type TForegroundColor = TBaseColor;

export type TBackgroundColor = TBaseColor;
