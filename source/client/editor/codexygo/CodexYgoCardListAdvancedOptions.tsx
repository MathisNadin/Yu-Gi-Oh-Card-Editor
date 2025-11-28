import { FC, useEffect, useState } from 'react';
import {
  ButtonIcon,
  CheckboxField,
  Chips,
  HorizontalStack,
  Icon,
  Image,
  IMasonryProps,
  ISelectItem,
  IVerticalStackProps,
  Masonry,
  SearchBar,
  Select,
  Spacer,
  TextInput,
  Toggle,
  Typography,
  VerticalStack,
} from 'mn-toolkit';
import { classNames, isDefined } from 'mn-tools';
import {
  TCodexYgoCardAttribute,
  TCodexYgoCardStIcon,
  TCodexYgoCardType,
  TCodexYgoMonsterCardTypeFr,
  TCodexYgoMonsterTypeFr,
  ICodexYgoCardListAdvancedOptions,
  TCodexYgoCardAdvancedSearchType,
  TCodexYgoCardRuleFormat,
  TCodexYgoCardLanguage,
} from './interfaces';
import { LinkArrowsEditor } from './LinkArrowsEditor';

// Search types per format
// Master search types
const MASTER_SEARCH_TYPE_ITEMS: ISelectItem<TCodexYgoCardAdvancedSearchType>[] = [
  { id: 'name', label: 'Recherche par Nom de Carte' },
  { id: 'description', label: 'Recherche par Texte de Carte' },
  { id: 'pendulumEffect', label: 'Recherche par Effet Pendule' },
  { id: 'limitationText', label: 'Recherche par Texte de Limitation' },
];
// Rush search types
const RUSH_SEARCH_TYPE_ITEMS: ISelectItem<TCodexYgoCardAdvancedSearchType>[] = [
  { id: 'name', label: 'Recherche par Nom de Carte' },
  { id: 'description', label: 'Recherche par Texte de Carte' },
  { id: 'limitationText', label: 'Recherche par Texte de Limitation' },
];

// Common Card Types (all formats)
const CARD_TYPES: Array<{ id: TCodexYgoCardType; label: string }> = [
  { id: 'monster', label: 'Monstre' },
  { id: 'spell', label: 'Magie' },
  { id: 'trap', label: 'Piège' },
  { id: 'skill', label: 'Compétence' },
];

// Common attributes (all formats)
const ATTRIBUTES_COMMON: TCodexYgoCardAttribute[] = ['dark', 'light', 'earth', 'water', 'fire', 'wind'];
// Attributes exclusive to Master format
const ATTRIBUTES_EXCLUSIVE_MASTER: TCodexYgoCardAttribute[] = ['divine'];

// Spell/Trap icons by card type and format
// Master format
const ST_ICONS_MASTER_SPELL: TCodexYgoCardStIcon[] = ['normal', 'equip', 'field', 'ritual', 'quickplay', 'continuous'];
const ST_ICONS_MASTER_TRAP: TCodexYgoCardStIcon[] = ['normal', 'continuous', 'counter'];
// Rush format
const ST_ICONS_RUSH_SPELL: TCodexYgoCardStIcon[] = ['normal', 'equip', 'field', 'ritual'];
const ST_ICONS_RUSH_TRAP: TCodexYgoCardStIcon[] = ['normal'];

// Common Monster Card Types (all formats)
const MONSTER_CARD_TYPES_FR_COMMON: TCodexYgoMonsterCardTypeFr[] = ['Normal', 'Effet', 'Rituel', 'Fusion'];
// Monster Card Types exclusive to Master format
const MONSTER_CARD_TYPES_FR_EXCLUSIVE_MASTER: TCodexYgoMonsterCardTypeFr[] = [
  'Synchro',
  'Xyz',
  'Pendule',
  'Lien',
  'Toon',
  'Spirit',
  'Union',
  'Gémeau',
  'Syntoniseur',
  'Flip',
];
// Monster Card Types exclusive to Rush format
const MONSTER_CARD_TYPES_FR_EXCLUSIVE_RUSH: TCodexYgoMonsterCardTypeFr[] = ['Maximum'];

// Common Monster Types (all formats)
const MONSTER_TYPES_FR_COMMON: TCodexYgoMonsterTypeFr[] = [
  'Magicien',
  'Dragon',
  'Zombie',
  'Guerrier',
  'Bête-Guerrier',
  'Bête',
  'Bête Ailée',
  'Démon',
  'Elfe',
  'Insecte',
  'Dinosaure',
  'Reptile',
  'Poisson',
  'Serpent de Mer',
  'Aqua',
  'Pyro',
  'Tonnerre',
  'Rocher',
  'Plante',
  'Machine',
  'Psychique',
  'Wyrm',
  'Cyberse',
];
// Monster Types exclusive to Master format
const MONSTER_TYPES_FR_EXCLUSIVE_MASTER: TCodexYgoMonsterTypeFr[] = ['Illusion', 'Bête Divine', 'Dieu Créateur'];
// Monster Types exclusive to Rush format
const MONSTER_TYPES_FR_EXCLUSIVE_RUSH: TCodexYgoMonsterTypeFr[] = [
  'Cyborg',
  'Chevalier Magique',
  'Grand Dragon',
  'Psychique Oméga',
  'Guerrier Céleste',
  'Galaxie',
];

