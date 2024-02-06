import './index.scss';
import App from './App';
import { createRoot } from 'react-dom/client';
import { SettingsService } from './settings';
import { setupAppAndToolkit } from 'libraries/mn-toolkit';
import { CardService } from './card';
import { MediaWikiService } from './mediaWiki';
import { YuginewsService } from './yuginews';

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

import * as confJson from "../../package.json";
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
    app.service('$settings', SettingsService, { depends: ['$indexedDB'] });
    app.service('$mediaWiki', MediaWikiService, { depends: ['$api'] });
    app.service('$card', CardService, { depends: ['$indexedDB'] });
    app.service('$yuginews', YuginewsService, { depends: ['$api'] });
  }
);

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
