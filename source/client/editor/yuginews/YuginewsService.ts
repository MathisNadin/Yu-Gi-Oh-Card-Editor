import { extend, integer, isDefined, isUndefined, unserialize, uuid } from 'mn-tools';
import { ICard, TRushTextMode, TRushEffectType, TFrame, TStIcon, TAttribute } from 'client/editor/card';

export interface IYuginewsCardData {
  artworkUrl?: string;
  uuid?: string;
  id?: number | string;
  pageOrder?: number;
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
  linkArrows?: string[];
  normalText?: string;
  effects?: string[];
  pendulumEffects?: string[];
  note?: string;
  tradNote?: string;
  legend?: boolean;
  otherEffectTexts?: string[];
  condition?: string;
  effectType?: string;
  effect?: string;
  choiceEffects?: string[];
  isRush?: boolean;
}

export class YuginewsService {
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
      `https://yuginews.fr/wp-json/wp/v2/posts?slug=${slug}&timestamp=${new Date().getTime()}`
    );
    return response?.data[0]?.content?.rendered;
  }

  /**
   * Extracts the setId from the content.
   * @param content - The content to search in.
   * @returns The extracted setId or undefined if not found.
   */
  private extractSetId(content: string): string | undefined {
    const setIdMatches = content.match(/var setId = `([A-Za-z0-9]+)`;/);
    return setIdMatches?.length ? setIdMatches[1] : '????';
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
      .replaceAll('<!–- [et_pb_br_holder] -–>', '\\n')
      .replaceAll('<!\u2013- [et_pb_br_holder] -\u2013>', '\\n');
    const parsedCards = this.parseJavaScriptArray(extractedData);
    if (!parsedCards.length) return [];

    const cardsData: IYuginewsCardData[] = [];
    let foundRush = false;
    for (const parsedCardData of parsedCards) {
      if (!Object.keys(parsedCardData)?.length) continue;

      // Process parsed card data
      if (!parsedCardData.setId && setId) parsedCardData.setId = setId;
      if (isDefined(parsedCardData.id) && !/\D/g.test(`${parsedCardData.id}`)) {
        parsedCardData.id = integer(parsedCardData.id);
      }
      parsedCardData.uuid = uuid();
      parsedCardData.pictureDate = parsedCardData.pictureDate?.replaceAll('"', '');

      if (parsedCardData.added) {
        parsedCardData.added = new Date(parsedCardData.added);
      }

      parsedCardData.isRush = forceRush || foundRush || 'effectType' in parsedCardData;

      // Construct picture URL
      let picture: string;
      if (parsedCardData.picture) {
        picture = parsedCardData.picture;
      } else {
        picture = [
          this.formatPictureString(parsedCardData.nameEN),
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
            if (card.setId) card.setId = `RD/${card.setId}`;
          }
        }
        if (parsedCardData.setId) parsedCardData.setId = `RD/${parsedCardData.setId}`;
      }

      cardsData.push(parsedCardData);
    }

    return cardsData;
  }

  /**
   * Convertit un string JavaScript non valide en un tableau d'objets JSON valide.
   * @param inputString - Le string contenant le code JavaScript.
   * @returns Un tableau d'objets représentant les données parsées.
   */
  private parseJavaScriptArray(inputString: string) {
    // Étape 1 : Remplacement de `new Date("...")` par les strings
    inputString = inputString.replace(/new Date\("([^"]+)"\)/g, '"$1"');

    // Étape 2 : Remplacement des backticks par des guillemets doubles
    inputString = inputString.replace(/`([^`]*)`/g, (_, content) => {
      const escapedContent = content.replace(/"/g, '\\"'); // Échapper les guillemets doubles
      return `"${escapedContent}"`;
    });

    // Étape 3 : Suppression des virgules finales dans les tableaux et objets
    inputString = inputString.replace(/,\s*([\]}])/g, '$1');

    // Étape 4 : Suppression du point-virgule final (ou autres caractères inattendus)
    inputString = inputString.replace(/;\s*$/, '');

    // Étape 5 : Vérifier que l'entrée est bien un tableau
    if (!inputString.trim().startsWith('[')) {
      inputString = `[${inputString}]`;
    }

    // Étape 6 : Conversion JSON
    let cardsData: IYuginewsCardData[] = [];
    try {
      cardsData = unserialize(inputString);
    } catch (e) {
      app.$errorManager.trigger(e as Error);
    }

    return cardsData;
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

    let pageOrder = 1;
    sections.forEach((section) => {
      const artworkUrl = section.querySelector('img')?.src;
      const subSections = section.querySelectorAll(
        'div.elementor-column.elementor-col-50.elementor-inner-column.elementor-element'
      );
      subSections.forEach((subSection, index) => {
        if (!index) return; // Skip the first sub-section

        const subSubSections = subSection.querySelectorAll(
          'div.elementor-element.elementor-widget.elementor-widget-text-editor'
        );
        if (!subSubSections?.length) return;

        const parsedCardData: IYuginewsCardData = {};
        subSubSections.forEach((s, sIndex) => {
          const paragraphs = Array.from(s.querySelectorAll('p'));
          if (!paragraphs.length) return;

          // If first section, parse card info lines
          if (!sIndex) {
            paragraphs.forEach((p, i) => {
              const infoLines = p.innerHTML.split('<br>');
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
            const effects: string[] = paragraphs
              .map((paragraph) => {
                let textWithBreaks = '';

                // Parcours des enfants du paragraphe
                paragraph.childNodes.forEach((child) => {
                  if (child.nodeType === Node.TEXT_NODE) {
                    // Texte brut
                    textWithBreaks += child.textContent;
                  } else if (child.nodeType === Node.ELEMENT_NODE && 'tagName' in child && child.tagName === 'BR') {
                    // Balise <br>, ajouter un saut de ligne
                    textWithBreaks += '\n';
                  } else if (child.nodeType === Node.ELEMENT_NODE) {
                    // Autres balises, récupérer le texte à l'intérieur
                    textWithBreaks += (child as HTMLElement).textContent;
                  }
                });

                // Nettoyage final
                return textWithBreaks.replace(/\u00A0/g, ' ').trim();
              })
              .filter((e) => !!e);

            if (effects.length) this.parseDOMEffects(effects, parsedCardData);
          }
        });

        if (!Object.keys(parsedCardData)?.length) return;

        parsedCardData.uuid = uuid();
        if (!parsedCardData.cardType) parsedCardData.cardType = '1';
        if (artworkUrl) parsedCardData.artworkUrl = artworkUrl;
        if (!parsedCardData.setId) parsedCardData.setId = '';
        if (isUndefined(parsedCardData.id)) parsedCardData.id = '';
        parsedCardData.pageOrder = pageOrder;
        pageOrder++;
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
      // Utiliser DOMParser pour analyser le contenu HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(line, 'text/html');

      // Extraire le texte brut, sans balises HTML, en remplaçant les espaces insécables
      const plainLine = doc.body?.textContent?.replace(/\u00A0/g, ' ')?.trim() || '';

      // First line, nameFR
      if (!iLine) {
        parsedCardData.nameFR = plainLine;
      } else {
        // Other lines
        const setIdMatch = plainLine.match(/^([^-]+)/);
        const idMatch = plainLine.match(/-(.*?)\s*\(JAP/);
        if (setIdMatch && isDefined(setIdMatch[1]) && idMatch && isDefined(idMatch[1])) {
          parsedCardData.setId = setIdMatch[1].trim();
          if (parsedCardData.setId?.startsWith('RD/')) parsedCardData.isRush = true;
          parsedCardData.id = integer(idMatch[1].slice(-3).replace(/\D/g, '').trim());
        }

        // Expression régulière pour capturer les noms anglais et japonais
        const parsedNames = this.parseDOMNames(plainLine);
        if (parsedNames.nameEN) parsedCardData.nameEN = parsedNames.nameEN; // Nom anglais s'il existe
        if (parsedNames.nameJP) parsedCardData.nameJP = parsedNames.nameJP; // Nom japonais s'il existe
      }
    });
  }

  private parseDOMNames(plainLine: string) {
    let nameJP = '';
    let nameEN = '';

    // Retirer tout ce qui est en dehors des parenthèses pour limiter le contexte
    const matchParentheses = plainLine.match(/\((.*?)\)$/);
    if (!matchParentheses || !matchParentheses[1]) {
      // Si aucune parenthèse, retourner des noms vides
      return { nameJP, nameEN };
    }

    // Contenu à l'intérieur des parenthèses
    const content = matchParentheses[1];

    // Première regex : cas où JAP et EN sont séparés
    const matchSeparate = content.match(/JAP\s*:\s*(.*?)\s*\/\s*EN\s*:\s*(.*)/);
    if (matchSeparate) {
      nameJP = matchSeparate[1]?.trim() || '';
      nameEN = matchSeparate[2]?.trim() || '';
      return { nameJP, nameEN };
    }

    // Deuxième regex : cas où JAP/EN est combiné
    const matchCombined = content.match(/JAP\/EN\s*:\s*(.*)/);
    if (matchCombined) {
      nameJP = matchCombined[1]?.trim() || '';
      nameEN = matchCombined[1]?.trim() || '';
      return { nameJP, nameEN };
    }

    // Si aucune correspondance trouvée
    return { nameJP, nameEN };
  }

  /**
   * Parses lines of card information from the DOM.
   * @param infoLines - The lines to parse.
   * @param parsedCardData - The card data object to populate.
   */
  private parseDOMInfoLines(infoLines: string[], parsedCardData: IYuginewsCardData) {
    for (const line of infoLines) {
      // Utiliser DOMParser pour analyser le contenu HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(line, 'text/html');

      // Extraire le texte brut, sans balises HTML, en remplaçant les espaces insécables
      const plainLine = doc.body?.textContent?.replace(/\u00A0/g, ' ')?.trim() || '';

      if (plainLine === 'Compétence') {
        parsedCardData.abilities = [plainLine];
      } else if (plainLine.includes('Flèche')) {
        parsedCardData.linkArrows = plainLine
          .replace('Flèche Lien : ', '')
          .replace('Flèches Lien : ', '')
          .trim()
          .split(' / ');
      } else if (plainLine.includes(' / ')) {
        parsedCardData.abilities = plainLine.split(' / ');
      } else if (plainLine.includes('Niveau')) {
        parsedCardData.level = plainLine.replace('Niveau ', '').trim();
      } else if (plainLine.includes('Rang')) {
        parsedCardData.level = plainLine.replace('Rang ', '').trim();
      } else if (plainLine.includes('Link-')) {
        parsedCardData.level = plainLine.replace('Link-', '').trim();
      } else if (plainLine.includes('ATK MAXIMUM')) {
        parsedCardData.atkMAX = plainLine.replace(' ATK MAXIMUM', '').trim();
      } else if (plainLine.includes('ATK')) {
        parsedCardData.atk = plainLine.replace(' ATK', '').trim();
      } else if (plainLine.includes('DEF')) {
        parsedCardData.def = plainLine.replace(' DEF', '').trim();
      } else if (plainLine.includes('Échelle')) {
        parsedCardData.scale = plainLine.replace('Échelle Pendule : ', '').trim();
      } else if (plainLine.includes('Magie')) {
        parsedCardData.cardType = '2';
        parsedCardData.stType = this.getStTypeFromLine(plainLine);
      } else if (plainLine.includes('Piège')) {
        parsedCardData.cardType = '3';
        parsedCardData.stType = this.getStTypeFromLine(plainLine);
      } else if (plainLine.includes('LEGEND') || plainLine.includes('LÉGENDE')) {
        parsedCardData.legend = true;
      } else if (/^[A-ZÀ-ÖØ-Þ]+$/i.test(plainLine)) {
        parsedCardData.attribute = this.getAttributeFromLine(plainLine);
      }
    }
  }

  /**
   * Parses card effects from the DOM.
   * @param effects - The effects to parse.
   * @param parsedCardData - The card data object to populate.
   */
  private parseDOMEffects(effects: string[], parsedCardData: IYuginewsCardData) {
    if (parsedCardData.isRush) {
      for (const effect of effects) {
        if (effect.startsWith('[CONDITION]')) {
          parsedCardData.condition = effect.replace('[CONDITION] ', '');
        } else if (effect.startsWith('[EFFET]')) {
          parsedCardData.effectType = '1';
          parsedCardData.effect = effect.replace('[EFFET] ', '');
        } else if (effect.startsWith('[EFFET CONTINU]')) {
          parsedCardData.effectType = '2';
          parsedCardData.effect = effect.replace('[EFFET CONTINU] ', '');
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
    } else if (effects[0]?.startsWith('Effet Pendule :')) {
      parsedCardData.pendulumEffects = effects.slice(1);
    } else if (effects[0]?.startsWith('Effet de Monstre :')) {
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
  private formatPictureString(str: string | undefined) {
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
      str = str.replace(accents[i]!, noAccent[i]!);
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

  public async importFromCardData(options: {
    cardsData: IYuginewsCardData[];
    importArtworks: boolean;
    artworkDirectoryPath: string;
  }) {
    const { cardsData, importArtworks, artworkDirectoryPath } = options;
    const cards: ICard[] = [];
    const now = new Date();

    for (const cardData of cardsData) {
      const scale = cardData.scale ? integer(cardData.scale) : 0;

      let card: ICard = {
        uuid: cardData.uuid!,
        created: now,
        modified: now,
        language: 'fr',
        name: cardData.nameFR!,
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
        abilities: cardData.abilities!,
        level: integer(cardData.level || cardData.rank || cardData.linkRating || '0'),
        atk: cardData.atk!,
        def: cardData.def!,
        pendulum: !!cardData.abilities?.includes('Pendule'),
        scales: {
          left: scale,
          right: scale,
        },
        linkArrows: this.getLinkArrows(cardData),
        edition: 'unlimited',
        cardSet: this.getCardSet(cardData),
        hasCopyright: true,
        sticker: 'none',
        rush: cardData.isRush!,
        legend: cardData.legend!,
        atkMax: cardData.atkMAX!,
        maximum: !!cardData.atkMAX,
        rushEffectType: this.getRushEffectType(cardData.effectType),
        rushTextMode: this.getRushTextMode(cardData),
        rushOtherEffects: undefined!,
        rushCondition: cardData.condition!,
        rushEffect: cardData.effect!,
        rushChoiceEffects: cardData.choiceEffects!,
        description: undefined!,
        dontCoverRushArt: undefined!,
        legendType: undefined!,
        oldCopyright: undefined!,
        passcode: undefined!,
        pendEffect: undefined!,
        speed: undefined!,
      };

      // For now, handle Rush Skills that way
      if (card.rush && card.frames.length === 1 && card.frames[0] === 'skill') {
        card.frames = ['effect'];
        card.dontCoverRushArt = true;
      }

      app.$card.correct(card);
      card.description = this.getDescription(cardData, app.$card.hasMaterials(card));
      card.pendEffect = this.getPendEffect(cardData);
      card.rushOtherEffects = this.getRushOtherEffects(cardData, app.$card.hasMaterials(card));

      // Cheat a bit here for the display purpose when there is maybe only otherEffects (on a Ritual/Fusion for example)
      if (
        card.rush &&
        card.rushTextMode === 'regular' &&
        !card.rushCondition &&
        !card.rushEffect &&
        !card.rushChoiceEffects?.some((e) => !!e?.length)
      ) {
        if (card.rushOtherEffects) card.description = card.rushOtherEffects;
        card.rushTextMode = 'vanilla';
      }

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

      cards.push(card);
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

  private getRushEffectType(effectType: string | undefined): TRushEffectType {
    switch (effectType) {
      case '2':
        return 'continuous';
      case '1':
      default:
        return 'effect';
    }
  }

  private getDescription(cardData: IYuginewsCardData, hasMaterials: boolean): string {
    let description = '';

    // Check for special MD cases where no material is listed
    if (hasMaterials && !cardData.isRush && cardData.effects?.[0]) {
      if (cardData.effects[0].startsWith('Uniquement')) hasMaterials = false;
      if (cardData.effects[0].startsWith("Doit d'abord être Invoqué")) hasMaterials = false;
      if (cardData.effects[0].startsWith('Non Invocable')) hasMaterials = false;
    }

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

        if (
          isDefined(cardData.effects![i + 1]) &&
          ((!i && hasMaterials) || (eff.startsWith('(') && !eff.startsWith('(Effet')) || eff.startsWith('FLIP'))
        ) {
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

  private getPendEffect(cardData: IYuginewsCardData): string {
    if (!cardData.pendulumEffects?.length) return '';

    let pendEffect = '';
    let lastHasLineBreak = false;
    let lastHasBulletPoint = false;
    cardData.pendulumEffects.forEach((eff, i) => {
      if (!i) {
        pendEffect = eff;
      } else if (!lastHasLineBreak && (lastHasBulletPoint || eff.startsWith('●'))) {
        pendEffect = `${pendEffect}\n${eff}`;
      } else {
        pendEffect = `${pendEffect}${lastHasLineBreak ? '' : ' '}${eff}`;
      }

      if (eff.startsWith('(') && !eff.startsWith('(Effet')) {
        pendEffect = `${pendEffect}\n`;
        lastHasLineBreak = true;
      } else {
        lastHasLineBreak = false;
      }

      lastHasBulletPoint = eff.startsWith('●') || eff.includes('\n●');
    });

    return pendEffect;
  }

  private getRushOtherEffects(cardData: IYuginewsCardData, hasMaterials: boolean): string {
    if (!cardData.otherEffectTexts?.length) return '';

    let otherEffectTexts = '';

    let lastHasLineBreak = false;
    let lastHasBulletPoint = false;
    cardData.otherEffectTexts.forEach((eff, i) => {
      if (!i) {
        otherEffectTexts = eff;
      } else if (!lastHasLineBreak && (lastHasBulletPoint || eff.startsWith('●'))) {
        otherEffectTexts = `${otherEffectTexts}\n${eff}`;
      } else {
        otherEffectTexts = `${otherEffectTexts}${lastHasLineBreak ? '' : ' '}${eff}`;
      }

      if (isDefined(cardData.otherEffectTexts![i + 1]) && ((!i && hasMaterials) || eff.startsWith('('))) {
        otherEffectTexts = `${otherEffectTexts}\n`;
        lastHasLineBreak = true;
      } else {
        lastHasLineBreak = false;
      }

      lastHasBulletPoint = eff.startsWith('●') || eff.includes('\n●');
    });

    return otherEffectTexts;
  }

  private getFrame(cardData: IYuginewsCardData): TFrame[] {
    const frame: TFrame[] = [];

    const types = cardData.abilities;
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
    const arrows: ICard['linkArrows'] = {
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
      for (const arrow of cardData.linkArrows) {
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
