import { integer } from 'mn-tools';
import { IYugipediaCard, IYugipediaCardPrint, TYugipediaCardClass, TYugipediaCardLanguage } from '..';
import { AbstractWikitextParser } from './AbstractWikitextParser';

export class WikitextCardParser extends AbstractWikitextParser {
  private card: IYugipediaCard;

  private name?: string;
  private enName?: string;

  private lore?: string;
  private frLore?: string;

  public constructor(page: AbstractWikitextParser['page']) {
    super(page);
    this.card = {
      translations: {
        en_us: {},
        fr_fr: {},
      },
      frames: [],
      jpPrints: [],
      enPrints: [],
      naPrints: [],
      frPrints: [],
    };
  }

  /**
   * Public method to parse the page and build the card object
   */
  public parse(): IYugipediaCard | undefined {
    if (!this.wikitextLines.length) return undefined;

    // Process each line with dedicated functions.
    for (let i = 0; i < this.wikitextLines.length; i++) {
      const line = this.wikitextLines[i]!;

      // Process prints sections (jp, en, na, fr) in one go.
      if (line.includes('| jp_sets')) {
        const { prints, newIndex } = this.extractPrints(this.wikitextLines, i);
        this.card.jpPrints.push(...prints);
        i = newIndex;
      } else if (line.includes('| en_sets')) {
        const { prints, newIndex } = this.extractPrints(this.wikitextLines, i);
        this.card.enPrints.push(...prints);
        i = newIndex;
      } else if (line.includes('| na_sets')) {
        const { prints, newIndex } = this.extractPrints(this.wikitextLines, i);
        this.card.naPrints.push(...prints);
        i = newIndex;
      } else if (line.includes('| fr_sets')) {
        const { prints, newIndex } = this.extractPrints(this.wikitextLines, i);
        this.card.frPrints.push(...prints);
        i = newIndex;
      } else {
        // Process individual metadata lines.
        this.processMetadataLine(line);
      }
    }

    // Final adjustments to the card entity (setting translations, forced names, etc.)
    this.finalizeCard();
    return this.card;
  }

