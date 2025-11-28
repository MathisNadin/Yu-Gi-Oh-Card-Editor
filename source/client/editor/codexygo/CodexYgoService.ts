/* eslint-disable @typescript-eslint/no-require-imports */
import { isArray, isBoolean, isNumber, isObject, isString, normalizeError } from 'mn-tools';
import { IFileEntity, TEntityDraft } from 'api/main';
import { ICard } from '../card';
import {
  ICodexYgoCardEntity,
  IArticleEntity,
  IContentBlockEntity,
  ICodexYgoCardListOptions,
  IArticleListOptions,
  IContentBlockListOptions,
  IContentFakeCardContentBlock,
  IContentCardContentBlock,
  TCodexYgoCardLanguage,
} from './interfaces';
import { CodexYgoCardListDialog } from './CodexYgoCardListDialog';

export class CodexYgoService {
  public readonly masterCardBack = require('assets/images/master-card-back-en.png') as string;
  public readonly rushCardBack = require('assets/images/rush-card-back-jp.png') as string;
  public readonly baseUrl = 'https://codexygo.fr';

  private userAgent = '';
  private requestQueue: Array<() => void> = [];
  private isQueueProcessing = false;

  public setup() {
    const { displayName, version, author, repository } = app.conf;
    if (displayName && version && repository.url && author.email) {
      this.userAgent = `${displayName}/${version} (${repository.url}; ${author.email})`;
    }

    if (app.$device.isElectron(window)) {
      window.electron.ipcRenderer.addListener('importCodexYgoCards', () =>
        app.$errorManager.handlePromise(app.$codexygo.showCardListDialog())
      );
    }
  }

