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
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import './styles.css';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { ICard, TAttribute, TFrame, hasAbilities, hasPendulumFrame } from 'renderer/card-handler/ICard';
import { integer, isEmpty, isUndefined } from 'mn-toolkit/tools';
import { InplaceEdit } from 'mn-toolkit/inplaceEdit/InplaceEdit';
import lockOpen from '../resources/pictures/lock-open.svg';
import lockClosed from '../resources/pictures/lock-closed.svg';
import plus from '../resources/pictures/plus.svg';
import cross from '../resources/pictures/cross.svg';
import upArrow from '../resources/pictures/up-arrow.svg';
import downArrow from '../resources/pictures/down-arrow.svg';

interface EventTargetWithValue extends EventTarget {
  value: string;
}

interface ICardEditorProps extends IContainableProps {
  card: ICard;
  onCardChange: (card: ICard) => void;
}

interface ICardEditorState extends IContainableState {
  lockPend: boolean;
  card: ICard;
  cardFrames: {
    id: TFrame;
    file: string;
  }[];
  cardAttributes: {
    id: TAttribute;
    file: string;
  }[];
  selectedFrame: TFrame;
  selectedAbility: number;
}

export class CardEditor extends Containable<ICardEditorProps, ICardEditorState> {
  private debouncedOnCardChange: (card: ICard) => void;

  public constructor(props: ICardEditorProps) {
    super(props);
    this.debouncedOnCardChange = (card: ICard) => setTimeout(() => this.props.onCardChange(card), 500);

    this.state = {
      loaded: true,
      lockPend: props.card.scales.left === props.card.scales.right,
      card: props.card,
      cardFrames: [
        { id: 'normal', file: require(`../resources/pictures/card-frames/normal.png`) },
        { id: 'effect', file: require(`../resources/pictures/card-frames/effect.png`) },
        { id: 'ritual', file: require(`../resources/pictures/card-frames/ritual.png`) },
        { id: 'fusion', file: require(`../resources/pictures/card-frames/fusion.png`) },
        { id: 'synchro', file: require(`../resources/pictures/card-frames/synchro.png`) },
        { id: 'darkSynchro', file: require(`../resources/pictures/card-frames/darkSynchro.png`) },
        { id: 'xyz', file: require(`../resources/pictures/card-frames/xyz.png`) },
        { id: 'link', file: require(`../resources/pictures/card-frames/link.png`) },
        { id: 'obelisk', file: require(`../resources/pictures/card-frames/obelisk.png`) },
        { id: 'slifer', file: require(`../resources/pictures/card-frames/slifer.png`) },
        { id: 'ra', file: require(`../resources/pictures/card-frames/ra.png`) },
        { id: 'legendaryDragon', file: require(`../resources/pictures/card-frames/legendaryDragon.png`) },
        { id: 'spell', file: require(`../resources/pictures/card-frames/spell.png`) },
        { id: 'trap', file: require(`../resources/pictures/card-frames/trap.png`) },
        { id: 'monsterToken', file: require(`../resources/pictures/card-frames/monsterToken.png`) },
        { id: 'token', file: require(`../resources/pictures/card-frames/token.png`) },
        { id: 'skill', file: require(`../resources/pictures/card-frames/skill.png`) },
      ],
      cardAttributes: [
        { id: 'light', file: require(`../resources/pictures/icons/attributeLight.png`) },
        { id: 'dark', file: require(`../resources/pictures/icons/attributeDark.png`) },
        { id: 'water', file: require(`../resources/pictures/icons/attributeWater.png`) },
        { id: 'fire', file: require(`../resources/pictures/icons/attributeFire.png`) },
        { id: 'earth', file: require(`../resources/pictures/icons/attributeEarth.png`) },
        { id: 'wind', file: require(`../resources/pictures/icons/attributeWind.png`) },
        { id: 'divine', file: require(`../resources/pictures/icons/attributeDivine.png`) },
        { id: 'spell', file: require(`../resources/pictures/icons/attributeSpell.png`) },
        { id: 'trap', file: require(`../resources/pictures/icons/attributeTrap.png`) },
      ],
      selectedFrame: props.card.frame,
      selectedAbility: -1,
    }
  }

  public componentWillReceiveProps(nextProps: ICardEditorProps, _prevState: ICardEditorState) {
    this.setState({ card: nextProps.card });
  }

  public onFrameChange(frame: TFrame) {
    this.state.card.frame = frame;

    if (frame === 'spell') {
      this.state.card.attribute = 'spell';
    } else if (frame === 'trap') {
      this.state.card.attribute = 'trap';
    } else {
      if (this.state.card.attribute === 'spell' || this.state.card.attribute === 'trap') {
        this.state.card.attribute = 'dark';
      }
      if (this.state.card.level > 8 && frame === 'link') {
        this.state.card.level = 8;
      }
    }
    this.setState({ card: this.state.card });
    this.props.onCardChange(this.state.card);
  }