  /**
   * Process a metadata line and update the parsing context accordingly.
   */
  private processMetadataLine(line: string) {
    // --- Process rush duel property
    if (line.includes('| rush_duel') && line.includes('true')) {
      this.card.rush = true;
    }
    // --- Process card class
    else if (line.includes('| cardclass')) {
      this.card.class = this.getMetadataLineValue(line) as TYugipediaCardClass;
    }
    // --- Process card name
    else if (line.includes('| name')) {
      this.name = this.getMetadataLineValue(line);
    }
    // --- Process English card name
    else if (line.includes('| en_name')) {
      this.enName = this.getMetadataLineValue(line);
    }
    // --- Process French card name
    else if (line.includes('| fr_name')) {
      this.card.translations.fr_fr.name = this.getMetadataLineValue(line);
    }
    // --- Process attribute
    else if (line.includes('| attribute')) {
      this.processAttributeLine(this.getMetadataLineValue(line));
    }
    // --- Process card type
    else if (line.includes('| card_type')) {
      this.processCardTypeLine(this.getMetadataLineValue(line));
    }
    // --- Process card types
    else if (line.includes('| types')) {
      this.processTypesLine(this.getMetadataLineValue(line));
    }
    // --- Process property
    else if (line.includes('| property')) {
      this.processPropertyLine(this.getMetadataLineValue(line));
    }
    // --- Process level or rank
    else if (line.includes('| level') || line.includes('| rank')) {
      this.card.level = integer(this.getMetadataLineValue(line));
    }
    // --- Process link arrows
    else if (line.includes('| link_arrows')) {
      this.processLinkArrowsLine(this.getMetadataLineValue(line));
    }
    // --- Process materials (rush other effects in EN)
    else if (line.includes('| materials')) {
      const parsed = this.parseWikitextLore(line);
      if (this.card.translations.en_us.rushOtherEffects) {
        this.card.translations.en_us.rushOtherEffects = `${parsed}\n${this.card.translations.en_us.rushOtherEffects}`;
      } else {
        this.card.translations.en_us.rushOtherEffects = parsed;
      }
    }
    // --- Process French materials (rush other effects in FR)
    else if (line.includes('| fr_materials')) {
      const parsed = this.parseWikitextLore(line);
      if (this.card.translations.fr_fr.rushOtherEffects) {
        this.card.translations.fr_fr.rushOtherEffects = `${parsed}\n${this.card.translations.fr_fr.rushOtherEffects}`;
      } else {
        this.card.translations.fr_fr.rushOtherEffects = parsed;
      }
    }
    // --- Process maximum attack value
    else if (line.includes('| maximum_atk')) {
      this.card.rush = true;
      this.card.atkMax = this.getMetadataLineValue(line);
    }
    // --- Process attack value
    else if (line.includes('| atk')) {
      this.card.atk = this.getMetadataLineValue(line);
    }
    // --- Process defense value
    else if (line.includes('| def')) {
      this.card.def = this.getMetadataLineValue(line);
    }
    // --- Process effect types
    else if (line.includes('| effect_types')) {
      if (line.includes('Continuous')) this.card.rushEffectType = 'continuous';
      else if (line.includes('Multi-Choice')) this.card.rushEffectType = 'choice';
    }
    // --- Process pendulum scale
    else if (line.includes('| pendulum_scale')) {
      const scale = integer(this.getMetadataLineValue(line));
      this.card.scales = { left: scale, right: scale };
    }
    // --- Process rush requirement (EN)
    else if (line.includes('| requirement')) {
      this.card.rush = true;
      this.card.translations.en_us.rushCondition = this.parseWikitextLore(line);
    }
    // --- Process rush requirement (FR)
    else if (line.includes('| fr_requirement')) {
      this.card.translations.fr_fr.rushCondition = this.parseWikitextLore(line);
    }
    // --- Process rush condition or summoning condition (EN)
    else if (line.includes('| condition') || line.includes('| summoning_condition')) {
      const parsed = this.parseWikitextLore(line);
      if (this.card.translations.en_us.rushOtherEffects) {
        this.card.translations.en_us.rushOtherEffects = `${this.card.translations.en_us.rushOtherEffects}\n${parsed}`;
      } else {
        this.card.translations.en_us.rushOtherEffects = parsed;
      }
    }
    // --- Process rush condition or summoning condition (FR)
    else if (line.includes('| fr_condition') || line.includes('| fr_summoning_condition')) {
      const parsed = this.parseWikitextLore(line);
      if (this.card.translations.fr_fr.rushOtherEffects) {
        this.card.translations.fr_fr.rushOtherEffects = `${this.card.translations.fr_fr.rushOtherEffects}\n${parsed}`;
      } else {
        this.card.translations.fr_fr.rushOtherEffects = parsed;
      }
    }
    // --- Process card lore (EN)
    else if (line.includes('| text') || line.includes('| lore')) {
      const parsed = this.parseWikitextLore(line);
      // Check if text is just duplicated materials
      if (parsed !== this.card.translations.en_us.rushOtherEffects) {
        this.lore = parsed;
      }
    }
    // --- Process card lore (FR)
    else if (line.includes('| fr_text') || line.includes('| fr_lore')) {
      const parsed = this.parseWikitextLore(line);
      // Check if fr_text is just duplicated fr_materials
      if (parsed !== this.card.translations.fr_fr.rushOtherEffects) {
        this.frLore = parsed;
      }
    }
    // --- Process pendulum effect (EN)
    else if (line.includes('| pendulum_effect')) {
      this.card.translations.en_us.pendEffect = this.parseWikitextLore(line);
    }
    // --- Process pendulum effect (FR)
    else if (line.includes('| fr_pendulum_effect')) {
      this.card.translations.fr_fr.pendEffect = this.parseWikitextLore(line);
    }
    // --- Process skill activation (EN)
    else if (line.includes('| skill_activation')) {
      this.card.translations.en_us.skillBack = this.parseWikitextLore(line);
    }
    // --- Process skill activation (FR)
    else if (line.includes('| fr_skill_activation')) {
      this.card.translations.fr_fr.skillBack = this.parseWikitextLore(line);
    }
    // --- Process card password
    else if (line.includes('| password')) {
      this.card.password = this.getMetadataLineValue(line);
    }
    // --- Process database ID
    else if (line.includes('| database_id')) {
      const konamiId = this.parseWikitextLore(line);
      if (konamiId) this.card.konamiId = integer(konamiId);
    }
    // --- Process miscellaneous info (Legend Card)
    else if (line.includes('| misc') && line.includes('Legend Card')) {
      this.card.legend = true;
    }
  }

