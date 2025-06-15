import { Configuration, EnvironmentPlugin } from 'webpack';
import { merge } from 'webpack-merge';
import { commonConfig, commonDevConfig, commonProdConfig } from './common';
import { webServedCommonConfig, webServedDevConfig, webServedProdConfig } from './web-served';
import { webStandaloneCommonConfig, webStandaloneDevConfig, webStandaloneProdConfig } from './web-standalone';
import { desktopCommonConfig, desktopPreloadConfig, desktopMainConfig, desktopRendererConfig } from './desktop';
import { projectWebpackConfig } from '../../config/project-webpack';
import { platformWebpackConfig } from '../../config/platform-webpack';

export type TWebpackNodeEnv = 'development' | 'integration' | 'preProduction' | 'production';

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
    case 'development':
      envConfigs.push(commonDevConfig);
      break;

    case 'integration':
      envConfigs.push(commonProdConfig);
      break;

    case 'preProduction':
      envConfigs.push(commonProdConfig);
      break;

    case 'production':
    default:
      envConfigs.push(commonProdConfig);
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
        case 'development':
          envConfigs.push(webStandaloneDevConfig);
          break;

        default:
          envConfigs.push(webStandaloneProdConfig);
          break;
      }
      break;

    case 'web-served':
      envConfigs.push(webServedCommonConfig);
      switch (nodeEnv) {
        case 'development':
          envConfigs.push(webServedDevConfig);
          break;

        default:
          envConfigs.push(webServedProdConfig);
          break;
      }
      break;
  }

  envConfigs.push({
    plugins: [
      new EnvironmentPlugin({
        BUILD_ENV: nodeEnv,
      }),
    ],
  });

  return merge(commonConfig, ...envConfigs, projectWebpackConfig, platformWebpackConfig);
};
