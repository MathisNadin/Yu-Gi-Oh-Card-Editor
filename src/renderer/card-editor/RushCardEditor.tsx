/* eslint-disable import/order */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-lonely-if */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable prefer-destructuring */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable global-require */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/sort-comp */
/* eslint-disable react/static-property-placement */
/* eslint-disable no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable no-useless-constructor */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import './styles.css';
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { ICard, TAttribute, TCardLanguage, TEdition, TFrame, TLegendType, TNameStyle, TRushTextMode, TStIcon, TSticker } from 'renderer/card/card-interfaces';
import { classNames, debounce, integer, isEmpty, isUndefined } from 'mn-toolkit/tools';
import { InplaceEdit } from 'mn-toolkit/inplaceEdit/InplaceEdit';
import { Dropdown } from 'mn-toolkit/dropdown/Dropdown';
import { EventTargetWithValue } from 'mn-toolkit/container/Container';
import { ArtworkEditDialog, IArtworkEditDialogResult } from 'renderer/artwork-edit-dialog/ArtworkEditDialog';
import plus from '../resources/pictures/plus.svg';
import cross from '../resources/pictures/cross.svg';
import upArrow from '../resources/pictures/up-arrow.svg';
import downArrow from '../resources/pictures/down-arrow.svg';

interface IRushCardEditorProps extends IContainableProps {
  card: ICard;
  onCardChange: (card: ICard) => void;
}

interface IRushCardEditorState extends IContainableState {
  import: string;
  card: ICard;
  cardFrames: {
    id: TFrame;
    file: string;
  }[];
  cardAttributes: {
    id: TAttribute;
    file: string;
  }[];
  cardStTypes: {
    id: TStIcon;
    file: string;
  }[];
  appVersion: string;
}

export class RushCardEditor extends Containable<IRushCardEditorProps, IRushCardEditorState> {
  private debouncedOnCardChange: (card: ICard) => void;

  public constructor(props: IRushCardEditorProps) {
    super(props);
    this.debouncedOnCardChange = debounce((card: ICard) => this.props.onCardChange(card), 100);

    this.state = {
      loaded: true,
      import: '',
      card: props.card,
      cardFrames: [
        { id: 'normal', file: require(`../resources/pictures/rd-card-frames/normal.png`) },
        { id: 'effect', file: require(`../resources/pictures/rd-card-frames/effect.png`) },
        { id: 'ritual', file: require(`../resources/pictures/rd-card-frames/ritual.png`) },
        { id: 'fusion', file: require(`../resources/pictures/rd-card-frames/fusion.png`) },
        { id: 'synchro', file: require(`../resources/pictures/rd-card-frames/synchro.png`) },
        { id: 'xyz', file: require(`../resources/pictures/rd-card-frames/xyz.png`) },
        { id: 'spell', file: require(`../resources/pictures/rd-card-frames/spell.png`) },
        { id: 'trap', file: require(`../resources/pictures/rd-card-frames/trap.png`) },
        { id: 'monsterToken', file: require(`../resources/pictures/rd-card-frames/monsterToken.png`) },
        { id: 'token', file: require(`../resources/pictures/rd-card-frames/token.png`) },
      ],
      cardAttributes: [
        { id: 'light', file: require(`../resources/pictures/rd-icons/vanilla/attributeLight.png`) },
        { id: 'dark', file: require(`../resources/pictures/rd-icons/vanilla/attributeDark.png`) },
        { id: 'water', file: require(`../resources/pictures/rd-icons/vanilla/attributeWater.png`) },
        { id: 'fire', file: require(`../resources/pictures/rd-icons/vanilla/attributeFire.png`) },
        { id: 'earth', file: require(`../resources/pictures/rd-icons/vanilla/attributeEarth.png`) },
        { id: 'wind', file: require(`../resources/pictures/rd-icons/vanilla/attributeWind.png`) },
        { id: 'spell', file: require(`../resources/pictures/rd-icons/vanilla/attributeSpell.png`) },
        { id: 'trap', file: require(`../resources/pictures/rd-icons/vanilla/attributeTrap.png`) },
      ],
      cardStTypes: [
        { id: 'normal', file: require(`../resources/pictures/rd-icons/st/normal.png`) },
        { id: 'ritual', file: require(`../resources/pictures/rd-icons/st/ritual.png`) },
        { id: 'quickplay', file: require(`../resources/pictures/rd-icons/st/quickplay.png`) },
        { id: 'continuous', file: require(`../resources/pictures/rd-icons/st/continuous.png`) },
        { id: 'equip', file: require(`../resources/pictures/rd-icons/st/equip.png`) },
        { id: 'field', file: require(`../resources/pictures/rd-icons/st/field.png`) },
        { id: 'counter', file: require(`../resources/pictures/rd-icons/st/counter.png`) },
      ],
      appVersion: '',
    };

    app.$errorManager.handlePromise(this.setAppVersion());
  }

