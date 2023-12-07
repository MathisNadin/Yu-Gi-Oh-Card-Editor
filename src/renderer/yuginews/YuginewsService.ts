import { extend, integer, uuid } from "libraries/mn-tools";
import { ICard, TAttribute, TFrame, TRushEffectType, TRushTextMode, TStIcon } from "renderer/card/card-interfaces";
import { load } from 'cheerio';

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
  [key: string]: string | string[] | number | boolean | Date | undefined;
  isRush?: boolean;
}

export class YuginewsService {
  private basePostsRequestUrl: string;

  public constructor() {
    this.basePostsRequestUrl = 'https://yuginews.fr/wp-json/wp/v2/posts';
  }

  public async getPageCards(url: string): Promise<IYuginewsCardData[]> {
    let cards: IYuginewsCardData[] = [];
    const urlParts = url.split('/');
    if (!urlParts?.length || urlParts.length < 2) return cards;

    const slug = urlParts[urlParts.length - 2];
    if (!slug) return cards;

    const forceRush = slug.includes('cartes-rd-');
    let foundRush = false;

    let response = await app.$api.get(`${this.basePostsRequestUrl}?slug=${slug}&timestamp=${new Date().getTime()}`);
    const htmlContent = response[0]?.content?.rendered as string;
    if (htmlContent) {
      const renderedContent = (response[0].content.rendered as string);

      let setIdMatches = renderedContent.match(/var setId = `([A-Za-z0-9]+)`;/);
      let setId = setIdMatches?.length ? setIdMatches[1] : undefined;

      let useFinalPictures = false;
      let useFinalPicturesMatches = renderedContent.match(/var useFinalPictures = ([A-Za-z0-9]+);/);
      if (useFinalPicturesMatches?.length && useFinalPicturesMatches[1] && useFinalPicturesMatches[1] === 'true') {
        useFinalPictures = true;
      }

      const matches = renderedContent.match(/var cards = (.*?];)/s);
      if (matches?.length && matches[1]) {
        const extractedData = matches[1]
          .replaceAll('<!-- [et_pb_line_break_holder] -->', '')
          .replaceAll('<!–- [et_pb_br_holder] -–>', '\n')
          .replaceAll('<!\u2013- [et_pb_br_holder] -\u2013>', '\n');
        let cardsData = extractedData.split('},{');

        if (cardsData?.length) {
          for (let cardData of cardsData) {
            let inputString = cardData
              .replaceAll('[L]', '(L)')
              .replaceAll('[R]', '(R)')
              .replaceAll(/[ \t]+/g, ' ')
              .replaceAll(/\n/g, '\\n');

            // eslint-disable-next-line no-useless-escape
            const regex = /"([^"]+)":\s*("[^"]+"|\[[^\]]+\]|\`[^`]+\`)/g;
            const parsedCardData: IYuginewsCardData = {};

            let match: RegExpExecArray | null;
            // eslint-disable-next-line no-cond-assign
            while ((match = regex.exec(inputString)) !== null) {
              const key = match[1];
              let value: string | string[] = match[2];

              // Si la valeur est un tableau encadré par des crochets, l'analyser en tant que tableau
              if (value.startsWith("[") && value.endsWith("]")) {
                let cleanValue = value
                  .replaceAll(', ]', ']')
                  .replaceAll('"', '\\"')
                  .replaceAll('`', '"')
                  .replaceAll('(L)', '[L]')
                  .replaceAll('(R)', '[R]');
                value = JSON.parse(cleanValue) as string[];
                // value = array.map(t => t.replaceAll('\\\\"', '"'));
              }

