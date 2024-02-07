import './index.scss';
import * as confJson from "../../package.json";
import { setupAppAndToolkit } from 'libraries/mn-toolkit';
import { CoreService } from './kernel';
import { SettingsService, MediaWikiService, CardService, YuginewsService, HomeView } from './editor';

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
  }
}

const conf = confJson as unknown as IPackageJSON;
const stage = process.env.NODE_ENV as 'development' | 'production';
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
    app.service('$settings', SettingsService, { depends: ['$indexedDB'] });
    app.service('$mediaWiki', MediaWikiService, { depends: ['$api'] });
    app.service('$card', CardService, { depends: ['$indexedDB'] });
    app.service('$yuginews', YuginewsService, { depends: ['$api'] });
  }
);

app.$router.register('home', '/home', HomeView);