/**
 * Get attributes available in the given format
 */
const getAttributesForFormat = (format: TCodexYgoCardRuleFormat): TCodexYgoCardAttribute[] => {
  if (format === 'rush') {
    return ATTRIBUTES_COMMON;
  }
  return [...ATTRIBUTES_COMMON, ...ATTRIBUTES_EXCLUSIVE_MASTER];
};

/**
 * Get Spell/Trap icons available in the given format and card type
 */
const getStIconsForFormat = (
  format: TCodexYgoCardRuleFormat,
  cardTypesAny?: TCodexYgoCardType[]
): TCodexYgoCardStIcon[] => {
  // Determine if we're filtering by card type
  const hasSpell = !cardTypesAny || cardTypesAny.includes('spell');
  const hasTrap = !cardTypesAny || cardTypesAny.includes('trap');

  if (format === 'rush') {
    // Collect available icons for the selected card types
    const icons = new Set<TCodexYgoCardStIcon>();
    if (hasSpell) {
      ST_ICONS_RUSH_SPELL.forEach((icon) => icons.add(icon));
    }
    if (hasTrap) {
      ST_ICONS_RUSH_TRAP.forEach((icon) => icons.add(icon));
    }
    return Array.from(icons);
  }

  // Master format
  const icons = new Set<TCodexYgoCardStIcon>();
  if (hasSpell) {
    ST_ICONS_MASTER_SPELL.forEach((icon) => icons.add(icon));
  }
  if (hasTrap) {
    ST_ICONS_MASTER_TRAP.forEach((icon) => icons.add(icon));
  }
  return Array.from(icons);
};

/**
 * Get Monster Card Types available in the given format
 */
const getSearchTypeItemsForFormat = (
  format: TCodexYgoCardRuleFormat
): ISelectItem<TCodexYgoCardAdvancedSearchType>[] => {
  if (format === 'rush') {
    return RUSH_SEARCH_TYPE_ITEMS;
  }
  return MASTER_SEARCH_TYPE_ITEMS;
};

/**
 * Get Monster Card Types available in the given format
 */
const getMonsterCardTypesFrForFormat = (format: TCodexYgoCardRuleFormat): TCodexYgoMonsterCardTypeFr[] => {
  if (format === 'rush') {
    return [...MONSTER_CARD_TYPES_FR_COMMON, ...MONSTER_CARD_TYPES_FR_EXCLUSIVE_RUSH];
  }
  if (format === 'master') {
    return [...MONSTER_CARD_TYPES_FR_COMMON, ...MONSTER_CARD_TYPES_FR_EXCLUSIVE_MASTER];
  }
  return [
    ...MONSTER_CARD_TYPES_FR_COMMON,
    ...MONSTER_CARD_TYPES_FR_EXCLUSIVE_MASTER,
    ...MONSTER_CARD_TYPES_FR_EXCLUSIVE_RUSH,
  ];
};

/**
 * Get Monster Types available in the given format
 */
const getMonsterTypesFrForFormat = (format: TCodexYgoCardRuleFormat): TCodexYgoMonsterTypeFr[] => {
  if (format === 'rush') {
    return [...MONSTER_TYPES_FR_COMMON, ...MONSTER_TYPES_FR_EXCLUSIVE_RUSH];
  }
  if (format === 'master') {
    return [...MONSTER_TYPES_FR_COMMON, ...MONSTER_TYPES_FR_EXCLUSIVE_MASTER];
  }
  return [...MONSTER_TYPES_FR_COMMON, ...MONSTER_TYPES_FR_EXCLUSIVE_MASTER, ...MONSTER_TYPES_FR_EXCLUSIVE_RUSH];
};

/**
 * Clean options based on format and visibility constraints
 */
