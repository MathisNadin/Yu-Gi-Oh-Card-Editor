import { Configuration } from 'webpack';

const desktopCommonConfig: Configuration = {
  node: {
    __dirname: false,
    __filename: false,
  },
};

export { desktopCommonConfig };
