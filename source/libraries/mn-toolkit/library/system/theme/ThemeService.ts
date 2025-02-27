import { deepClone, deepExtend, hslToRgb, isArray, isDefined, isObject, isString } from 'mn-tools';
import { IThemeUnitValue, TThemeColor } from '.';

export class ThemeService {
  private _defaultTheme: Partial<IAppTheme> = {};
  public get defaultTheme(): Partial<IAppTheme> {
    return this._defaultTheme;
  }

  private _settings: Partial<IAppTheme> = {};
  public get settings(): Partial<IAppTheme> {
    return this._settings;
  }

  // Store the links of the currently loaded fonts
  private loadedFontLinks: HTMLLinkElement[] = [];

  public setLightDarkTheme(darkTheme: boolean) {
    document.body.classList.remove('mn-light-theme', 'mn-dark-theme');
    if (darkTheme) {
      document.body.classList.add('mn-dark-theme');
    } else {
      document.body.classList.add('mn-light-theme');
    }
  }

  private isThemeUnitValue(variable: unknown): variable is IThemeUnitValue {
    return isObject(variable) && 'value' in variable && 'unit' in variable;
  }

  public lighten(hsl: TThemeColor | undefined, percentage: number): TThemeColor {
    if (!hsl) return 'transparent';

    // Mainly supported for easy typing reasons
    if (isString(hsl)) return hsl;

    if (percentage < 0) percentage = 0;
    else if (percentage > 100) percentage = 100;

    const [hue, saturation, lightness] = hsl;

    // Calculer la nouvelle luminosité, en veillant à ne pas dépasser 100
    const newLightness = Math.min(lightness + percentage, 100);

    return [hue, saturation, newLightness];
  }

  public darken(hsl: TThemeColor | undefined, percentage: number): TThemeColor {
    if (!hsl) return 'transparent';

    // Mainly supported for easy typing reasons
    if (isString(hsl)) return hsl;

    if (percentage < 0) percentage = 0;
    else if (percentage > 100) percentage = 100;

    const [hue, saturation, lightness] = hsl;

    // Calculer la nouvelle luminosité, en veillant à ne pas descendre en dessous de 0
    const newLightness = Math.max(lightness - percentage, 0);

    return [hue, saturation, newLightness];
  }

  public getHslString(hsl: TThemeColor | undefined): string {
    if (!hsl) return 'transparent';
    if (isString(hsl)) return hsl;
    return `hsl(${hsl.join(', ')})`;
  }

  public invertHslLightness(colors: Partial<IAppThemeThemesColors>) {
    const invertedColors: Partial<IAppThemeThemesColors> = {};
    for (const key in colors) {
      // For typing purposes, treat this as a key for a value that can be an hsl array
      // Won't cause any problem due to the isArray check of the original value before assigning the new value
      const variableName = key as 'primary';
      const variable = colors[variableName];

      if (!isArray(variable) || variable.length !== 3) {
        invertedColors[variableName] = variable;
        continue;
      }

      const [hue, saturation, lightness] = variable;
      invertedColors[variableName] = [hue, saturation, 100 - lightness];
    }
    return invertedColors;
  }

  public getUnitString(unitValue: IThemeUnitValue | undefined): string {
    if (!unitValue) return '0px';
    return `${unitValue.value}${unitValue.unit}`;
  }

  private applyTheme(theme: keyof IAppThemeThemes, colors: Partial<IAppThemeThemesColors>) {
    for (const key in colors) {
      const variable = colors[key as keyof IAppThemeThemesColors];
      const variableName = `--${theme}-${key}`;

      if (isArray(variable) && variable.length === 3) {
        const [hue, saturation, lightness] = variable;
        document.documentElement.style.setProperty(variableName, `${hue}deg, ${saturation}%, ${lightness}%`);
      } else {
        this.setGenericProperty(variableName, variable);
      }
    }
  }

