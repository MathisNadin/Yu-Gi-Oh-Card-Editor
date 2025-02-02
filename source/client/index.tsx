import './index.scss';
import { RouterService, setupAppAndToolkit } from 'mn-toolkit';
import { CoreService } from './kernel';
import {
  SettingsService,
  MediaWikiService,
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
}

import confJson from '../../package.json';
const conf = confJson as unknown as IPackageJSON;

import patchConfig from '../../config/platform.js';
patchConfig(conf);

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

app.$router.register('home', '/home/', HomeView);