  /**
   * Process the attribute line and set the card attribute.
   */
  private processAttributeLine(value: string) {
    switch (value) {
      case 'DARK':
        this.card.attribute = 'dark';
        break;
      case 'LIGHT':
        this.card.attribute = 'light';
        break;
      case 'WATER':
        this.card.attribute = 'water';
        break;
      case 'EARTH':
        this.card.attribute = 'earth';
        break;
      case 'FIRE':
        this.card.attribute = 'fire';
        break;
      case 'WIND':
        this.card.attribute = 'wind';
        break;
      case 'DIVINE':
        this.card.attribute = 'divine';
        break;
      default:
        break;
    }
  }

  /**
   * Process the card_type line.
   */
  private processCardTypeLine(value: string) {
    switch (value) {
      case 'Skill':
        this.card.frames.push('skill');
        if (this.card.translations.en_us.abilities) this.card.translations.en_us.abilities.push(value);
        else this.card.translations.en_us.abilities = [value];
        break;

      case 'Legendary Dragon':
        this.card.frames.push('legendaryDragon');
        break;

      case 'Trap':
        this.card.frames.push('trap');
        break;

      default:
        this.card.frames.push('spell');
        break;
    }
  }

  /**
   * Process the types line.
   */
  private processTypesLine(value: string) {
    if (value.includes('/ Ritual')) this.card.frames.push('ritual');
    if (value.includes('/ Fusion')) this.card.frames.push('fusion');
    if (value.includes('/ Synchro')) this.card.frames.push('synchro');
    if (value.includes('/ Dark Synchro')) this.card.frames.push('darkSynchro');
    if (value.includes('/ Xyz')) this.card.frames.push('xyz');
    if (value.includes('/ Link')) this.card.frames.push('link');
    if (value.includes('/ Skill')) this.card.frames.push('skill');
    if (value.includes('/ Effect')) this.card.frames.unshift('effect'); // Unshift here to handle the anime Z-ARC case
    if (value.includes('/ Normal')) this.card.frames.push('normal');

    if (!this.card.frames.length) {
      // Handle the colors for the Egyptian Gods
      if (value.includes('Divine-Beast')) {
        switch (this.card.class) {
          case 'red':
            this.card.frames.push('slifer');
            break;
          case 'yellow':
            this.card.frames.push('ra');
            break;
          case 'blue':
            this.card.frames.push('obelisk');
            break;
          default:
            this.card.frames.push('effect');
            break;
        }
      }
      // Some old Normal Monsters don't have "Normal" written in their Types
      else {
        this.card.frames.push('normal');
      }
    }
    // If only two are present and the first is effect, then remove it as it is useless
    else if (this.card.frames.length === 2 && this.card.frames[0] === 'effect') {
      this.card.frames = [this.card.frames[1]!];
    }

    this.card.translations.en_us.abilities = value.split(' / ');
  }

  /**
   * Process the property line.
   */
  private processPropertyLine(value: string) {
    switch (value) {
      case 'Normal':
        this.card.stType = 'normal';
        break;
      case 'Ritual':
        this.card.stType = 'ritual';
        break;
      case 'Continuous':
        this.card.stType = 'continuous';
        break;
      case 'Equip':
        this.card.stType = 'equip';
        break;
      case 'Quick-Play':
        this.card.stType = 'quickplay';
        break;
      case 'Field':
        this.card.stType = 'field';
        break;
      case 'Link':
        this.card.stType = 'link';
        break;
      case 'Counter':
        this.card.stType = 'counter';
        break;
      default:
        break;
    }
  }

  /**
   * Process the link_arrows line.
   */
  private processLinkArrowsLine(value: string) {
    const linkArrows = value.split(', ');
    if (!linkArrows.length) return;

    this.card.level = linkArrows.length;
    this.card.linkArrows = {
      top: false,
      bottom: false,
      left: false,
      right: false,
      topLeft: false,
      topRight: false,
      bottomLeft: false,
      bottomRight: false,
    };

    for (const arrow of linkArrows) {
      switch (arrow) {
        case 'Top-Left':
          this.card.linkArrows.topLeft = true;
          break;
        case 'Top-Center':
          this.card.linkArrows.top = true;
          break;
        case 'Top-Right':
          this.card.linkArrows.topRight = true;
          break;
        case 'Middle-Left':
          this.card.linkArrows.left = true;
          break;
        case 'Middle-Right':
          this.card.linkArrows.right = true;
          break;
        case 'Bottom-Left':
          this.card.linkArrows.bottomLeft = true;
          break;
        case 'Bottom-Center':
          this.card.linkArrows.bottom = true;
          break;
        case 'Bottom-Right':
          this.card.linkArrows.bottomRight = true;
          break;
        default:
          break;
      }
    }
  }

