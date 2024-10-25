import { IArtworkEditDialogResult, ArtworkEditDialog } from 'client/editor/artworkEditDialog';
import {
  ICard,
  TFrame,
  TAttribute,
  TStIcon,
  TCardLanguage,
  TNameStyle,
  TLinkArrows,
  TEdition,
  TSticker,
} from 'client/editor/card/card-interfaces';
import {
  IContainerProps,
  IContainerState,
  Container,
  VerticalStack,
  HorizontalStack,
  Button,
  Spacer,
  Typography,
  TextInput,
  Select,
  FileInput,
  CheckBox,
  Grid,
  TextAreaInput,
  NumberInput,
  Icon,
  InplaceEdit,
  Image,
  TDidUpdateSnapshot,
} from 'mn-toolkit';
import { classNames, integer, isEmpty, isUndefined } from 'mn-tools';

interface ICardEditorProps extends IContainerProps {
  card: ICard;
  onCardChange: (card: ICard) => void;
}

interface ICardEditorState extends IContainerState {
  rendering: boolean;
  import: string;
  lockPend: boolean;
  card: ICard;
  cardFrames: TFrame[];
  cardAttributes: TAttribute[];
  cardStTypes: TStIcon[];
  appVersion: string;
}

export class CardEditor extends Container<ICardEditorProps, ICardEditorState> {
  private debouncedOnCardChange: (card: ICard, delay?: number) => void;

  public static get defaultProps(): Partial<ICardEditorProps> {
    return {
      ...super.defaultProps,
      bg: '1',
      scroll: true,
      layout: 'vertical',
    };
  }

