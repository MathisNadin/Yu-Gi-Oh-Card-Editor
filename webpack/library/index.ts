import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import { commonConfig, commonDevConfig, commonProdConfig } from './common';
import { webServedCommonConfig, webServedDevConfig, webServedProdConfig } from './web-served';
import { webStandaloneCommonConfig, webStandaloneDevConfig, webStandaloneProdConfig } from './web-standalone';
import { desktopCommonConfig, desktopPreloadConfig, desktopMainConfig, desktopRendererConfig } from './desktop';
import { getWebpackConfig } from '../../config/platform';

export type TWebpackNodeEnv = 'development' | 'production';

export type TWebpackPlatform =
  | 'web-served'
  | 'web-standalone'
  | 'desktop-preload'
  | 'desktop-main'
  | 'desktop-renderer';

export const buildConfig = () => {
  const nodeEnv = process.env.NODE_ENV as TWebpackNodeEnv;
  const platform = process.env.PLATFORM as TWebpackPlatform;
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

    case 'web-standalone':
      envConfigs.push(webStandaloneCommonConfig);
      switch (nodeEnv) {
        case 'production':
          envConfigs.push(webStandaloneProdConfig);
          break;

        case 'development':
          envConfigs.push(webStandaloneDevConfig);
          break;
      }
      break;

    case 'web-served':
      envConfigs.push(webServedCommonConfig);
      switch (nodeEnv) {
        case 'production':
          envConfigs.push(webServedProdConfig);
          break;

        case 'development':
          envConfigs.push(webServedDevConfig);
          break;
      }
      break;
  }

  const projectConfig = getWebpackConfig(nodeEnv, platform);

  return merge(commonConfig, ...envConfigs, projectConfig);
};
