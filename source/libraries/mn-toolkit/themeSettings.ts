import * as theme from "./settings.json";

interface IThemeSettings {
  themeDefaultSpacing: number;
  themeDefaultItemHeight: number;
  themeDefaultBorderRadius: number;
  themeDefaultFontSize: number;
  themeMaxContentWidth: number;
  themeMaxListWidth: number;
}

export function themeSettings() : IThemeSettings {
  return theme as IThemeSettings;
}

export type TForegroundColor = 'primary' | 'secondary' | 'neutral' | 'positive' | 'calm' | 'balanced' | 'energized' | 'assertive' | 'royal' | '1' | '2' | '3' | '4';

export type TBackgroundColor = 'primary' | 'secondary' | 'neutral' | 'positive' | 'calm' | 'balanced' | 'energized' | 'assertive' | 'royal' | '1' | '2' | '3' | '4';
