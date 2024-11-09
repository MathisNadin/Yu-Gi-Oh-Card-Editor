import { load } from 'cheerio';
import { extend, integer, isDefined, isString, isUndefined, uuid } from 'mn-tools';
import { ICard, TRushTextMode, TRushEffectType, TFrame, TStIcon, TAttribute } from 'client/editor/card';

export interface IYuginewsCardData {
  artworkUrl?: string;
  uuid?: string;
  id?: number | string;
  added?: Date;
  setId?: string;
  picture?: string;
  pictureDate?: string;
  theme?: string;
  nameFR?: string;
  nameEN?: string;
  nameJP?: string;
  cardType?: string;
  stType?: string;
  attribute?: string;
  abilities?: string[];
  level?: string;
  rank?: string;
  linkRating?: string;
  atkMAX?: string;
  atk?: string;
  def?: string;
  scale?: string;
  linkArrows?: string[] | undefined;
  normalText?: string;
  effects?: string[] | undefined;
  pendulumEffects?: string[] | undefined;
  note?: string;
  tradNote?: string;
  legend?: boolean | undefined;
  otherEffectTexts?: string[] | undefined;
  condition?: string;
  effectType?: string;
  effect?: string;
  choiceEffects?: string[] | undefined;
  isRush?: boolean;
}

export class YuginewsService {
  private basePostsRequestUrl = 'https://yuginews.fr/wp-json/wp/v2/posts';

  /**
   * Fetches and parses card data from a given page URL.
   * @param url - The page URL to fetch card data from.
   * @returns An array of IYuginewsCardData objects.
   */
  public async getPageCards(url: string): Promise<IYuginewsCardData[]> {
    // Extract the slug from the URL
    const slug = this.getSlugFromUrl(url);
    if (!slug) return [];

    const forceRush = slug.includes('cartes-rd-');

    // Fetch page content
    const renderedContent = await this.fetchPageContent(slug);
    if (!renderedContent) return [];

    // Extract setId and useFinalPictures
    const setId = this.extractSetId(renderedContent);
    const useFinalPictures = this.extractUseFinalPictures(renderedContent);

    // Try to parse card data from the 'var cards = [...]' script
    let cardsData = this.parseCardsScript(renderedContent, setId, useFinalPictures, forceRush);

    // If parsing the script failed, parse the DOM
    if (!cardsData) cardsData = this.parseDOM(renderedContent);

    return cardsData || [];
  }

  /**
   * Extracts the slug from a given URL.
   * @param url - The URL to extract the slug from.
   * @returns The extracted slug or undefined if not found.
   */
  private getSlugFromUrl(url: string): string | undefined {
    const urlParts = url.split('/');
    if (!urlParts?.length || urlParts.length < 2) return undefined;
    return urlParts[urlParts.length - 2];
  }

  /**
   * Fetches the page content using the slug.
   * @param slug - The slug to use in the request.
   * @returns The rendered content as a string or undefined if not found.
   */
  private async fetchPageContent(slug: string): Promise<string | undefined> {
    const response = await app.$axios.get<{ content?: { rendered?: string } }[]>(
      `${this.basePostsRequestUrl}?slug=${slug}&timestamp=${new Date().getTime()}`
    );
    return response[0]?.content?.rendered;
  }

  /**
   * Extracts the setId from the content.
   * @param content - The content to search in.
   * @returns The extracted setId or undefined if not found.
   */
  private extractSetId(content: string): string | undefined {
    const setIdMatches = content.match(/var setId = `([A-Za-z0-9]+)`;/);
    return setIdMatches?.length ? setIdMatches[1] : undefined;
  }

  /**
   * Extracts the useFinalPictures flag from the content.
   * @param content - The content to search in.
   * @returns True if useFinalPictures is 'true', otherwise false.
   */
  private extractUseFinalPictures(content: string): boolean {
    const useFinalPicturesMatches = content.match(/var useFinalPictures = ([A-Za-z0-9]+);/);
    return !!useFinalPicturesMatches?.length && useFinalPicturesMatches[1] === 'true';
  }