  /**
   * Extracts prints (jp, en, or fr) starting at the given index.
   * Returns the array of prints and the new index to poursuivre le parsing.
   */
  private extractPrints(lines: string[], startIndex: number): { prints: IYugipediaCardPrint[]; newIndex: number } {
    const prints: IYugipediaCardPrint[] = [];
    let i = startIndex + 1;
    while (i < lines.length && !lines[i]!.startsWith('| ')) {
      const sections = lines[i]!.split(';');
      if (sections.length) {
        const print: IYugipediaCardPrint = {};
        if (sections[0]) print.code = sections[0].trim();
        if (sections[1]) print.setName = sections[1].trim();
        if (sections[2]) print.rarities = sections[2].split(',').map((r) => r.trim());
        prints.push(print);
      }
      i++;
    }
    return { prints, newIndex: i - 1 };
  }

  private extractNameBeforeParenthesis(input: string | undefined) {
    if (!input) return input;

    const index = input.indexOf('(');
    if (index === -1) return input.trim();

    return input.substring(0, index).trim();
  }

  /**
   * Finalize the card by setting translations and applying forced name if needed.
   */
  private finalizeCard() {
    // Use jpSets to determine if the card is Rush, if not already the case
    if (!this.card.rush && this.card.jpPrints.some((print) => print.code?.startsWith('RD/'))) {
      this.card.rush = true;
    }

    // This may have been defined from the effect_types line but end up irrelevant
    if (!this.card.rush && this.card.rushEffectType) delete this.card.rushEffectType;

    // Define default rushEffectType when needed
    if (
      this.card.rush &&
      !this.card.rushEffectType &&
      (this.card.translations.en_us.rushCondition ||
        this.card.translations.en_us.rushEffect ||
        this.card.translations.en_us.rushChoiceEffects?.length)
    ) {
      this.card.rushEffectType = 'effect';
    }

    // Determine the English name based on priority.
    this.card.translations.en_us.name =
      this.name || this.enName || this.extractNameBeforeParenthesis(this.pageTitle) || '';

    if (this.card.translations.en_us.name && this.card.frames.length === 1 && this.card.frames[0] === 'normal') {
      if (this.card.translations.en_us.name === 'Token') this.card.frames.push('token');
      else if (this.card.translations.en_us.name.includes('Token')) this.card.frames.push('monsterToken');
    }

    // Process lore for each language
    this.assignLore('en_us');
    this.assignLore('fr_fr');

    // Map abilities to French if present.
    if (this.card.translations.en_us.abilities?.length) {
      this.card.translations.fr_fr.abilities = this.card.translations.en_us.abilities.map((ability) =>
        this.getFrenchAbility(ability)
      );
    }

    // Format all translations.
    for (const key in this.card.translations) {
      const ln = key as TYugipediaCardLanguage;
      if (!this.card.translations[ln]) continue;

      // Format name
      if (this.card.translations[ln].name) {
        this.card.translations[ln].name = this.formatTranslation(this.card.translations[ln].name);
      }

      // Format description
      if (this.card.translations[ln].description) {
        this.card.translations[ln].description = this.formatTranslation(this.card.translations[ln].description);
      }

      // Format pendulum effect
      if (this.card.translations[ln].pendEffect) {
        this.card.translations[ln].pendEffect = this.formatTranslation(this.card.translations[ln].pendEffect);
      }

      // Format abilities
      if (this.card.translations[ln].abilities?.length) {
        this.card.translations[ln].abilities = this.card.translations[ln].abilities!.map((ability) =>
          ability ? this.formatTranslation(ability) : ability
        );
      }

      // Format skill text on the back
      if (this.card.translations[ln].skillBack) {
        this.card.translations[ln].skillBack = this.formatTranslation(this.card.translations[ln].skillBack);
      }

      // From here on out, if rush-related values have been assigned (such as materials on rushOtherEffects) but the card is not rush, delete them

      // Format rush other effects
      if (this.card.translations[ln].rushOtherEffects) {
        if (this.card.rush) {
          this.card.translations[ln].rushOtherEffects = this.formatTranslation(
            this.card.translations[ln].rushOtherEffects
          );
        } else {
          delete this.card.translations[ln].rushOtherEffects;
        }
      }

      // Format rush condition
      if (this.card.translations[ln].rushCondition) {
        if (this.card.rush) {
          this.card.translations[ln].rushCondition = this.formatTranslation(this.card.translations[ln].rushCondition);
        } else {
          delete this.card.translations[ln].rushCondition;
        }
      }

      // Format rush effect
      if (this.card.translations[ln].rushEffect) {
        if (this.card.rush) {
          this.card.translations[ln].rushEffect = this.formatTranslation(this.card.translations[ln].rushEffect);
        } else {
          delete this.card.translations[ln].rushEffect;
        }
      }

      // Format rush choice effects
      if (this.card.translations[ln].rushChoiceEffects?.length) {
        if (this.card.rush) {
          this.card.translations[ln].rushChoiceEffects = this.card.translations[ln].rushChoiceEffects!.map(
            (choiceEffect) => (choiceEffect ? this.formatTranslation(choiceEffect) : choiceEffect)
          );
        } else {
          delete this.card.translations[ln].rushChoiceEffects;
        }
      }
    }
  }