  private async setAppVersion() {
    const appVersion = await window.electron.ipcRenderer.getAppVersion();
    this.setState({ appVersion: `v. ${appVersion}` });
  }

  public componentWillReceiveProps(nextProps: IRushCardEditorProps, _prevState: IRushCardEditorState) {
    this.setState({ card: nextProps.card });
  }

  private onLanguageChange(language: TCardLanguage) {
    this.state.card.language = language;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMultipleFramesChange() {
    let card = this.state.card;
    card.multipleFrames = !card.multipleFrames;
    if (card.frames.length > 1) {
      card.frames = [card.frames[0]];
    }
    this.setState({ card });
    this.debouncedOnCardChange(this.state.card);
  }

  public onFrameChange(frame: TFrame) {
    if (this.state.card.frames.includes(frame)) {
      if (this.state.card.frames.length > 1) {
        this.state.card.frames = this.state.card.frames.filter(f => f !== frame);
        this.forceUpdate();
        this.debouncedOnCardChange(this.state.card);
      }
    }
    else {
      if (this.state.card.multipleFrames) {
        this.state.card.frames.push(frame);
      } else {
        this.state.card.frames = [frame];
      }

      if (frame === 'spell') {
        this.state.card.attribute = 'spell';
      } else if (frame === 'trap') {
        this.state.card.attribute = 'trap';
      } else if (this.state.card.attribute === 'spell' || this.state.card.attribute === 'trap') {
        this.state.card.attribute = 'dark';
      }

      this.forceUpdate();
      this.debouncedOnCardChange(this.state.card);
    }
  }

  public onAttributeChange(attribute: TAttribute) {
    this.state.card.attribute = attribute;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onNameStyleChange(nameStyle: TNameStyle) {
    this.state.card.nameStyle = nameStyle;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onStTypeChange(stType: TStIcon) {
    this.state.card.stType = stType;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onLevelChange(level: string, max: number) {
    if (isUndefined(level)) return;
    const levelNumber = integer(level);
    if (levelNumber > max) return;
    this.state.card.level = levelNumber;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMaximumChange() {
    this.state.card.maximum = !this.state.card.maximum;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onAtkMaxChange(atkMax: string) {
    if (isUndefined(atkMax) || atkMax.length > 6) return;
    if (atkMax && atkMax !== '?' && integer(atkMax) === 0) atkMax = '0';
    this.state.card.atkMax = atkMax;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onAtkChange(atk: string) {
    if (isUndefined(atk) || atk.length > 6) return;
    if (atk && atk !== '?' && integer(atk) === 0) atk = '0';
    this.state.card.atk = atk;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onDefChange(def: string) {
    if (isUndefined(def) || def.length > 6) return;
    if (def && def !== '?' && integer(def) === 0) def = '0';
    this.state.card.def = def;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onNameChange(name: string) {
    if (isUndefined(name)) return;
    this.state.card.name = name;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onDescChange(description: string) {
    if (isUndefined(description)) return;
    this.state.card.description = description;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onDontCoverRushArtChange() {
    this.state.card.dontCoverRushArt = !this.state.card.dontCoverRushArt;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onLegendChange() {
    this.state.card.legend = !this.state.card.legend;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onLegendTypeChange(legendType: TLegendType) {
    this.state.card.legendType = legendType;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onRushTextModeChange(rushTextMode: TRushTextMode) {
    this.state.card.rushTextMode = rushTextMode;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onRushOtherEffectsChange(rushOtherEffects: string) {
    if (isUndefined(rushOtherEffects)) return;
    this.state.card.rushOtherEffects = rushOtherEffects;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onRushConditionChange(rushCondition: string) {
    if (isUndefined(rushCondition)) return;
    this.state.card.rushCondition = rushCondition;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onRushEffectChange(rushEffect: string) {
    if (isUndefined(rushEffect)) return;
    this.state.card.rushEffect = rushEffect;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onCardSetChange(cardSet: string) {
    if (isUndefined(cardSet)) return;
    this.state.card.cardSet = cardSet;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onArtworkInfoChange(infos: IArtworkEditDialogResult) {
    if (isEmpty(infos?.url)) return;
    this.state.card.artwork = {
      url: infos.url,
      x: infos.crop?.x,
      y: infos.crop?.y,
      height: infos.crop?.height,
      width: infos.crop?.width,
      pendulum: this.state.card.artwork.pendulum,
      keepRatio: infos.keepRatio
    }
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onArtworkURLChange(url: string) {
    if (isEmpty(url)) return;
    this.state.card.artwork = {
      url,
      x: 0,
      y: 0,
      height: 100,
      width: 100,
      pendulum: false,
      keepRatio: false
    }
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onRushChoiceEffectsChange(newValue: string, iChoiceEffect: number) {
    this.state.card.rushChoiceEffects[iChoiceEffect] = newValue;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onAbilityChange(newValue: string, iAbility: number) {
    this.state.card.abilities[iAbility] = newValue;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onAddAbility() {
    this.state.card.abilities.push('');
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onRemoveAbility(index: number) {
    this.state.card.abilities.splice(index, 1);
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMoveAbilityUp(index: number) {
    if (index === 0) return;
    const newIndex = index - 1;
    let element = this.state.card.abilities[index];
    this.state.card.abilities.splice(index, 1);
    this.state.card.abilities.splice(newIndex, 0, element);
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMoveAbilityDown(index: number) {
    if (index === this.state.card.abilities.length-1) return;
    const newIndex = index + 1;
    let element = this.state.card.abilities[index];
    this.state.card.abilities.splice(index, 1);
    this.state.card.abilities.splice(newIndex, 0, element);
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onEditionChange(edition: TEdition) {
    this.state.card.edition = edition;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onStickerChange(sticker: TSticker) {
    this.state.card.sticker = sticker;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onCopyrightChange() {
    this.state.card.hasCopyright = !this.state.card.hasCopyright;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onOldCopyrightChange() {
    this.state.card.oldCopyright = !this.state.card.oldCopyright;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private async showArtworkPopup() {
    let result = await app.$popup.show<IArtworkEditDialogResult>({
      id: 'edit-popup',
      title: "Édition de l'image",
      innerHeight: '70%',
      innerWidth: '70%',
      content: <ArtworkEditDialog
        artworkURL={this.state.card.artwork.url}
        crop={{
          x: this.state.card.artwork.x,
          y: this.state.card.artwork.y,
          height: this.state.card.artwork.height,
          width: this.state.card.artwork.width,
          unit: '%'
        }}
        keepRatio={this.state.card.artwork.keepRatio}
        pendulumRatio={this.state.card.pendulum && !this.state.card.artwork.pendulum}
        hasPendulumFrame={app.$card.hasPendulumFrame(this.state.card)}
        hasLinkFrame={this.state.card.frames.includes('link')} />
    });
    if (result) this.onArtworkInfoChange(result);
  }

  public render() {
    return this.renderAttributes(<VerticalStack scroll>
      {this.renderBasicCardDetails()}
      {app.$card.hasAbilities(this.state.card) && this.renderMonsterCardDetails()}
      {this.renderMiscDetails()}
      <p className='app-version'>{this.state.appVersion}</p>
    </VerticalStack>, 'card-editor');
  }

  private renderBasicCardDetails() {
    return this.renderAttributes(<VerticalStack>
      <HorizontalStack className='card-editor-full-width-section'>
        <VerticalStack className='card-editor-vertical-section card-name card-input-container'>
          <p className='editor-label name-label'>Nom</p>
          <input type='text' className='name-input card-input' value={this.state.card.name} onInput={e => this.onNameChange((e.target as EventTargetWithValue).value)} />
        </VerticalStack>

        {!app.$card.tempCurrentCard && <p className='reset-current-card-btn' onClick={() => app.$errorManager.handlePromise(app.$card.resetCurrentCard())}>Réinitialiser</p>}
      </HorizontalStack>

      <HorizontalStack className='card-editor-full-width-section'>
        <VerticalStack className='card-editor-vertical-section card-name-style card-input-container'>
          <p className='editor-label card-name-style-label'>Rareté</p>
          <Dropdown<TNameStyle>
            className='card-name-style-dropdown'
            options={[
              'default',
              'white',
              'black',
              'yellow',
              'gold',
              'silver',
              'rare',
              'ultra',
              'secret'
            ]}
            optionsLabel={[
              'Par défaut',
              'Blanc',
              'Noir',
              'Jaune',
              'Or',
              'Argent',
              'Rare',
              'Ultra Rare',
              'Secret Rare'
            ]}
            defaultOption={this.state.card.nameStyle}
            onSelect={value => this.onNameStyleChange(value)} />
        </VerticalStack>

        <VerticalStack className='card-editor-vertical-section card-language card-input-container'>
          <p className='editor-label card-language-label'>Langue</p>
          <Dropdown<TCardLanguage>
            className='card-language-dropdown'
            options={[
              'fr',
              'en'
            ]}
            optionsLabel={[
              'Français',
              'Anglais'
            ]}
            defaultOption={this.state.card.language}
            onSelect={value => this.onLanguageChange(value)} />
        </VerticalStack>
      </HorizontalStack>

      <VerticalStack className='card-editor-full-width-section card-editor-vertical-section card-artwork card-input-container'>
        <p className='editor-label artwork-label'>Image</p>

        <HorizontalStack>
          <input type='text' className='artwork-input card-input' value={this.state.card.artwork.url} onInput={e => this.onArtworkURLChange((e.target as EventTargetWithValue).value)} />
          <button type='button' className='artwork-btn' onClick={() => this.showArtworkPopup()}>...</button>
        </HorizontalStack>
      </VerticalStack>

      <VerticalStack className='card-editor-full-width-section card-editor-vertical-section card-frames card-input-container'>
        <HorizontalStack className='card-frames-labels with-label-separator'>
          <p className='editor-label frames-label'>Bordures</p>

          <HorizontalStack className='card-multiple-frames card-input-container'>
            <input type='checkbox' className='multiple-frames-input card-input' checked={this.state.card.multipleFrames} onChange={() => this.onMultipleFramesChange()} />
            <p className='editor-sub-label multiple-frames-label'>Cumuler</p>
          </HorizontalStack>
        </HorizontalStack>

        <HorizontalStack className='card-items card-frames-icons'>
          {this.state.cardFrames.map(frame => {
            let className = 'item-container card-frame-container';
            let frameIndex = this.state.card.frames.indexOf(frame.id);
            if (frameIndex >= 0) {
              className = `${className} selected`;
              if (this.state.card.multipleFrames) {
                className = `${className} selected-${frameIndex + 1}`;
              }
            }
            return <HorizontalStack className={className}>
              <img src={frame.file}
                alt={`frame-${frame.id}`}
                title={app.$card.getFrameName(frame.id)}
                className='card-frame'
                onClick={() => this.onFrameChange(frame.id)} />
            </HorizontalStack>;
            }
          )}
        </HorizontalStack>
      </VerticalStack>

      {!app.$card.isOnlySkill(this.state.card) && <VerticalStack className='card-editor-full-width-section card-editor-vertical-section card-attributes card-input-container'>
        <p className='editor-label attributes-label'>Icones</p>

        <HorizontalStack className='card-items card-attributes-icons'>
          {this.state.cardAttributes.map(attribute =>
            <HorizontalStack className='item-container card-attribute-container'>
              <img src={attribute.file}
                alt={`attribute-${attribute.id}`}
                title={app.$card.getAttributeName(attribute.id)}
                className={`card-attribute${this.state.card.attribute === attribute.id ? ' selected' : ''}`}
                onClick={() => this.onAttributeChange(attribute.id)} />
            </HorizontalStack>
          )}
        </HorizontalStack>
      </VerticalStack>}

      {app.$card.isBackrow(this.state.card) &&
        <VerticalStack className='card-editor-full-width-section card-editor-vertical-section card-st-icons card-input-container'>
          <p className='editor-label st-icons-label label-with-separator with-label-separator'>Type de Magie/Piège</p>

          <HorizontalStack className='card-items card-st-icons-icons'>
            {this.state.cardStTypes.map(stType =>
              <HorizontalStack className='item-container card-st-icon-container'>
                <img src={stType.file}
                  alt={`st-icon-${stType.id}`}
                  title={app.$card.getStIconName(stType.id)}
                  className={classNames('card-st-icon', { 'selected': this.state.card.stType === stType.id })}
                  onClick={() => this.onStTypeChange(stType.id)} />
              </HorizontalStack>
            )}
          </HorizontalStack>
      </VerticalStack>}

      <VerticalStack className='card-editor-full-width-section card-editor-vertical-section card-description card-input-container'>
        <p className='editor-label description-label label-with-separator'>Description</p>
        <textarea
          spellCheck={false}
          className='description-input textarea-input'
          value={this.state.card.description}
          onInput={e => this.onDescChange((e.target as EventTargetWithValue).value)}
        />
      </VerticalStack>
    </VerticalStack>, 'card-editor-section basic-section');
  }

  private renderMonsterCardDetails() {
    let levelLabel: string;
    let max: number;
    if (this.state.card.frames.includes('link')) {
      levelLabel = 'Classification Lien';
      max = 8
    } else {
      max = 13;

      let includesOther = false;
      let includesDarkSynchro = false;
      for (let frame of this.state.card.frames) {
        if (frame !== 'xyz') {
          if (frame === 'darkSynchro') {
            includesDarkSynchro = true;
          } else {
            includesOther = true;
          }
        }
      }

      if (includesOther) {
        levelLabel = 'Niveau';
      } else if (includesDarkSynchro) {
        levelLabel = 'Niveau Négatif';
      } else {
        levelLabel = 'Rang';
      }
    }

    return this.renderAttributes(<VerticalStack>
      <HorizontalStack className='card-editor-full-width-section'>
        <input type='checkbox' className='dont-coder-rush-art-input card-input' checked={this.state.card.dontCoverRushArt} onChange={() => this.onDontCoverRushArtChange()} />
        <p className='editor-label dont-coder-rush-art-label'>Ne pas couvrir l'artwork</p>
      </HorizontalStack>

      {!this.state.card.dontCoverRushArt && <HorizontalStack className='card-editor-full-width-section'>
        <input type='checkbox' className='legend-input card-input' checked={this.state.card.legend} onChange={() => this.onLegendChange()} />
        <p className='editor-label legend-label'>LEGEND</p>

        {this.state.card.legend && <VerticalStack className='card-editor-vertical-section card-legend-type card-input-container'>
          <p className='editor-label card-legend-type-label'>Type de LEGEND</p>
          <Dropdown<TLegendType>
            className='card-legend-type-dropdown'
            options={[
              'gold',
              'goldFoil',
              'silver',
              'silverFoil'
            ]}
            optionsLabel={[
              'Or',
              'Or Foil',
              'Argent',
              'Argent Foil'
            ]}
            defaultOption={this.state.card.legendType}
            onSelect={value => this.onLegendTypeChange(value)} />
        </VerticalStack>}
      </HorizontalStack>}

      {!this.state.card.dontCoverRushArt && <HorizontalStack className='card-editor-full-width-section'>
        <VerticalStack className='card-editor-vertical-section card-level card-input-container'>
          <p className='editor-label level-label'>{levelLabel}</p>
          <input
            type='number'
            min={0}
            max={max}
            className='level-input card-input'
            value={this.state.card.level}
            onInput={e => this.onLevelChange((e.target as EventTargetWithValue).value, max)}
          />
        </VerticalStack>

        <VerticalStack className='card-editor-vertical-section card-stats card-atk card-input-container'>
          <p className='editor-label atk-label'>ATK</p>
          <input type='text' className='atk-input card-input' value={this.state.card.atk} onInput={e => this.onAtkChange((e.target as EventTargetWithValue).value)} />
        </VerticalStack>

        <VerticalStack className='card-editor-vertical-section card-stats card-def card-input-container'>
           <p className='editor-label def-label'>DEF</p>
          <input type='text' className='def-input card-input' value={this.state.card.def} onInput={e => this.onDefChange((e.target as EventTargetWithValue).value)} />
        </VerticalStack>
      </HorizontalStack>}

      {!this.state.card.dontCoverRushArt && <HorizontalStack className='card-editor-full-width-section'>
        <input type='checkbox' className='maximum-input card-input' checked={this.state.card.maximum} onChange={() => this.onMaximumChange()} />
        <p className='editor-label atk-max-label'>ATK MAX</p>
        {this.state.card.maximum && <input type='text' className='atk-max-input card-input' value={this.state.card.atkMax} onInput={e => this.onAtkMaxChange((e.target as EventTargetWithValue).value)} />}
      </HorizontalStack>}

      <VerticalStack className='card-editor-full-width-section card-editor-vertical-section card-abilities card-input-container'>
        <p className='editor-label abilities-label'>Types</p>

        <VerticalStack className='abilities-list'>
          {this.state.card.abilities.map((ability, iAbility) => {
            return <HorizontalStack className='ability-line'>
              <InplaceEdit
                focusOnSingleClick
                validateOnEnter
                key={`${iAbility}-${ability}`}
                className='ability-input card-input'
                value={ability}
                onChange={newValue => this.onAbilityChange(newValue, iAbility)}
              />

              <HorizontalStack className='ability-edit-buttons'>
                <button type='button' className='ability-btn ability-edit-btn delete-btn' onClick={() => this.onRemoveAbility(iAbility)}>
                  <img src={cross} alt='lock' />
                </button>

                <button type='button' className='ability-btn ability-edit-btn up-btn' onClick={() => this.onMoveAbilityUp(iAbility)}>
                  <img src={upArrow} alt='lock' />
                </button>

                <button type='button' className='ability-btn ability-edit-btn down-btn' onClick={() => this.onMoveAbilityDown(iAbility)}>
                  <img src={downArrow} alt='lock' />
                </button>
              </HorizontalStack>
            </HorizontalStack>
          })}

          <button type='button' className='ability-btn ability-add-btn' onClick={() => this.onAddAbility()}>
            <img src={plus} alt='lock' />
          </button>
        </VerticalStack>
      </VerticalStack>
    </VerticalStack>, 'card-editor-section abilities-section');
  }

  private renderMiscDetails() {
    return this.renderAttributes(<VerticalStack>
      <HorizontalStack className='card-editor-full-width-section'>
        <VerticalStack className='card-editor-vertical-section card-set card-input-container'>
          <p className='editor-label card-set-label'>Set</p>
          <input
            type='text'
            className='card-set-input card-input'
            value={this.state.card.cardSet}
            onInput={e => this.onCardSetChange((e.target as EventTargetWithValue).value)}
          />
        </VerticalStack>

        <VerticalStack className='card-editor-vertical-section card-edition card-input-container'>
          <p className='editor-label card-edition-label'>Édition</p>
          <Dropdown<TEdition>
            className='card-edition-dropdown'
            options={[
              'unlimited',
              'firstEdition',
              'limited',
              'forbidden',
              'duelTerminal',
              'anime'
            ]}
            optionsLabel={[
              'Aucune',
              '1ère Édition',
              'Édition Limitée',
              'Interdite',
              'Duel Terminal',
              'Édition Anime'
            ]}
            defaultOption={this.state.card.edition}
            onSelect={value => this.onEditionChange(value)} />
        </VerticalStack>
      </HorizontalStack>

      <HorizontalStack className='card-editor-full-width-section'>
        <VerticalStack className='card-editor-vertical-section card-sticker card-input-container'>
          <p className='editor-label card-edition-label'>Sticker</p>
          <Dropdown<TSticker>
            className='card-edition-dropdown'
            options={[
              'none',
              'silver',
              'gold',
              'grey',
              'white',
              'lightBlue',
              'skyBlue',
              'cyan',
              'aqua',
              'green'
            ]}
            optionsLabel={[
              'Aucun',
              'Argent',
              'Or',
              'Gris',
              'Blanc',
              'Bleu clair',
              'Bleu ciel',
              'Cyan',
              'Aqua',
              'Vert'
            ]}
            defaultOption={this.state.card.sticker}
            onSelect={value => this.onStickerChange(value)} />
        </VerticalStack>

        <HorizontalStack className='card-copyright card-copyright-new card-input-container'>
          <input type='checkbox' className='copyright-input card-input' checked={this.state.card.hasCopyright} onChange={() => this.onCopyrightChange()} />
          <p className='editor-label copyright-label'>Copyright</p>
        </HorizontalStack>

        <HorizontalStack className='card-copyright card-copyright-old card-input-container'>
          <input type='checkbox' className='copyright-old-input card-input' checked={this.state.card.oldCopyright} onChange={() => this.onOldCopyrightChange()} />
          <p className='editor-label copyright-old-label'>1996</p>
        </HorizontalStack>
      </HorizontalStack>
    </VerticalStack>, 'card-editor-section misc-section');
  }
};
