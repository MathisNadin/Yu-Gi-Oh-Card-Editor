import './index.scss';
import { setupAppAndToolkit } from 'mn-toolkit';
import { CoreService } from './kernel';
import {
  SettingsService,
  MediaWikiService,
  CardService,
  YuginewsService,
  HomeView,
  CardBuilderService,
} from './editor';

declare global {
  interface IPackageJSON {
    name: string;
    displayName: string;
    stage: string;
    version: string;
    dbName: string;
    objectStoreName: string;
    presets: {
      development: {
        apiUrl: string;
      };
      production: {
        apiUrl: string;
      };
    };
  }
}

import * as confJson from '../../package.json';
const conf = confJson as unknown as IPackageJSON;

import correctConf from '../../config/platform.js';
correctConf(conf);

const stage = process.env.NODE_ENV as TAppplicationStage;
let apiUrl: string;
if (stage === 'production') {
  apiUrl = conf.presets.production.apiUrl;
} else {
  apiUrl = conf.presets.development.apiUrl;
}

setupAppAndToolkit(
  {
    name: conf.name,
    displayName: conf.displayName,
    stage: stage,
    version: conf.version,
    apiUrl,
    dbName: conf.dbName,
    objectStoreName: conf.objectStoreName,
  },
  () => {
    app.service('$core', CoreService);
    app.service('$settings', SettingsService, { depends: ['$store'] });
    app.service('$mediaWiki', MediaWikiService, { depends: ['$axios'] });
    app.service('$card', CardService, { depends: ['$store'] });
    app.service('$cardBuilder', CardBuilderService);
    app.service('$yuginews', YuginewsService, { depends: ['$axios'] });
  }
);

app.$router.register('home', '/home', HomeView);
