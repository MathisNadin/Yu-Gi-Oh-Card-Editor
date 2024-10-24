export * from './ThemeService';

import { ThemeService } from './ThemeService';

declare global {
  interface IApp {
    $theme: ThemeService;
  }

  interface IAppTheme {
    // Main colors
    positive: TThemeColor;
    negative: TThemeColor;
    neutral: TThemeColor;
    warning: TThemeColor;
    info: TThemeColor;
    primary: TThemeColor;
    secondary: TThemeColor;
    tertiary: TThemeColor;

    // Darken variations
    'positive-darken': TThemeColor;
    'negative-darken': TThemeColor;
    'neutral-darken': TThemeColor;
    'warning-darken': TThemeColor;
    'info-darken': TThemeColor;
    'primary-darken': TThemeColor;
    'secondary-darken': TThemeColor;
    'tertiary-darken': TThemeColor;

    // Lighten variations
    'positive-lighten': TThemeColor;
    'negative-lighten': TThemeColor;
    'neutral-lighten': TThemeColor;
    'warning-lighten': TThemeColor;
    'info-lighten': TThemeColor;
    'primary-lighten': TThemeColor;
    'secondary-lighten': TThemeColor;
    'tertiary-lighten': TThemeColor;

    // Theme Dark Background Colors
    'theme-dark-bg-1': TThemeColor;
    'theme-dark-bg-2': TThemeColor;
    'theme-dark-bg-3': TThemeColor;
    'theme-dark-bg-4': TThemeColor;

    // Theme Dark Foreground Colors
    'theme-dark-fg-1': TThemeColor;
    'theme-dark-fg-2': TThemeColor;
    'theme-dark-fg-3': TThemeColor;
    'theme-dark-fg-4': TThemeColor;

    // Theme Light Background Colors
    'theme-light-bg-1': TThemeColor;
    'theme-light-bg-2': TThemeColor;
    'theme-light-bg-3': TThemeColor;
    'theme-light-bg-4': TThemeColor;

    // Theme Light Foreground Colors
    'theme-light-fg-1': TThemeColor;
    'theme-light-fg-2': TThemeColor;
    'theme-light-fg-3': TThemeColor;
    'theme-light-fg-4': TThemeColor;

    // Dimensions
    'theme-default-spacing': IThemeUnitValue;
    'theme-default-item-height': IThemeUnitValue;
    'theme-default-border-radius': IThemeUnitValue;
    'theme-max-content-width': IThemeUnitValue;
    'theme-max-list-width': IThemeUnitValue;
    'theme-field-border-size': IThemeUnitValue;

    // Font
    'theme-default-font-name': IThemeFonts;
    'theme-default-font-size': IThemeUnitValue;
  }
}

// Either RGB or a reference to another css variable (NO hexadecimal code!!)
export type TThemeColor = [number, number, number] | string;

export interface IThemeUnitValue {
  value: number;
  unit: 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw';
}

export interface IThemeFonts {
  fonts: string[]; // Font names in order of priority
  urls?: string[]; // Fonts links
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
