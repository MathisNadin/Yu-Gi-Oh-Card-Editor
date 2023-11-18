import './styles.css';
import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { ICard, TAttribute, TCardLanguage, TEdition, TFrame, TLinkArrows, TNameStyle, TStIcon, TSticker } from 'renderer/card/card-interfaces';
import { classNames, debounce, integer, isEmpty, isUndefined } from 'libraries/mn-tools';
import { InplaceEdit } from 'libraries/mn-toolkit/inplaceEdit/InplaceEdit';
import { Dropdown } from 'libraries/mn-toolkit/dropdown/Dropdown';
import { EventTargetWithValue } from 'libraries/mn-toolkit/container/Container';
import { ArtworkEditDialog, IArtworkEditDialogResult } from 'renderer/artwork-edit-dialog/ArtworkEditDialog';
import lockOpen from '../resources/pictures/lock-open.svg';
import lockClosed from '../resources/pictures/lock-closed.svg';
import plus from '../resources/pictures/plus.svg';
import cross from '../resources/pictures/cross.svg';
import upArrow from '../resources/pictures/up-arrow.svg';
import downArrow from '../resources/pictures/down-arrow.svg';
import triangle from '../resources/pictures/triangle.svg';
import triangleRed from '../resources/pictures/triangle-red.svg';
import { Typography } from 'libraries/mn-toolkit/typography/Typography';
import { TextInput } from 'libraries/mn-toolkit/text-input/TextInput';
import { Button, ButtonIcon } from 'libraries/mn-toolkit/button';
import { Spacer } from 'libraries/mn-toolkit/spacer/Spacer';
import { Icon } from 'libraries/mn-toolkit/icon';
import { Select } from 'libraries/mn-toolkit/select/Select';
import { FileInput } from 'libraries/mn-toolkit/file-input/FileInput';
import { CheckBox } from 'libraries/mn-toolkit/checkbox/Checkbox';
import { Grid } from 'libraries/mn-toolkit/container/Grid';
import { Image } from 'libraries/mn-toolkit/image/Image';
import { TextAreaInput } from 'libraries/mn-toolkit/text-area-input/TextAreaInput';
import { NumberInput } from 'libraries/mn-toolkit/number-input/NumberInput';

interface ICardEditorProps extends IContainableProps {
  card: ICard;
  onCardChange: (card: ICard) => void;
}

interface ICardEditorState extends IContainableState {
  import: string;
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
  cardStTypes: {
    id: TStIcon;
    file: string;
  }[];
  appVersion: string;
}

export class CardEditor extends Containable<ICardEditorProps, ICardEditorState> {
  private debouncedOnCardChange: (card: ICard) => void;

  public constructor(props: ICardEditorProps) {
    super(props);
    this.debouncedOnCardChange = debounce((card: ICard) => this.props.onCardChange(card), 100);

    this.state = {
      loaded: true,
      import: '',
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
        { id: 'light', file: require(`../resources/pictures/icons/vanilla/attributeLight.png`) },
        { id: 'dark', file: require(`../resources/pictures/icons/vanilla/attributeDark.png`) },
        { id: 'water', file: require(`../resources/pictures/icons/vanilla/attributeWater.png`) },
        { id: 'fire', file: require(`../resources/pictures/icons/vanilla/attributeFire.png`) },
        { id: 'earth', file: require(`../resources/pictures/icons/vanilla/attributeEarth.png`) },
        { id: 'wind', file: require(`../resources/pictures/icons/vanilla/attributeWind.png`) },
        { id: 'divine', file: require(`../resources/pictures/icons/vanilla/attributeDivine.png`) },
        { id: 'spell', file: require(`../resources/pictures/icons/vanilla/attributeSpell.png`) },
        { id: 'trap', file: require(`../resources/pictures/icons/vanilla/attributeTrap.png`) },
      ],
      cardStTypes: [
        { id: 'normal', file: require(`../resources/pictures/icons/st/normal.png`) },
        { id: 'ritual', file: require(`../resources/pictures/icons/st/ritual.png`) },
        { id: 'quickplay', file: require(`../resources/pictures/icons/st/quickplay.png`) },
        { id: 'continuous', file: require(`../resources/pictures/icons/st/continuous.png`) },
        { id: 'equip', file: require(`../resources/pictures/icons/st/equip.png`) },
        { id: 'field', file: require(`../resources/pictures/icons/st/field.png`) },
        { id: 'counter', file: require(`../resources/pictures/icons/st/counter.png`) },
        { id: 'link', file: require(`../resources/pictures/icons/st/link.png`) },
      ],
      appVersion: '',
    };