const cleanOptionsForFormat = (options: ICodexYgoCardListAdvancedOptions): ICodexYgoCardListAdvancedOptions => {
  const cleanedOptions = { ...options };

  // Get available items for the format
  const availableSearchTypes = getSearchTypeItemsForFormat(options.format);
  const availableAttributes = getAttributesForFormat(options.format);
  const availableStIcons = getStIconsForFormat(options.format, options.cardTypesAny);
  const availableMonsterCardTypes = getMonsterCardTypesFrForFormat(options.format);
  const availableMonsterTypes = getMonsterTypesFrForFormat(options.format);

  // Clean search type : if not found, default to name as it will always be correct
  if (!availableSearchTypes.find((t) => t.id === cleanedOptions.searchType)) {
    cleanedOptions.searchType = 'name';
  }

  // Clean attributes: only keep those available in format
  if (cleanedOptions.attributesAny && cleanedOptions.attributesAny.length > 0) {
    const filteredAttributes = cleanedOptions.attributesAny.filter((a) => !!a && availableAttributes.includes(a));
    cleanedOptions.attributesAny = filteredAttributes.length > 0 ? filteredAttributes : undefined;
  }

  // Clean Spell/Trap icons: only keep those available in format
  if (cleanedOptions.stTypesAny && cleanedOptions.stTypesAny.length > 0) {
    const filteredStTypes = cleanedOptions.stTypesAny.filter((st) => !!st && availableStIcons.includes(st));
    cleanedOptions.stTypesAny = filteredStTypes.length > 0 ? filteredStTypes : undefined;
  }

  // Clean monster card types: only keep those available in format
  if (cleanedOptions.monsterCardTypesFrAny && cleanedOptions.monsterCardTypesFrAny.length > 0) {
    const filteredMonsterCardTypes = cleanedOptions.monsterCardTypesFrAny.filter((mct) =>
      availableMonsterCardTypes.includes(mct)
    );
    cleanedOptions.monsterCardTypesFrAny = filteredMonsterCardTypes.length > 0 ? filteredMonsterCardTypes : undefined;
  }

  if (cleanedOptions.monsterCardTypesFrAll && cleanedOptions.monsterCardTypesFrAll.length > 0) {
    const filteredMonsterCardTypes = cleanedOptions.monsterCardTypesFrAll.filter((mct) =>
      availableMonsterCardTypes.includes(mct)
    );
    cleanedOptions.monsterCardTypesFrAll = filteredMonsterCardTypes.length > 0 ? filteredMonsterCardTypes : undefined;
  }

  // Clean monster types: only keep those available in format
  if (cleanedOptions.monsterTypesFrAny && cleanedOptions.monsterTypesFrAny.length > 0) {
    const filteredMonsterTypes = cleanedOptions.monsterTypesFrAny.filter((mt) => availableMonsterTypes.includes(mt));
    cleanedOptions.monsterTypesFrAny = filteredMonsterTypes.length > 0 ? filteredMonsterTypes : undefined;
  }

  // If no spell or trap card types are selected, clear Spell/Trap icons
  if (cleanedOptions.cardTypesAny && !cleanedOptions.cardTypesAny.find((c) => c === 'spell' || c === 'trap')) {
    cleanedOptions.stTypesAny = undefined;
  }

  // If no monster card types are selected, clear attributes, monster card types, monster types, levels, scales, and link arrows
  if (cleanedOptions.cardTypesAny && !cleanedOptions.cardTypesAny.includes('monster')) {
    cleanedOptions.attributesAny = undefined;
    cleanedOptions.monsterCardTypesFrAny = undefined;
    cleanedOptions.monsterCardTypesFrAll = undefined;
    cleanedOptions.monsterTypesFrAny = undefined;
    cleanedOptions.levelsAny = undefined;
    cleanedOptions.scalesAny = undefined;
    cleanedOptions.linkArrowsAny = undefined;
    cleanedOptions.linkArrowsAll = undefined;
    cleanedOptions.atkMaxsAny = undefined;
    cleanedOptions.atksAny = undefined;
    cleanedOptions.defsAny = undefined;
  }

  if (options.format === 'master') {
    cleanedOptions.atkMaxsAny = undefined;
  } else if (options.format === 'rush') {
    cleanedOptions.scalesAny = undefined;
    cleanedOptions.linkArrowsAny = undefined;
    cleanedOptions.linkArrowsAll = undefined;

    if (cleanedOptions.levelsAny?.length) {
      cleanedOptions.levelsAny = cleanedOptions.levelsAny.filter((l) => l !== 0 && l !== 13);
    }
  }

  return cleanedOptions;
};

/**
 * Update options and notify parent, cleaning them based on format and visibility
 */
const updateOptions = (
  options: ICodexYgoCardListAdvancedOptions,
  patch: Partial<ICodexYgoCardListAdvancedOptions>,
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void
) => {
  const newOptions: ICodexYgoCardListAdvancedOptions = {
    ...options,
    ...patch,
  };
  const cleanedOptions = cleanOptionsForFormat(newOptions);
  onChange(cleanedOptions);
};

/**
 * Toggle a card type in the card types list
 */
const toggleCardType = (
  options: ICodexYgoCardListAdvancedOptions,
  cardType: TCodexYgoCardType,
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void
) => {
  const cardTypes = options.cardTypesAny || [];
  const newCardTypes = cardTypes.includes(cardType)
    ? cardTypes.filter((ct) => ct !== cardType)
    : [...cardTypes, cardType];
  updateOptions(options, { cardTypesAny: newCardTypes.length > 0 ? newCardTypes : undefined }, onChange);
};

/**
 * Toggle an attribute in the attributes list
 */
const toggleAttribute = (
  options: ICodexYgoCardListAdvancedOptions,
  attribute: TCodexYgoCardAttribute,
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void
) => {
  const attributes = options.attributesAny || [];
  const newAttributes = attributes.includes(attribute)
    ? attributes.filter((a) => a !== attribute)
    : [...attributes, attribute];
  updateOptions(options, { attributesAny: newAttributes.length > 0 ? newAttributes : undefined }, onChange);
};

