import { Spinner, RouterViewPort, HorizontalStack, Popovers, Popups, Toasters } from 'mn-toolkit';
import { Component } from 'react';

interface IPageProps {}

interface IPageState {}

export class Page extends Component<IPageProps, IPageState> {
  public constructor(props: IPageProps) {
    super(props);

    app.$router.addListener({
      routerStateChanged: () => this.forceUpdate(),
    });

    const fontFamilies: Partial<IAppThemeScreensSizesFont> = {
      family: ['Tahoma', 'Helvetica', 'sans-serif'],
    };
    const screenFonts: Partial<IAppThemeScreensSizesFonts> = {
      h1: fontFamilies,
      h2: fontFamilies,
      h3: fontFamilies,
      h4: fontFamilies,
      h5: fontFamilies,
      h6: fontFamilies,
    };
    app.$theme.loadTheme({
      fontLinks: [],
      screens: {
        small: {
          fonts: screenFonts,
        },
        medium: {
          fonts: screenFonts,
        },
        large: {
          fonts: screenFonts,
        },
        xlarge: {
          fonts: screenFonts,
        },
        xxlarge: {
          fonts: screenFonts,
        },
      },
    });

    app.$theme.setLightDarkTheme(false);
  }

  public override render() {
    if (!app.$router.ready) return <Spinner />;
    return (
      <HorizontalStack fill>
        <RouterViewPort />
        <Popups />
        <Popovers />
        <Toasters />
      </HorizontalStack>
    );
  }
}