    app.$errorManager.handlePromise(this.setAppVersion());
  }

  private async setAppVersion() {
    const appVersion = await window.electron.ipcRenderer.getAppVersion();
    this.setState({ appVersion: `v. ${appVersion}` });
  }

  public componentWillReceiveProps(nextProps: ICardEditorProps, _prevState: ICardEditorState) {
    this.setState({ card: nextProps.card });
  }

  private onLanguageChange(language: TCardLanguage) {
    this.state.card.language = language;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onNoTextAttributeChange() {
    this.state.card.noTextAttribute = !this.state.card.noTextAttribute;
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
      } else {
        if (this.state.card.attribute === 'spell' || this.state.card.attribute === 'trap') {
          this.state.card.attribute = 'dark';
        }
        if (this.state.card.level > 8 && frame === 'link') {
          this.state.card.level = 8;
        }
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

  public onLevelChange(level: number, max: number) {
    if (level > max) return;
    this.state.card.level = level;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onAtkChange(atk: string) {
    if (isUndefined(atk) || atk.length > 6) return;
    if (atk && atk !== '?' && atk !=='∞' && !atk.startsWith('X') && integer(atk) === 0) atk = '0';
    this.state.card.atk = atk;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onDefChange(def: string) {
    if (isUndefined(def) || def.length > 6) return;
    if (def && def !== '?' && def !=='∞' &&  !def.startsWith('X') && integer(def) === 0) def = '0';
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

  private onPendChange() {
    this.state.card.pendulum = !this.state.card.pendulum;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onArtworkPendChange() {
    this.state.card.artwork.pendulum = !this.state.card.artwork.pendulum;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onPendLockChange() {
    const lockPend = !this.state.lockPend;
    this.setState({ lockPend });
    if (lockPend && this.state.card.scales.left !== this.state.card.scales.right) {
      this.state.card.scales.right = this.state.card.scales.left;
      this.forceUpdate();
      this.debouncedOnCardChange(this.state.card);
    }
  }

  public onLeftScaleChange(left: string) {
    if (isUndefined(left)) return;
    const leftNumber = integer(left);
    this.state.card.scales.left = leftNumber;
    if (this.state.lockPend) this.state.card.scales.right = leftNumber;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onRightScaleChange(right: string) {
    if (isUndefined(right)) return;
    const rightNumber = integer(right);
    this.state.card.scales.right = rightNumber;
    if (this.state.lockPend) this.state.card.scales.left = rightNumber;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onPendEffChange(pendEffect: string) {
    if (isUndefined(pendEffect)) return;
    this.state.card.pendEffect = pendEffect;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onCardSetChange(cardSet: string) {
    if (isUndefined(cardSet)) return;
    this.state.card.cardSet = cardSet;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onPasscodeChange(passcode: string) {
    if (isUndefined(passcode)) return;
    this.state.card.passcode = passcode;
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

  private onAbilityChange(newValue: string, iAbility: number) {
    this.state.card.abilities[iAbility] = newValue;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onLinkArrowChange(arrow: TLinkArrows) {
    this.state.card.linkArrows[arrow] = !this.state.card.linkArrows[arrow];
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

  private generatePasscode() {
    this.state.card.passcode = app.$card.generatePasscode();
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private async showArtworkPopup() {
    let result = await app.$popup.show<IArtworkEditDialogResult>({
      id: 'edit-popup',
      title: "Édition de l'image",
      innerHeight: '85%',
      innerWidth: '80%',
      content: <ArtworkEditDialog
        isRush={false}
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
        hasLinkFrame={this.state.card.frames.includes('link')}
      />
    });
    if (result) this.onArtworkInfoChange(result);
  }

  public render() {
    return this.renderAttributes(<VerticalStack scroll padding gutter>
      {this.renderBasicCardDetails()}
      {app.$card.hasLinkArrows(this.state.card) && this.renderLinkArrows()}
      {app.$card.hasAbilities(this.state.card) && this.renderMonsterCardDetails()}
      {/* {this.renderMiscDetails()} */}
      <p className='app-version'>{this.state.appVersion}</p>
    </VerticalStack>, 'card-editor');
  }

  private renderBasicCardDetails() {
    return <VerticalStack gutter className='card-editor-section basic-section'>
      <HorizontalStack className='top-options'>
        <Button
          label='Faire le rendu'
          color='positive'
          onTap={() => app.$errorManager.handlePromise(app.$card.renderCurrentCard())}
        />
        <Spacer />
        {!app.$card.tempCurrentCard && <Button
          label='Réinitialiser'
          color='assertive'
          onTap={() => app.$errorManager.handlePromise(app.$card.resetCurrentCard())}
        />}
      </HorizontalStack>

      <HorizontalStack fill verticalItemAlignment='middle'>
        <Icon className='field-icon' iconId='toolkit-pen' color='1' />
        <TextInput fill placeholder='Nom' defaultValue={this.state.card.name} onChange={name =>  this.onNameChange(name)} />
      </HorizontalStack>

      <HorizontalStack gutter>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-plus' color='1' />
          <Select<TNameStyle>
            fill
            items={[
              { id: 'default', label: 'Par défaut' },
              { id: 'white', label: 'Blanc' },
              { id: 'black', label: 'Noir' },
              { id: 'yellow', label: 'Jaune' },
              { id: 'gold', label: 'Or' },
              { id: 'silver', label: 'Argent' },
              { id: 'rare', label: 'Rare' },
              { id: 'ultra', label: 'Ultra Rare' },
              { id: 'secret', label: 'Secret Rare' },
            ]}
            defaultValue={this.state.card.nameStyle}
            onChange={nameStyle => this.onNameStyleChange(nameStyle)}
          />
        </HorizontalStack>

        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-plus' color='1' />
          <Select<TCardLanguage>
            fill
            items={[
              { id: 'fr', label: 'Français' },
              { id: 'en', label: 'Anglais' },
            ]}
            defaultValue={this.state.card.language}
            onChange={language => this.onLanguageChange(language)}
          />
        </HorizontalStack>
      </HorizontalStack>

      <HorizontalStack verticalItemAlignment='middle' gutter>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-plus' color='1' />
          <FileInput
            fill
            placeholder="Chemin vers l'artwork"
            defaultValue={this.state.card.artwork.url}
            onChange={url => this.onArtworkURLChange(url)}
            overrideOnTap={() => this.showArtworkPopup()}
          />
        </HorizontalStack>

        {this.state.card.pendulum && <CheckBox
          label='Format Pendule'
          defaultValue={this.state.card.artwork.pendulum}
          onChange={() => this.onArtworkPendChange()}
        />}
      </HorizontalStack>

      <VerticalStack gutter>
        <CheckBox label='Cumuler' defaultValue={this.state.card.multipleFrames} onChange={() => this.onMultipleFramesChange()} />
        <Grid>
          {this.state.cardFrames.map(frame => {
            let className = 'card-frame';
            const frameIndex = this.state.card.frames.indexOf(frame.id);
            if (frameIndex >= 0) {
              className = `${className} selected`;
              if (this.state.card.multipleFrames) {
                className = `${className} selected-${frameIndex + 1}`;
              }
            }
            return <Image
              s='12'
              m='6'
              l='3'
              xl='2'
              xxl='1'
              className={className}
              src={frame.file}
              alt={`frame-${frame.id}`}
              title={app.$card.getFrameName(frame.id)}
              onTap={() => this.onFrameChange(frame.id)}
              maxHeight={60}
            />;}
          )}
        </Grid>
      </VerticalStack>

      {!app.$card.isOnlySkill(this.state.card) && <VerticalStack gutter>
        <CheckBox label='Sans texte' defaultValue={this.state.card.multipleFrames} onChange={() => this.onNoTextAttributeChange()} />
        <Grid>
          {this.state.cardAttributes.map(attribute =>
            <Image
              s='12'
              m='6'
              l='3'
              xl='2'
              xxl='1'
              className={`card-attribute${this.state.card.attribute === attribute.id ? ' selected' : ''}`}
              src={attribute.file}
              alt={`attribute-${attribute.id}`}
              title={app.$card.getAttributeName(attribute.id)}
              onTap={() => this.onAttributeChange(attribute.id)}
              maxHeight={40}
            />
          )}
        </Grid>
      </VerticalStack>}

      {app.$card.isBackrow(this.state.card) && <Grid>
        {this.state.cardStTypes.map(stType =>
          <Image
            s='12'
            m='6'
            l='3'
            xl='2'
            xxl='1'
            src={stType.file}
            alt={`st-icon-${stType.id}`}
            title={app.$card.getStIconName(stType.id)}
            className={classNames('card-st-icon', { 'selected': this.state.card.stType === stType.id })}
            onTap={() => this.onStTypeChange(stType.id)}
            maxHeight={40}
          />
        )}
      </Grid>}

      <TextAreaInput
        autoGrow
        minRows={5}
        maxRows={100}
        spellCheck={false}
        defaultValue={this.state.card.description}
        placeholder={app.$card.getDescriptionPlaceholder(this.state.card)}
        onChange={description => this.onDescChange(description)}
      />
    </VerticalStack>;
  }

  private renderLinkArrows() {
    return <VerticalStack gutter className='card-editor-section link-arrow-section'>
      <HorizontalStack gutter fill itemAlignment='center'>
        <Spacer />
        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.topLeft} onTap={() => this.onLinkArrowChange('topLeft')} />
        </HorizontalStack>

        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.top} onTap={() => this.onLinkArrowChange('top')} />
        </HorizontalStack>

        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.topRight} onTap={() => this.onLinkArrowChange('topRight')} />
        </HorizontalStack>
        <Spacer />
      </HorizontalStack>

      <HorizontalStack gutter>
        <Spacer />
        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.left} onTap={() => this.onLinkArrowChange('left')} />
        </HorizontalStack>
        <Spacer />
        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.right} onTap={() => this.onLinkArrowChange('right')} />
        </HorizontalStack>
        <Spacer />
      </HorizontalStack>

      <HorizontalStack gutter>
        <Spacer />
        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.bottomLeft} onTap={() => this.onLinkArrowChange('bottomLeft')} />
        </HorizontalStack>

        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.bottom} onTap={() => this.onLinkArrowChange('bottom')} />
        </HorizontalStack>

        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.bottomRight} onTap={() => this.onLinkArrowChange('bottomRight')} />
        </HorizontalStack>
        <Spacer />
      </HorizontalStack>
    </VerticalStack>;
  }

  private renderMonsterCardDetails() {
    let levelPlaceholder: string;
    let max: number;
    if (this.state.card.frames.includes('link')) {
      levelPlaceholder = 'Classification Lien';
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
        levelPlaceholder = 'Niveau';
      } else if (includesDarkSynchro) {
        levelPlaceholder = 'Niveau Négatif';
      } else {
        levelPlaceholder = 'Rang';
      }
    }

    const hasPendulumFrame = app.$card.hasPendulumFrame(this.state.card);

    return <VerticalStack gutter className='card-editor-section abilities-section'>
      <HorizontalStack gutter>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-star' color='1' />
          <NumberInput
            fill
            min={0}
            max={max}
            placeholder={levelPlaceholder}
            defaultValue={this.state.card.level}
            onChange={level =>  this.onLevelChange(level, max)}
          />
        </HorizontalStack>

        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-sword' color='1' />
          <TextInput
            fill
            placeholder='ATK'
            defaultValue={this.state.card.atk}
            onChange={atk =>  this.onAtkChange(atk)}
          />
        </HorizontalStack>

        {!this.state.card.frames.includes('link') && <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-shield' color='1' />
          <TextInput
            fill
            placeholder='DEF'
            defaultValue={this.state.card.def}
            onChange={def =>  this.onDefChange(def)}
          />
        </HorizontalStack>}
      </HorizontalStack>

      {/* <VerticalStack className='card-editor-full-width-section card-editor-vertical-section card-abilities card-input-container'>
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
      </VerticalStack> */}

      {/* <VerticalStack className={classNames('pendulum-details', { 'opened': hasPendulumFrame })}>
        <HorizontalStack className='card-pendulum card-input-container'>
          <input type='checkbox' className='pendulum-input card-input' checked={this.state.card.pendulum} onChange={() => this.onPendChange()} />
          <p className='editor-label pendulum-label'>Pendule</p>
        </HorizontalStack>

        {hasPendulumFrame && this.renderPendulumCardDetails()}
      </VerticalStack> */}
    </VerticalStack>;
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

    return <VerticalStack className='card-editor-section pendulum-section'>
      {/* <HorizontalStack className='card-editor-sub-section scales-section'>
        <HorizontalStack className='card-scale card-left-scale card-input-container'>
          <p className='editor-label scale-label'>Échelle Gauche</p>
          <input
            type='number'
            min={0}
            max={13}
            className='scale-input card-input'
            value={this.state.card.scales.left}
            onInput={e => this.onLeftScaleChange((e.target as EventTargetWithValue).value)}
          />
        </HorizontalStack>

        <VerticalStack className='separator-container pend-lock-container' fill>
          <button type='button' className={lockBtnClass} onClick={() => this.onPendLockChange()}>
            <img src={lockSVG} alt='lock' />
          </button>
        </VerticalStack>

        <HorizontalStack className='card-scale card-right-scale card-input-container'>
          <p className='editor-label scale-label'>Échelle Droite</p>
          <input
            readOnly={this.state.lockPend}
            type='number'
            min={0}
            max={13}
            className='scale-input card-input'
            value={this.state.card.scales.right}
            onInput={e => this.onRightScaleChange((e.target as EventTargetWithValue).value)}
          />
        </HorizontalStack>
      </HorizontalStack> */}

      {/* <VerticalStack className='card-editor-sub-section card-pendulum-effect card-textarea'>
        <p className='editor-label pendulum-effect-label label-with-separator'>Effet Pendule</p>
        <textarea
          spellCheck={false}
          className='pendulum-effect-input textarea-input'
          value={this.state.card.pendEffect}
          onInput={e => this.onPendEffChange((e.target as EventTargetWithValue).value)}
        />
      </VerticalStack> */}
    </VerticalStack>;
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
              'forbiddenDeck',
              'duelTerminal',
              'anime'
            ]}
            optionsLabel={[
              'Aucune',
              '1ère Édition',
              'Édition Limitée',
              'Interdite',
              'Interdite dans un Deck',
              'Duel Terminal',
              'Édition Anime'
            ]}
            defaultOption={this.state.card.edition}
            onSelect={value => this.onEditionChange(value)} />
        </VerticalStack>
      </HorizontalStack>

      {/* <HorizontalStack className='card-editor-full-width-section'>
        <VerticalStack className='card-editor-vertical-section card-passcode card-input-container'>
          <p className='editor-label passcode-label'>Code</p>
          <input
            type='text'
            pattern='\d*'
            maxLength={8}
            className='passcode-input card-input'
            value={this.state.card.passcode}
            onInput={e => this.onPasscodeChange((e.target as EventTargetWithValue).value)}
          />
        </VerticalStack>

        <p className='generate-passcode-btn' onClick={() => this.generatePasscode()}>Générer</p>
      </HorizontalStack> */}

      {/* <HorizontalStack className='card-editor-full-width-section'>
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
      </HorizontalStack> */}
    </VerticalStack>, 'card-editor-section misc-section');
  }
};