/**
 * Toggle a spell type icon in the spell types list
 */
const toggleSpellType = (
  options: ICodexYgoCardListAdvancedOptions,
  stType: TCodexYgoCardStIcon,
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void
) => {
  const stTypes = options.stTypesAny || [];
  const newStTypes = stTypes.includes(stType) ? stTypes.filter((st) => st !== stType) : [...stTypes, stType];
  updateOptions(options, { stTypesAny: newStTypes.length > 0 ? newStTypes : undefined }, onChange);
};

/**
 * Toggle a monster card type in the card types list (French)
 */
const toggleMonsterCardTypeFr = (
  options: ICodexYgoCardListAdvancedOptions,
  monsterCardType: TCodexYgoMonsterCardTypeFr,
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void
) => {
  const monsterCardTypes = options.monsterCardTypesFrAny || [];
  const newCardTypes = monsterCardTypes.includes(monsterCardType)
    ? monsterCardTypes.filter((ct) => ct !== monsterCardType)
    : [...monsterCardTypes, monsterCardType];
  updateOptions(options, { monsterCardTypesFrAny: newCardTypes.length > 0 ? newCardTypes : undefined }, onChange);
};

/**
 * Toggle a monster type in the monster types list (French)
 */
const toggleMonsterTypeFr = (
  options: ICodexYgoCardListAdvancedOptions,
  monsterType: TCodexYgoMonsterTypeFr,
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void
) => {
  const monsterTypes = options.monsterTypesFrAny || [];
  const newMonsterTypes = monsterTypes.includes(monsterType)
    ? monsterTypes.filter((mt) => mt !== monsterType)
    : [...monsterTypes, monsterType];
  updateOptions(options, { monsterTypesFrAny: newMonsterTypes.length > 0 ? newMonsterTypes : undefined }, onChange);
};

/**
 * Toggle a level in the levels list
 */
const toggleLevel = (
  options: ICodexYgoCardListAdvancedOptions,
  level: number,
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void
) => {
  const levels = options.levelsAny || [];
  const newLevels = levels.includes(level) ? levels.filter((l) => l !== level) : [...levels, level];
  updateOptions(options, { levelsAny: newLevels.length > 0 ? newLevels : undefined }, onChange);
};

/**
 * Toggle a scale value in the scales list
 */
const toggleScale = (
  options: ICodexYgoCardListAdvancedOptions,
  scale: number,
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void
) => {
  const scales = options.scalesAny || [];
  const newScales = scales.includes(scale) ? scales.filter((s) => s !== scale) : [...scales, scale];
  updateOptions(options, { scalesAny: newScales.length > 0 ? newScales : undefined }, onChange);
};

const toggleButtonSize = 18;
const ToggleButton: FC<{
  imageSrc?: string;
  label: string;
  pressed: boolean;
  onTap: () => void;
}> = ({ imageSrc, label, pressed, onTap }) => {
  return (
    <HorizontalStack
      className={classNames('mn-toggle-button', { pressed })}
      gutter='small'
      padding='tiny'
      itemAlignment='center'
      verticalItemAlignment='middle'
      onTap={onTap}
    >
      {!!imageSrc && (
        <Image
          minWidth={toggleButtonSize}
          maxWidth={toggleButtonSize}
          minHeight={toggleButtonSize}
          maxHeight={toggleButtonSize}
          src={imageSrc}
          alt={label}
        />
      )}
      <Typography bold color='1' variant='document' fontSize='small' content={label} />
    </HorizontalStack>
  );
};

/**
 * Common section props interface for all filter sections
 */
interface ISectionProps {
  /** The options object to modify */
  options: ICodexYgoCardListAdvancedOptions;
  /** Callback when options change */
  onChange: (opts: ICodexYgoCardListAdvancedOptions) => void;
}

/**
 * Reusable section header component that displays title with optional AND/OR toggle
 */
interface ISectionHeaderProps {
  /** Section title */
  title: string;
  /** Clear section selection */
  onClearSelection?: () => void;
  /** Show AND/OR toggle (when true, toggleLogicMode callback is required) */
  showLogicToggle?: boolean;
  /** Current logic mode (true = AND, false = OR) */
  logicMode?: boolean;
  /** Callback when logic mode changes */
  onToggleLogicMode?: (isAnd: boolean) => void;
}

const SectionHeader: FC<ISectionHeaderProps> = ({
  title,
  onClearSelection,
  showLogicToggle,
  logicMode,
  onToggleLogicMode,
}) => {
  const showLogicMode = !!showLogicToggle && isDefined(logicMode) && !!onToggleLogicMode;
  return (
    <HorizontalStack className='section-header' verticalItemAlignment='middle' gutter='small'>
      <Typography className='section-title' bold variant='label' fontSize='small' contentType='text' content={title} />
      {!!onClearSelection && (
        <ButtonIcon
          className='clear-selection'
          name='clear-selection'
          icon='toolkit-close'
          color='negative'
          onTap={onClearSelection}
        />
      )}

      {showLogicMode && (
        <>
          <Spacer />
          <HorizontalStack gutter='tiny' verticalItemAlignment='middle'>
            <Typography
              color={logicMode ? '4' : '1'}
              variant='document'
              fontSize='small'
              contentType='text'
              content='OU'
            />
            <Toggle value={logicMode} onChange={(checked) => onToggleLogicMode(checked)} />
            <Typography
              color={logicMode ? '1' : '4'}
              variant='document'
              fontSize='small'
              contentType='text'
              content='ET'
            />
          </HorizontalStack>
        </>
      )}
    </HorizontalStack>
  );
};

