import './styles.scss';
import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { ICard, ICurrentCardToDo, TAttribute, TCardLanguage, TEdition, TFrame, TLinkArrows, TNameStyle, TStIcon, TSticker } from 'renderer/card/card-interfaces';
import { classNames, debounce, integer, isEmpty, isUndefined } from 'libraries/mn-tools';
import { InplaceEdit } from 'libraries/mn-toolkit/inplaceEdit/InplaceEdit';
import { ArtworkEditDialog, IArtworkEditDialogResult } from 'renderer/artwork-edit-dialog/ArtworkEditDialog';
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
        { id: 'normal', file: require(`../resources/pictures/menu-card-frames/normal.png`) },
        { id: 'effect', file: require(`../resources/pictures/menu-card-frames/effect.png`) },
        { id: 'ritual', file: require(`../resources/pictures/menu-card-frames/ritual.png`) },
        { id: 'fusion', file: require(`../resources/pictures/menu-card-frames/fusion.png`) },
        { id: 'synchro', file: require(`../resources/pictures/menu-card-frames/synchro.png`) },
        { id: 'darkSynchro', file: require(`../resources/pictures/menu-card-frames/darkSynchro.png`) },
        { id: 'xyz', file: require(`../resources/pictures/menu-card-frames/xyz.png`) },
        { id: 'link', file: require(`../resources/pictures/menu-card-frames/link.png`) },
        { id: 'obelisk', file: require(`../resources/pictures/menu-card-frames/obelisk.png`) },
        { id: 'slifer', file: require(`../resources/pictures/menu-card-frames/slifer.png`) },
        { id: 'ra', file: require(`../resources/pictures/menu-card-frames/ra.png`) },
        { id: 'legendaryDragon', file: require(`../resources/pictures/menu-card-frames/legendaryDragon.png`) },
        { id: 'spell', file: require(`../resources/pictures/menu-card-frames/spell.png`) },
        { id: 'trap', file: require(`../resources/pictures/menu-card-frames/trap.png`) },
        { id: 'monsterToken', file: require(`../resources/pictures/menu-card-frames/monsterToken.png`) },
        { id: 'token', file: require(`../resources/pictures/menu-card-frames/token.png`) },
        { id: 'skill', file: require(`../resources/pictures/menu-card-frames/skill.png`) },
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

  public componentWillReceiveProps(nextProps: ICardEditorProps) {
    this.setState({ card: nextProps.card }, () => this.forceUpdate());
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
    const { card } = this.state;
    card.multipleFrames = !card.multipleFrames;
    if (card.frames.length > 1) {
      card.frames = [card.frames[0]];
      app.$card.resetCurrentCardToDo();
    }
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onFrameChange(frame: TFrame) {
    const { card } = this.state;
    const toDo: Partial<ICurrentCardToDo> = {};
    const spNameFrames: TFrame[] = ['xyz', 'link', 'skill', 'spell', 'trap'];
    if (spNameFrames.includes(frame) || card.frames.some(f => spNameFrames.includes(f))) {
      toDo.name = true;
      if (card.pendulum && (frame === 'link' || card.frames.includes('link'))) {
        toDo.desc = true;
        toDo.pend = true;
      }
    }

    if (card.frames.includes(frame)) {
      if (card.frames.length > 1) {
        this.state.card.frames = card.frames.filter(f => f !== frame);
        app.$card.updateCurrentCardToDo(toDo);
        this.forceUpdate();
        this.debouncedOnCardChange(card);
      }
    }
    else {
      if (card.multipleFrames) {
        card.frames.push(frame);
      } else {
        card.frames = [frame];
      }

      if (frame === 'spell') {
        card.attribute = 'spell';
      } else if (frame === 'trap') {
        card.attribute = 'trap';
      } else {
        if (card.attribute === 'spell' || card.attribute === 'trap') {
          card.attribute = 'dark';
        }
        if (card.level > 8 && frame === 'link') {
          card.level = 8;
        }
      }

      app.$card.updateCurrentCardToDo(toDo);
      this.forceUpdate();
      this.debouncedOnCardChange(card);
    }
  }

  public onAttributeChange(attribute: TAttribute) {
    this.state.card.attribute = attribute;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onNameStyleChange(nameStyle: TNameStyle) {
    this.state.card.nameStyle = nameStyle;
    app.$card.updateCurrentCardToDo({ name: true });
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
    app.$card.updateCurrentCardToDo({ atk: true });
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onDefChange(def: string) {
    if (isUndefined(def) || def.length > 6) return;
    if (def && def !== '?' && def !=='∞' &&  !def.startsWith('X') && integer(def) === 0) def = '0';
    this.state.card.def = def;
    app.$card.updateCurrentCardToDo({ def: true });
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onNameChange(name: string) {
    if (isUndefined(name)) return;
    this.state.card.name = name;
    app.$card.updateCurrentCardToDo({ name: true });
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onDescChange(description: string) {
    if (isUndefined(description)) return;
    this.state.card.description = description;
    app.$card.updateCurrentCardToDo({ desc: true });
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onPendChange() {
    this.state.card.pendulum = !this.state.card.pendulum;
    app.$card.resetCurrentCardToDo();
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

  public onLeftScaleChange(left: number) {
    if (isUndefined(left)) return;
    this.state.card.scales.left = left;
    if (this.state.lockPend) this.state.card.scales.right = left;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onRightScaleChange(right: number) {
    if (isUndefined(right)) return;
    this.state.card.scales.right = right;
    if (this.state.lockPend) this.state.card.scales.left = right;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onPendEffChange(pendEffect: string) {
    if (isUndefined(pendEffect)) return;
    this.state.card.pendEffect = pendEffect;
    app.$card.updateCurrentCardToDo({ pend: true });
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
    app.$card.updateCurrentCardToDo({ abilities: true });
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onAddAbility() {
    this.state.card.abilities.push('');
    app.$card.updateCurrentCardToDo({ abilities: true });
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onRemoveAbility(index: number) {
    this.state.card.abilities.splice(index, 1);
    app.$card.updateCurrentCardToDo({ abilities: true });
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onLinkArrowChange(arrow: TLinkArrows) {
    this.state.card.linkArrows[arrow] = !this.state.card.linkArrows[arrow];
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMoveAbilityUp(index: number) {
    if (index === 0) return;
    const newIndex = index - 1;
    let element = this.state.card.abilities[index];
    this.state.card.abilities.splice(index, 1);
    this.state.card.abilities.splice(newIndex, 0, element);
    app.$card.updateCurrentCardToDo({ abilities: true });
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMoveAbilityDown(index: number) {
    if (index === this.state.card.abilities.length-1) return;
    const newIndex = index + 1;
    let element = this.state.card.abilities[index];
    this.state.card.abilities.splice(index, 1);
    this.state.card.abilities.splice(newIndex, 0, element);
    app.$card.updateCurrentCardToDo({ abilities: true });
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
    return this.renderAttributes(<VerticalStack fill>
      <HorizontalStack padding className='top-options'>
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
        <Spacer />
        <Button
          label='Sauvegarder'
          color='balanced'
          onTap={() => app.$errorManager.handlePromise(app.$card.saveCurrentOrTempToLocal())}
        />
      </HorizontalStack>

      <VerticalStack scroll padding gutter className='card-editor-sections'>
        {this.renderBasicCardDetails()}
        {app.$card.hasLinkArrows(this.state.card) && this.renderLinkArrows()}
        {app.$card.hasAbilities(this.state.card) && this.renderMonsterCardDetails()}
        {this.renderMiscDetails()}
        <HorizontalStack itemAlignment='right'>
          <Typography variant='help' content={this.state.appVersion} />
        </HorizontalStack>
      </VerticalStack>
    </VerticalStack>, 'card-editor');
  }

  private renderBasicCardDetails() {
    return <VerticalStack gutter className='card-editor-section basic-section'>
      <HorizontalStack fill verticalItemAlignment='middle'>
        <Icon className='field-icon' iconId='toolkit-title' color='1' />
        <TextInput fill placeholder='Nom' defaultValue={this.state.card.name} onChange={name => this.onNameChange(name)} />
      </HorizontalStack>

      <HorizontalStack gutter>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-color-palette' color='1' />
          <Select<TNameStyle>
            fill
            popoverMinWidth={115}
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
          <Icon className='field-icon' iconId='toolkit-language' color='1' />
          <Select<TCardLanguage>
            fill
            popoverMinWidth={115}
            items={[
              { id: 'fr', label: 'Français' },
              { id: 'en', label: 'Anglais' },
            ]}
            defaultValue={this.state.card.language}
            onChange={language => this.onLanguageChange(language)}
          />
        </HorizontalStack>
      </HorizontalStack>

      <HorizontalStack gutter verticalItemAlignment='middle'>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-image' color='1' />
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
        <HorizontalStack gutter className='sub-title-container' itemAlignment='center'>
          <Typography fill variant='help' content={this.state.card.multipleFrames ? 'Bordures' : 'Bordure'} />
          <CheckBox label='Cumuler' defaultValue={this.state.card.multipleFrames} onChange={() => this.onMultipleFramesChange()} />
        </HorizontalStack>

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
            return <HorizontalStack className={className} s='12' m='6' l='3' xl='2' xxl='1'>
              <Image
                src={frame.file}
                alt={`frame-${frame.id}`}
                title={app.$card.getFrameName(frame.id)}
                onTap={() => this.onFrameChange(frame.id)}
                maxHeight={60}
              />
            </HorizontalStack>;}
          )}
        </Grid>
      </VerticalStack>

      {!app.$card.isOnlySkill(this.state.card) && <VerticalStack gutter>
        <HorizontalStack gutter className='sub-title-container' itemAlignment='center'>
          <Typography fill variant='help' content='Icône' />
          <CheckBox label='Sans texte' defaultValue={this.state.card.noTextAttribute} onChange={() => this.onNoTextAttributeChange()} />
        </HorizontalStack>

        <Grid className='card-icons-grid'>
          {this.state.cardAttributes.map(attribute => <HorizontalStack className={`card-attribute${this.state.card.attribute === attribute.id ? ' selected' : ''}`} s='12' m='6' l='3' xl='2' xxl='1'>
            <Image
              src={attribute.file}
              alt={`attribute-${attribute.id}`}
              title={app.$card.getAttributeName(attribute.id)}
              onTap={() => this.onAttributeChange(attribute.id)}
              maxHeight={40}
            />
          </HorizontalStack>)}
        </Grid>
      </VerticalStack>}

      {app.$card.isBackrow(this.state.card) && <VerticalStack gutter>
        <Typography fill className='sub-title' variant='help' content='Type de Magie/Piège' />
        <Grid className='card-icons-grid'>
          {this.state.cardStTypes.map(stType => <HorizontalStack className={classNames('card-st-icon', { 'selected': this.state.card.stType === stType.id })} s='12' m='6' l='3' xl='2' xxl='1'>
            <Image
              src={stType.file}
              alt={`st-icon-${stType.id}`}
              title={app.$card.getStIconName(stType.id)}
              onTap={() => this.onStTypeChange(stType.id)}
              maxHeight={40}
            />
          </HorizontalStack>)}
        </Grid>
      </VerticalStack>}

      <HorizontalStack>
        <Icon className='field-icon' iconId='toolkit-script' color='1' />
        <TextAreaInput
          autoGrow
          minRows={5}
          maxRows={100}
          spellCheck={false}
          defaultValue={this.state.card.description}
          placeholder={app.$card.getDescriptionPlaceholder(this.state.card)}
          onChange={description => this.onDescChange(description)}
        />
      </HorizontalStack>
    </VerticalStack>;
  }

  private renderLinkArrows() {
    return <VerticalStack gutter className='card-editor-section link-arrows-section'>
      <Typography fill className='sub-title' variant='help' content='Flèches Lien' />

      <HorizontalStack gutter>
        <Spacer />
        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.topLeft} onChange={() => this.onLinkArrowChange('topLeft')} />
        </HorizontalStack>

        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.top} onChange={() => this.onLinkArrowChange('top')} />
        </HorizontalStack>

        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.topRight} onChange={() => this.onLinkArrowChange('topRight')} />
        </HorizontalStack>
        <Spacer />
      </HorizontalStack>

      <HorizontalStack gutter>
        <Spacer />
        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.left} onChange={() => this.onLinkArrowChange('left')} />
        </HorizontalStack>
        <Spacer />
        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.right} onChange={() => this.onLinkArrowChange('right')} />
        </HorizontalStack>
        <Spacer />
      </HorizontalStack>

      <HorizontalStack gutter>
        <Spacer />
        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.bottomLeft} onChange={() => this.onLinkArrowChange('bottomLeft')} />
        </HorizontalStack>

        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.bottom} onChange={() => this.onLinkArrowChange('bottom')} />
        </HorizontalStack>

        <HorizontalStack fill itemAlignment='center'>
          <CheckBox defaultValue={this.state.card.linkArrows.bottomRight} onChange={() => this.onLinkArrowChange('bottomRight')} />
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
      <Typography fill className='sub-title' variant='help' content='Détails' />

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

      <VerticalStack className='card-abilities'>
        <HorizontalStack fill className='abilities-add' itemAlignment='right' verticalItemAlignment='middle'>
          <Typography fill variant='help' content='Types' />
          <ButtonIcon icon='toolkit-plus' color='balanced' onTap={() => this.onAddAbility()} />
        </HorizontalStack>

        <VerticalStack className='card-abilities-list'>
          {this.state.card.abilities.map((ability, iAbility) => <HorizontalStack fill gutter className='abilities-line' verticalItemAlignment='middle'>
            <InplaceEdit
              fill
              focusOnSingleClick
              validateOnEnter
              key={`${iAbility}-${ability}`}
              value={ability}
              onChange={ability => this.onAbilityChange(ability, iAbility)}
            />

            <HorizontalStack className='abilities-line-icons'>
              <ButtonIcon icon='toolkit-minus' color='assertive' onTap={() => this.onRemoveAbility(iAbility)} />
              {this.state.card.abilities.length > 1 && <ButtonIcon icon='toolkit-angle-up' onTap={() => this.onMoveAbilityUp(iAbility)} />}
              {this.state.card.abilities.length > 1 && <ButtonIcon icon='toolkit-angle-down' onTap={() => this.onMoveAbilityDown(iAbility)} />}
            </HorizontalStack>
          </HorizontalStack>)}
        </VerticalStack>
      </VerticalStack>

      <CheckBox
        className='sub-title-checkbox'
        label='Pendule'
        defaultValue={this.state.card.pendulum}
        onChange={() => this.onPendChange()}
      />

      {hasPendulumFrame && this.renderPendulumCardDetails()}
    </VerticalStack>;
  }

  private renderPendulumCardDetails() {
    return <VerticalStack gutter className='card-editor-section pendulum-section'>
      <HorizontalStack fill gutter verticalItemAlignment='bottom'>
        <VerticalStack fill>
          <Typography variant='help' content='Échelle Gauche' />
          <NumberInput
            fill
            min={0}
            max={13}
            defaultValue={this.state.card.scales.left}
            onChange={left => this.onLeftScaleChange(left)}
          />
        </VerticalStack>

        <ButtonIcon
          className='pendulum-lock-icon'
          pressed={this.state.lockPend}
          icon={this.state.lockPend ? 'toolkit-lock-closed' : 'toolkit-lock-opened'}
          onTap={() => this.onPendLockChange()}
        />

        <VerticalStack fill>
          <Typography variant='help' content='Échelle Droite' />
          <NumberInput
            fill
            min={0}
            max={13}
            defaultValue={this.state.card.scales.right}
            onChange={right => this.onRightScaleChange(right)}
          />
        </VerticalStack>
      </HorizontalStack>

      <HorizontalStack>
        <Icon className='field-icon' iconId='toolkit-small-script' color='1' />
        <TextAreaInput
          autoGrow
          minRows={5}
          maxRows={100}
          spellCheck={false}
          placeholder='Effet Pendule'
          defaultValue={this.state.card.pendEffect}
          onChange={pendEffect => this.onPendEffChange(pendEffect)}
        />
      </HorizontalStack>
    </VerticalStack>;
  }

  private renderMiscDetails() {
    return <VerticalStack gutter className='card-editor-section misc-section'>
      <Typography fill className='sub-title' variant='help' content='Autres' />

      <HorizontalStack gutter>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-id' color='1' />
          <TextInput
            fill
            placeholder='Set'
            defaultValue={this.state.card.cardSet}
            onChange={cardSet => this.onCardSetChange(cardSet)}
          />
        </HorizontalStack>

        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-print' color='1' />
          <Select<TEdition>
            fill
            popoverMinWidth={200}
            items={[
              { id: 'unlimited', label: 'Aucune édition' },
              { id: 'firstEdition', label: '1ère Édition' },
              { id: 'limited', label: 'Édition Limitée' },
              { id: 'forbidden', label: 'Interdite' },
              { id: 'forbiddenDeck', label: 'Interdite dans un Deck' },
              { id: 'duelTerminal', label: 'Duel Terminal' },
              { id: 'anime', label: 'Édition Anime' },
            ]}
            defaultValue={this.state.card.edition}
            onChange={edition => this.onEditionChange(edition)}
          />
        </HorizontalStack>
      </HorizontalStack>

      <HorizontalStack gutter verticalItemAlignment='middle'>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-hash' color='1' />
          <TextInput
            fill
            maxLength={8}
            placeholder='Code'
            defaultValue={this.state.card.passcode}
            onChange={passcode => this.onPasscodeChange(passcode)}
          />
        </HorizontalStack>

        <Button color='balanced' label='Générer' onTap={() => this.generatePasscode()} />
      </HorizontalStack>

      <HorizontalStack gutter>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-sticker' color='1' />
          <Select<TSticker>
            fill
            popoverMinWidth={150}
            items={[
              { id: 'none', label: 'Aucun sticker' },
              { id: 'silver', label: 'Argent' },
              { id: 'gold', label: 'Or' },
              { id: 'grey', label: 'Gris' },
              { id: 'white', label: 'Blanc' },
              { id: 'lightBlue', label: 'Bleu clair' },
              { id: 'skyBlue', label: 'Bleu ciel' },
              { id: 'cyan', label: 'Cyan' },
              { id: 'aqua', label: 'Aqua' },
              { id: 'green', label: 'Vert' },
            ]}
            defaultValue={this.state.card.sticker}
            onChange={sticker => this.onStickerChange(sticker)}
          />
        </HorizontalStack>

        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-copyright' color='1' />
          <CheckBox
            fill
            label='Copyright'
            defaultValue={this.state.card.hasCopyright}
            onChange={() => this.onCopyrightChange()}
          />
          <CheckBox
            fill
            label='1996'
            defaultValue={this.state.card.oldCopyright}
            onChange={() => this.onOldCopyrightChange()}
          />
        </HorizontalStack>
      </HorizontalStack>
    </VerticalStack>;
  }
};
