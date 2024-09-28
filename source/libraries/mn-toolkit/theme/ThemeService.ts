import { isArray, isDefined, isObject, isString } from 'mn-tools';
import { IThemeFonts, IThemeUnitValue, TThemeColor } from '.';

export class ThemeService {
  private _defaultTheme: Partial<IAppTheme> = {};
  public get defaultTheme() {
    return this._defaultTheme;
  }

  private _settings: Partial<IAppTheme> = {};
  public get settings() {
    return this._settings;
  }

  private loadedFontLinks: HTMLLinkElement[] = []; // Stockage des liens de police actuellement chargés

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isThemeFonts(variable: any): variable is IThemeFonts {
    return isObject(variable) && 'fonts' in variable && isArray(variable.fonts);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isThemeUnitValue(variable: any): variable is IThemeUnitValue {
    return isObject(variable) && 'value' in variable && 'unit' in variable;
  }

  public loadTheme(partialTheme: Partial<IAppTheme>): void {
    this._settings = {
      ...this._settings,
      ...partialTheme,
    };
    this.applyTheme(partialTheme);
  }

  private applyTheme(theme: Partial<IAppTheme>) {
    for (const key in theme) {
      const variable = theme[key as keyof IAppTheme];

      if (this.isThemeFonts(variable)) {
        // Unload any font previously loaded
        for (const link of this.loadedFontLinks) {
          document.head.removeChild(link);
        }
        this.loadedFontLinks = [];

        // Load new urls, if any
        if (variable.urls?.length) {
          for (const url of variable.urls) {
            const link = document.createElement('link');
            link.href = url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            this.loadedFontLinks.push(link); // Ajouter le lien au tableau pour le supprimer plus tard
          }
        }

        // Define css variable
        document.documentElement.style.setProperty(`--${key}`, `${variable.fonts.filter(isDefined).join(', ')}`);
      } else if (this.isThemeUnitValue(variable)) {
        document.documentElement.style.setProperty(`--${key}`, `${variable.value}${variable.unit}`);
      } else if (isArray(variable)) {
        document.documentElement.style.setProperty(`--${key}`, variable.join(', '));
      } else if (isString(variable)) {
        document.documentElement.style.setProperty(`--${key}`, variable);
      } else if (isDefined(variable)) {
        document.documentElement.style.setProperty(`--${key}`, `${variable}`);
      }
    }
  }

  public lighten(rgb: TThemeColor | undefined, percentage: number): TThemeColor {
    if (!rgb) return 'transparent';
    // Mainly supported for easy typing reasons
    if (isString(rgb)) return rgb;
    else if (percentage < 0) percentage = 0;
    else if (percentage > 100) percentage = 100;

    const amount = Math.round((percentage / 100) * 255);
    return [Math.min(255, rgb[0] + amount), Math.min(255, rgb[1] + amount), Math.min(255, rgb[2] + amount)];
  }

  public darken(rgb: TThemeColor | undefined, percentage: number): TThemeColor {
    if (!rgb) return 'transparent';
    // Mainly supported for easy typing reasons
    if (isString(rgb)) return rgb;
    else if (percentage < 0) percentage = 0;
    else if (percentage > 100) percentage = 100;

    const amount = Math.round((percentage / 100) * 255);
    return [Math.max(0, rgb[0] - amount), Math.max(0, rgb[1] - amount), Math.max(0, rgb[2] - amount)];
  }

  public getRgbString(rgb: TThemeColor | undefined): string {
    if (!rgb) return 'transparent';
    if (isString(rgb)) return rgb;
    return `rgb(${rgb.join(', ')})`;
  }

  public getUnitString(unitValue: IThemeUnitValue | undefined): string {
    if (!unitValue) return '0px';
    return `${unitValue.value}${unitValue.unit}`;
  }

  public constructor() {
    const mainColors: Partial<IAppTheme> = {
      positive: [40, 167, 69], // #28a745
      negative: [220, 53, 69], // #dc3545
      neutral: [30, 144, 255], // #1e90ff
      warning: [255, 202, 44], // #ffca2c
      info: [23, 162, 184], // #17a2b8
      primary: [250, 189, 47], // #fabd2f
      secondary: [86, 61, 124], // #563d7c
      tertiary: [248, 131, 121], // #f88379
    };

    this._defaultTheme = {
      ...mainColors,

      // Darken variations
      'positive-darken': this.darken(mainColors.positive, 15),
      'negative-darken': this.darken(mainColors.negative, 15),
      'neutral-darken': this.darken(mainColors.neutral, 15),
      'warning-darken': this.darken(mainColors.warning, 15),
      'info-darken': this.darken(mainColors.info, 15),
      'primary-darken': this.darken(mainColors.primary, 15),
      'secondary-darken': this.darken(mainColors.secondary, 15),
      'tertiary-darken': this.darken(mainColors.tertiary, 15),

      // Lighten variations
      'positive-lighten': this.lighten(mainColors.positive, 15),
      'negative-lighten': this.lighten(mainColors.negative, 15),
      'neutral-lighten': this.lighten(mainColors.neutral, 15),
      'warning-lighten': this.lighten(mainColors.warning, 15),
      'info-lighten': this.lighten(mainColors.info, 15),
      'primary-lighten': this.lighten(mainColors.primary, 15),
      'secondary-lighten': this.lighten(mainColors.secondary, 15),
      'tertiary-lighten': this.lighten(mainColors.tertiary, 15),

      // Theme Dark Background Colors
      'theme-dark-bg-1': [24, 24, 24], // #181818
      'theme-dark-bg-2': [65, 65, 65], // #414141
      'theme-dark-bg-3': [85, 85, 85], // #555555
      'theme-dark-bg-4': [157, 157, 157], // #9d9d9d

      // Theme Dark Foreground Colors
      'theme-dark-fg-1': [233, 233, 233], // #e9e9e9
      'theme-dark-fg-2': [184, 184, 184], // #b8b8b8
      'theme-dark-fg-3': [105, 105, 105], // #696969
      'theme-dark-fg-4': [112, 112, 112], // #707070

      // Theme Light Background Colors
      'theme-light-bg-1': [255, 255, 255], // #ffffff
      'theme-light-bg-2': [246, 248, 249], // #f6f8f9
      'theme-light-bg-3': [238, 240, 242], // #eef0f2
      'theme-light-bg-4': [229, 233, 235], // #e5e9eb

      // Theme Light Foreground Colors
      'theme-light-fg-1': [71, 71, 71], // #474747
      'theme-light-fg-2': [138, 138, 138], // #8a8a8a
      'theme-light-fg-3': [158, 158, 158], // #9e9e9e
      'theme-light-fg-4': [228, 228, 228], // #e4e4e4

      // Dimensions
      'theme-default-spacing': { value: 16, unit: 'px' },
      'theme-default-item-height': { value: 32, unit: 'px' },
      'theme-default-border-radius': { value: 6, unit: 'px' },
      'theme-max-content-width': { value: 750, unit: 'px' },
      'theme-max-list-width': { value: 750, unit: 'px' },
      'theme-field-border-size': { value: 1, unit: 'px' },

      // Font
      'theme-default-font-name': { fonts: ['Tahoma', 'Helvetica', 'sans-serif'], urls: [] },
      'theme-default-font-size': { value: 16, unit: 'px' },
    };

    this.loadTheme(this._defaultTheme);
  }
}