/**
 * Reusable filter section component with Masonry layout
 */
interface IFilterSectionProps extends ISectionHeaderProps {
  /** Masonry template columns configuration */
  masonryTemplateColumns: IMasonryProps['masonryTemplateColumns'];
  /** Child elements to render in the Masonry */
  children: React.ReactNode;
}

const FilterSection: FC<IFilterSectionProps> = ({
  title,
  masonryTemplateColumns,
  onClearSelection,
  showLogicToggle,
  logicMode,
  onToggleLogicMode,
  children,
}) => {
  return (
    <VerticalStack paddingX='tiny' gutter='small'>
      <SectionHeader
        title={title}
        onClearSelection={onClearSelection}
        showLogicToggle={showLogicToggle}
        logicMode={logicMode}
        onToggleLogicMode={onToggleLogicMode}
      />

      <Masonry gutter='small' masonryTemplateColumns={masonryTemplateColumns}>
        {children}
      </Masonry>
    </VerticalStack>
  );
};

/**
 * Search Type selector section component
 */
const SearchTypeSection: FC<ISectionProps> = ({ options, onChange }) => {
  const items = getSearchTypeItemsForFormat(options.format);

  return (
    <VerticalStack paddingX='tiny' gutter='small'>
      <SectionHeader title='Type de recherche' />
      <Select<TCodexYgoCardAdvancedSearchType>
        items={items}
        value={options.searchType}
        onChange={(searchType) => updateOptions(options, { searchType }, onChange)}
      />
    </VerticalStack>
  );
};

/**
 * Card type filter section component
 */
const CardTypeSection: FC<ISectionProps> = ({ options, onChange }) => {
  const optionsCardTypes = options.cardTypesAny || [];

  return (
    <FilterSection
      title='Type de carte'
      onClearSelection={() => updateOptions(options, { cardTypesAny: undefined }, onChange)}
      masonryTemplateColumns={{
        small: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '110px',
                  max: '1fr',
                },
              },
            },
          ],
        },
      }}
    >
      {CARD_TYPES.map((cardType) => (
        <ToggleButton
          key={cardType.id}
          label={cardType.label}
          pressed={optionsCardTypes.includes(cardType.id)}
          onTap={() => toggleCardType(options, cardType.id, onChange)}
        />
      ))}
    </FilterSection>
  );
};

/**
 * Attribute filter section component
 */
const AttributeSection: FC<ISectionProps> = ({ options, onChange }) => {
  if (options.cardTypesAny && !options.cardTypesAny.includes('monster')) return null;

  const availableAttributes = getAttributesForFormat(options.format);
  const attributes: Array<{ id: TCodexYgoCardAttribute; label: string }> = availableAttributes.map((id) => ({
    id,
    label: app.$card.getAttributeName(id),
  }));

  const optionsAttributes = options.attributesAny || [];

  return (
    <FilterSection
      title='Attribut'
      onClearSelection={() => updateOptions(options, { attributesAny: undefined }, onChange)}
      masonryTemplateColumns={{
        small: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '110px',
                  max: '1fr',
                },
              },
            },
          ],
        },
        medium: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '130px',
                  max: '1fr',
                },
              },
            },
          ],
        },
      }}
    >
      {attributes.map((attr) => (
        <ToggleButton
          key={attr.id}
          imageSrc={app.$card.paths.master.attributeIcons[attr.id]}
          label={attr.label}
          pressed={optionsAttributes.includes(attr.id)}
          onTap={() => toggleAttribute(options, attr.id, onChange)}
        />
      ))}
    </FilterSection>
  );
};

/**
 * Spell/Trap icon filter section component
 */
