import { ICard } from 'client/editor/card';
import { extend, integer } from 'mn-tools';

export interface IReplaceMatrix {
  toReplace: string;
  newString: string;
}

interface IYugipediaGetCardImgApiResponse {
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

interface IYugipediaGetCardPageImgApiResponse {
  parse: {
    pageid: number;
    title: string;
    images: string[];
  };
}

interface IYugipediaGetCardPageApiResponse {
  batchcomplete: string;
  query: {
    normalized: {
      from: string;
      to: string;
    }[];
    pages: {
      [pageid: number]: {
        pageid: number;
        ns: number;
        title: string;
        revisions: {
          contentformat: string;
          contentmodel: string;
          '*': string; // Le contenu de la révision
        }[];
      };
    };
  };
}

export class MediaWikiService {
  private baseApiUrl: string;
  private baseArtworkUrl: string;

  public constructor() {
    this.baseApiUrl = 'https://yugipedia.com/api.php';
    this.baseArtworkUrl = 'F:\\Images\\Images Yu-Gi-Oh!\\Artworks\\';
  }

  public async getCardInfo(
    titles: string,
    useFr: boolean,
    generatePasscode: boolean,
    replaceMatrixes: IReplaceMatrix[],
    importArtworks: boolean,
    artworkDirectoryPath: string
  ) {
    let card = app.$card.getDefaultImportCard();

    titles = titles
      .replaceAll('%20', ' ')
      .replaceAll('%27', "'")
      .replaceAll('%22', '"')
      .replaceAll('%23', '#')
      .replaceAll('%25', '%')
      .replaceAll('%26', '&')
      .replaceAll('%2B', '+')
      .replaceAll('%2C', ',')
      .replaceAll('%2F', '/')
      .replaceAll('%3A', ':')
      .replaceAll('%3B', ';')
      .replaceAll('%3C', '<')
      .replaceAll('%3D', '=')
      .replaceAll('%3E', '>')
      .replaceAll('%3F', '?')
      .replaceAll('%40', '@')
      .replaceAll('%5B', '[')
      .replaceAll('%5C', '\\')
      .replaceAll('%5D', ']')
      .replaceAll('%5E', '^')
      .replaceAll('%60', '`')
      .replaceAll('%7B', '{')
      .replaceAll('%7C', '|')
      .replaceAll('%7D', '}')
      .replaceAll('%7E', '~');

    const data = await app.$axios.get<IYugipediaGetCardPageApiResponse>(this.baseApiUrl, {
      params: {
        titles,
        action: 'query',
        prop: 'revisions',
        rvprop: 'content',
        format: 'json',
      },
    });
    if (!data?.query?.pages) return card;

    const pageKeys = Object.keys(data.query.pages).map(Number);
    if (!pageKeys?.length) return card;

    const pageInfo = data.query?.pages[pageKeys[0]];
    if (!pageInfo?.revisions?.length) return card;

    const wikitext = pageInfo.revisions[0]['*'];
    if (!wikitext) return card;

    return await this.wikitextToCard(
      card,
      pageInfo.title.replaceAll(' (card)', '').replaceAll(' (Skill Card)', '').replaceAll(' (Rush Duel)', ''),
      wikitext,
      useFr,
      generatePasscode,
      replaceMatrixes,
      titles,
      importArtworks,
      artworkDirectoryPath
    );
  }