              if (typeof value === 'string') {
                value = value.replaceAll('`', '');
              }
              parsedCardData[key] = value;
            }
            if (Object.keys(parsedCardData)?.length) {
              if (!parsedCardData.setId && setId) parsedCardData.setId = setId;
              if (parsedCardData.id && !/\D/g.test(`${parsedCardData.id}`)) parsedCardData.id = integer(parsedCardData.id);
              parsedCardData.uuid = uuid();
              parsedCardData.pictureDate = parsedCardData.pictureDate?.replaceAll('"', '');

              // parsedCardData.isRush = 'effectType' in parsedCardData || 'normalText' in parsedCardData;
              parsedCardData.isRush = forceRush || foundRush || 'effectType' in parsedCardData;
              let picture = parsedCardData.picture ?? `${this.formatPictureString(parsedCardData.nameEN || '')}-${parsedCardData.isRush ? 'RD' : ''}${parsedCardData.setId ?? setId}-JP${useFinalPictures ? '' : '-OP'}`;
              if (picture) parsedCardData.artworkUrl = `https://yuginews.fr/wp-content/uploads/${parsedCardData.pictureDate}/${picture}.png`;

              if (parsedCardData.isRush) {
                if (!forceRush && !foundRush) {
                  foundRush = true;
                  for (const card of cards) {
                    card.isRush = true;
                    if (card.nameFR) card.nameFR = card.nameFR.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                    if (card.nameEN) card.nameEN = card.nameEN.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                    if (card.nameJP) card.nameJP = card.nameJP.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                    if (card.normalText) card.normalText = card.normalText.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                    if (card.condition) card.condition = card.condition.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                    if (card.effect) card.effect = card.effect.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                    if (card.setId) card.setId = `RD/${card.setId}`;
                  }
                }
                if (parsedCardData.nameFR) parsedCardData.nameFR = parsedCardData.nameFR.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                if (parsedCardData.nameEN) parsedCardData.nameEN = parsedCardData.nameEN.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                if (parsedCardData.nameJP) parsedCardData.nameJP = parsedCardData.nameJP.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                if (parsedCardData.normalText) parsedCardData.normalText = parsedCardData.normalText.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                if (parsedCardData.condition) parsedCardData.condition = parsedCardData.condition.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                if (parsedCardData.effect) parsedCardData.effect = parsedCardData.effect.replaceAll('(L)', '[L]').replaceAll('(R)', '[R]');
                if (parsedCardData.setId) parsedCardData.setId = `RD/${parsedCardData.setId}`;
              }

              cards.push(parsedCardData);
            }
          }
        }
      } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const sections = doc.querySelectorAll('section.elementor-section.elementor-inner-section.elementor-element.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default');
        sections.forEach(section => {
          let artworkUrl = section.querySelector('img')?.src;
          let subSections = section.querySelectorAll('div.elementor-column.elementor-col-50.elementor-inner-column.elementor-element');
          subSections.forEach((subSection, index) => {
            if (!index) return;
            let subSubSections = subSection.querySelectorAll('div.elementor-element.elementor-widget.elementor-widget-text-editor');
            const parsedCardData: IYuginewsCardData = {};
            subSubSections.forEach((s, sIndex) => {
              const $ = load(s.innerHTML);
              let lines: string[];
              if (!sIndex) {
                let ps = $('p');
                ps.each(i => {
                  lines = ps.eq(i).html()?.split('<br>') as string[];
                  if (lines?.length) {
                    lines.forEach((line, iLine) => {
                      if (!i) {
                        if (iLine) {
                          const setIdMatch = line.match(/^([^-]+)/);
                          const idMatch = line.match(/-(.*?)\s*\(JAP/);
                          const nameENMatch = line.match(/EN\s*:\s*<em>(.*?)<\/em>/);

                          if (setIdMatch && idMatch) {
                            parsedCardData.setId = setIdMatch[1].replaceAll('&nbsp;', ' ').trim();
                            if (parsedCardData.setId && parsedCardData.setId.startsWith('RD/')) parsedCardData.isRush = true;
                            parsedCardData.id = integer(idMatch[1].slice(-3).replace(/\D/g, '').replaceAll('&nbsp;', ' ').trim());
                            parsedCardData.nameEN = nameENMatch ? nameENMatch[1].replaceAll('&nbsp;', ' ').trim() : '';
                        }
                        } else {
                          parsedCardData.nameFR = line
                            .replaceAll('<strong>', '')
                            .replaceAll('</strong>', '')
                            .replaceAll('<b>', '')
                            .replaceAll('</b>', '')
                            .replaceAll('&nbsp;', ' ')
                            .trim();
                        }
                      } else if (line.includes('Flèche')) {
                        parsedCardData.linkArrows = line
                          .replaceAll('&nbsp;', ' ')
                          .replaceAll('Flèche Lien : ', '')
                          .replaceAll('Flèches Lien : ', '')
                          .trim()
                          .split(' / ');
                      } else if (line.includes(' / ')) {
                        parsedCardData.abilities = line.split(' / ');
                      } else if (line.includes('LEGEND')) {
                        parsedCardData.legend = true;
                      } else if (line.includes('Niveau')) {
                        parsedCardData.level = line.replaceAll('&nbsp;', ' ').replaceAll('Niveau ', '').trim();
                      } else if (line.includes('Rang')) {
                        parsedCardData.level = line.replaceAll('&nbsp;', ' ').replaceAll('Rang ', '').trim();
                      } else if (line.includes('Link-')) {
                        parsedCardData.level = line.replaceAll('&nbsp;', ' ').replaceAll('Link-', '').trim();
                      } else if (line.includes('ATK MAXIMUM')) {
                        parsedCardData.atkMAX = line.replaceAll('&nbsp;', ' ').replaceAll(' ATK MAXIMUM', '').trim();
                      } else if (line.includes('ATK')) {
                        parsedCardData.atk = line.replaceAll('&nbsp;', ' ').replaceAll(' ATK', '').trim();
                      } else if (line.includes('DEF')) {
                        parsedCardData.def = line.replaceAll('&nbsp;', ' ').replaceAll(' DEF', '').trim();
                      } else if (line.includes('Échelle')) {
                        parsedCardData.scale = line.replaceAll('&nbsp;', ' ').replaceAll('Échelle Pendule : ', '').trim();
                      } else if (line.includes('Magie')) {
                        parsedCardData.cardType = '2';
                        parsedCardData.stType = this.getStTypeFromLine(line);
                      } else if (line.includes('Piège')) {
                        parsedCardData.cardType = '3';
                        parsedCardData.stType = this.getStTypeFromLine(line);
                      } else if (/^[A-ZÀ-ÖØ-Þ]+$/i.test(line.replaceAll('&nbsp;', ' ').trim())) {
                        parsedCardData.attribute = this.getAttributeFromLine(line);
                      }
                    });
                  }
                });
              } else {
                let ps = $('p');
                let effects: string[] = [];
                ps.each(i => { effects.push(ps.eq(i).text()); });
                if (effects.length) {
                  if (parsedCardData.isRush) {
                    for (let effect of effects) {
                      if (effect.startsWith('[CONDITION]')) {
                        parsedCardData.condition = effect.replaceAll('&nbsp;', ' ').replace('[CONDITION] ', '');
                      }
                      else if (effect.startsWith('[EFFET]')) {
                        parsedCardData.effectType = '1';
                        parsedCardData.effect = effect.replaceAll('&nbsp;', ' ').replace('[EFFET] ', '');
                      }
                      else if (effect.startsWith('[EFFET CONTINU]')) {
                        parsedCardData.effectType = '2';
                        parsedCardData.condition = effect.replaceAll('&nbsp;', ' ').replace('[EFFET CONTINU] ', '');
                      }
                      else if (effect.startsWith('[EFFET AU CHOIX]')) {
                        parsedCardData.effectType = '3';
                        parsedCardData.choiceEffects = [effect.replaceAll('&nbsp;', ' ').replace('[EFFET AU CHOIX] ', '').replace('● ', '').replace('• ', '')];
                      }
                      else if (effect.startsWith('●') || effect.startsWith('•') && parsedCardData.choiceEffects) {
                        parsedCardData.choiceEffects?.push(effect.replaceAll('&nbsp;', ' ').replace('● ', '').replace('• ', ''));
                      }
                      else if (parsedCardData.abilities && parsedCardData.abilities.includes('Normal')) {
                        parsedCardData.normalText = effect.replaceAll('&nbsp;', ' ');
                      }
                      else {
                        if (!parsedCardData.otherEffectTexts) parsedCardData.otherEffectTexts = [];
                        parsedCardData.otherEffectTexts?.push(effect.replaceAll('&nbsp;', ' '));
                      }
                    }
                  } else if (effects[0].startsWith('Effet Pendule :')) {
                    parsedCardData.pendulumEffects = effects.slice(1);
                  }
                  else if (effects[0].startsWith('Effet de Monstre :')) {
                    parsedCardData.effects = effects.slice(1);
                  }
                  else {
                    parsedCardData.effects = effects;
                  }
                }
              }
            });

            if (Object.keys(parsedCardData)?.length) {
              if (!parsedCardData.cardType) parsedCardData.cardType = '1';
              parsedCardData.uuid = uuid();
              if (artworkUrl) parsedCardData.artworkUrl = artworkUrl;
              if (!parsedCardData.setId) parsedCardData.setId = '';
              if (!parsedCardData.id) parsedCardData.id = '';
              cards.push(parsedCardData);
            }
          });
        });
      }
    }

    return cards;
  }

  private formatPictureString(str: string) {
    if (!str) return str;
    // Remplacer les caractères non autorisés dans une URL ou un nom de fichier
    str = str.replace(/[^\w\s\-+.!\/'()=%\\*\?"<>|\u00E0\u00E2\u00E4\u00E7\u00E8\u00E9\u00EA\u00EB\u00EE\u00EF\u00F4\u00F6\u00F9\u00FB\u00FC]/g, '').replace(/[\s?!]/g, '').replace(/:/g, '');
    // Remplacer les caractères accentués
    const accents = [
      /[\300-\306]/g, /[\340-\346]/g, // A, a
      /[\310-\313]/g, /[\350-\353]/g, // E, e
      /[\314-\317]/g, /[\354-\357]/g, // I, i
      /[\322-\330]/g, /[\362-\370]/g, // O, o
      /[\331-\334]/g, /[\371-\374]/g, // U, u
      /[\321]/g, /[\361]/g, // N, n
      /[\307]/g, /[\347]/g // C, c
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

  public async importFromCardData(cardsData: IYuginewsCardData[], importArtworks: boolean, artworkDirectoryPath: string) {
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
        tcgAt: false,
        artwork: {
          url: '',
          x: 0,
          y: 0,
          height: 100,
          width: 100,
          pendulum: false,
          keepRatio: false
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
          right: scale
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

      if (importArtworks && cardData.artworkUrl?.length && artworkDirectoryPath?.length) {
        const filePath = await app.$card.importArtwork(cardData.artworkUrl, artworkDirectoryPath) || '';
        if (filePath) {
          card.artwork.url = filePath;
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
      case '1': return 'effect';
      case '2': return 'continuous';
      default: return 'effect';
    }
  }

  private getDescription(card: ICard, cardData: IYuginewsCardData): string {
    let description = '';

    if (cardData.normalText) {
      description = cardData.normalText;
    } else if ((cardData.effects as string[])?.length) {
      let effects = cardData.effects as string[];
      let lastHasLineBreak = false;
      effects.forEach((eff, i) => {
        if (!i) {
          description = eff;
        } else if (!lastHasLineBreak && eff.startsWith('●')) {
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
      }
    }

    return frame;
  }

  private getStType(cardData: IYuginewsCardData) {
    let stType: TStIcon;

    switch(cardData.stType) {
      case 'field': stType = 'field'; break;
      case 'equip': stType = 'equip'; break;
      case 'continuous': stType = 'continuous'; break;
      case 'ritual': stType = 'ritual'; break;
      case 'quickplay': stType = 'quickplay'; break;
      case 'counter': stType = 'counter'; break;
      case 'link': stType = 'link'; break;
      default: stType = 'normal'; break;
    }

    return stType;
  }

  private getAttribute(cardData: IYuginewsCardData): TAttribute {
    let attribute: TAttribute = 'spell';

    if (cardData.attribute) {
      switch (cardData.attribute) {
        case 'dark': attribute = 'dark'; break;
        case 'light': attribute = 'light'; break;
        case 'water': attribute = 'water'; break;
        case 'earth': attribute = 'earth'; break;
        case 'fire': attribute = 'fire'; break;
        case 'wind': attribute = 'wind'; break;
        default: attribute = 'divine'; break;
      }
    } else if (cardData.cardType && cardData.cardType === '3') {
      attribute = 'trap';
    }

    return attribute;
  }

  private getCardSet(cardData: IYuginewsCardData): string {
    let id = `${cardData.id}`;
    switch (id.length) {
        case (1): id = `00${id}`; break;
        case (2): id = `0${id}`; break;
        case (undefined): id = '000'; break;
        default: break;
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
      bottomRight: false
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