const SpellTypeSection: FC<ISectionProps> = ({ options, onChange }) => {
  if (options.cardTypesAny && !options.cardTypesAny.find((c) => c === 'spell' || c === 'trap')) return null;

  const availableStIcons = getStIconsForFormat(options.format, options.cardTypesAny);
  const allSpellTypes: Array<{ value: TCodexYgoCardStIcon; label: string }> = [
    { value: 'normal', label: app.$card.getStTypeName('normal', 'fr', true) },
    { value: 'equip', label: app.$card.getStTypeName('equip', 'fr', true) },
    { value: 'field', label: app.$card.getStTypeName('field', 'fr', true) },
    { value: 'quickplay', label: app.$card.getStTypeName('quickplay', 'fr', true) },
    { value: 'ritual', label: app.$card.getStTypeName('ritual', 'fr', true) },
    { value: 'continuous', label: app.$card.getStTypeName('continuous', 'fr', true) },
    { value: 'counter', label: app.$card.getStTypeName('counter', 'fr', false) },
  ];
  const spellTypes = allSpellTypes.filter((st) => availableStIcons.includes(st.value));

  const optionsStTypes = options.stTypesAny || [];

  return (
    <FilterSection
      title='Icône'
      onClearSelection={() => updateOptions(options, { stTypesAny: undefined }, onChange)}
      masonryTemplateColumns={{
        small: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '110px',
                  max: '1fr',
                },
              },
            },
          ],
        },
        medium: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '130px',
                  max: '1fr',
                },
              },
            },
          ],
        },
      }}
    >
      {spellTypes.map((st) => (
        <ToggleButton
          key={st.value}
          imageSrc={app.$card.paths.master.stIcons[st.value]}
          label={st.label}
          pressed={optionsStTypes.includes(st.value)}
          onTap={() => toggleSpellType(options, st.value, onChange)}
        />
      ))}
    </FilterSection>
  );
};

/**
 * Monster Card Type filter section component with AND/OR logic toggle
 */
const MonsterCardTypeFrSection: FC<ISectionProps> = ({ options, onChange }) => {
  // Independent state to track whether we're in AND mode
  const [useAndMode, setUseAndMode] = useState<boolean>(!!options.monsterCardTypesFrAll?.length);

  if (options.cardTypesAny && !options.cardTypesAny.includes('monster')) return null;

  const availableMonsterCardTypes = getMonsterCardTypesFrForFormat(options.format);
  const optionsMonsterCardTypes = options.monsterCardTypesFrAny || [];
  const optionsMonsterCardTypesAll = options.monsterCardTypesFrAll || [];
  const currentOptions = useAndMode ? optionsMonsterCardTypesAll : optionsMonsterCardTypes;

  const handleToggleLogicMode = (isAnd: boolean) => {
    setUseAndMode(isAnd);
    if (isAnd) {
      // Switch from OR to AND: move current selections
      updateOptions(
        options,
        {
          monsterCardTypesFrAny: undefined,
          monsterCardTypesFrAll: optionsMonsterCardTypes,
        },
        onChange
      );
    } else {
      // Switch from AND to OR: move current selections
      updateOptions(
        options,
        {
          monsterCardTypesFrAny: optionsMonsterCardTypesAll,
          monsterCardTypesFrAll: undefined,
        },
        onChange
      );
    }
  };

  return (
    <FilterSection
      title='Type de Carte Monstre'
      onClearSelection={() =>
        updateOptions(options, { monsterCardTypesFrAny: undefined, monsterCardTypesFrAll: undefined }, onChange)
      }
      masonryTemplateColumns={{
        small: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '110px',
                  max: '1fr',
                },
              },
            },
          ],
        },
      }}
      showLogicToggle={true}
      logicMode={useAndMode}
      onToggleLogicMode={handleToggleLogicMode}
    >
      {availableMonsterCardTypes.map((cardType) => (
        <ToggleButton
          key={cardType}
          label={cardType}
          pressed={currentOptions.includes(cardType)}
          onTap={() => {
            // Update based on current mode
            if (useAndMode) {
              const monsterCardTypesAll = optionsMonsterCardTypesAll || [];
              const newCardTypes = monsterCardTypesAll.includes(cardType)
                ? monsterCardTypesAll.filter((ct) => ct !== cardType)
                : [...monsterCardTypesAll, cardType];
              updateOptions(
                options,
                { monsterCardTypesFrAll: newCardTypes.length > 0 ? newCardTypes : undefined },
                onChange
              );
            } else {
              toggleMonsterCardTypeFr(options, cardType, onChange);
            }
          }}
        />
      ))}
    </FilterSection>
  );
};

/**
 * Monster type filter section component
 */
const MonsterTypeSection: FC<ISectionProps> = ({ options, onChange }) => {
  if (options.cardTypesAny && !options.cardTypesAny.includes('monster')) return null;

  const availableMonsterTypes = getMonsterTypesFrForFormat(options.format);
  const optionsMonsterTypes = options.monsterTypesFrAny || [];

  return (
    <FilterSection
      title='Type de Monstre'
      onClearSelection={() => updateOptions(options, { monsterTypesFrAny: undefined }, onChange)}
      masonryTemplateColumns={{
        small: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '130px',
                  max: '1fr',
                },
              },
            },
          ],
        },
      }}
    >
      {availableMonsterTypes.map((monsterType) => (
        <ToggleButton
          key={monsterType}
          label={monsterType}
          pressed={optionsMonsterTypes.includes(monsterType)}
          onTap={() => toggleMonsterTypeFr(options, monsterType, onChange)}
        />
      ))}
    </FilterSection>
  );
};

/**
 * Level/Rank/Link Classification filter section component
 */
