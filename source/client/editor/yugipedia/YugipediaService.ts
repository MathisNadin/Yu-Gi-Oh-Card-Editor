import { extend, sanitizeFileName, isDefined } from 'mn-tools';
import { ICard } from '../card';
import {
  IYugipediaCard,
  IYugipediaGetCardImgApiResponse,
  IYugipediaGetCardPageImgApiResponse,
  IYugipediaGetPageByTitleApiResponse,
} from '.';
import { WikitextCardParser } from './parsers';

export interface IReplaceMatrix {
  toReplace: string;
  newString: string;
}

export class YugipediaService {
  private baseApiUrl: string;
  private baseArtworkUrl: string;
  private userAgent = '';
  private requestQueue: Array<() => void> = [];
  private isQueueProcessing = false;

  public constructor() {
    this.baseApiUrl = 'https://yugipedia.com/api.php';
    this.baseArtworkUrl = 'F:\\Images\\Images Yu-Gi-Oh!\\Artworks\\';
  }

  public async setup() {
    const { displayName, version, author, repository } = app.conf;
    if (displayName && version && repository.url && author.email) {
      this.userAgent = `${displayName}/${version} (${repository.url}; ${author.email})`;
    }
  }

  /**
   * Adds fn to the queue and returns a promise that resolves/rejects when fn() completes.
   * Ensures only one request is processed at a time, with a 1-second delay between requests.
   */
  private scheduleRequest<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolveOuter, rejectOuter) => {
      // Wrap the original function to handle resolution, rejection, and the 1-second delay
      const taskWrapper = () => {
        fn()
          .then((result) => {
            resolveOuter(result);
          })
          .catch((err) => {
            rejectOuter(err);
          })
          .finally(() => {
            // After fn() completes (success or failure), wait 1 second before processing next task
            setTimeout(() => {
              this.isQueueProcessing = false;
              this._processNext();
            }, 1000);
          });
      };

      // Add the wrapper to the queue
      this.requestQueue.push(taskWrapper);
      // Start processing if not already running
      this._processNext();
    });
  }

  /**
   * Processes the next task in the queue if none is currently being processed.
   */
  private _processNext() {
    if (this.isQueueProcessing) return;

    const nextTask = this.requestQueue.shift();
    if (!nextTask) return;

    this.isQueueProcessing = true;
    nextTask();
  }

  private async electronAxiosGet<R = unknown>(params: object) {
    if (!app.$device.isElectron(window)) return undefined;
    return await this.scheduleRequest(
      () =>
        window.electron!.ipcRenderer.invoke('axiosGet', this.baseApiUrl, {
          params,
          headers: {
            'User-Agent': this.userAgent,
          },
        }) as Promise<R | undefined>
    );
  }

  private async getCardImageUrl(yugipediaCardPage: IYugipediaGetPageByTitleApiResponse) {
    const pageKeys = Object.keys(yugipediaCardPage.query.pages);
    if (!pageKeys[0]) return undefined;

    const pageInfo = yugipediaCardPage.query.pages[pageKeys[0]];
    if (!pageInfo) return undefined;

    const yugipediaCardPageImg = await this.getCardPageImg(pageInfo.title);
    if (!yugipediaCardPageImg?.parse?.images?.length) return undefined;

    const fileName = yugipediaCardPageImg.parse.images.find((image) => image.endsWith('.png'));
    if (!fileName) return;

    const yugipediaCardImg = await this.getCardImg(fileName);
    if (!yugipediaCardImg?.query?.pages) return undefined;

    const imgKeys = Object.keys(yugipediaCardImg.query.pages);
    if (!imgKeys.length) return undefined;

    const imgInfo = yugipediaCardImg.query.pages[imgKeys[0]!];
    return imgInfo?.imageinfo?.[0]?.url || null;
  }

  private async getCardPageImg(cardName: string) {
    try {
      return await this.electronAxiosGet<IYugipediaGetCardPageImgApiResponse>({
        action: 'parse',
        page: cardName,
        prop: 'images',
        format: 'json',
      });
    } catch (error) {
      throw new Error(`Failed to fetch card page images: ${(error as Error).message}`);
    }
  }

  private async getCardImg(fileName: string) {
    try {
      return await this.electronAxiosGet<IYugipediaGetCardImgApiResponse>({
        action: 'query',
        titles: `File:${fileName}`,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
      });
    } catch (error) {
      throw new Error(`Failed to fetch card image: ${(error as Error).message}`);
    }
  }

  /**
   * Generic function to fetch a page by title.
   * This function manages redirects by recursively calling itself if needed.
   */
  private async getPageByTitle(pageTitle: string): Promise<IYugipediaGetPageByTitleApiResponse | undefined> {
    try {
      // Decode URL encoded characters in one step
      // and replace spaces with underscores and adjust invalid characters as needed
      const titles = decodeURIComponent(pageTitle)
        .replace(/ /g, '_') // replace spaces with underscores
        .replace(/\[/g, '(') // replace [ with (
        .replace(/\]/g, ')') // replace ] with )
        .replace(/[<>#]/g, ''); // remove <, >, and #

      const response = await this.electronAxiosGet<IYugipediaGetPageByTitleApiResponse>({
        action: 'query',
        titles,
        prop: 'revisions',
        rvprop: 'content',
        format: 'json',
      });

      // Verify the presence of pages data
      if (!response?.query?.pages) return undefined;
      const pageKeys = Object.keys(response.query.pages);
      if (!pageKeys.length) return undefined;

      // Extract page data from the response
      const page = response.query.pages[pageKeys[0]!];
      if (!page?.revisions?.length) return undefined;

      // Check if the page content indicates a redirect
      const content = page.revisions[0]!['*'];
      const redirectMatch = content.match(/#REDIRECT\s+\[\[([^\]]+)\]\]/i);
      if (redirectMatch && redirectMatch[1]) {
        // Recursively fetch the page using the new title from the redirect
        return await this.getPageByTitle(redirectMatch[1]);
      } else {
        return response;
      }
    } catch (error) {
      throw new Error(`Failed to fetch page by title: ${(error as Error).message}`);
    }
  }

  private buildEditorCard(yugipediaCard: IYugipediaCard, useFr: boolean): ICard {
    const frTranslations = yugipediaCard.translations.fr_fr;
    const enTranslations = yugipediaCard.translations.en_us;

    let cardSet: ICard['cardSet'] | undefined;
    if (useFr) {
      cardSet = yugipediaCard.frPrints[0]?.code;
    } else {
      cardSet = yugipediaCard.enPrints[0]?.code || yugipediaCard.naPrints[0]?.code;
    }

    let edition: ICard['edition'] | undefined;
    if (
      yugipediaCard.frames.length === 1 &&
      (yugipediaCard.frames[0] === 'token' || yugipediaCard.frames[0] === 'monsterToken')
    ) {
      edition = 'forbiddenDeck';
    } else if (yugipediaCard.rush) {
      edition = 'unlimited';
    }

    let name: ICard['name'] | undefined;
    if (useFr) name = frTranslations.name;
    else name = enTranslations.name;

    let description: ICard['description'] | undefined;
    if (useFr) description = frTranslations.description;
    else description = enTranslations.description;

    let pendEffect: ICard['pendEffect'] | undefined;
    if (useFr) pendEffect = frTranslations.pendEffect;
    else pendEffect = enTranslations.pendEffect;

    let rushOtherEffects: ICard['rushOtherEffects'] | undefined;
    if (useFr) rushOtherEffects = frTranslations.rushOtherEffects;
    else rushOtherEffects = enTranslations.rushOtherEffects;

    let rushCondition: ICard['rushCondition'] | undefined;
    if (useFr) rushCondition = frTranslations.rushCondition;
    else rushCondition = enTranslations.rushCondition;

    let rushEffect: ICard['rushEffect'] | undefined;
    if (useFr) rushEffect = frTranslations.rushEffect;
    else rushEffect = enTranslations.rushEffect;

    let rushChoiceEffects: ICard['rushChoiceEffects'] | undefined;
    if (useFr) rushChoiceEffects = frTranslations.rushChoiceEffects;
    else rushChoiceEffects = enTranslations.rushChoiceEffects;

    let rushTextMode = this.getEditorCardRushTextMode(yugipediaCard);

    // Cheat a bit here for the display purpose when there is maybe only otherEffects (on a Ritual/Fusion for example)
    if (
      yugipediaCard.rush &&
      rushTextMode === 'regular' &&
      !rushCondition &&
      !rushEffect &&
      !rushChoiceEffects?.length
    ) {
      if (rushOtherEffects) description = rushOtherEffects;
      rushTextMode = 'vanilla';
    }

    let abilities: ICard['abilities'] | undefined;
    if (useFr) abilities = frTranslations.abilities;
    else abilities = enTranslations.abilities;

    let attribute: ICard['attribute'] | undefined;
    if (yugipediaCard.frames.includes('spell')) attribute = 'spell';
    else if (yugipediaCard.frames.includes('trap')) attribute = 'trap';
    else attribute = yugipediaCard.attribute;

    let dontCoverRushArt: ICard['dontCoverRushArt'] | undefined;
    const frames: ICard['frames'] = [];
    // For now, handle Rush Skills that way
    if (yugipediaCard.rush && yugipediaCard.frames.length === 1 && yugipediaCard.frames[0] === 'skill') {
      frames.push('effect');
      dontCoverRushArt = true;
    } else if (yugipediaCard.frames.length) {
      frames.push(...yugipediaCard.frames);
    } else {
      frames.push('normal');
    }

    const card: Partial<ICard> = {
      ...app.$card.defaultImportCard,
      language: useFr ? 'fr' : 'en',
      rush: yugipediaCard.rush,
      legend: yugipediaCard.legend,
      cardSet,
      edition,
      name,
      description,
      pendEffect,
      rushTextMode,
      rushOtherEffects,
      rushCondition,
      rushEffect,
      rushEffectType: yugipediaCard.rushEffectType === 'continuous' ? 'continuous' : 'effect',
      rushChoiceEffects,
      abilities,
      attribute,
      dontCoverRushArt,
      frames,
      pendulum: isDefined(yugipediaCard.scales?.left) && enTranslations.abilities?.includes('Pendulum'),
      maximum: isDefined(yugipediaCard.atkMax) && enTranslations.abilities?.includes('Maximum'),
      speed: !yugipediaCard.rush && yugipediaCard.frames.length === 1 && yugipediaCard.frames[0] === 'skill',
      atkMax: yugipediaCard.atkMax,
      atk: yugipediaCard.atk,
      def: yugipediaCard.def,
      level: yugipediaCard.level,
      scales: yugipediaCard.scales,
      linkArrows: yugipediaCard.linkArrows,
      stType: yugipediaCard.stType,
      passcode: yugipediaCard.password,
    };

    return app.$card.correct(card);
  }

  private getEditorCardRushTextMode(yugipediaCard: IYugipediaCard): ICard['rushTextMode'] | undefined {
    if (!yugipediaCard.rush) return undefined;
    if (yugipediaCard.frames.length === 1 && yugipediaCard.frames[0] === 'normal') return 'vanilla';
    if (
      yugipediaCard.translations.en_us.rushChoiceEffects?.length ||
      yugipediaCard.translations.fr_fr.rushChoiceEffects?.length
    ) {
      return 'choice';
    }
    return 'regular';
  }

  public async importCard(options: {
    titles: string;
    useFr: boolean;
    generatePasscode: boolean;
    replaceMatrixes: IReplaceMatrix[];
    importArtwork: boolean;
    artworkDirectoryPath: string;
  }): Promise<ICard | undefined> {
    const { titles, useFr, generatePasscode, replaceMatrixes, importArtwork, artworkDirectoryPath } = options;

    const yugipediaCardPage = await this.getPageByTitle(titles);
    if (!yugipediaCardPage) return undefined;

    const yugipediaCard = new WikitextCardParser(yugipediaCardPage).parse();
    if (!yugipediaCard) return undefined;

    const editorCard = this.buildEditorCard(yugipediaCard, useFr);

    if (generatePasscode && !editorCard.passcode) {
      editorCard.passcode = app.$card.generatePasscode();
    }

    for (const replaceMatrix of replaceMatrixes) {
      if (editorCard.name) {
        editorCard.name = editorCard.name.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString);
      }

      if (editorCard.description) {
        editorCard.description = editorCard.description.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString);
      }

      if (editorCard.pendEffect) {
        editorCard.pendEffect = editorCard.pendEffect.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString);
      }

      if (editorCard.rushOtherEffects) {
        editorCard.rushOtherEffects = editorCard.rushOtherEffects.replaceAll(
          replaceMatrix.toReplace,
          replaceMatrix.newString
        );
      }

      if (editorCard.rushCondition) {
        editorCard.rushCondition = editorCard.rushCondition.replaceAll(
          replaceMatrix.toReplace,
          replaceMatrix.newString
        );
      }

      if (editorCard.rushEffect) {
        editorCard.rushEffect = editorCard.rushEffect.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString);
      }

      if (editorCard.rushChoiceEffects.length) {
        editorCard.rushChoiceEffects = editorCard.rushChoiceEffects.map((eff) =>
          eff.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString)
        );
      }
    }

    if (!app.$device.isElectron(window)) return editorCard;

    const enName = yugipediaCard.translations.en_us.name;
    if (!enName) return editorCard;

    const artworkDefaultPath = `${this.baseArtworkUrl}${sanitizeFileName(enName)} Artwork`;
    const defaultPng = `${artworkDefaultPath}.png`;
    const defaultJpg = `${artworkDefaultPath}.jpg`;

    if (await window.electron.ipcRenderer.invoke('checkFileExists', defaultPng)) {
      editorCard.artwork.url = defaultPng;
    } else if (await window.electron.ipcRenderer.invoke('checkFileExists', defaultJpg)) {
      editorCard.artwork.url = defaultJpg;
    } else if (importArtwork && artworkDirectoryPath?.length) {
      await this.importArtwork({ yugipediaCardPage, editorCard, artworkDirectoryPath });
    }

    return editorCard;
  }

  private async importArtwork(options: {
    yugipediaCardPage: IYugipediaGetPageByTitleApiResponse;
    editorCard: ICard;
    artworkDirectoryPath: string;
  }) {
    const { yugipediaCardPage, editorCard, artworkDirectoryPath } = options;
    try {
      const url = await this.getCardImageUrl(yugipediaCardPage);
      if (!url) return;

      const filePath = await app.$card.importArtwork(url, artworkDirectoryPath);
      if (!filePath) return;

      editorCard.artwork.url = filePath;
      if (editorCard.rush) editorCard.dontCoverRushArt = true;

      // These are full artworks
      if (
        filePath.endsWith('-OW.webp') ||
        filePath.endsWith('-OW.png') ||
        filePath.endsWith('-OW.jpg') ||
        filePath.endsWith('-OW.jpeg')
      ) {
        return;
      }

      if (editorCard.rush) {
        editorCard.dontCoverRushArt = true;
        extend(editorCard.artwork, app.$card.getFullRushCardPreset());
      } else if (editorCard.pendulum) {
        extend(editorCard.artwork, app.$card.getFullPendulumCardPreset());
      } else {
        extend(editorCard.artwork, app.$card.getFullCardPreset());
      }
    } catch (error) {
      console.error(error);
    }
  }
}