  /**
   * Parses the card data from the 'var cards = [...]' script in the content.
   * @param content - The content containing the script.
   * @param setId - The setId to use if not present in card data.
   * @param useFinalPictures - Flag indicating whether to use final pictures.
   * @param forceRush - Flag indicating whether to force Rush card formatting.
   * @returns An array of parsed IYuginewsCardData objects or undefined if no script is found.
   */
  private parseCardsScript(
    content: string,
    setId: string | undefined,
    useFinalPictures: boolean,
    forceRush: boolean
  ): IYuginewsCardData[] | undefined {
    const matches = content.match(/var cards = ([\s\S]*?];)/);
    if (!matches?.length || !matches[1]) return undefined;

    const extractedData = matches[1]
      .replaceAll('<!-- [et_pb_line_break_holder] -->', '')
      .replaceAll('<!–- [et_pb_br_holder] -–>', '\n')
      .replaceAll('<!\u2013- [et_pb_br_holder] -\u2013>', '\n');
    const cardsDataStrings = extractedData.split('},{');
    if (!cardsDataStrings?.length) return [];

    const cardsData: IYuginewsCardData[] = [];
    let foundRush = false;
    for (const cardDataString of cardsDataStrings) {
      const inputString = cardDataString
        .replaceAll('[L]', '(L)')
        .replaceAll('[R]', '(R)')
        .replaceAll(/[ \t]+/g, ' ')
        .replaceAll(/\n/g, '\\n');

      // Parse the card data
      const parsedCardData = this.parseCardData(inputString);
      if (!Object.keys(parsedCardData)?.length) continue;

      // Process parsed card data
      if (!parsedCardData.setId && setId) parsedCardData.setId = setId;
      if (isDefined(parsedCardData.id) && !/\D/g.test(`${parsedCardData.id}`)) {
        parsedCardData.id = integer(parsedCardData.id);
      }
      parsedCardData.uuid = uuid();
      parsedCardData.pictureDate = parsedCardData.pictureDate?.replaceAll('"', '');

      parsedCardData.isRush = forceRush || foundRush || 'effectType' in parsedCardData;

      // Construct picture URL
      let picture: string;
      if (parsedCardData.picture) {
        picture = parsedCardData.picture;
      } else {
        picture = [
          this.formatPictureString(parsedCardData.nameEN || ''),
          '-',
          parsedCardData.isRush ? 'RD' : '',
          parsedCardData.setId,
          '-JP',
          useFinalPictures ? '' : '-OP',
        ].join('');
      }

      parsedCardData.artworkUrl = `https://yuginews.fr/wp-content/uploads/${parsedCardData.pictureDate}/${picture}.png`;

      // Handle Rush specific modifications
      if (parsedCardData.isRush) {
        if (!forceRush && !foundRush) {
          foundRush = true;
          // Update existing cards in cardsData
          for (const card of cardsData) {
            card.isRush = true;
            this.updateCardForRush(card);
          }
        }
        this.updateCardForRush(parsedCardData);
      }

      cardsData.push(parsedCardData);
    }