const LevelSection: FC<ISectionProps> = ({ options, onChange }) => {
  if (options.cardTypesAny && !options.cardTypesAny.includes('monster')) return null;

  const levels =
    options.format === 'rush' ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 14 }, (_, i) => i);
  const optionsLevels = options.levelsAny || [];

  return (
    <FilterSection
      title={`Niveau${options.format === 'rush' ? '' : ' / Rang / Classification Lien'}`}
      onClearSelection={() => updateOptions(options, { levelsAny: undefined }, onChange)}
      masonryTemplateColumns={{
        small: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '60px',
                  max: '1fr',
                },
              },
            },
          ],
        },
      }}
    >
      {levels.map((level) => (
        <ToggleButton
          key={level}
          label={String(level)}
          pressed={optionsLevels.includes(level)}
          onTap={() => toggleLevel(options, level, onChange)}
        />
      ))}
    </FilterSection>
  );
};

/**
 * Pendulum scale filter section component
 */
const ScaleSection: FC<ISectionProps> = ({ options, onChange }) => {
  if (options.format === 'rush') return null;
  if (options.cardTypesAny && !options.cardTypesAny.includes('monster')) return null;

  const scales = Array.from({ length: 14 }, (_, i) => i);
  const optionsScales = options.scalesAny || [];

  return (
    <FilterSection
      title='Échelle Pendule'
      onClearSelection={() => updateOptions(options, { scalesAny: undefined }, onChange)}
      masonryTemplateColumns={{
        small: {
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fill',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '60px',
                  max: '1fr',
                },
              },
            },
          ],
        },
      }}
    >
      {scales.map((scale) => (
        <ToggleButton
          key={scale}
          label={String(scale)}
          pressed={optionsScales.includes(scale)}
          onTap={() => toggleScale(options, scale, onChange)}
        />
      ))}
    </FilterSection>
  );
};

/**
 * Link Arrows filter section component with AND/OR logic toggle
 */
const LinkArrowsSection: FC<ISectionProps> = ({ options, onChange }) => {
  // Independent state to track whether we're in AND mode
  const [useAndMode, setUseAndMode] = useState<boolean>(!!options.linkArrowsAll?.length);

  if (options.format === 'rush') return null;
  if (options.cardTypesAny && !options.cardTypesAny.includes('monster')) return null;

  const optionsLinkArrowsAny = options.linkArrowsAny || [];
  const optionsLinkArrowsAll = options.linkArrowsAll || [];
  const currentOptions = useAndMode ? optionsLinkArrowsAll : optionsLinkArrowsAny;

  const handleToggleLogicMode = (isAnd: boolean) => {
    setUseAndMode(isAnd);
    if (isAnd) {
      // Switch from OR to AND: move current selections
      updateOptions(
        options,
        {
          linkArrowsAny: undefined,
          linkArrowsAll: optionsLinkArrowsAny,
        },
        onChange
      );
    } else {
      // Switch from AND to OR: move current selections
      updateOptions(
        options,
        {
          linkArrowsAny: optionsLinkArrowsAll,
          linkArrowsAll: undefined,
        },
        onChange
      );
    }
  };

  return (
    <VerticalStack paddingX='tiny' gutter='small'>
      <SectionHeader
        title='Flèches Lien'
        onClearSelection={() =>
          updateOptions(options, { linkArrowsAny: undefined, linkArrowsAll: undefined }, onChange)
        }
        showLogicToggle={true}
        logicMode={useAndMode}
        onToggleLogicMode={handleToggleLogicMode}
      />
      <LinkArrowsEditor
        value={currentOptions}
        onChange={(newLinkArrows) => {
          // Update based on current mode
          if (useAndMode) {
            updateOptions(options, { linkArrowsAll: newLinkArrows.length > 0 ? newLinkArrows : undefined }, onChange);
          } else {
            updateOptions(options, { linkArrowsAny: newLinkArrows.length > 0 ? newLinkArrows : undefined }, onChange);
          }
        }}
      />
    </VerticalStack>
  );
};

/**
 * ATK/DEF range filter section component
 */
const AtkDefSection: FC<ISectionProps> = ({ options, onChange }) => {
  if (options.cardTypesAny && !options.cardTypesAny.includes('monster')) return null;

  return (
    <VerticalStack gutter>
      {options.format !== 'master' && (
        <HorizontalStack gutter='small' verticalItemAlignment='middle'>
          <Typography bold variant='label' fontSize='small' contentType='text' content='ATK MAX' />
          <TextInput
            fill
            value={options.atkMaxsAny?.[0] || ''}
            onChange={(value) => updateOptions(options, { atkMaxsAny: value ? [value] : undefined }, onChange)}
          />
        </HorizontalStack>
      )}

      <Masonry
        masonryTemplateColumns={{
          kind: 'track-list',
          segments: [
            {
              kind: 'repeat',
              count: 'auto-fit',
              track: {
                kind: 'track',
                size: {
                  kind: 'minmax',
                  min: '200px',
                  max: '1fr',
                },
              },
            },
          ],
        }}
      >
        <HorizontalStack gutter='small' verticalItemAlignment='middle'>
          <Typography bold variant='label' fontSize='small' contentType='text' content='ATK' />
          <TextInput
            fill
            value={options.atksAny?.[0] || ''}
            onChange={(value) => updateOptions(options, { atksAny: value ? [value] : undefined }, onChange)}
          />
        </HorizontalStack>

        <HorizontalStack gutter='small' verticalItemAlignment='middle'>
          <Typography bold variant='label' fontSize='small' contentType='text' content='DEF' />
          <TextInput
            fill
            value={options.defsAny?.[0] || ''}
            onChange={(value) => updateOptions(options, { defsAny: value ? [value] : undefined }, onChange)}
          />
        </HorizontalStack>
      </Masonry>
    </VerticalStack>
  );
};