  /** ------------------------------ API Tools ------------------------------ */

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
            rejectOuter(normalizeError(err));
          })
          .finally(() => {
            // After fn() completes (success or failure), wait 1 second before processing next task
            setTimeout(() => {
              this.isQueueProcessing = false;
              this._processNext();
            }, 200);
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

  private async electronAxiosPost<R = unknown>(path: string, data: object) {
    if (!app.$device.isElectron(window)) return undefined;
    return await this.scheduleRequest(
      () =>
        window.electron!.ipcRenderer.invoke('axiosPost', `${this.baseUrl}/api/${path}`, data, {
          headers: {
            'User-Agent': this.userAgent,
          },
        }) as Promise<{ result: R } | undefined>
    );
  }

  public async listArticles(options: IArticleListOptions): Promise<IArticleEntity[]> {
    const data = await this.electronAxiosPost<IArticleEntity[]>('article/list', options);
    return isArray(data?.result) ? data.result : [];
  }

  public async listContentBlocks(options: IContentBlockListOptions): Promise<IContentBlockEntity[]> {
    const data = await this.electronAxiosPost<IContentBlockEntity[]>('content-block/list', options);
    return isArray(data?.result) ? data.result : [];
  }

  public async countCards(options: ICodexYgoCardListOptions): Promise<number> {
    const data = await this.electronAxiosPost<number>('card/count', options);
    return isNumber(data?.result) ? data.result : 0;
  }

  public async listCards(options: ICodexYgoCardListOptions): Promise<ICodexYgoCardEntity[]> {
    const data = await this.electronAxiosPost<ICodexYgoCardEntity[]>('card/list', options);
    return isArray(data?.result) ? data.result : [];
  }

  public async showCardListDialog() {
    await CodexYgoCardListDialog.show();
  }

  /** ----------------------------- Article Tools ----------------------------- */

  private extractArticleSlugFromUrl(url: string): string | undefined {
    // Normalize the base URL (ensure single trailing slash and clean path)
    function normalizeBaseUrl(url: string): string {
      const u = new URL(url);
      const cleanPath = u.pathname.replace(/\/+$/, ''); // remove trailing slashes
      u.pathname = cleanPath + '/';
      u.hash = ''; // ignore hash
      u.search = ''; // ignore query
      return u.toString();
    }

    // Try to parse URLs safely
    let target: URL;
    let base: URL;

    try {
      target = new URL(url);
      base = new URL(normalizeBaseUrl(this.baseUrl));
    } catch {
      // Invalid URL or baseUrl
      return undefined;
    }

    // 1) The protocol + host must match the baseUrl
    if (target.origin !== base.origin) return undefined;

    // 2) Compute the expected path prefix: "<basePath>/article/"
    const basePath = base.pathname.replace(/\/+$/, ''); // strip trailing slash
    const expectedPrefix = `${basePath}/article/`;

    // 3) The target path must start with that prefix
    if (!target.pathname.startsWith(expectedPrefix)) return undefined;

    // 4) Extract what comes after "/article/"
    const rest = target.pathname.slice(expectedPrefix.length); // e.g. "troisiemeteaparty-1/" or "troisiemeteaparty-1"

    // 5) Split the slug from the rest
    const [slug, afterSlug] = (() => {
      const idx = rest.indexOf('/');
      return idx === -1 ? [rest, ''] : [rest.slice(0, idx), rest.slice(idx)];
    })();

    // 6) Allow only an optional trailing slash after the slug
    if (afterSlug && afterSlug !== '/') return undefined;

    // 7) Validate the slug format (letters, digits, and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) return undefined;

    return slug;
  }

  // Extracts the last numeric segment from a hyphen-separated string.
  private extractOidFromSlug(input: string): number | undefined {
    // Split the input string by hyphens
    const parts = input.split('-');

    // Iterate over the parts in reverse order
    for (let i = parts.length - 1; i >= 0; i--) {
      const segment = parts[i];

      // Check if the segment consists solely of digits using a regular expression
      if (segment && /^\d+$/.test(segment)) {
        // Convert the segment to a number and return it
        return parseInt(segment, 10);
      }
    }

    // Return null if no numeric segment is found
    return undefined;
  }

  public async getCodexCardsFromArticle(url: string): Promise<{ card: ICard; imageUrl: string | undefined }[]> {
    const cards: { card: ICard; imageUrl: string | undefined }[] = [];

    const slug = this.extractArticleSlugFromUrl(url);
    if (!slug) return cards;

    const oid = this.extractOidFromSlug(slug);
    if (!oid) return cards;

    const [article] = await this.listArticles({ oids: [oid], published: true, deleted: false });
    if (!article) return cards;

    const cardBlockType: IContentCardContentBlock['type'] = 'a504be26-45d0-4bb9-8649-74d37bc0ef99';
    const fakeCardBlockType: IContentFakeCardContentBlock['type'] = '81f39442-0004-4e87-ac7f-c8c7b9370d71';
    const contentBlocks = await this.listContentBlocks({
      articles: [article.oid],
      types: [cardBlockType, fakeCardBlockType],
      deleted: false,
      sort: [
        { field: 'weight', order: 'asc' },
        { field: 'oid', order: 'asc' },
      ],
    });
    if (!contentBlocks.length) return cards;

    const cardOidSet = new Set<ICodexYgoCardEntity['oid']>();
    const cardSetIdByOid: Record<ICodexYgoCardEntity['oid'], string | undefined> = {};
    const cardOverrideImageByOid: Record<ICodexYgoCardEntity['oid'], IFileEntity['oid'] | undefined> = {};
    for (const block of contentBlocks) {
      switch (true) {
        case this.isContentFakeCard(block): {
          if (isObject(block.fakeCard)) {
            const card = this.getCardFromCodexCard(block.fakeCard, 'fr_fr');
            card.cardSet = block.setId || '';
            cards.push({
              card,
              imageUrl: this.getFileUrl(block.fakeCard.image),
            });
          }
          break;
        }

        case this.isContentCard(block): {
          if (isNumber(block.card)) {
            cardOidSet.add(block.card);
            if (isString(block.setId)) cardSetIdByOid[block.card] = block.setId;
            if (isNumber(block.overrideImage)) cardOverrideImageByOid[block.card] = block.overrideImage;
          }
          break;
        }
      }
    }
    if (!cardOidSet.size) return cards;

    const codexCards = await this.listCards({ oids: Array.from(cardOidSet), public: true, deleted: false });
    if (!codexCards.length) return cards;

    for (const codexCard of codexCards) {
      const card = this.getCardFromCodexCard(codexCard, 'fr_fr');
      card.cardSet = cardSetIdByOid[codexCard.oid] || '';
      const image = cardOverrideImageByOid[codexCard.oid] || codexCard.image;
      cards.push({
        card,
        imageUrl: this.getFileUrl(image),
      });
    }
    return cards;
  }

  /** -------------------------- Content Block Tools -------------------------- */

  public isContentFakeCard(contentBlock: IContentBlockEntity): contentBlock is IContentFakeCardContentBlock {
    const id: IContentFakeCardContentBlock['type'] = '81f39442-0004-4e87-ac7f-c8c7b9370d71';
    return contentBlock.type === id;
  }

  public isContentCard(contentBlock: IContentBlockEntity): contentBlock is IContentCardContentBlock {
    const id: IContentCardContentBlock['type'] = 'a504be26-45d0-4bb9-8649-74d37bc0ef99';
    return contentBlock.type === id;
  }

  /** ----------------------------- Generic Tools ----------------------------- */

  public getFileUrl(fileOid: IFileEntity['oid'] | undefined, derivative?: TDerivative) {
    if (!fileOid) return undefined;
    const url = new URL(`${this.baseUrl}/api/file/download/1/${fileOid}/`);
    if (derivative) url.searchParams.set('derivative', derivative);
    return url.toString();
  }

  /** ------------------------------ Card Tools ------------------------------ */

  public getCardFromCodexCard(codexCard: TEntityDraft<ICodexYgoCardEntity>, language: TCodexYgoCardLanguage): ICard {
    const card = app.$card.defaultImportCard;

    const isFr = language === 'fr_fr';
    card.language = isFr ? 'fr' : 'en';

    if (isBoolean(codexCard.rush)) card.rush = codexCard.rush;
    if (isBoolean(codexCard.legend)) card.legend = codexCard.legend;

    if (card.rush) card.edition = 'unlimited';

    if (isString(codexCard.atkMax)) card.atkMax = codexCard.atkMax;
    if (isString(codexCard.atk)) card.atk = codexCard.atk;
    if (isString(codexCard.def)) card.def = codexCard.def;

    if (isString(codexCard.attribute)) card.attribute = codexCard.attribute;
    if (isString(codexCard.stType)) {
      card.stType = codexCard.stType;
      if (isString(codexCard.frame) && codexCard.frame === 'trap') {
        card.attribute = 'trap';
      } else {
        card.attribute = 'spell';
      }
    }
    if (isNumber(codexCard.level)) card.level = codexCard.level;

    if (isObject(codexCard.translations)) {
      const translations = codexCard.translations[language];

      if (isObject(translations)) {
        if (isString(translations.name)) card.name = translations.name;

        if (isString(translations.description)) card.description = translations.description;
        if (isString(translations.pendEffect)) card.pendEffect = translations.pendEffect;

        if (isString(translations.rushCondition)) card.rushCondition = translations.rushCondition;
        if (isString(translations.rushOtherEffects)) card.rushOtherEffects = translations.rushOtherEffects;
        if (isString(translations.rushEffect)) card.rushEffect = translations.rushEffect;

        if (isArray(translations.abilities)) {
          card.abilities = translations.abilities.filter(isString);
          card.maximum = card.abilities.includes('Maximum');
          card.pendulum = isFr ? card.abilities.includes('Pendule') : card.abilities.includes('Pendulum');
        }

        if (isString(translations.limitationText)) {
          switch (translations.limitationText) {
            case 'Cette carte ne peut pas être utilisée en Duel.':
            case 'This card cannot be used in a Duel.':
              card.edition = 'forbidden';
              break;

            case 'Cette carte ne peut pas être dans un Deck.':
            case 'This card cannot be in a Deck.':
              card.edition = 'forbiddenDeck';
              break;
          }
        }
      }
    }

    if (isString(codexCard.rushEffectType)) {
      switch (codexCard.rushEffectType) {
        case 'effect':
          card.rushTextMode = 'regular';
          card.rushEffectType = 'effect';
          break;
        case 'continuous':
          card.rushTextMode = 'regular';
          card.rushEffectType = 'continuous';
          break;
        case 'choice':
          card.rushTextMode = 'choice';
          break;
        default:
          break;
      }
    }

    if (isString(codexCard.frame)) {
      card.frames = [codexCard.frame];
      card.speed = codexCard.frame === 'skill';
      if (codexCard.frame === 'normal') {
        card.rushTextMode = 'vanilla';
      }
    }

    if (isObject(codexCard.scales) && isNumber(codexCard.scales.left) && isNumber(codexCard.scales.right)) {
      card.scales = {
        left: codexCard.scales.left,
        right: codexCard.scales.right,
      };
    }

    if (isObject(codexCard.linkArrows)) {
      card.linkArrows = {
        left: !!codexCard.linkArrows.left,
        right: !!codexCard.linkArrows.right,
        top: !!codexCard.linkArrows.top,
        topLeft: !!codexCard.linkArrows.topLeft,
        topRight: !!codexCard.linkArrows.topRight,
        bottom: !!codexCard.linkArrows.bottom,
        bottomLeft: !!codexCard.linkArrows.bottomLeft,
        bottomRight: !!codexCard.linkArrows.bottomRight,
      };
    }

    return app.$card.correct(card);
  }
}
