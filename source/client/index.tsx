import './index.scss';
import { RouterService, setupAppAndToolkit } from 'mn-toolkit';
import { CoreService } from './kernel';
import {
  SettingsService,
  YugipediaService,
  CardService,
  YuginewsService,
  HomeView,
  CardBuilderService,
} from './editor';

export interface IPackageJSON {
  name: string;
  displayName: string;
  stage: string;
  version: string;
  dbName: string;
  objectStoreName: string;
  repository: {
    type: string;
    url: string;
  };
  author: {
    name: string;
    email: string;
  };
}

import confJson from '../../package.json';
const conf = confJson as unknown as IPackageJSON;

import patchConfig from '../../config/platform.js';
patchConfig(conf);

declare global {
  interface IApplicationConfig {
    repository: {
      type: string;
      url: string;
    };
    author: {
      name: string;
      email: string;
    };
  }
}

setupAppAndToolkit(
  {
    name: conf.name,
    displayName: conf.displayName,
    stage: process.env.NODE_ENV as TAppplicationStage,
    version: conf.version,
    baseUrl: RouterService.baseUrlWithHash,
    apiUrl: '',
    dbName: conf.dbName,
    objectStoreName: conf.objectStoreName,
    author: conf.author,
    repository: conf.repository,
  },
  () => {
    app.service('$core', CoreService);
    app.service('$settings', SettingsService, { depends: ['$store'] });
    app.service('$yugipedia', YugipediaService, { depends: ['$axios'] });
    app.service('$card', CardService, { depends: ['$store'] });
    app.service('$cardBuilder', CardBuilderService);
    app.service('$yuginews', YuginewsService, { depends: ['$axios'] });
  }
);

app.$router.register('home', '/home/', HomeView);