/**
 * Top options section with search, format, and sort
 */
const TopOptionsSection: FC<ISectionProps> = ({ options, onChange }) => {
  return (
    <VerticalStack gutter>
      <HorizontalStack wrap gutterX='large' gutterY itemAlignment='space-between'>
        <Chips<TCodexYgoCardLanguage>
          gutter='small'
          multiple={false}
          value={[options.language]}
          items={[
            { id: 'fr_fr', label: 'FR', color: 'info' },
            { id: 'en_us', label: 'EN', color: 'info' },
          ]}
          onChange={(selectedLanguage) => updateOptions(options, { language: selectedLanguage[0]! }, onChange)}
        />

        <Chips<TCodexYgoCardRuleFormat>
          gutter='small'
          multiple={false}
          value={[options.format]}
          items={[
            { id: 'all', label: 'Tout', color: 'neutral' },
            { id: 'master', label: 'Master', color: 'warning' },
            { id: 'rush', label: 'Rush', color: 'negative' },
          ]}
          onChange={(selectedFormat) => updateOptions(options, { format: selectedFormat[0]! }, onChange)}
        />
      </HorizontalStack>

      <SearchBar
        autofocus
        minWidth={200}
        searchDebounce={500}
        placeholder='chercher une carte...'
        value={options.search}
        onChange={(search) => updateOptions(options, { search }, onChange)}
      />
    </VerticalStack>
  );
};

interface ICheckboxesSectionProps {
  importArtworks: boolean;
  onImportArtworksChange: (importArtworks: boolean) => void;
  withSetId: boolean;
  onWithSetIdChange: (withSetId: boolean) => void;
}

const CheckboxesSection: FC<ICheckboxesSectionProps> = ({
  importArtworks,
  onImportArtworksChange,
  withSetId,
  onWithSetIdChange,
}) => {
  return (
    <HorizontalStack gutterX='large' gutterY='small' wrap itemAlignment='space-between'>
      <CheckboxField
        fieldId='importArtworks'
        fieldName='importArtworks'
        label='Importer les images'
        value={importArtworks}
        onChange={onImportArtworksChange}
      />

      <HorizontalStack
        gutter='small'
        verticalItemAlignment='middle'
        hint="Ceci utilise Yugipedia, l'import sera donc plus lent"
        onTap={() => onWithSetIdChange(!withSetId)}
      >
        <CheckboxField
          fieldId='withSetId'
          fieldName='withSetId'
          label='Importer les IDs de set'
          value={withSetId}
          onChange={() => {}}
        />
        <Icon size='regular' icon='toolkit-info-circle' />
      </HorizontalStack>
    </HorizontalStack>
  );
};

interface ICodexYgoCardListAdvancedOptionsProps extends ISectionProps, ICheckboxesSectionProps {
  colSpans?: IVerticalStackProps['colSpans'];
}

export const CodexYgoCardListAdvancedOptions: FC<ICodexYgoCardListAdvancedOptionsProps> = ({
  colSpans,
  options,
  onChange,
  importArtworks,
  onImportArtworksChange,
  withSetId,
  onWithSetIdChange,
}) => {
  // Clean options when format changes
  useEffect(() => {
    const cleanedOptions = cleanOptionsForFormat(options);
    if (JSON.stringify(cleanedOptions) !== JSON.stringify(options)) {
      onChange(cleanedOptions);
    }
  }, [options, onChange]);

  return (
    <VerticalStack className='mn-card-list-advanced-options' gutter='large' colSpans={colSpans}>
      <VerticalStack gutter>
        <CheckboxesSection
          importArtworks={importArtworks}
          onImportArtworksChange={onImportArtworksChange}
          withSetId={withSetId}
          onWithSetIdChange={onWithSetIdChange}
        />
        <TopOptionsSection options={options} onChange={onChange} />
      </VerticalStack>

      <SearchTypeSection options={options} onChange={onChange} />
      <CardTypeSection options={options} onChange={onChange} />
      <AttributeSection options={options} onChange={onChange} />
      <SpellTypeSection options={options} onChange={onChange} />
      <MonsterCardTypeFrSection options={options} onChange={onChange} />
      <MonsterTypeSection options={options} onChange={onChange} />
      <LevelSection options={options} onChange={onChange} />
      <ScaleSection options={options} onChange={onChange} />
      <LinkArrowsSection options={options} onChange={onChange} />
      <AtkDefSection options={options} onChange={onChange} />
    </VerticalStack>
  );
};
