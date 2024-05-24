import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import commonConfig from './webpack.common';

import commonDevConfig from './webpack.common.dev';
import commonProdConfig from './webpack.common.prod';

import webCommonConfig from './web/webpack.web.common';
import webDevConfig from './web/webpack.web.dev';
import webProdConfig from './web/webpack.web.prod';

import desktopCommonConfig from './desktop/webpack.desktop.common';
import desktopPreloadConfig from './desktop/webpack.desktop.preload';
import desktopMainConfig from './desktop/webpack.desktop.main';
import desktopRendererConfig from './desktop/webpack.desktop.renderer';

type TNodeEnv = 'development' | 'production';
type TPlatform = 'web' | 'desktop-preload' | 'desktop-main' | 'desktop-renderer';

const getConfig = () => {
  const nodeEnv = process.env.NODE_ENV as TNodeEnv;
  const platform = process.env.PLATFORM as TPlatform;
  const envConfigs: Configuration[] = [];

  switch (nodeEnv) {
    case 'production':
      envConfigs.push(commonProdConfig);
      break;

    case 'development':
      envConfigs.push(commonDevConfig);
      break;
  }

  switch (platform) {
    case 'desktop-preload':
      envConfigs.push(desktopCommonConfig, desktopPreloadConfig);
      break;

    case 'desktop-main':
      envConfigs.push(desktopCommonConfig, desktopMainConfig);
      break;

    case 'desktop-renderer':
      envConfigs.push(desktopCommonConfig, desktopRendererConfig);
      break;

    case 'web':
      envConfigs.push(webCommonConfig);
      switch (nodeEnv) {
        case 'production':
          envConfigs.push(webProdConfig);
          break;

        case 'development':
          envConfigs.push(webDevConfig);
          break;
      }
      break;
  }

  return merge(commonConfig, ...envConfigs);
}

export default getConfig;