  private applyScreen(screen: keyof TAppThemeScreens, sizes: Partial<IAppThemeScreensSizes>) {
    if (sizes.fonts) {
      for (const fontType in sizes.fonts) {
        const font = sizes.fonts[fontType as keyof IAppThemeScreensSizesFonts]!;
        for (const key in font) {
          this.setGenericProperty(`--${screen}-${fontType}-${key}`, font[key as keyof IAppThemeScreensSizesFont]);
        }
      }
    }

    if (sizes.others) {
      for (const key in sizes.others) {
        this.setGenericProperty(`--${screen}-${key}`, sizes.others[key as keyof IAppThemeScreensSizesOthers]);
      }
    }
  }

  private setGenericProperty(variableName: string, variable: unknown) {
    if (this.isThemeUnitValue(variable)) {
      document.documentElement.style.setProperty(variableName, `${variable.value}${variable.unit}`);
    } else if (isArray(variable)) {
      document.documentElement.style.setProperty(variableName, `${variable.filter(isDefined).join(', ')}`);
    } else if (isString(variable)) {
      document.documentElement.style.setProperty(variableName, variable);
    } else if (isDefined(variable)) {
      document.documentElement.style.setProperty(variableName, `${variable}`);
    }
  }

  public loadTheme(partialTheme: Partial<IAppTheme>) {
    this._settings = deepExtend(this._settings, partialTheme);

    if (partialTheme.themes) {
      for (const key in partialTheme.themes) {
        const theme = key as keyof IAppThemeThemes;
        this.applyTheme(theme, partialTheme.themes[theme]!);
      }
    }

    if (partialTheme.fontLinks) {
      // Unload any font previously loaded
      for (const link of this.loadedFontLinks) {
        document.head.removeChild(link);
      }
      this.loadedFontLinks = [];

      // Load new links, if any
      for (const linkAttributes of partialTheme.fontLinks) {
        const link = document.createElement('link');

        for (const key in linkAttributes) {
          const value = linkAttributes[key as keyof React.LinkHTMLAttributes<HTMLLinkElement>];
          if (isDefined(value)) link.setAttribute(key, value.toString());
        }

        document.head.appendChild(link);
        this.loadedFontLinks.push(link);
      }
    }

    if (partialTheme.screens) {
      for (const key in partialTheme.screens) {
        const screen = key as keyof TAppThemeScreens;
        this.applyScreen(screen, partialTheme.screens[screen]!);
      }
    }

    if (partialTheme.commons) {
      for (const key in partialTheme.commons) {
        this.setGenericProperty(`--${key}`, partialTheme.commons[key as keyof IAppThemeCommons]);
      }
    }
  }