    return cardsData;
  }

  /**
   * Parses individual card data from a string.
   * @param inputString - The string containing card data.
   * @returns An object representing the parsed card data.
   */
  private parseCardData(inputString: string): IYuginewsCardData {
    const regex = /"([^"]+)":\s*("[^"]+"|\[[^\]]+\]|\`[^`]+\`)/g;
    const parsedCardData: IYuginewsCardData = {};

    let match: RegExpExecArray | null;
    while ((match = regex.exec(inputString)) !== null) {
      const key = match[1] as keyof IYuginewsCardData;
      let value: string | string[] = match[2];

      // If the value is an array enclosed in brackets, parse it as an array
      if (value.startsWith('[') && value.endsWith(']')) {
        const cleanValue = value
          .replaceAll(', ]', ']')
          .replaceAll('"', '\\"')
          .replaceAll('`', '"')
          .replaceAll('(L)', '[L]')
          .replaceAll('(R)', '[R]');
        value = JSON.parse(cleanValue) as string[];
      }

      if (isString(value)) value = value.replaceAll('`', '');

      // Just for typing reasons
      parsedCardData[key as 'effect'] = value as string;
    }
    return parsedCardData;
  }

  /**
   * Updates card data for Rush formatting.
   * @param card - The card data to update.
   */
  private updateCardForRush(card: IYuginewsCardData) {
    if (card.setId) card.setId = `RD/${card.setId}`;

    function renormalizeText(text: string): string {
      if (!text) return text;
      return text.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
    }

    if (card.nameFR) card.nameFR = renormalizeText(card.nameFR);
    if (card.nameEN) card.nameEN = renormalizeText(card.nameEN);
    if (card.nameJP) card.nameJP = renormalizeText(card.nameJP);

    if (card.normalText) card.normalText = renormalizeText(card.normalText);

    if (card.otherEffectTexts?.length) {
      for (let effect of card.otherEffectTexts) {
        effect = renormalizeText(effect);
      }
    }

    if (card.condition) card.condition = renormalizeText(card.condition);
    if (card.effect) card.effect = renormalizeText(card.effect);

    if (card.choiceEffects?.length) {
      for (let effect of card.choiceEffects) {
        effect = renormalizeText(effect);
      }
    }
  }

  /**
   * Parses the DOM to extract card data when the script is not found.
   * @param htmlContent - The HTML content to parse.
   * @returns An array of parsed IYuginewsCardData objects.
   */
  private parseDOM(htmlContent: string): IYuginewsCardData[] {
    const cardsData: IYuginewsCardData[] = [];
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const sections = doc.querySelectorAll(
      'section.elementor-section.elementor-inner-section.elementor-element.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default'
    );

    sections.forEach((section) => {
      const artworkUrl = section.querySelector('img')?.src;
      const subSections = section.querySelectorAll(
        'div.elementor-column.elementor-col-50.elementor-inner-column.elementor-element'
      );
      subSections.forEach((subSection, index) => {
        if (!index) return;

        const subSubSections = subSection.querySelectorAll(
          'div.elementor-element.elementor-widget.elementor-widget-text-editor'
        );
        if (!subSubSections?.length) return;

        const parsedCardData: IYuginewsCardData = {};
        subSubSections.forEach((s, sIndex) => {
          const paragraphs = load(s.innerHTML)('p');
          if (!paragraphs.length) return;

          // If first section, parse card info lines
          if (!sIndex) {
            paragraphs.each((i) => {
              const infoLines = paragraphs.eq(i).html()?.split('<br>');
              if (infoLines?.length) {
                // Parse card names lines
                if (!i) this.parseDOMNamesLines(infoLines, parsedCardData);
                // Parse card information lines
                else this.parseDOMInfoLines(infoLines, parsedCardData);
              }
            });
          }
          // Else, parse card effects
          else {
            const effects: string[] = [];
            paragraphs.each((i) => {
              effects.push(paragraphs.eq(i).text());
            });
            if (effects.length) this.parseDOMEffects(effects, parsedCardData);
          }
        });
        if (!Object.keys(parsedCardData)?.length) return;

        parsedCardData.uuid = uuid();
        if (!parsedCardData.cardType) parsedCardData.cardType = '1';
        if (artworkUrl) parsedCardData.artworkUrl = artworkUrl;
        if (!parsedCardData.setId) parsedCardData.setId = '';
        if (isUndefined(parsedCardData.id)) parsedCardData.id = '';
        cardsData.push(parsedCardData);
      });
    });

    return cardsData;
  }

  /**
   * Parses lines of card names from the DOM.
   * @param nameLines - The lines to parse.
   * @param parsedCardData - The card data object to populate.
   */
  private parseDOMNamesLines(namesLines: string[], parsedCardData: IYuginewsCardData) {
    namesLines.forEach((line, iLine) => {
      // Replace &nbsp; with spaces
      line = line.replaceAll('&nbsp;', ' ').trim();

      // First line, nameFR
      if (!iLine) {
        parsedCardData.nameFR = line
          .replaceAll('<span>', '')
          .replaceAll('</span>', '')
          .replaceAll('<strong>', '')
          .replaceAll('</strong>', '')
          .replaceAll('<b>', '')
          .replaceAll('</b>', '')
          .trim();
      } else {
        // Other lines
        const setIdMatch = line.match(/^([^-]+)/);
        const idMatch = line.match(/-(.*?)\s*\(JAP/);
        const nameENMatch = line.match(/EN\s*:\s*<em>(.*?)<\/em>/);

        if (setIdMatch && idMatch) {
          parsedCardData.setId = setIdMatch[1].trim();
          if (parsedCardData.setId?.startsWith('RD/')) parsedCardData.isRush = true;
          parsedCardData.id = integer(idMatch[1].slice(-3).replace(/\D/g, '').trim());
          parsedCardData.nameEN = nameENMatch?.length && nameENMatch[1] ? nameENMatch[1].trim() : '';
        }
      }
    });
  }

  /**
   * Parses lines of card information from the DOM.
   * @param infoLines - The lines to parse.
   * @param parsedCardData - The card data object to populate.
   */
  private parseDOMInfoLines(infoLines: string[], parsedCardData: IYuginewsCardData) {
    for (let line of infoLines) {
      // Replace &nbsp; with spaces
      line = line.replaceAll('&nbsp;', ' ').trim();

      if (line.includes('Flèche')) {
        parsedCardData.linkArrows = line
          .replace('Flèche Lien : ', '')
          .replace('Flèches Lien : ', '')
          .trim()
          .split(' / ');
      } else if (line.includes(' / ')) {
        parsedCardData.abilities = line.split(' / ');
      } else if (line.includes('Niveau')) {
        parsedCardData.level = line.replace('Niveau ', '').trim();
      } else if (line.includes('Rang')) {
        parsedCardData.level = line.replace('Rang ', '').trim();
      } else if (line.includes('Link-')) {
        parsedCardData.level = line.replace('Link-', '').trim();
      } else if (line.includes('ATK MAXIMUM')) {
        parsedCardData.atkMAX = line.replace(' ATK MAXIMUM', '').trim();
      } else if (line.includes('ATK')) {
        parsedCardData.atk = line.replace(' ATK', '').trim();
      } else if (line.includes('DEF')) {
        parsedCardData.def = line.replace(' DEF', '').trim();
      } else if (line.includes('Échelle')) {
        parsedCardData.scale = line.replace('Échelle Pendule : ', '').trim();
      } else if (line.includes('Magie')) {
        parsedCardData.cardType = '2';
        parsedCardData.stType = this.getStTypeFromLine(line);
      } else if (line.includes('Piège')) {
        parsedCardData.cardType = '3';
        parsedCardData.stType = this.getStTypeFromLine(line);
      } else if (line.includes('LEGEND') || line.includes('LÉGENDE')) {
        parsedCardData.legend = true;
      } else if (/^[A-ZÀ-ÖØ-Þ]+$/i.test(line)) {
        parsedCardData.attribute = this.getAttributeFromLine(line);
      }
    }
  }

  /**
   * Parses card effects from the DOM.
   * @param effects - The effects to parse.
   * @param parsedCardData - The card data object to populate.
   */
  private parseDOMEffects(effects: string[], parsedCardData: IYuginewsCardData) {
    // Replace &nbsp; with spaces
    for (let effect of effects) effect = effect.replaceAll('&nbsp;', ' ').trim();

    if (parsedCardData.isRush) {
      for (const effect of effects) {
        if (effect.startsWith('[CONDITION]')) {
          parsedCardData.condition = effect.replace('[CONDITION] ', '');
        } else if (effect.startsWith('[EFFET]')) {
          parsedCardData.effectType = '1';
          parsedCardData.effect = effect.replace('[EFFET] ', '');
        } else if (effect.startsWith('[EFFET CONTINU]')) {
          parsedCardData.effectType = '2';
          parsedCardData.condition = effect.replace('[EFFET CONTINU] ', '');
        } else if (effect.startsWith('[EFFET MULTI-CHOIX]')) {
          parsedCardData.effectType = '3';
          parsedCardData.choiceEffects = [
            effect.replace('[EFFET MULTI-CHOIX] ', '').replace('● ', '').replace('• ', ''),
          ];
        } else if ((effect.startsWith('●') || effect.startsWith('•')) && parsedCardData.choiceEffects) {
          parsedCardData.choiceEffects.push(effect.replace('● ', '').replace('• ', ''));
        } else if (parsedCardData.abilities?.includes('Normal')) {
          parsedCardData.normalText = effect;
        } else {
          if (!parsedCardData.otherEffectTexts) parsedCardData.otherEffectTexts = [effect];
          else parsedCardData.otherEffectTexts.push(effect);
        }
      }
    } else if (effects[0].startsWith('Effet Pendule :')) {
      parsedCardData.pendulumEffects = effects.slice(1);
    } else if (effects[0].startsWith('Effet de Monstre :')) {
      parsedCardData.effects = effects.slice(1);
    } else {
      parsedCardData.effects = effects;
    }
  }

  /**
   * Formats a string for use in picture URLs.
   * @param str - The string to format.
   * @returns The formatted string.
   */
  private formatPictureString(str: string) {
    if (!str) return str;
    // Remplacer les caractères non autorisés dans une URL ou un nom de fichier
    str = str
      .replace(
        /[^\w\s\-+.!\/'()=%\\*\?"<>|\u00E0\u00E2\u00E4\u00E7\u00E8\u00E9\u00EA\u00EB\u00EE\u00EF\u00F4\u00F6\u00F9\u00FB\u00FC]/g,
        ''
      )
      .replace(/[\s?!]/g, '')
      .replace(/:/g, '');
    // Remplacer les caractères accentués
    const accents = [
      /[\u00C0-\u00C6]/g, // A avec accents majuscules
      /[\u00E0-\u00E6]/g, // a avec accents minuscules
      /[\u00C8-\u00CB]/g, // E avec accents majuscules
      /[\u00E8-\u00EB]/g, // e avec accents minuscules
      /[\u00CC-\u00CF]/g, // I avec accents majuscules
      /[\u00EC-\u00EF]/g, // i avec accents minuscules
      /[\u00D2-\u00D8]/g, // O avec accents majuscules
      /[\u00F2-\u00F8]/g, // o avec accents minuscules
      /[\u00D9-\u00DC]/g, // U avec accents majuscules
      /[\u00F9-\u00FC]/g, // u avec accents minuscules
      /[\u00D1]/g, // N avec tilde majuscule
      /[\u00F1]/g, // n avec tilde minuscule
      /[\u00C7]/g, // C cédille majuscule
      /[\u00E7]/g, // c cédille minuscule
    ];
    const noAccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];
    for (let i = 0; i < accents.length; i++) {
      str = str.replace(accents[i], noAccent[i]);
    }
    // Remplacer les /, -, ", ', :, !, ?, et les .
    str = str.replace(/[\/\\\-"'()=:!?\.]/g, '');
    // Retourner la chaîne de caractères modifiée
    return str;
  }

  private getAttributeFromLine(line: string) {
    if (line.includes('TÉNÈBRES')) return 'dark';
    if (line.includes('LUMIÈRE')) return 'light';
    if (line.includes('EAU')) return 'water';
    if (line.includes('FEU')) return 'fire';
    if (line.includes('TERRE')) return 'earth';
    if (line.includes('VENT')) return 'wind';
    if (line.includes('DIVIN')) return 'divine';
    return undefined;
  }

  private getStTypeFromLine(line: string) {
    if (line.includes('Normal')) return 'normal';
    if (line.includes('Rituelle')) return 'ritual';
    if (line.includes('Jeu-Rapide')) return 'quickplay';
    if (line.includes('de Terrain')) return 'field';
    if (line.includes('Continu')) return 'continuous';
    if (line.includes('Équipement')) return 'equip';
    if (line.includes('Contre-')) return 'counter';
    return undefined;
  }

  public async importFromCardData(
    cardsData: IYuginewsCardData[],
    importArtworks: boolean,
    artworkDirectoryPath: string
  ) {
    let cards: ICard[] = [];
    let now = new Date();

    for (let cardData of cardsData) {
      let scale: number = cardData.scale ? integer(cardData.scale) : 0;

      let card = {
        uuid: cardData.uuid as string,
        created: now,
        modified: now,
        language: 'fr',
        name: cardData.nameFR as string,
        nameStyle: 'default',
        tcgAt: true,
        artwork: {
          url: '',
          x: 0,
          y: 0,
          height: 100,
          width: 100,
          pendulum: false,
          keepRatio: false,
        },
        frames: this.getFrame(cardData),
        multipleFrames: false,
        stType: this.getStType(cardData),
        attribute: this.getAttribute(cardData),
        noTextAttribute: false,
        abilities: cardData.abilities as string[],
        level: integer(cardData.level || cardData.rank || cardData.linkRating || '0'),
        atk: cardData.atk,
        def: cardData.def,
        pendulum: (cardData.abilities as string[])?.includes('Pendule'),
        pendEffect: (cardData.pendulumEffects as string[])?.join(' '),
        scales: {
          left: scale,
          right: scale,
        },
        linkArrows: this.getLinkArrows(cardData),
        edition: 'unlimited',
        cardSet: this.getCardSet(cardData),
        hasCopyright: true,
        sticker: 'none',
        rush: cardData.isRush,
        legend: cardData.legend,
        atkMax: cardData.atkMAX,
        maximum: !!cardData.atkMAX,
        rushEffectType: this.getRushEffectType(cardData.effectType as string),
        rushTextMode: this.getRushTextMode(cardData),
        rushOtherEffects: cardData.otherEffectTexts?.join('\n'),
        rushCondition: cardData.condition,
        rushEffect: cardData.effect,
        rushChoiceEffects: cardData.choiceEffects,
      } as ICard;

      app.$card.correct(card as ICard);
      card.description = this.getDescription(card as ICard, cardData);

      if (card.frames.length === 1 && (card.frames[0] === 'token' || card.frames[0] === 'monsterToken')) {
        card.edition = 'forbiddenDeck';
      }

      if (importArtworks && cardData.artworkUrl?.length && artworkDirectoryPath?.length) {
        const filePath = await app.$card.importArtwork(cardData.artworkUrl, artworkDirectoryPath);
        if (filePath) {
          card.artwork.url = filePath;
          if (card.rush) {
            card.dontCoverRushArt = true;
          }

          if (
            !filePath.endsWith('-OW.webp') &&
            !filePath.endsWith('-OW.png') &&
            !filePath.endsWith('-OW.jpg') &&
            !filePath.endsWith('-OW.jpeg')
          ) {
            if (card.rush) {
              card.dontCoverRushArt = true;
              extend(card.artwork, app.$card.getFullRushCardPreset());
            } else if (card.pendulum) {
              extend(card.artwork, app.$card.getFullPendulumCardPreset());
            } else {
              extend(card.artwork, app.$card.getFullCardPreset());
            }
          }
        }
      }

      cards.push(card as ICard);
    }

    return cards;
  }

  private getRushTextMode(cardData: IYuginewsCardData): TRushTextMode {
    if ('choiceEffects' in cardData) {
      return 'choice';
    } else if ('normalText' in cardData) {
      return 'vanilla';
    } else {
      return 'regular';
    }
  }

  private getRushEffectType(effectType: string): TRushEffectType {
    switch (effectType) {
      case '1':
        return 'effect';
      case '2':
        return 'continuous';
      default:
        return 'effect';
    }
  }

  private getDescription(card: ICard, cardData: IYuginewsCardData): string {
    let description = '';

    if (cardData.normalText) {
      description = cardData.normalText;
    } else if (cardData.effects?.length) {
      let lastHasLineBreak = false;
      let lastHasBulletPoint = false;
      cardData.effects.forEach((eff, i) => {
        if (!i) {
          description = eff;
        } else if (!lastHasLineBreak && (lastHasBulletPoint || eff.startsWith('●'))) {
          description = `${description}\n${eff}`;
        } else {
          description = `${description}${lastHasLineBreak ? '' : ' '}${eff}`;
        }

        if ((!i && app.$card.hasMaterials(card as ICard)) || (eff.startsWith('(') && !eff.startsWith('(Effet'))) {
          description = `${description}\n`;
          lastHasLineBreak = true;
        } else {
          lastHasLineBreak = false;
        }

        lastHasBulletPoint = eff.startsWith('●') || eff.includes('\n●');
      });
    }

    return description;
  }

  private getFrame(cardData: IYuginewsCardData): TFrame[] {
    let frame: TFrame[] = [];

    let types = cardData.abilities as string[];
    if (types?.length) {
      if (types.includes('Rituel')) {
        frame.push('ritual');
      } else if (types.includes('Fusion')) {
        frame.push('fusion');
      } else if (types.includes('Synchro')) {
        frame.push('synchro');
      } else if (types.includes('Synchro des Ténèbres')) {
        frame.push('darkSynchro');
      } else if (types.includes('Xyz')) {
        frame.push('xyz');
      } else if (types.includes('Lien')) {
        frame.push('link');
      } else if (types.includes('Compétence')) {
        frame.push('skill');
      } else if (types.includes('Effet')) {
        frame.push('effect');
      } else if (types.includes('Normal')) {
        frame.push('normal');
      }
    } else if (cardData.cardType) {
      if (cardData.cardType === '2') {
        frame.push('spell');
      } else if (cardData.cardType === '3') {
        frame.push('trap');
      } else if (cardData.nameEN === 'Token') {
        frame.push('token');
      } else if (cardData.nameEN?.includes('Token')) {
        frame.push('monsterToken');
      }
    }

    return frame;
  }

  private getStType(cardData: IYuginewsCardData) {
    let stType: TStIcon;

    switch (cardData.stType) {
      case 'field':
        stType = 'field';
        break;
      case 'equip':
        stType = 'equip';
        break;
      case 'continuous':
        stType = 'continuous';
        break;
      case 'ritual':
        stType = 'ritual';
        break;
      case 'quickplay':
        stType = 'quickplay';
        break;
      case 'counter':
        stType = 'counter';
        break;
      case 'link':
        stType = 'link';
        break;
      default:
        stType = 'normal';
        break;
    }

    return stType;
  }

  private getAttribute(cardData: IYuginewsCardData): TAttribute {
    let attribute: TAttribute = 'spell';

    if (cardData.attribute) {
      switch (cardData.attribute) {
        case 'dark':
          attribute = 'dark';
          break;
        case 'light':
          attribute = 'light';
          break;
        case 'water':
          attribute = 'water';
          break;
        case 'earth':
          attribute = 'earth';
          break;
        case 'fire':
          attribute = 'fire';
          break;
        case 'wind':
          attribute = 'wind';
          break;
        default:
          attribute = 'divine';
          break;
      }
    } else if (cardData.cardType && cardData.cardType === '3') {
      attribute = 'trap';
    }

    return attribute;
  }

  private getCardSet(cardData: IYuginewsCardData): string {
    let id = `${cardData.id}`;
    switch (id.length) {
      case 1:
        id = `00${id}`;
        break;
      case 2:
        id = `0${id}`;
        break;
      case undefined:
        id = '000';
        break;
      default:
        break;
    }

    return `${cardData.setId}-JP${id}`;
  }

  private getLinkArrows(cardData: IYuginewsCardData): ICard['linkArrows'] {
    let arrows: ICard['linkArrows'] = {
      top: false,
      bottom: false,
      left: false,
      right: false,
      topLeft: false,
      topRight: false,
      bottomLeft: false,
      bottomRight: false,
    };

    if (cardData.linkArrows?.length) {
      for (let arrow of cardData.linkArrows) {
        switch (arrow) {
          case 'Haut':
            arrows.top = true;
            break;

          case 'Haut-Gauche':
            arrows.topLeft = true;
            break;

          case 'Haut-Droite':
            arrows.topRight = true;
            break;

          case 'Gauche':
            arrows.left = true;
            break;

          case 'Droite':
            arrows.right = true;
            break;

          case 'Bas':
            arrows.bottom = true;
            break;

          case 'Bas-Gauche':
            arrows.bottomLeft = true;
            break;

          case 'Bas-Droite':
            arrows.bottomRight = true;
            break;

          default:
            break;
        }
      }
    }

    return arrows;
  }
}