  private flexibleDebounce(func: (card: ICard) => void): (card: ICard, delay?: number) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (card: ICard, delay: number = 100) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func(card);
        timeoutId = null;
      }, delay);
    };
  }

  public constructor(props: ICardEditorProps) {
    super(props);
    this.debouncedOnCardChange = this.flexibleDebounce(this.props.onCardChange);

    this.state = {
      ...this.state,
      loaded: true,
      rendering: false,
      import: '',
      lockPend: props.card.scales.left === props.card.scales.right,
      card: props.card,
      cardFrames: [
        'normal',
        'effect',
        'ritual',
        'fusion',
        'synchro',
        'darkSynchro',
        'xyz',
        'link',
        'obelisk',
        'slifer',
        'ra',
        'legendaryDragon',
        'spell',
        'trap',
        'monsterToken',
        'token',
        'skill',
      ],
      cardAttributes: ['light', 'dark', 'water', 'fire', 'earth', 'wind', 'divine', 'spell', 'trap'],
      cardStTypes: ['normal', 'ritual', 'quickplay', 'continuous', 'equip', 'field', 'counter', 'link'],
      appVersion: `v. ${app.version}`,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ICardEditorProps>,
    prevState: Readonly<ICardEditorState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.props.card === this.state.card) return;
    this.setState({ card: this.props.card });
  }

  private onTcgAtChange(tcgAt: boolean) {
    this.state.card.tcgAt = tcgAt;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
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
    this.setState({ card }, () => this.debouncedOnCardChange(this.state.card));
  }

  public onFrameChange(frame: TFrame) {
    if (this.state.card.frames.includes(frame)) {
      if (this.state.card.frames.length > 1) {
        this.state.card.frames = this.state.card.frames.filter((f) => f !== frame);
        this.forceUpdate();
        this.debouncedOnCardChange(this.state.card);
      }
    } else {
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
    this.debouncedOnCardChange(this.state.card, 200);
  }

  public onAtkChange(atk: string) {
    if (isUndefined(atk) || atk.length > 6) return;
    if (atk && atk !== '?' && atk !== '∞' && !atk.startsWith('X') && integer(atk) === 0) atk = '0';
    this.state.card.atk = atk;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 200);
  }

  public onDefChange(def: string) {
    if (isUndefined(def) || def.length > 6) return;
    if (def && def !== '?' && def !== '∞' && !def.startsWith('X') && integer(def) === 0) def = '0';
    this.state.card.def = def;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 200);
  }

  private onNameChange(name: string) {
    if (isUndefined(name)) return;
    this.state.card.name = name;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 300);
  }

  private onDescChange(description: string) {
    if (isUndefined(description)) return;
    this.state.card.description = description;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 300);
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

  public onLeftScaleChange(left: number) {
    if (isUndefined(left)) return;
    this.state.card.scales.left = left;
    if (this.state.lockPend) this.state.card.scales.right = left;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 200);
  }

  public onRightScaleChange(right: number) {
    if (isUndefined(right)) return;
    this.state.card.scales.right = right;
    if (this.state.lockPend) this.state.card.scales.left = right;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 200);
  }

  private onPendEffChange(pendEffect: string) {
    if (isUndefined(pendEffect)) return;
    this.state.card.pendEffect = pendEffect;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 300);
  }

  private onCardSetChange(cardSet: string) {
    if (isUndefined(cardSet)) return;
    this.state.card.cardSet = cardSet;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 300);
  }

  private onPasscodeChange(passcode: string) {
    if (isUndefined(passcode)) return;
    this.state.card.passcode = passcode;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card, 300);
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
      keepRatio: infos.keepRatio,
    };
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onArtworkURLChange(url: string) {
    this.state.card.artwork = {
      url,
      x: 0,
      y: 0,
      height: 100,
      width: 100,
      pendulum: false,
      keepRatio: false,
    };
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
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMoveAbilityDown(index: number) {
    if (index === this.state.card.abilities.length - 1) return;
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
    const result = await ArtworkEditDialog.show({
      isRush: false,
      artworkURL: this.state.card.artwork.url,
      crop: {
        x: this.state.card.artwork.x,
        y: this.state.card.artwork.y,
        height: this.state.card.artwork.height,
        width: this.state.card.artwork.width,
        unit: '%',
      },
      keepRatio: this.state.card.artwork.keepRatio,
      pendulumRatio: this.state.card.pendulum && !this.state.card.artwork.pendulum,
      hasPendulumFrame: app.$card.hasPendulumFrame(this.state.card),
      hasLinkFrame: this.state.card.frames.includes('link'),
    });
    if (result) this.onArtworkInfoChange(result);
  }

  private async renderCurrentCard() {
    await this.setStateAsync({ rendering: true });
    await app.$card.renderCurrentCard();
    await this.setStateAsync({ rendering: false });
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['card-editor'] = true;
    return classes;
  }

  public get children() {
    return [
      <HorizontalStack key='top-options' padding className='top-options'>
        <Button
          disabled={this.state.rendering}
          label={this.state.rendering ? 'Rendu en cours...' : 'Faire le rendu'}
          color='neutral'
          onTap={() => app.$errorManager.handlePromise(this.renderCurrentCard())}
        />
        <Spacer />
        {!app.$card.tempCurrentCard && (
          <Button
            disabled={this.state.rendering}
            label='Réinitialiser'
            color='negative'
            onTap={() => app.$errorManager.handlePromise(app.$card.resetCurrentCard())}
          />
        )}
        <Spacer />
        <Button
          disabled={this.state.rendering}
          label='Sauvegarder'
          color='positive'
          onTap={() => app.$errorManager.handlePromise(app.$card.saveCurrentOrTempToLocal())}
        />
      </HorizontalStack>,

      <VerticalStack key='card-editor-sections' scroll padding gutter className='card-editor-sections'>
        {this.renderBasicCardDetails()}
        {app.$card.hasLinkArrows(this.state.card) && this.renderLinkArrows()}
        {app.$card.hasAbilities(this.state.card) && this.renderMonsterCardDetails()}
        {this.renderMiscDetails()}
        <HorizontalStack itemAlignment='right'>
          <Typography variant='help' content={this.state.appVersion} />
        </HorizontalStack>
      </VerticalStack>,
    ];
  }

  private renderBasicCardDetails() {
    const paths = app.$card.paths.master;
    return (
      <VerticalStack gutter className='card-editor-section basic-section'>
        <HorizontalStack fill verticalItemAlignment='middle'>
          <Icon className='field-icon' size={24} icon='toolkit-title' color='1' />
          <TextInput
            fill
            placeholder='Nom'
            defaultValue={this.state.card.name}
            onChange={(name) => this.onNameChange(name)}
          />
        </HorizontalStack>

        <HorizontalStack gutter>
          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-color-palette' color='1' />
            <Select<TNameStyle>
              fill
              minWidth={115}
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
              onChange={(nameStyle) => this.onNameStyleChange(nameStyle)}
            />
          </HorizontalStack>

          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-language' color='1' />
            <Select<TCardLanguage>
              fill
              minWidth={115}
              items={[
                { id: 'fr', label: 'Français' },
                { id: 'en', label: 'Anglais' },
              ]}
              defaultValue={this.state.card.language}
              onChange={(language) => this.onLanguageChange(language)}
            />
          </HorizontalStack>

          <CheckBox
            label='@ TCG'
            defaultValue={this.state.card.tcgAt}
            onChange={(tcgAt) => this.onTcgAtChange(tcgAt)}
          />
        </HorizontalStack>

        <HorizontalStack gutter verticalItemAlignment='middle'>
          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-image' color='1' />
            {app.$device.isDesktop && (
              <FileInput
                fill
                placeholder="Chemin vers l'artwork"
                defaultValue={this.state.card.artwork.url}
                onChange={(url) => this.onArtworkURLChange(url)}
                overrideOnTap={() => this.showArtworkPopup()}
              />
            )}
          </HorizontalStack>

          {this.state.card.pendulum && (
            <CheckBox
              label='Format Pendule'
              defaultValue={this.state.card.artwork.pendulum}
              onChange={() => this.onArtworkPendChange()}
            />
          )}
        </HorizontalStack>

        <VerticalStack gutter>
          <HorizontalStack gutter className='sub-title-container' itemAlignment='center'>
            <Typography fill variant='help' content={this.state.card.multipleFrames ? 'Bordures' : 'Bordure'} />
            <CheckBox
              label='Cumuler'
              defaultValue={this.state.card.multipleFrames}
              onChange={() => this.onMultipleFramesChange()}
            />
          </HorizontalStack>

          <Grid>
            {this.state.cardFrames.map((frame, i) => {
              let className = 'card-frame';
              const frameIndex = this.state.card.frames.indexOf(frame);
              if (frameIndex >= 0) {
                className = `${className} selected`;
                if (this.state.card.multipleFrames) {
                  className = `${className} selected-${frameIndex + 1}`;
                }
              }
              return (
                <HorizontalStack key={`card-frame-${i}`} className={className} s='12' m='6' l='3' xl='2' xxl='1'>
                  <Image
                    src={paths.frames[frame]}
                    alt={`frame-${frame}`}
                    title={app.$card.getFrameName(frame)}
                    onTap={() => this.onFrameChange(frame)}
                    maxHeight={60}
                  />
                </HorizontalStack>
              );
            })}
          </Grid>
        </VerticalStack>

        {!this.state.card.frames.includes('skill') && !this.state.card.frames.includes('token') && (
          <VerticalStack gutter>
            <HorizontalStack gutter className='sub-title-container' itemAlignment='center'>
              <Typography fill variant='help' content='Icône' />
              <CheckBox
                label='Sans texte'
                defaultValue={this.state.card.noTextAttribute}
                onChange={() => this.onNoTextAttributeChange()}
              />
            </HorizontalStack>

            <Grid className='card-icons-grid'>
              {this.state.cardAttributes.map((attribute, i) => (
                <HorizontalStack
                  key={`card-attribute-${i}`}
                  className={`card-attribute${this.state.card.attribute === attribute ? ' selected' : ''}`}
                  s='12'
                  m='6'
                  l='3'
                  xl='2'
                  xxl='1'
                >
                  <Image
                    src={paths.attributeIcons[attribute]}
                    alt={`attribute-${attribute}`}
                    title={app.$card.getAttributeName(attribute)}
                    onTap={() => this.onAttributeChange(attribute)}
                    maxHeight={40}
                  />
                </HorizontalStack>
              ))}
            </Grid>
          </VerticalStack>
        )}

        {app.$card.isBackrow(this.state.card) && (
          <VerticalStack gutter>
            <Typography fill className='sub-title' variant='help' content='Type de Magie/Piège' />
            <Grid className='card-icons-grid'>
              {this.state.cardStTypes.map((stType, i) => (
                <HorizontalStack
                  key={`card-st-icon-${i}`}
                  className={classNames('card-st-icon', { selected: this.state.card.stType === stType })}
                  s='12'
                  m='6'
                  l='3'
                  xl='2'
                  xxl='1'
                >
                  <Image
                    src={paths.stIcons[stType]}
                    alt={`st-icon-${stType}`}
                    title={app.$card.getStIconName(stType)}
                    onTap={() => this.onStTypeChange(stType)}
                    maxHeight={40}
                  />
                </HorizontalStack>
              ))}
            </Grid>
          </VerticalStack>
        )}

        <HorizontalStack>
          <Icon className='field-icon' size={24} icon='toolkit-script' color='1' />
          <TextAreaInput
            autoGrow
            minRows={5}
            maxRows={100}
            spellCheck={false}
            defaultValue={this.state.card.description}
            placeholder={app.$card.getDescriptionPlaceholder(this.state.card)}
            onChange={(description) => this.onDescChange(description)}
          />
        </HorizontalStack>
      </VerticalStack>
    );
  }

  private renderLinkArrows() {
    return (
      <VerticalStack gutter className='card-editor-section link-arrows-section'>
        <Typography fill className='sub-title' variant='help' content='Flèches Lien' />

        <HorizontalStack gutter>
          <Spacer />
          <HorizontalStack fill itemAlignment='center'>
            <CheckBox
              defaultValue={this.state.card.linkArrows.topLeft}
              onChange={() => this.onLinkArrowChange('topLeft')}
            />
          </HorizontalStack>

          <HorizontalStack fill itemAlignment='center'>
            <CheckBox defaultValue={this.state.card.linkArrows.top} onChange={() => this.onLinkArrowChange('top')} />
          </HorizontalStack>

          <HorizontalStack fill itemAlignment='center'>
            <CheckBox
              defaultValue={this.state.card.linkArrows.topRight}
              onChange={() => this.onLinkArrowChange('topRight')}
            />
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
            <CheckBox
              defaultValue={this.state.card.linkArrows.right}
              onChange={() => this.onLinkArrowChange('right')}
            />
          </HorizontalStack>
          <Spacer />
        </HorizontalStack>

        <HorizontalStack gutter>
          <Spacer />
          <HorizontalStack fill itemAlignment='center'>
            <CheckBox
              defaultValue={this.state.card.linkArrows.bottomLeft}
              onChange={() => this.onLinkArrowChange('bottomLeft')}
            />
          </HorizontalStack>

          <HorizontalStack fill itemAlignment='center'>
            <CheckBox
              defaultValue={this.state.card.linkArrows.bottom}
              onChange={() => this.onLinkArrowChange('bottom')}
            />
          </HorizontalStack>

          <HorizontalStack fill itemAlignment='center'>
            <CheckBox
              defaultValue={this.state.card.linkArrows.bottomRight}
              onChange={() => this.onLinkArrowChange('bottomRight')}
            />
          </HorizontalStack>
          <Spacer />
        </HorizontalStack>
      </VerticalStack>
    );
  }

  private renderMonsterCardDetails() {
    const includesLink = this.state.card.frames.includes('link');
    let levelPlaceholder: string;
    let max: number;
    if (includesLink) {
      levelPlaceholder = 'Classification Lien';
      max = 8;
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

    return (
      <VerticalStack gutter className='card-editor-section abilities-section'>
        <Typography fill className='sub-title' variant='help' content='Détails' />

        <Grid>
          <HorizontalStack xl='12' xxl={includesLink ? '6' : '4'} fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-star' color='1' />
            <NumberInput
              fill
              min={0}
              max={max}
              placeholder={levelPlaceholder}
              defaultValue={this.state.card.level}
              onChange={(level) => this.onLevelChange(level, max)}
            />
          </HorizontalStack>

          <HorizontalStack xl='12' xxl={includesLink ? '6' : '4'} fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-sword' color='1' />
            <TextInput
              fill
              placeholder='ATK'
              defaultValue={this.state.card.atk}
              onChange={(atk) => this.onAtkChange(atk)}
            />
          </HorizontalStack>

          {!includesLink && (
            <HorizontalStack xl='12' xxl='4' verticalItemAlignment='middle'>
              <Icon className='field-icon' size={24} icon='toolkit-shield' color='1' />
              <TextInput
                fill
                placeholder='DEF'
                defaultValue={this.state.card.def}
                onChange={(def) => this.onDefChange(def)}
              />
            </HorizontalStack>
          )}
        </Grid>

        <VerticalStack className='card-abilities'>
          <HorizontalStack fill className='abilities-add' itemAlignment='right' verticalItemAlignment='middle'>
            <Typography fill variant='help' content='Types' />
            <Icon size={24} icon='toolkit-plus' color='positive' onTap={() => this.onAddAbility()} />
          </HorizontalStack>

          <VerticalStack className='card-abilities-list' gutter={false}>
            {this.state.card.abilities.map((ability, iAbility) => (
              <HorizontalStack
                key={`abilities-line-${iAbility}`}
                fill
                gutter
                className='abilities-line'
                verticalItemAlignment='middle'
              >
                <InplaceEdit
                  fill
                  validateOnEnter
                  defaultValue={ability}
                  onChange={(ability, fromBlur) => {
                    if (fromBlur) this.onAbilityChange(ability, iAbility);
                  }}
                />

                <HorizontalStack className='abilities-line-icons'>
                  <Icon size={24} icon='toolkit-minus' color='negative' onTap={() => this.onRemoveAbility(iAbility)} />
                  {this.state.card.abilities.length > 1 && (
                    <Icon size={24} icon='toolkit-angle-up' onTap={() => this.onMoveAbilityUp(iAbility)} />
                  )}
                  {this.state.card.abilities.length > 1 && (
                    <Icon size={24} icon='toolkit-angle-down' onTap={() => this.onMoveAbilityDown(iAbility)} />
                  )}
                </HorizontalStack>
              </HorizontalStack>
            ))}
          </VerticalStack>
        </VerticalStack>

        <CheckBox
          className='sub-title-checkbox'
          label='Pendule'
          defaultValue={this.state.card.pendulum}
          onChange={() => this.onPendChange()}
        />

        {hasPendulumFrame && this.renderPendulumCardDetails()}
      </VerticalStack>
    );
  }

  private renderPendulumCardDetails() {
    return (
      <VerticalStack gutter className='card-editor-section pendulum-section'>
        <HorizontalStack fill gutter verticalItemAlignment='bottom'>
          <VerticalStack fill>
            <Typography variant='help' content='Échelle Gauche' />
            <NumberInput
              fill
              min={0}
              max={13}
              defaultValue={this.state.card.scales.left}
              onChange={(left) => this.onLeftScaleChange(left)}
            />
          </VerticalStack>

          <Icon
            size={32}
            className={classNames('pendulum-lock-icon', { locked: this.state.lockPend })}
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
              onChange={(right) => this.onRightScaleChange(right)}
            />
          </VerticalStack>
        </HorizontalStack>

        <HorizontalStack>
          <Icon className='field-icon' size={24} icon='toolkit-small-script' color='1' />
          <TextAreaInput
            autoGrow
            minRows={5}
            maxRows={100}
            spellCheck={false}
            placeholder='Effet Pendule'
            defaultValue={this.state.card.pendEffect}
            onChange={(pendEffect) => this.onPendEffChange(pendEffect)}
          />
        </HorizontalStack>
      </VerticalStack>
    );
  }

  private renderMiscDetails() {
    return (
      <VerticalStack gutter className='card-editor-section misc-section'>
        <Typography fill className='sub-title' variant='help' content='Autres' />

        <Grid>
          <HorizontalStack xl='12' xxl='6' fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-id' color='1' />
            <TextInput
              fill
              placeholder='Set'
              defaultValue={this.state.card.cardSet}
              onChange={(cardSet) => this.onCardSetChange(cardSet)}
            />
          </HorizontalStack>

          <HorizontalStack xl='12' xxl='6' fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-print' color='1' />
            <Select<TEdition>
              fill
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
              onChange={(edition) => this.onEditionChange(edition)}
            />
          </HorizontalStack>
        </Grid>

        <HorizontalStack gutter verticalItemAlignment='middle'>
          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-hash' color='1' />
            <TextInput
              fill
              maxLength={8}
              placeholder='Code'
              defaultValue={this.state.card.passcode}
              onChange={(passcode) => this.onPasscodeChange(passcode)}
            />
          </HorizontalStack>

          <Button color='positive' label='Générer' onTap={() => this.generatePasscode()} />
        </HorizontalStack>

        <Grid>
          <HorizontalStack xl='12' xxl='6' fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-sticker' color='1' />
            <Select<TSticker>
              fill
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
              onChange={(sticker) => this.onStickerChange(sticker)}
            />
          </HorizontalStack>

          <HorizontalStack xl='12' xxl='6' fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-copyright' color='1' />
            <HorizontalStack gutter fill verticalItemAlignment='middle'>
              <CheckBox
                label='Copyright'
                defaultValue={this.state.card.hasCopyright}
                onChange={() => this.onCopyrightChange()}
              />
              <CheckBox
                label='1996'
                defaultValue={this.state.card.oldCopyright}
                onChange={() => this.onOldCopyrightChange()}
              />
            </HorizontalStack>
          </HorizontalStack>
        </Grid>
      </VerticalStack>
    );
  }
}