  public onAttributeChange(attribute: TAttribute) {
    this.state.card.attribute = attribute;
    this.setState({ card: this.state.card });
    this.props.onCardChange(this.state.card);
  }

  public onLevelChange(level: string, max: number) {
    if (isUndefined(level)) return;
    const levelNumber = integer(level);
    if (levelNumber > max) return;
    this.state.card.level = levelNumber;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  public onAtkChange(atk: string) {
    if (isUndefined(atk)) return;
    const atkNumber = integer(atk);
    if (atkNumber > 999999) return;
    this.state.card.atk = atkNumber;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  public onDefChange(def: string) {
    if (isUndefined(def)) return;
    const defNumber = integer(def);
    if (defNumber > 999999) return;
    this.state.card.def = defNumber;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onNameChange(name: string) {
    if (isUndefined(name)) return;
    this.state.card.name = name;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onDescChange(description: string) {
    if (isUndefined(description)) return;
    this.state.card.description = description;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onPendChange() {
    this.state.card.pendulum = !this.state.card.pendulum;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onPendLockChange() {
    const lockPend = !this.state.lockPend;
    this.setState({ lockPend });
    if (lockPend && this.state.card.scales.left !== this.state.card.scales.right) {
      this.state.card.scales.right = this.state.card.scales.left;
      this.setState({ card: this.state.card });
      this.props.onCardChange(this.state.card);
    }
  }

  public onLeftScaleChange(left: string) {
    if (isUndefined(left)) return;
    const leftNumber = integer(left);
    this.state.card.scales.left = leftNumber;
    if (this.state.lockPend) this.state.card.scales.right = leftNumber;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  public onRightScaleChange(right: string) {
    if (isUndefined(right)) return;
    const rightNumber = integer(right);
    this.state.card.scales.right = rightNumber;
    if (this.state.lockPend) this.state.card.scales.left = rightNumber;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onPendEffChange(pendEffect: string) {
    if (isUndefined(pendEffect)) return;
    this.state.card.pendEffect = pendEffect;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onCardSetChange(cardSet: string) {
    if (isUndefined(cardSet)) return;
    this.state.card.cardSet = cardSet;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onPasscodeChange(passcode: string) {
    if (isUndefined(passcode)) return;
    this.state.card.passcode = passcode;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onArtworkURLChange(path: string) {
    if (isEmpty(path)) return;
    this.state.card.artwork.url = path;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onAbilityChange(newValue: string, iAbility: number) {
    this.state.card.abilities[iAbility] = newValue;
    this.setState({ card: this.state.card });
    this.debouncedOnCardChange(this.state.card);
  }

  private onAddAbility() {
    if (this.state.selectedAbility === -1) {
      this.state.card.abilities.push('');
    } else {
      this.state.card.abilities.splice(this.state.selectedAbility + 1, 0, '');
    }
    this.setState({ card: this.state.card });
    this.props.onCardChange(this.state.card);
  }

  private onRemoveAbility() {
    if (this.state.selectedAbility === -1) return;
    this.state.card.abilities.splice(this.state.selectedAbility, 1);
    this.setState({ card: this.state.card, selectedAbility: -1 });
    this.props.onCardChange(this.state.card);
  }

  private onMoveAbilityUp() {
    if (this.state.selectedAbility < 1) return;
    const newIndex = this.state.selectedAbility - 1;
    let element = this.state.card.abilities[this.state.selectedAbility];
    this.state.card.abilities.splice(this.state.selectedAbility, 1);
    this.state.card.abilities.splice(newIndex, 0, element);
    this.setState({ card: this.state.card, selectedAbility: newIndex });
    this.props.onCardChange(this.state.card);
  }

  private onMoveAbilityDown() {
    if (this.state.selectedAbility === -1 || this.state.selectedAbility > this.state.card.attribute.length) return;
    const newIndex = this.state.selectedAbility + 1;
    let element = this.state.card.abilities[this.state.selectedAbility];
    this.state.card.abilities.splice(this.state.selectedAbility, 1);
    this.state.card.abilities.splice(newIndex, 0, element);
    this.setState({ card: this.state.card, selectedAbility: newIndex });
    this.props.onCardChange(this.state.card);
  }

  public render() {
    return this.renderAttributes(<VerticalStack scroll>
      {this.renderBasicCardDetails()}
      {hasAbilities(this.state.card) && this.renderMonsterCardDetails()}
      {hasPendulumFrame(this.state.card) && this.renderPendulumCardDetails()}
      {this.renderMiscDetails()}
    </VerticalStack>, 'card-editor');
  }

  private renderBasicCardDetails() {
    return this.renderAttributes(<VerticalStack>
      <VerticalStack className='section-header'>
        <p className='section-header-title'>Bases de la Carte</p>
      </VerticalStack>

      <HorizontalStack className='card-editor-sub-section card-name card-input-container'>
        <p className='editor-label name-label'>Nom</p>
        <input type='text' className='name-input card-input' value={this.state.card.name} onInput={e => this.onNameChange((e.target as EventTargetWithValue).value)} />
      </HorizontalStack>

      <HorizontalStack className='card-editor-sub-section card-artwork card-input-container'>
        <p className='editor-label artwork-label'>Image</p>
        <input type='text' className='artwork-input card-input' value={this.state.card.artwork.url} onInput={e => this.onArtworkURLChange((e.target as EventTargetWithValue).value)} />
        <button type='button' className='artwork-btn' onClick={() => document.getElementById('artwork-input')?.click()}>...</button>
        <input type='file' accept='image/*' id='artwork-input' className='artwork-hidden-input' onChange={e => this.onArtworkURLChange((e.target.files as FileList)[0].path)} />
      </HorizontalStack>

      <VerticalStack className='card-editor-sub-section card-description card-textarea'>
        <p className='editor-label description-label label-with-separator'>Description</p>
        <textarea className='description-input textarea-input' value={this.state.card.description} onInput={e => this.onDescChange((e.target as EventTargetWithValue).value)} />
      </VerticalStack>

      <VerticalStack className='card-editor-sub-section card-attributes'>
        <p className='editor-label attributes-label label-with-separator'>Icones</p>
        <HorizontalStack className='card-items card-attributes-icons'>
          {this.state.cardAttributes.map(attribute =>
            <HorizontalStack className='item-container card-attribute-container'>
              <img src={attribute.file}
                alt={`attribute-${attribute.id}`}
                className={`card-attribute${this.state.card.attribute === attribute.id ? ' selected' : ''}`}
                onClick={() => this.onAttributeChange(attribute.id)} />
            </HorizontalStack>
          )}
        </HorizontalStack>
      </VerticalStack>

      <VerticalStack className='card-editor-sub-section card-frames'>
        <p className='editor-label frames-label label-with-separator'>Types de carte</p>
        <HorizontalStack className='card-items card-frames-icons'>
          {this.state.cardFrames.map(frame =>
            <HorizontalStack className='item-container card-frame-container'>
              <img src={frame.file}
                alt={`frame-${frame.id}`}
                className={`card-frame${this.state.card.frame === frame.id ? ' selected' : ''}`}
                onClick={() => this.onFrameChange(frame.id)} />
            </HorizontalStack>
          )}
        </HorizontalStack>
      </VerticalStack>
    </VerticalStack>, 'card-editor-section basic-section');
  }

  private renderMonsterCardDetails() {
    let levelLabel: string;
    let max: number;
    // let levels = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    if (this.state.card.frame === 'link') {
      levelLabel = 'Classification Lien';
      max = 8
    } else {
      // levels = levels.concat([9, 10, 11, 12, 13]);
      max = 13;

      if (this.state.card.frame === 'xyz') {
        levelLabel = 'Rang';
      } else if (this.state.card.frame === 'darkSynchro') {
        levelLabel = 'Niveau Négatif';
      } else {
        levelLabel = 'Niveau';
      }
    }

    return this.renderAttributes(<VerticalStack>
      <VerticalStack className='section-header'>
        <p className='section-header-title'>Détails de la Carte Monstre</p>
      </VerticalStack>

      <HorizontalStack className='card-editor-sub-section level-and-pend-section'>
        <HorizontalStack className='card-level card-input-container'>
          <p className='editor-label level-label'>{levelLabel}</p>
          <input type='number' min={0} max={max} className='level-input card-input' value={this.state.card.level} onInput={e => this.onLevelChange((e.target as EventTargetWithValue).value, max)} />
        </HorizontalStack>

        <HorizontalStack className='card-pendulum card-input-container'>
          <input type='checkbox' className='pendulum-input card-input' defaultChecked={this.state.card.pendulum} onInput={() => this.onPendChange()} />
          <p className='editor-label pendulum-label'>Pendule</p>
        </HorizontalStack>
      </HorizontalStack>

      <VerticalStack className='card-editor-sub-section abilities-section'>
        <HorizontalStack className='abilities-edit-buttons'>
          <button type='button' className='abilities-edit-btn add-btn' onClick={() => this.onAddAbility()}>
            <img src={plus} alt='lock' />
          </button>

          <button type='button' className='abilities-edit-btn delete-btn' onClick={() => this.onRemoveAbility()}>
            <img src={cross} alt='lock' />
          </button>

          <button type='button' className='abilities-edit-btn up-btn' onClick={() => this.onMoveAbilityUp()}>
            <img src={upArrow} alt='lock' />
          </button>

          <button type='button' className='abilities-edit-btn down-btn' onClick={() => this.onMoveAbilityDown()}>
            <img src={downArrow} alt='lock' />
          </button>
        </HorizontalStack>

        <VerticalStack className='abilities-list'>
          {this.state.card.abilities.map((ability, iAbility) => {
            return <InplaceEdit
              key={`${iAbility}-${ability}`}
              className={`ability-input card-input ${iAbility === this.state.selectedAbility ? 'selected' : ''}`}
              value={ability}
              onSingleClick={() => this.setState({ selectedAbility: iAbility === this.state.selectedAbility ? -1 : iAbility })}
              onChange={newValue => this.onAbilityChange(newValue, iAbility)} />
          })}
        </VerticalStack>
      </VerticalStack>

      <HorizontalStack className='card-editor-sub-section atk-def-section'>
        <HorizontalStack className='card-stats card-atk card-input-container'>
          <p className='editor-label atk-label'>ATK</p>
          <input type='number' min={0} max={999999} className='atk-input card-input' value={this.state.card.atk} onInput={e => this.onAtkChange((e.target as EventTargetWithValue).value)} />
        </HorizontalStack>

        <VerticalStack className='separator-container' fill />

        {this.state.card.frame !== 'link' && <HorizontalStack className='card-stats card-def card-input-container'>
          <p className='editor-label def-label'>DEF</p>
          <input readOnly={this.state.lockPend} type='number' min={0} max={999999} className='def-input card-input' value={this.state.card.def} onInput={e => this.onDefChange((e.target as EventTargetWithValue).value)} />
        </HorizontalStack>}
      </HorizontalStack>
    </VerticalStack>, 'card-editor-section abilities-section');
  }

  private renderPendulumCardDetails() {
    let lockBtnClass = 'pend-lock';
    let lockSVG: string;
    if (this.state.lockPend) {
      lockSVG = lockClosed;
      lockBtnClass = `${lockBtnClass} lock-closed`;
    } else {
      lockSVG = lockOpen;
      lockBtnClass = `${lockBtnClass} lock-opened`;
    }

    return this.renderAttributes(<VerticalStack>
      <VerticalStack className='section-header'>
        <p className='section-header-title'>Détails de la Carte Pendule</p>
      </VerticalStack>

      <HorizontalStack className='card-editor-sub-section scales-section'>
        <HorizontalStack className='card-scale card-left-scale card-input-container'>
          <p className='editor-label scale-label'>Échelle Gauche</p>
          <input type='number' min={0} max={13} className='scale-input card-input' value={this.state.card.scales.left} onInput={e => this.onLeftScaleChange((e.target as EventTargetWithValue).value)} />
        </HorizontalStack>

        <VerticalStack className='separator-container pend-lock-container' fill>
          <button type='button' className={lockBtnClass} onClick={() => this.onPendLockChange()}>
            <img src={lockSVG} alt='lock' />
          </button>
        </VerticalStack>

        <HorizontalStack className='card-scale card-right-scale card-input-container'>
          <p className='editor-label scale-label'>Échelle Droite</p>
          <input readOnly={this.state.lockPend} type='number' min={0} max={13} className='scale-input card-input' value={this.state.card.scales.right} onInput={e => this.onRightScaleChange((e.target as EventTargetWithValue).value)} />
        </HorizontalStack>
      </HorizontalStack>

      <VerticalStack className='card-editor-sub-section card-pendulum-effect card-textarea'>
        <p className='editor-label pendulum-effect-label label-with-separator'>Effet Pendule</p>
        <textarea className='pendulum-effect-input textarea-input' value={this.state.card.pendEffect} onInput={e => this.onPendEffChange((e.target as EventTargetWithValue).value)} />
      </VerticalStack>
    </VerticalStack>, 'card-editor-section pendulum-section');
  }

  private renderMiscDetails() {
    return this.renderAttributes(<VerticalStack>
      <VerticalStack className='section-header'>
        <p className='section-header-title'>Détails Divers</p>
      </VerticalStack>

      <HorizontalStack className='card-editor-sub-section card-card-set card-input-container'>
        <p className='editor-label card-set-label'>Set</p>
        <input type='text' className='card-set-input card-input' value={this.state.card.cardSet} onInput={e => this.onCardSetChange((e.target as EventTargetWithValue).value)} />
      </HorizontalStack>

      <HorizontalStack className='card-editor-sub-section card-passcode card-input-container'>
        <p className='editor-label passcode-label'>Code</p>
        <input type='text' pattern='\d*' maxLength={8} className='passcode-input card-input' value={this.state.card.passcode} onInput={e => this.onPasscodeChange((e.target as EventTargetWithValue).value)} />
      </HorizontalStack>
    </VerticalStack>, 'card-editor-section misc-section');
  }
};