  /**
   * Load the default Toolkit theme
   * Use Partial to prevent typing errors if some properties are added on specific projects
   */
  public constructor() {
    this._defaultTheme = {
      fontLinks: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap' },
      ],
      themes: this.buildDefaultThemes(),
      screens: this.buildDefaultScreens(),
      commons: {
        'default-spacing': { value: 16, unit: 'px' },
        'default-item-height': { value: 32, unit: 'px' },
        'default-border-radius': { value: 6, unit: 'px' },
        'field-border-size': { value: 1, unit: 'px' },
      },
    };
    this.loadTheme(this._defaultTheme);
  }

  private buildDefaultThemes(): Partial<IAppThemeThemes> {
    const mainLightColors: Partial<IAppThemeThemesColors> = {
      // App Main Colors
      primary: [42, 93, 48], // hsl(42, 93%, 48%)
      secondary: [269, 34, 43], // hsl(269, 34%, 43%)
      tertiary: [347, 100, 56], // hsl(347, 100%, 56%)

      // Utilitary Colors
      positive: [134, 61, 41], // hsl(134, 61%, 41%)
      negative: [355, 71, 54], // hsl(355, 71%, 54%)
      neutral: [210, 100, 56], // hsl(210, 100%, 56%)
      warning: [44, 100, 59], // hsl(44, 100%, 59%)
      info: [190, 78, 41], // hsl(190, 78%, 41%)

      // Theme Light Foreground Colors
      'fg-1': [0, 0, 0], // hsl(0, 0%, 0%)
      'fg-2': [0, 0, 35], // hsl(0, 0%, 35%)
      'fg-3': [0, 0, 60], // hsl(0, 0%, 60%)
      'fg-4': [0, 0, 85], // hsl(0, 0%, 85%)

      // Theme Light Background Colors
      'bg-1': [0, 0, 100], // hsl(0, 0%, 100%)
      'bg-2': [0, 10, 96], // hsl(0, 10%, 96%)
      'bg-3': [0, 20, 92], // hsl(0, 20%, 92%)
      'bg-4': [0, 30, 88], // hsl(0, 30%, 88%)

      // Link Colors
      link: [220, 60, 50], // hsl(220, 60%, 50%)
      'link-hover': [220, 60, 40], // hsl(220, 60%, 40%)
      'link-visited': [250, 30, 53], // hsl(250, 30%, 53%)
      'link-visited-hover': [250, 30, 43], // hsl(250, 30%, 43%)
    };

    const mainDarkColors = this.invertHslLightness(mainLightColors);

    function buildCalloutInfoIconUrl(hsl: TThemeColor | undefined) {
      let rgbString: string;
      if (isString(hsl)) {
        rgbString = hsl;
      } else if (isArray(hsl) && hsl.length === 3) {
        const [red, green, blue] = hslToRgb(hsl);
        rgbString = `rgb(${red}, ${green}, ${blue})`;
      } else {
        rgbString = 'transparent';
      }

      return `url("data:image/svg+xml;utf8,<svg viewBox='0 0 14 14'><g><circle cx='7' cy='7' r='6.5' fill='none' stroke='${rgbString}' stroke-linecap='round' stroke-linejoin='round'/><line x1='7' y1='7' x2='7' y2='10.5' stroke='${rgbString}' stroke-linecap='round' stroke-linejoin='round'/><circle cx='7' cy='4.5' r='0.5' fill='${rgbString}' stroke-linecap='round' stroke-linejoin='round'/></g></svg>")`;
    }

    return {
      light: {
        ...mainLightColors,

        // Darken variations
        'positive-darken': this.darken(mainLightColors.positive, 10),
        'negative-darken': this.darken(mainLightColors.negative, 10),
        'neutral-darken': this.darken(mainLightColors.neutral, 10),
        'warning-darken': this.darken(mainLightColors.warning, 10),
        'info-darken': this.darken(mainLightColors.info, 10),
        'primary-darken': this.darken(mainLightColors.primary, 10),
        'secondary-darken': this.darken(mainLightColors.secondary, 10),
        'tertiary-darken': this.darken(mainLightColors.tertiary, 10),

        // Lighten variations
        'positive-lighten': this.lighten(mainLightColors.positive, 10),
        'negative-lighten': this.lighten(mainLightColors.negative, 10),
        'neutral-lighten': this.lighten(mainLightColors.neutral, 10),
        'warning-lighten': this.lighten(mainLightColors.warning, 10),
        'info-lighten': this.lighten(mainLightColors.info, 10),
        'primary-lighten': this.lighten(mainLightColors.primary, 10),
        'secondary-lighten': this.lighten(mainLightColors.secondary, 10),
        'tertiary-lighten': this.lighten(mainLightColors.tertiary, 10),

        // Shadow Specifics
        'border-shadow-0': '1px solid',
        'border-color-shadow-0': 'var(--light-fg-4)',
        'box-shadow-shadow-0': 'none',

        'border-shadow-1': undefined,
        'border-color-shadow-1': undefined,
        'box-shadow-shadow-1': `0px 0px 1px hsla(var(--light-fg-1), 0.32), 0px 1px 2px hsla(var(--light-fg-2), 0.32)`,

        'border-shadow-2': '',
        'border-color-shadow-2': '',
        'box-shadow-shadow-2': `0px 0px 1px hsla(var(--light-fg-1), 0.32), 0px 4px 8px hsla(var(--light-fg-2), 0.24)`,

        'border-shadow-3': undefined,
        'border-color-shadow-3': undefined,
        'box-shadow-shadow-3': `0px 0px 1px hsla(var(--light-fg-1), 0.32), 0px 8px 16px hsla(var(--light-fg-2), 0.24)`,

        'border-shadow-4': undefined,
        'border-color-shadow-4': undefined,
        'box-shadow-shadow-4': `0px 0px 1px hsla(var(--light-fg-1), 0.32), 0px 12px 24px hsla(var(--light-fg-2), 0.24)`,

        'border-shadow-5': undefined,
        'border-color-shadow-5': undefined,
        'box-shadow-shadow-5': `0px 0px 1px hsla(var(--light-fg-1), 0.32), 0px 24px 32px hsla(var(--light-fg-2), 0.24)`,

        'border-shadow-6': undefined,
        'border-color-shadow-6': undefined,
        'box-shadow-shadow-6': `0px 0px 1px hsla(var(--light-fg-1), 0.32), 0px 40px 64px hsla(var(--light-fg-2), 0.24)`,

        // Field Specifics
        'field-border-color': 'hsla(var(--light-fg-3), 0.6)',

        // Top Menu Specifics
        'top-menu-below-action-bg': 'var(--light-bg-1)',

        // Callout Specifics
        'callout-data-icon-info-bg-img': buildCalloutInfoIconUrl(mainLightColors['fg-2']),
      },
      dark: {
        ...mainDarkColors,

        // Darken variations
        'positive-darken': this.darken(mainDarkColors.positive, 10),
        'negative-darken': this.darken(mainDarkColors.negative, 10),
        'neutral-darken': this.darken(mainDarkColors.neutral, 10),
        'warning-darken': this.darken(mainDarkColors.warning, 10),
        'info-darken': this.darken(mainDarkColors.info, 10),
        'primary-darken': this.darken(mainDarkColors.primary, 10),
        'secondary-darken': this.darken(mainDarkColors.secondary, 10),
        'tertiary-darken': this.darken(mainDarkColors.tertiary, 10),

        // Lighten variations
        'positive-lighten': this.lighten(mainDarkColors.positive, 10),
        'negative-lighten': this.lighten(mainDarkColors.negative, 10),
        'neutral-lighten': this.lighten(mainDarkColors.neutral, 10),
        'warning-lighten': this.lighten(mainDarkColors.warning, 10),
        'info-lighten': this.lighten(mainDarkColors.info, 10),
        'primary-lighten': this.lighten(mainDarkColors.primary, 10),
        'secondary-lighten': this.lighten(mainDarkColors.secondary, 10),
        'tertiary-lighten': this.lighten(mainDarkColors.tertiary, 10),

        // Shadow Specifics
        'border-shadow-0': '1px solid',
        'border-color-shadow-0': 'var(--dark-fg-2)',
        'box-shadow-shadow-0': 'none',

        'border-shadow-1': '1px solid',
        'border-color-shadow-1': 'var(--dark-fg-2)',
        'box-shadow-shadow-1': 'none',

        'border-shadow-2': '1px solid',
        'border-color-shadow-2': 'var(--dark-fg-2)',
        'box-shadow-shadow-2': 'none',

        'border-shadow-3': '1px solid',
        'border-color-shadow-3': 'var(--dark-fg-2)',
        'box-shadow-shadow-3': 'none',

        'border-shadow-4': '1px solid',
        'border-color-shadow-4': 'var(--dark-fg-2)',
        'box-shadow-shadow-4': 'none',

        'border-shadow-5': '1px solid',
        'border-color-shadow-5': 'var(--dark-fg-2)',
        'box-shadow-shadow-5': 'none',

        'border-shadow-6': '1px solid',
        'border-color-shadow-6': 'var(--dark-fg-2)',
        'box-shadow-shadow-6': 'none',

        // Field Specifics
        'field-border-color': 'hsla(var(--dark-fg-3), 0.6)',

        // Top Menu Specifics
        'top-menu-below-action-bg': 'var(--dark-bg-2)',

        // Callout Specifics
        'callout-data-icon-info-bg-img': buildCalloutInfoIconUrl(mainDarkColors['fg-2']),
      },
    };
  }

  /**
   * By default, the theme will treat each screen size as these device equivalents :
   * - Small: Mobile
   * - Medium & Large: Tablet
   * - XLarge & XXLarge: Desktop
   */
  private buildDefaultScreens(): Partial<TAppThemeScreens> {
    // Default values for every size, unless specifically changed on specific sizes
    const others: Partial<IAppThemeScreensSizesOthers> = {
      'max-content-width': { value: 750, unit: 'px' },
      'popup-active-animation-name': 'mn-scale-in',
      'popup-active-animation-duration': { value: 0.2, unit: 's' },
      'popup-hidding-animation-name': 'mn-scale-out',
      'popup-hidding-animation-duration': { value: 0.2, unit: 's' },
    };

    const fontCommons: Partial<IAppThemeScreensSizesFont> = {
      family: [`"Roboto"`, 'Helvetica', 'sans-serif'],
      stretch: 'normal',
      style: 'normal',
      variant: 'normal',
      weight: 'normal',
      'letter-spacing': 'normal',
    };

    // Sizes for Desktop (used as default values for everything else, when not overriden)
    const xxlargeFonts: Partial<IAppThemeScreensSizesFonts> = {
      h1: {
        ...fontCommons,
        size: { value: 56, unit: 'px' },
        weight: 'bold',
        'line-height': { value: 120, unit: '%' },
      },
      h2: {
        ...fontCommons,
        size: { value: 48, unit: 'px' },
        weight: 'bold',
        'line-height': { value: 120, unit: '%' },
      },
      h3: {
        ...fontCommons,
        size: { value: 40, unit: 'px' },
        weight: 'bold',
        'line-height': { value: 120, unit: '%' },
      },
      h4: {
        ...fontCommons,
        size: { value: 32, unit: 'px' },
        weight: 'bold',
        'line-height': { value: 120, unit: '%' },
      },
      h5: {
        ...fontCommons,
        size: { value: 24, unit: 'px' },
        weight: 'bold',
        'line-height': { value: 120, unit: '%' },
      },
      h6: {
        ...fontCommons,
        size: { value: 20, unit: 'px' },
        weight: 'bold',
        'line-height': { value: 120, unit: '%' },
      },
      large: {
        ...fontCommons,
        size: { value: 24, unit: 'px' },
        'line-height': { value: 160, unit: '%' },
        'letter-spacing': { value: 0.2, unit: 'px' },
      },
      medium: {
        ...fontCommons,
        size: { value: 20, unit: 'px' },
        'line-height': { value: 160, unit: '%' },
        'letter-spacing': { value: 0.2, unit: 'px' },
      },
      regular: {
        ...fontCommons,
        size: { value: 16, unit: 'px' },
        'line-height': { value: 160, unit: '%' },
        'letter-spacing': { value: 0.25, unit: 'px' },
      },
      small: {
        ...fontCommons,
        size: { value: 14, unit: 'px' },
        'line-height': { value: 160, unit: '%' },
        'letter-spacing': { value: 0.25, unit: 'px' },
      },
      tiny: {
        ...fontCommons,
        size: { value: 12, unit: 'px' },
        'line-height': { value: 160, unit: '%' },
        'letter-spacing': { value: 0.3, unit: 'px' },
      },
    };

    // Sizes for Tablet
    const largeFonts = deepExtend(deepClone(xxlargeFonts), {
      h1: {
        size: { value: 52, unit: 'px' },
      },
      h2: {
        size: { value: 44, unit: 'px' },
      },
      h3: {
        size: { value: 36, unit: 'px' },
      },
      h4: {
        size: { value: 28, unit: 'px' },
      },
    });

    // Sizes for Mobile
    const smallFonts = deepExtend(deepClone(xxlargeFonts), {
      h1: {
        size: { value: 40, unit: 'px' },
      },
      h2: {
        size: { value: 36, unit: 'px' },
      },
      h3: {
        size: { value: 32, unit: 'px' },
      },
      h4: {
        size: { value: 24, unit: 'px' },
      },
      h5: {
        size: { value: 20, unit: 'px' },
      },
      h6: {
        size: { value: 18, unit: 'px' },
      },
    });

    return {
      small: {
        fonts: smallFonts,
        others: {
          ...others,
          'max-content-width': { value: 100, unit: '%' },
          'popup-active-animation-name': 'mn-enter-in',
          'popup-active-animation-duration': { value: 0.4, unit: 's' },
          'popup-hidding-animation-name': 'mn-leave-out',
          'popup-hidding-animation-duration': { value: 0.4, unit: 's' },
        },
      },
      medium: {
        fonts: largeFonts,
        others,
      },
      large: {
        fonts: largeFonts,
        others,
      },
      xlarge: {
        fonts: xxlargeFonts,
        others,
      },
      xxlarge: {
        fonts: xxlargeFonts,
        others,
      },
    };
  }
}