  /**
   * Utility method to format text by replacing HTML entities.
   */
  private formatTranslation(text: string | undefined): string {
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

  /**
   * Assign the lore string corresponding to the language to the correct property
   */
  private assignLore(language: TYugipediaCardLanguage) {
    let lore: string | undefined;
    if (language === 'en_us') lore = this.lore;
    else if (language === 'fr_fr') lore = this.frLore;

    if (!lore) return;

    if (!this.card.rush) {
      this.card.translations[language].description = lore;
      return;
    }

    if (this.card.rushEffectType === 'choice' && lore) {
      this.card.translations[language].rushChoiceEffects = lore
        .split(/(●|•)/)
        .map((part) => part.trim())
        .filter((part) => part && part !== '●' && part !== '•');
    } else if (this.card.frames.length === 1 && ['normal', 'token', 'monsterToken'].includes(this.card.frames[0]!)) {
      this.card.translations[language].description = lore;
    } else {
      this.card.translations[language].rushEffect = lore;
    }
  }

  /**
   * Translate an ability from English to French.
   */
  private getFrenchAbility(ability: string): string {
    switch (ability.trim()) {
      // Card Types
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
      case 'Skill':
        return 'Compétence';
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
      case 'Normal Spell':
        return 'Magie Normale';
      case 'Continuous Spell':
        return 'Magie Continue';
      case 'Equip Spell':
        return "Magie d'Équipement";
      case 'Field Spell':
        return 'Magie de Terrain';
      case 'Quick-Play Spell':
        return 'Magie Jeu-Rapide';
      case 'Ritual Spell':
        return 'Magie Rituelle';
      case 'Link Spell':
        return 'Magie de Lien';
      case 'Normal Trap':
        return 'Piège Normal';
      case 'Continuous Trap':
        return 'Piège Continu';
      case 'Counter Trap':
        return 'Contre-Piège';

      // Monster Types
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
        return 'Galaxie';

      // Skill characters
      case 'Weevil':
        return 'Haga';
      case 'Keith':
        return 'Ken';
      case 'Paradox':
        return 'Paradoxe';
      case 'Rare Hunter':
        return "Pilleur de l'Ombre";
      case 'Strings':
        return 'Sting';
      case 'Umbra & Lumis':
        return 'Lumis et Umbra';
      case 'Espa Roba':
        return 'Esparo';
      case 'Ishizu':
        return 'Shizu';
      case 'Jaden & Syrus':
        return 'Jaden et Syrus';
      case 'Chazz':
        return 'Chad';
      case 'Alexis':
        return 'Alexia';
      case 'Zane':
        return 'Zen';
      case 'Bastion':
        return 'Bastien';
      case 'Chumley':
        return 'Charlie';
      case 'Dr. Crowler':
        return 'Docteur Crowler';
      case 'Nightshroud':
        return 'Masque des Ténèbres';
      case 'Hassleberry':
        return 'Cricket';
      case 'Society':
        return 'Société';
      case 'Adrian':
        return 'Adrien';
      case 'Supreme King':
        return 'Roi Suprême';

      default:
        return ability;
    }
  }
}