  public async wikitextToCard(
    card: ICard,
    title: string,
    wikitext: string,
    useFr: boolean,
    generatePasscode: boolean,
    replaceMatrixes: IReplaceMatrix[],
    titles: string,
    importArtworks: boolean,
    artworkDirectoryPath: string
  ): Promise<ICard> {
    let name: string | undefined;
    let enName: string | undefined;
    let frName: string | undefined;
    let lore: string | undefined;
    let rushCondition: string | undefined;
    let rushFrCondition: string | undefined;
    let rushOtherEffects: string | undefined;
    let rushFrOtherEffects: string | undefined;
    let frLore: string | undefined;
    let pendEffect: string | undefined;
    let frPendEffect: string | undefined;
    let enSet: string | undefined;
    let frSet: string | undefined;
    let jpSet: string | undefined;

    const wikitextArray = wikitext.split('\n');
    wikitextArray.forEach((t, i) => {
      if (t.includes('| rush_duel') && t.includes('true')) {
        card.rush = true;
      } else if (t.includes('| name')) {
        name = t
          .slice(t.indexOf('= ') + 1, t.length)
          .trim()
          .replaceAll(' (card)', '');
      } else if (t.includes('| fr_name')) {
        frName = t
          .slice(t.indexOf('= ') + 1, t.length)
          .trim()
          .replaceAll(' (card)', '');
      } else if (t.includes('| en_name')) {
        enName = t
          .slice(t.indexOf('= ') + 1, t.length)
          .trim()
          .replaceAll(' (card)', '');
      } else if (t.includes('| attribute')) {
        let attribute = t.slice(t.indexOf('= ') + 1, t.length).trim();
        switch (attribute) {
          case 'DARK':
            card.attribute = 'dark';
            break;
          case 'LIGHT':
            card.attribute = 'light';
            break;
          case 'WATER':
            card.attribute = 'water';
            break;
          case 'EARTH':
            card.attribute = 'earth';
            break;
          case 'FIRE':
            card.attribute = 'fire';
            break;
          case 'WIND':
            card.attribute = 'wind';
            break;
          default:
            card.attribute = 'divine';
            break;
        }
      } else if (t.includes('| card_type')) {
        let cardType = t.slice(t.indexOf('= ') + 1, t.length).trim();
        switch (cardType) {
          case 'Trap':
            card.frames.push('trap');
            card.attribute = 'trap';
            break;

          default:
            card.frames.push('spell');
            card.attribute = 'spell';
            break;
        }
      } else if (t.includes('| types')) {
        let types = t.slice(t.indexOf('= ') + 1, t.length).trim();

        if (types.includes('Ritual')) {
          card.frames.push('ritual');
        } else if (types.includes('Fusion')) {
          card.frames.push('fusion');
        } else if (types.includes('Synchro')) {
          card.frames.push('synchro');
        } else if (types.includes('Dark Synchro')) {
          card.frames.push('darkSynchro');
        } else if (types.includes('Xyz')) {
          card.frames.push('xyz');
        } else if (types.includes('Link')) {
          card.frames.push('link');
        } else if (types.includes('Skill')) {
          card.frames.push('skill');
        } else if (types.includes('Effect')) {
          card.frames.push('effect');
        } else if (types.includes('Normal')) {
          card.frames.push('normal');
        }

        if (types.includes('Pendulum')) {
          card.pendulum = true;
        }

        card.abilities = types.split(' / ');
      } else if (t.includes('| property')) {
        let property = t.slice(t.indexOf('= ') + 1, t.length).trim();
        switch (property) {
          case 'Normal':
            card.stType = 'normal';
            break;
          case 'Ritual':
            card.stType = 'ritual';
            break;
          case 'Continuous':
            card.stType = 'continuous';
            break;
          case 'Equip':
            card.stType = 'equip';
            break;
          case 'Quick-Play':
            card.stType = 'quickplay';
            break;
          case 'Field':
            card.stType = 'field';
            break;
          case 'Link':
            card.stType = 'link';
            break;
          case 'Counter':
            card.stType = 'counter';
            break;
          default:
            break;
        }
      } else if (t.includes('| level')) {
        card.level = integer(t.slice(t.indexOf('= ') + 1, t.length).trim());
      } else if (t.includes('| rank')) {
        card.level = integer(t.slice(t.indexOf('= ') + 1, t.length).trim());
      } else if (t.includes('| link_arrows')) {
        let linkArrows = t
          .slice(t.indexOf('= ') + 1, t.length)
          .trim()
          .split(', ');
        card.level = linkArrows.length;
        for (let arrow of linkArrows) {
          switch (arrow) {
            case 'Top-Left':
              card.linkArrows.topLeft = true;
              break;
            case 'Top-Center':
              card.linkArrows.top = true;
              break;
            case 'Top-Right':
              card.linkArrows.topRight = true;
              break;
            case 'Middle-Left':
              card.linkArrows.left = true;
              break;
            case 'Middle-Right':
              card.linkArrows.right = true;
              break;
            case 'Bottom-Left':
              card.linkArrows.bottomLeft = true;
              break;
            case 'Bottom-Center':
              card.linkArrows.bottom = true;
              break;
            case 'Bottom-Right':
              card.linkArrows.bottomRight = true;
              break;
            default:
              break;
          }
        }
      } else if (t.includes('| materials')) {
        let parsedText = this.parseWikitextLore(t);
        if (rushOtherEffects) {
          rushOtherEffects = `${parsedText}\n${rushOtherEffects}`;
        } else {
          rushOtherEffects = parsedText;
        }
      } else if (t.includes('| fr_materials')) {
        if (rushFrOtherEffects) {
          rushFrOtherEffects = `\n${rushFrOtherEffects}`;
        } else {
          rushFrOtherEffects = this.parseWikitextLore(t);
        }
      } else if (t.includes('| maximum_atk')) {
        card.rush = true;
        card.maximum = true;
        card.atkMax = t.slice(t.indexOf('= ') + 1, t.length).trim();
      } else if (t.includes('| atk')) {
        card.atk = t.slice(t.indexOf('= ') + 1, t.length).trim();
      } else if (t.includes('| def')) {
        card.def = t.slice(t.indexOf('= ') + 1, t.length).trim();
      } else if (t.includes('| effect_types')) {
        if (t.includes('Continuous')) {
          card.rushEffectType = 'continuous';
        } else if (t.includes('Multi-Choice')) {
          card.rushTextMode = 'choice';
        }
      } else if (t.includes('| pendulum_scale')) {
        let scale = integer(t.slice(t.indexOf('= ') + 1, t.length).trim());
        card.scales = { left: scale, right: scale };
      } else if (t.includes('| password')) {
        card.passcode = t.slice(t.indexOf('= ') + 1, t.length).trim();
      } else if (t.includes('| requirement')) {
        card.rush = true;
        rushCondition = this.parseWikitextLore(t);
      } else if (t.includes('| fr_requirement')) {
        rushFrCondition = this.parseWikitextLore(t);
      } else if (t.includes('| summoning_condition')) {
        let parsedText = this.parseWikitextLore(t);
        if (rushOtherEffects) {
          rushOtherEffects = `${rushOtherEffects}\n${parsedText}`;
        } else {
          rushOtherEffects = parsedText;
        }
      } else if (t.includes('| fr_summoning_condition')) {
        rushFrOtherEffects = this.parseWikitextLore(t);
      } else if (t.includes('| lore')) {
        lore = this.parseWikitextLore(t);
      } else if (t.includes('| fr_lore')) {
        frLore = this.parseWikitextLore(t);
      } else if (t.includes('| pendulum_effect')) {
        pendEffect = this.parseWikitextLore(t);
      } else if (t.includes('| fr_pendulum_effect')) {
        frPendEffect = this.parseWikitextLore(t);
      } else if (t.includes('| fr_sets')) {
        let firstFrSet = wikitextArray[i + 1];
        frSet = firstFrSet.slice(0, firstFrSet.indexOf(';'));
      } else if (t.includes('| en_sets')) {
        let firstEnSet = wikitextArray[i + 1];
        enSet = firstEnSet.slice(0, firstEnSet.indexOf(';'));
      } else if (t.includes('| jp_sets')) {
        let firstJpSet = wikitextArray[i + 1];
        jpSet = firstJpSet.slice(0, firstJpSet.indexOf(';'));
      } else if (t.includes('| misc') && t.includes('Legend Card')) {
        card.legend = true;
      }
    });

    if (!card.frames.length) {
      card.frames.push('normal');
    } else if (card.frames.length > 1) {
      card.multipleFrames = true;
    }

    enName = (name || enName || title) as string;
    if (enName && card.frames.length === 1 && card.frames[0] === 'normal') {
      if (enName === 'Token') card.frames = ['token'];
      else if (enName.includes('Token')) card.frames = ['monsterToken'];
    }

    if (card.frames.length === 1 && (card.frames[0] === 'token' || card.frames[0] === 'monsterToken')) {
      card.edition = 'forbiddenDeck';
    }

    if (useFr) {
      card.cardSet = frSet as string;
      if (!card.rush && card.cardSet.startsWith('RD/')) {
        card.rush = true;
      }

      if (card.rush) {
        if (card.rushTextMode === 'choice' && frLore) {
          card.rushChoiceEffects = frLore
            .split(/(●|•)/)
            .map((part) => part.trim())
            .filter((part) => part && part !== '●' && part !== '•');
        } else {
          card.rushEffect = frLore as string;
        }
      } else {
        card.description = frLore as string;
      }

      card.language = 'fr';
      card.name = frName as string;
      card.pendEffect = frPendEffect as string;
      card.rushCondition = rushFrCondition as string;
      card.rushOtherEffects = rushFrOtherEffects as string;
    } else {
      card.cardSet = (enSet || jpSet) as string;
      if (!card.rush && card.cardSet.startsWith('RD/')) {
        card.rush = true;
      }

      if (card.rush) {
        if (card.rushTextMode === 'choice' && lore) {
          card.rushChoiceEffects = lore
            .split(/(●|•)/)
            .map((part) => part.trim())
            .filter((part) => part && part !== '●' && part !== '•');
        } else {
          card.rushEffect = lore as string;
        }
      } else {
        card.description = lore as string;
      }

      card.name = enName;
      card.pendEffect = pendEffect as string;
      card.rushCondition = rushCondition as string;
      card.rushOtherEffects = rushOtherEffects as string;
    }

    // Format texts
    card.name = this.formatText(card.name);
    card.description = this.formatText(card.description);
    card.pendEffect = this.formatText(card.pendEffect);
    card.rushOtherEffects = this.formatText(card.rushOtherEffects);
    card.rushCondition = this.formatText(card.rushCondition);
    card.rushEffect = this.formatText(card.rushEffect);
    if (card.rushChoiceEffects?.length) card.rushChoiceEffects = card.rushChoiceEffects.map(this.formatText);

    if (replaceMatrixes.length) {
      for (let replaceMatrix of replaceMatrixes) {
        if (enName) enName = enName.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString);
        if (card.name) card.name = card.name.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString);
        if (card.description)
          card.description = card.description.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString);
        if (card.pendEffect)
          card.pendEffect = card.pendEffect.replaceAll(replaceMatrix.toReplace, replaceMatrix.newString);
      }
    }

    let artworkDefaultPath = `${this.baseArtworkUrl}${enName} Artwork`;
    let defaultPng = `${artworkDefaultPath}.png`;
    let defaultJpg = `${artworkDefaultPath}.jpg`;
    try {
      if (app.$device.isElectron(window) && (await window.electron.ipcRenderer.invoke('checkFileExists', defaultPng))) {
        card.artwork.url = defaultPng;
      } else if (
        app.$device.isElectron(window) &&
        (await window.electron.ipcRenderer.invoke('checkFileExists', defaultJpg))
      ) {
        card.artwork.url = defaultJpg;
      } else if (importArtworks && artworkDirectoryPath?.length && enName?.length) {
        let artworkName = this.getArtworkName(enName);
        if (artworkName) {
          const imgData = await app.$axios.get<IYugipediaGetCardPageImgApiResponse>(this.baseApiUrl, {
            params: {
              action: 'parse',
              page: titles,
              prop: 'images',
              format: 'json',
            },
          });

          if (imgData?.parse?.images?.length) {
            let fileName = imgData.parse.images.find((image) => image.includes(artworkName));
            if (fileName) {
              const artworkData = await app.$axios.get<IYugipediaGetCardImgApiResponse>(this.baseApiUrl, {
                params: {
                  action: 'query',
                  titles: `File:${fileName}`,
                  prop: 'imageinfo',
                  iiprop: 'url',
                  format: 'json',
                },
              });

              if (artworkData?.query?.pages) {
                let keys = Object.keys(artworkData?.query?.pages);
                if (keys?.length) {
                  let pageInfo = artworkData?.query?.pages[keys[0]];
                  if (pageInfo?.imageinfo?.length && pageInfo?.imageinfo[0].url) {
                    const filePath = await app.$card.importArtwork(pageInfo?.imageinfo[0].url, artworkDirectoryPath);
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
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }

    if (generatePasscode && !card.passcode) {
      card.passcode = app.$card.generatePasscode();
    }

    if (useFr && card.abilities?.length) {
      card.abilities = card.abilities.map((ability) => this.getFrenchAbility(ability.trim()));
    }

    if (card.rush) card.edition = 'unlimited';

    app.$card.correct(card);

    return card;
  }

  private parseWikitextLore(text: string): string {
    text = text.slice(text.indexOf('= ') + 1, text.length);
    // Remplacer les liens internes [[...]] par le contenu après le dernier |
    text = text.replaceAll(/\[\[([^\]]+)\]\]/g, (_, content) => {
      const lastIndex = content.lastIndexOf('|');
      if (lastIndex !== -1) {
        return content.substring(lastIndex + 1);
      }
      return content;
    });

    // Retirer les doubles crochets restants
    text = text.replaceAll(/\[\[|\]\]/g, '');

    // Retirer les caractères en double ou triples (exemple: [[face-up]] -> face-up)
    text = text.replaceAll(/(\[\[?\w+)(?:\|[\w\s-]+)?(\]\]?)/g, (_, before, after) => before + after);

    // Retirer les espaces en double
    text = text.replaceAll(/\s+/g, ' ');

    // Remplacer les balises <br /> par un saut de ligne
    text = text.replaceAll(/<br\s*\/?>/gi, '\n');

    text = text.replaceAll("''", '');

    return text.trim();
  }

  private formatText(text: string | undefined): string {
    if (!text) return '';
    return text
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  }

  private getArtworkName(str: string) {
    // Remplacer les caractères non autorisés dans une URL ou un nom de fichier
    str = str
      .replaceAll(
        /[^\w\s\-+.!\/'()=%\\*\?"<>|\u00E0\u00E2\u00E4\u00E7\u00E8\u00E9\u00EA\u00EB\u00EE\u00EF\u00F4\u00F6\u00F9\u00FB\u00FC]/g,
        ''
      )
      .replaceAll(/[\s?!]/g, '')
      .replaceAll(/:/g, '');
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
      str = str.replaceAll(accents[i], noAccent[i]);
    }
    // Remplacer les /, -, ", ', :, !, ?, et les .
    str = str.replaceAll(/[\/\\\-"'()=:!?\.]/g, '');
    // Retourner la chaîne de caractères modifiée
    return str;
  }

  private getFrenchAbility(ability: string): string {
    switch (ability) {
      case 'Normal':
        return 'Normal';
      case 'Effect':
        return 'Effet';
      case 'Pendulum':
        return 'Pendule';
      case 'Ritual':
        return 'Rituel';
      case 'Fusion':
        return 'Fusion';
      case 'Synchro':
        return 'Synchro';
      case 'Xyz':
        return 'Xyz';
      case 'Link':
        return 'Lien';
      case 'Dark Synchro':
        return 'Synchro des Ténèbres';
      case 'Tuner':
        return 'Syntoniseur';
      case 'Special Summon':
        return 'Invocation Spéciale';
      case 'Maximum':
        return 'Maximum';
      case 'Toon':
        return 'Toon';
      case 'Spirit':
        return 'Spirit';
      case 'Union':
        return 'Union';
      case 'Flip':
        return 'Flip';
      case 'Gemini':
        return 'Gémeau';
      case 'Aqua':
        return 'Aqua';
      case 'Beast':
        return 'Bête';
      case 'Beast-Warrior':
        return 'Bête-Guerrier';
      case 'Creator God':
        return 'Dieu Créateur';
      case 'Cyberse':
        return 'Cyberse';
      case 'Dinosaur':
        return 'Dinosaure';
      case 'Divine-Beast':
        return 'Bête Divine';
      case 'Dragon':
        return 'Dragon';
      case 'Fairy':
        return 'Elfe';
      case 'Fiend':
        return 'Démon';
      case 'Fish':
        return 'Poisson';
      case 'Illusion':
        return 'Illusion';
      case 'Insect':
        return 'Insecte';
      case 'Machine':
        return 'Machine';
      case 'Plant':
        return 'Plante';
      case 'Psychic':
        return 'Psychique';
      case 'Pyro':
        return 'Pyro';
      case 'Reptile':
        return 'Reptile';
      case 'Rock':
        return 'Rocher';
      case 'Sea Serpent':
        return 'Serpent de Mer';
      case 'Spellcaster':
        return 'Magicien';
      case 'Thunder':
        return 'Tonnerre';
      case 'Warrior':
        return 'Guerrier';
      case 'Winged Beast':
        return 'Bête Ailée';
      case 'Wyrm':
        return 'Wyrm';
      case 'Zombie':
        return 'Zombie';
      case 'Yokai':
        return 'Yokai';
      case 'Cyborg':
        return 'Cyborg';
      case 'Magical Knight':
        return 'Chevalier Magique';
      case 'High Dragon':
        return 'Grand Dragon';
      case 'Omega Psychic':
        return 'Psychique Oméga';
      case 'Celestial Warrior':
        return 'Guerrier Céleste';
      case 'Galaxy':
        return 'Galactique';
      default:
        return ability;
    }
  }
}
