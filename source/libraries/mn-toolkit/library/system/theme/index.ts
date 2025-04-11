export * from './ThemeService';

import { TScreenSize } from '../device';
import { ThemeService } from './ThemeService';

declare global {
  interface IApp {
    $theme: ThemeService;
  }

  interface IAppThemeThemesColors {
    positive: TThemeColor;
    negative: TThemeColor;
    neutral: TThemeColor;
    warning: TThemeColor;
    info: TThemeColor;
    primary: TThemeColor;
    secondary: TThemeColor;
    tertiary: TThemeColor;

    // Variations
    'positive-darken': TThemeColor;
    'negative-darken': TThemeColor;
    'neutral-darken': TThemeColor;
    'warning-darken': TThemeColor;
    'info-darken': TThemeColor;
    'primary-darken': TThemeColor;
    'secondary-darken': TThemeColor;
    'tertiary-darken': TThemeColor;

    'positive-lighten': TThemeColor;
    'negative-lighten': TThemeColor;
    'neutral-lighten': TThemeColor;
    'warning-lighten': TThemeColor;
    'info-lighten': TThemeColor;
    'primary-lighten': TThemeColor;
    'secondary-lighten': TThemeColor;
    'tertiary-lighten': TThemeColor;

    // Background and Foreground
    'bg-1': TThemeColor;
    'bg-2': TThemeColor;
    'bg-3': TThemeColor;
    'bg-4': TThemeColor;

    'fg-1': TThemeColor;
    'fg-2': TThemeColor;
    'fg-3': TThemeColor;
    'fg-4': TThemeColor;

    // Links
    link: TThemeColor;
    'link-hover': TThemeColor;
    'link-visited': TThemeColor;
    'link-visited-hover': TThemeColor;

    // Shadow Specifics
    'border-shadow-0': string;
    'border-color-shadow-0': TThemeColor;
    'box-shadow-shadow-0': string;

    'border-shadow-1': string;
    'border-color-shadow-1': TThemeColor;
    'box-shadow-shadow-1': string;

    'border-shadow-2': string;
    'border-color-shadow-2': TThemeColor;
    'box-shadow-shadow-2': string;

    'border-shadow-3': string;
    'border-color-shadow-3': TThemeColor;
    'box-shadow-shadow-3': string;

    'border-shadow-4': string;
    'border-color-shadow-4': TThemeColor;
    'box-shadow-shadow-4': string;

    'border-shadow-5': string;
    'border-color-shadow-5': TThemeColor;
    'box-shadow-shadow-5': string;

    'border-shadow-6': string;
    'border-color-shadow-6': TThemeColor;
    'box-shadow-shadow-6': string;

    // Field Specifics
    'field-border-color': string;

    // Callout Specifics
    'callout-data-icon-info-bg-img': TThemeColor;

    // Top Menu Specifics
    'top-menu-below-action-bg': TThemeColor;
  }

  // Variables that can depend on the light/dark mode
  interface IAppThemeThemes {
    light: Partial<IAppThemeThemesColors>;
    dark: Partial<IAppThemeThemesColors>;
  }

  interface IAppThemeScreensSizesFont {
    family: string[];
    size: IThemeUnitValue;
    stretch: string;
    style: string;
    variant: string;
    weight: string | number;
    'line-height': IThemeUnitValue | string;
    'letter-spacing': IThemeUnitValue | string;
  }

  interface IAppThemeScreensSizesFonts {
    h1: Partial<IAppThemeScreensSizesFont>;
    h2: Partial<IAppThemeScreensSizesFont>;
    h3: Partial<IAppThemeScreensSizesFont>;
    h4: Partial<IAppThemeScreensSizesFont>;
    h5: Partial<IAppThemeScreensSizesFont>;
    h6: Partial<IAppThemeScreensSizesFont>;
    large: Partial<IAppThemeScreensSizesFont>;
    medium: Partial<IAppThemeScreensSizesFont>;
    regular: Partial<IAppThemeScreensSizesFont>;
    small: Partial<IAppThemeScreensSizesFont>;
    tiny: Partial<IAppThemeScreensSizesFont>;
  }

  interface IAppThemeScreensSizesOthers {
    'max-content-width': IThemeUnitValue;
    'popup-active-animation-name': string;
    'popup-active-animation-duration': IThemeUnitValue;
    'popup-hidding-animation-name': string;
    'popup-hidding-animation-duration': IThemeUnitValue;
  }

  interface IAppThemeScreensSizes {
    fonts: Partial<IAppThemeScreensSizesFonts>;
    others: Partial<IAppThemeScreensSizesOthers>;
  }

  // Variables that can depend on the screen size
  type TAppThemeScreens = Record<TScreenSize, Partial<IAppThemeScreensSizes>>;

  // Variables that are always the same, no matter the teme or screen size
  interface IAppThemeCommons {
    'default-spacing': IThemeUnitValue;
    'default-item-height': IThemeUnitValue;
    'default-border-radius': IThemeUnitValue;
    'field-border-size': IThemeUnitValue;
  }

  // In the end, these should all be entierly defined
  // But if some project-specific properties are added via typescript, avoid typing errors by using Partial
  interface IAppTheme {
    themes: Partial<IAppThemeThemes>;
    screens: Partial<TAppThemeScreens>;
    commons: Partial<IAppThemeCommons>;
    fontLinks?: React.LinkHTMLAttributes<HTMLLinkElement>[];
  }
}

// Either HSL or a reference to another css variable (No RGB nor hexadecimal code!!)
export type TThemeColor = [number, number, number] | string;

export interface IThemeUnitValue {
  value: number;
  unit:
    | 'px' // Pixels
    | 'em' // Relative to the font-size of the element
    | 'rem' // Relative to the font-size of the root element
    | '%' // Percentage
    | 'vh' // Relative to 1% of the height of the viewport
    | 'vw' // Relative to 1% of the width of the viewport
    | 'vmin' // Relative to 1% of the smaller dimension of the viewport
    | 'vmax' // Relative to 1% of the larger dimension of the viewport
    | 'ch' // Relative to the width of the "0" (zero) character
    | 'ex' // Relative to the x-height of the font
    | 'cap' // Relative to the cap height of the font
    | 'ic' // Relative to the size of the "水" (water ideograph) character
    | 'lh' // Relative to the line-height of the element
    | 'rlh' // Relative to the line-height of the root element
    | 's' // Seconds (for animations or transitions)
    | 'ms' // Milliseconds (for animations or transitions)
    | 'deg' // Degrees (for rotation or angles)
    | 'grad' // Gradians (for rotation or angles)
    | 'rad' // Radians (for rotation or angles)
    | 'turn' // Turns (for rotation or angles)
    | 'fr'; // Fractional units for CSS Grid
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
