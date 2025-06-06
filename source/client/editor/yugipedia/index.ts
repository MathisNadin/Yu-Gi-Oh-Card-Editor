import { IScales, TFrame, TLinkArrows, TStIcon } from '../card';
import { YugipediaService } from './YugipediaService';

export * from './YugipediaService';

declare global {
  interface IApp {
    $yugipedia: YugipediaService;
  }
}

export interface IYugipediaGetPageByTitleApiResponse {
  batchcomplete: string;
  query: {
    normalized?: {
      // Absent when it is a REDIRECT
      from: string;
      to: string;
    }[];
    pages: {
      [pageid: string]: {
        pageid: number;
        ns: number;
        title: string;
        revisions: {
          contentformat: string;
          contentmodel: string;
          '*': string; // Contains the page content (or the REDIRECT)
        }[];
      };
    };
  };
}

export interface IYugipediaGetCardPageImgApiResponse {
  parse: {
    pageid: number;
    title: string;
    images: string[];
  };
}

export interface IYugipediaGetCardImgApiResponse {
  batchcomplete: string;
  query: {
    pages: {
      [pageid: string]: {
        pageid: number;
        ns: number;
        title: string;
        imagerepository: string;
        imageinfo: {
          url: string;
          descriptionurl: string;
          descriptionshorturl: string;
        }[];
      };
    };
  };
}

export type TYugipediaCardLanguage = 'en_us' | 'fr_fr';

export type TYugipediaCardClass =
  | 'normal'
  | 'effect'
  | 'fusion'
  | 'ritual'
  | 'synchro'
  | 'xyz'
  | 'link'
  | 'spell'
  | 'trap'
  | 'token'
  | 'skill'
  | 'faq'
  | 'strategy'
  | 'tip'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'pendulum'
  | 'blank';

export interface IYugipediaCardTranslation {
  name?: string;
  description?: string;
  pendEffect?: string;
  abilities?: string[];
  skillBack?: string;
  rushOtherEffects?: string;
  rushCondition?: string;
  rushEffect?: string;
  rushChoiceEffects?: string[];
}

export type TYugipediaCardAttribute = 'dark' | 'light' | 'water' | 'fire' | 'earth' | 'wind' | 'divine';

export type TYugipediaCardStIcon = TStIcon;

export interface IYugipediaCardPrint {
  code?: string;
  setName?: string;
  rarities?: string[];
}

export interface IYugipediaCard {
  konamiId?: number;
  password?: string;
  class?: TYugipediaCardClass;
  rush?: boolean;
  legend?: boolean;

  translations: { [key in TYugipediaCardLanguage]: IYugipediaCardTranslation };

  rushEffectType?: 'effect' | 'continuous' | 'choice';

  abilities?: string[];
  frAbilities?: string[];

  frames: TFrame[];
  stType?: TYugipediaCardStIcon;
  attribute?: TYugipediaCardAttribute;

  level?: number;
  atkMax?: string;
  atk?: string;
  def?: string;

  scales?: IScales;
  linkArrows?: { [key in TLinkArrows]: boolean };

  jpPrints: IYugipediaCardPrint[];
  enPrints: IYugipediaCardPrint[];
  naPrints: IYugipediaCardPrint[];
  frPrints: IYugipediaCardPrint[];
}
