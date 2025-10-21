import { classNames, integer, isUndefined } from 'mn-tools';
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
  FilePathInput,
  Checkbox,
  Grid,
  TextAreaInput,
  NumberInput,
  Icon,
  InplaceEdit,
  Image,
  TDidUpdateSnapshot,
} from 'mn-toolkit';
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
} from '../card';
import { ArtworkEditDialog } from '../artworkEditDialog';

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
  private debounceTimeout: NodeJS.Timeout | null = null;

  public static get defaultProps(): Partial<ICardEditorProps> {
    return {
      ...super.defaultProps,
      bg: '1',
      scroll: true,
      layout: 'vertical',
    };
  }

  public constructor(props: ICardEditorProps) {
    super(props);
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

    // La carte a été mise à jour par le parent
    if (this.props.card !== prevProps.card) {
      // Annuler tout débounce en cours
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = null;
      }
      this.setState({ card: this.props.card });
    }
    // La carte a été modifiée en interne
    else if (this.props.card !== this.state.card && this.state.card !== prevState.card) {
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.props.onCardChange(this.state.card);
        this.debounceTimeout = null;
      }, 200);
    }
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    if (!this.debounceTimeout) return;
    clearTimeout(this.debounceTimeout);
  }

  private async onTcgAtChange(tcgAt: boolean) {
    await this.setStateAsync({ card: { ...this.state.card, tcgAt } });
  }

  private async onLanguageChange(language: TCardLanguage) {
    await this.setStateAsync({ card: { ...this.state.card, language } });
  }

  private async onNoTextAttributeChange() {
    await this.setStateAsync({ card: { ...this.state.card, noTextAttribute: !this.state.card.noTextAttribute } });
  }

  private async onMultipleFramesChange() {
    const newCard: ICard = { ...this.state.card, multipleFrames: !this.state.card.multipleFrames };
    if (newCard.frames.length > 1) {
      newCard.frames = [newCard.frames[0]!];
    }
    await this.setStateAsync({ card: newCard });
  }

  private async onFrameChange(frame: TFrame) {
    const newCard: ICard = { ...this.state.card };

    if (newCard.frames.includes(frame)) {
      if (newCard.frames.length > 1) {
        newCard.frames = newCard.frames.filter((f) => f !== frame);
        await this.setStateAsync({ card: newCard });
      }
      return;
    }

    if (newCard.multipleFrames) {
      newCard.frames.push(frame);
    } else {
      newCard.frames = [frame];
    }

    if (frame === 'spell') {
      newCard.attribute = 'spell';
    } else if (frame === 'trap') {
      newCard.attribute = 'trap';
    } else {
      if (newCard.attribute === 'spell' || newCard.attribute === 'trap') {
        newCard.attribute = 'dark';
      }
      if (newCard.level > 8 && frame === 'link') {
        newCard.level = 8;
      }
    }

    await this.setStateAsync({ card: newCard });
  }

  private async onAttributeChange(attribute: TAttribute) {
    await this.setStateAsync({ card: { ...this.state.card, attribute } });
  }

  private async onNameStyleChange(nameStyle: TNameStyle) {
    await this.setStateAsync({ card: { ...this.state.card, nameStyle } });
  }

  private async onStTypeChange(stType: TStIcon) {
    await this.setStateAsync({ card: { ...this.state.card, stType } });
  }

  private async onLevelChange(level: number, max: number) {
    if (isUndefined(level)) return;
    if (level > max) return;
    await this.setStateAsync({ card: { ...this.state.card, level } });
  }

  private async onAtkChange(atk: string) {
    if (isUndefined(atk) || atk.length > 6) return;
    if (atk && atk !== '?' && atk !== '∞' && !atk.startsWith('X') && integer(atk) === 0) atk = '0';
    await this.setStateAsync({ card: { ...this.state.card, atk } });
  }

  private async onDefChange(def: string) {
    if (isUndefined(def) || def.length > 6) return;
    if (def && def !== '?' && def !== '∞' && !def.startsWith('X') && integer(def) === 0) def = '0';
    await this.setStateAsync({ card: { ...this.state.card, def } });
  }

  private async onNameChange(name: string) {
    if (isUndefined(name)) return;
    await this.setStateAsync({ card: { ...this.state.card, name } });
  }

  private async onDescChange(description: string) {
    if (isUndefined(description)) return;
    await this.setStateAsync({ card: { ...this.state.card, description } });
  }

  private async onPendChange() {
    await this.setStateAsync({ card: { ...this.state.card, pendulum: !this.state.card.pendulum } });
  }

  private async onArtworkPendChange() {
    const newCard: ICard = { ...this.state.card };
    newCard.artwork.pendulum = !newCard.artwork.pendulum;
    await this.setStateAsync({ card: newCard });
  }

  private async onPendLockChange() {
    const lockPend = !this.state.lockPend;
    if (!lockPend || this.state.card.scales.left === this.state.card.scales.right) {
      return await this.setStateAsync({ lockPend });
    }

    const newCard: ICard = { ...this.state.card };
    newCard.scales.right = newCard.scales.left;
    await this.setStateAsync({ card: newCard });
  }

  private async onLeftScaleChange(left: number) {
    if (isUndefined(left)) return;
    const newCard: ICard = { ...this.state.card };
    newCard.scales.left = left;
    if (this.state.lockPend) newCard.scales.right = left;
    await this.setStateAsync({ card: newCard });
  }

  private async onRightScaleChange(right: number) {
    if (isUndefined(right)) return;
    const newCard: ICard = { ...this.state.card };
    newCard.scales.right = right;
    if (this.state.lockPend) newCard.scales.left = right;
    await this.setStateAsync({ card: newCard });
  }

  private async onPendEffChange(pendEffect: string) {
    if (isUndefined(pendEffect)) return;
    await this.setStateAsync({ card: { ...this.state.card, pendEffect } });
  }

  private async onCardSetChange(cardSet: string) {
    if (isUndefined(cardSet)) return;
    await this.setStateAsync({ card: { ...this.state.card, cardSet } });
  }

  private async onPasscodeChange(passcode: string) {
    if (isUndefined(passcode)) return;
    await this.setStateAsync({ card: { ...this.state.card, passcode } });
  }

  private async onArtworkURLChange(url: string) {
    const newCard: ICard = { ...this.state.card };
    newCard.artwork = {
      url,
      x: 0,
      y: 0,
      height: 100,
      width: 100,
      pendulum: false,
      keepRatio: false,
    };
    await this.setStateAsync({ card: newCard });
  }

  private async onAddAbility() {
    const newCard: ICard = { ...this.state.card };
    newCard.abilities.push('');
    await this.setStateAsync({ card: newCard });
  }

  private async onRemoveAbility(index: number) {
    const newCard: ICard = { ...this.state.card };
    newCard.abilities.splice(index, 1);
    await this.setStateAsync({ card: newCard });
  }

  private async onLinkArrowChange(arrow: TLinkArrows) {
    const newCard: ICard = { ...this.state.card };
    newCard.linkArrows[arrow] = !newCard.linkArrows[arrow];
    await this.setStateAsync({ card: newCard });
  }

  private async onMoveAbilityUp(index: number) {
    if (index === 0) return;
    const newCard: ICard = { ...this.state.card };
    const newIndex = index - 1;
    const element = newCard.abilities[index]!;
    newCard.abilities.splice(index, 1);
    newCard.abilities.splice(newIndex, 0, element);
    await this.setStateAsync({ card: newCard });
  }

  private async onMoveAbilityDown(index: number) {
    if (index === this.state.card.abilities.length - 1) return;
    const newCard: ICard = { ...this.state.card };
    const newIndex = index + 1;
    const element = newCard.abilities[index]!;
    newCard.abilities.splice(index, 1);
    newCard.abilities.splice(newIndex, 0, element);
    await this.setStateAsync({ card: newCard });
  }

  private async onEditionChange(edition: TEdition) {
    await this.setStateAsync({ card: { ...this.state.card, edition } });
  }

  private async onStickerChange(sticker: TSticker) {
    await this.setStateAsync({ card: { ...this.state.card, sticker } });
  }

  private async onCopyrightChange() {
    await this.setStateAsync({ card: { ...this.state.card, hasCopyright: !this.state.card.hasCopyright } });
  }

  private async onOldCopyrightChange() {
    await this.setStateAsync({ card: { ...this.state.card, oldCopyright: !this.state.card.oldCopyright } });
  }

  private async generatePasscode() {
    await this.setStateAsync({ card: { ...this.state.card, passcode: app.$card.generatePasscode() } });
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
    });
    if (!result) return;

    const newCard: ICard = { ...this.state.card };
    newCard.artwork = {
      url: result.url,
      x: result.crop?.x,
      y: result.crop?.y,
      height: result.crop?.height,
      width: result.crop?.width,
      pendulum: newCard.artwork.pendulum,
      keepRatio: result.keepRatio,
    };
    await this.setStateAsync({ card: newCard });
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
          size='small'
          name={this.state.rendering ? 'Rendu en cours...' : 'Faire le rendu'}
          label={this.state.rendering ? 'Rendu en cours...' : 'Faire le rendu'}
          color='neutral'
          onTap={() => this.renderCurrentCard()}
        />
        <Spacer />
        {!app.$card.tempCurrentCard && (
          <Button
            disabled={this.state.rendering}
            size='small'
            name='Réinitialiser'
            label='Réinitialiser'
            color='negative'
            onTap={() => app.$card.resetCurrentCard()}
          />
        )}
        <Spacer />
        <Button
          disabled={this.state.rendering}
          size='small'
          name='Sauvegarder'
          label='Sauvegarder'
          color='positive'
          onTap={() => app.$card.saveCurrentOrTempToLocal()}
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
          <TextInput fill placeholder='Nom' value={this.state.card.name} onChange={(name) => this.onNameChange(name)} />
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
              value={this.state.card.nameStyle}
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
              value={this.state.card.language}
              onChange={(language) => this.onLanguageChange(language)}
            />
          </HorizontalStack>

          <Checkbox label='@ TCG' value={this.state.card.tcgAt} onChange={(tcgAt) => this.onTcgAtChange(tcgAt)} />
        </HorizontalStack>

        <HorizontalStack gutter verticalItemAlignment='middle'>
          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-image' color='1' />
            {app.$device.isDesktop && (
              <FilePathInput
                fill
                fileFilters={[{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]}
                placeholder="Chemin vers l'artwork"
                value={this.state.card.artwork.url}
                onChange={(url) => this.onArtworkURLChange(url)}
                overrideOnTapIcon={() => this.showArtworkPopup()}
              />
            )}
          </HorizontalStack>

          {this.state.card.pendulum && (
            <Checkbox
              label='Format Pendule'
              value={this.state.card.artwork.pendulum}
              onChange={() => this.onArtworkPendChange()}
            />
          )}
        </HorizontalStack>

        <VerticalStack gutter>
          <HorizontalStack gutter className='sub-title-container' itemAlignment='center'>
            <Typography fill variant='help' content={this.state.card.multipleFrames ? 'Bordures' : 'Bordure'} />
            <Checkbox
              label='Cumuler'
              value={this.state.card.multipleFrames}
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
                <HorizontalStack
                  key={`card-frame-${i}`}
                  className={className}
                  colSpans={{ small: 12, medium: 6, large: 3, xlarge: 2, xxxlarge: 1 }}
                >
                  <Image
                    src={paths.frames[frame]}
                    alt={`frame-${frame}`}
                    hint={app.$card.getFrameName(frame)}
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
              <Checkbox
                label='Sans texte'
                value={this.state.card.noTextAttribute}
                onChange={() => this.onNoTextAttributeChange()}
              />
            </HorizontalStack>

            <Grid className='card-icons-grid'>
              {this.state.cardAttributes.map((attribute, i) => (
                <HorizontalStack
                  key={`card-attribute-${i}`}
                  className={`card-attribute${this.state.card.attribute === attribute ? ' selected' : ''}`}
                  colSpans={{ small: 12, medium: 6, large: 3, xlarge: 2, xxxlarge: 1 }}
                >
                  <Image
                    src={paths.attributeIcons[attribute]}
                    alt={`attribute-${attribute}`}
                    hint={app.$card.getAttributeName(attribute)}
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
                  colSpans={{ small: 12, medium: 6, large: 3, xlarge: 2, xxxlarge: 1 }}
                >
                  <Image
                    src={paths.stIcons[stType]}
                    alt={`st-icon-${stType}`}
                    hint={app.$card.getStIconName(stType)}
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
            value={this.state.card.description}
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
            <Checkbox
              className='top-left'
              value={this.state.card.linkArrows.topLeft}
              onChange={() => this.onLinkArrowChange('topLeft')}
            />
          </HorizontalStack>

          <HorizontalStack fill itemAlignment='center'>
            <Checkbox
              className='top'
              value={this.state.card.linkArrows.top}
              onChange={() => this.onLinkArrowChange('top')}
            />
          </HorizontalStack>

          <HorizontalStack fill itemAlignment='center'>
            <Checkbox
              className='top-right'
              value={this.state.card.linkArrows.topRight}
              onChange={() => this.onLinkArrowChange('topRight')}
            />
          </HorizontalStack>
          <Spacer />
        </HorizontalStack>

        <HorizontalStack gutter>
          <Spacer />
          <HorizontalStack fill itemAlignment='center'>
            <Checkbox
              className='left'
              value={this.state.card.linkArrows.left}
              onChange={() => this.onLinkArrowChange('left')}
            />
          </HorizontalStack>
          <Spacer />
          <HorizontalStack fill itemAlignment='center'>
            <Checkbox
              className='right'
              value={this.state.card.linkArrows.right}
              onChange={() => this.onLinkArrowChange('right')}
            />
          </HorizontalStack>
          <Spacer />
        </HorizontalStack>

        <HorizontalStack gutter>
          <Spacer />
          <HorizontalStack fill itemAlignment='center'>
            <Checkbox
              className='bottom-left'
              value={this.state.card.linkArrows.bottomLeft}
              onChange={() => this.onLinkArrowChange('bottomLeft')}
            />
          </HorizontalStack>

          <HorizontalStack fill itemAlignment='center'>
            <Checkbox
              className='bottom'
              value={this.state.card.linkArrows.bottom}
              onChange={() => this.onLinkArrowChange('bottom')}
            />
          </HorizontalStack>

          <HorizontalStack fill itemAlignment='center'>
            <Checkbox
              className='bottom-right'
              value={this.state.card.linkArrows.bottomRight}
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
      for (const frame of this.state.card.frames) {
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
    const isOnlySkill = this.state.card.frames.length === 1 && this.state.card.frames[0] === 'skill';

    return (
      <VerticalStack gutter className='card-editor-section abilities-section'>
        <Typography fill className='sub-title' variant='help' content='Détails' />

        {!isOnlySkill && (
          <Grid>
            <HorizontalStack
              colSpans={{ small: 12, xxlarge: includesLink ? 6 : 4 }}
              fill
              verticalItemAlignment='middle'
            >
              <Icon className='field-icon' size={24} icon='toolkit-star' color='1' />
              <NumberInput
                fill
                min={0}
                max={max}
                placeholder={levelPlaceholder}
                value={this.state.card.level}
                onChange={(level) => this.onLevelChange(level || 0, max)}
              />
            </HorizontalStack>

            <HorizontalStack
              colSpans={{ small: 12, xxlarge: includesLink ? 6 : 4 }}
              fill
              verticalItemAlignment='middle'
            >
              <Icon className='field-icon' size={24} icon='toolkit-sword' color='1' />
              <TextInput fill placeholder='ATK' value={this.state.card.atk} onChange={(atk) => this.onAtkChange(atk)} />
            </HorizontalStack>

            {!includesLink && (
              <HorizontalStack colSpans={{ small: 12, xxlarge: 4 }} verticalItemAlignment='middle'>
                <Icon className='field-icon' size={24} icon='toolkit-shield' color='1' />
                <TextInput
                  fill
                  placeholder='DEF'
                  value={this.state.card.def}
                  onChange={(def) => this.onDefChange(def)}
                />
              </HorizontalStack>
            )}
          </Grid>
        )}

        <VerticalStack className='card-abilities' gutter='small'>
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
                  value={ability}
                  onChange={async (ability) => {
                    this.state.card.abilities[iAbility] = ability;
                    await this.forceUpdateAsync();
                  }}
                  onBlur={() => this.setStateAsync({ card: { ...this.state.card } })}
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

        {!isOnlySkill && (
          <Checkbox
            className='sub-title-checkbox'
            label='Pendule'
            value={this.state.card.pendulum}
            onChange={() => this.onPendChange()}
          />
        )}

        {hasPendulumFrame && this.renderPendulumCardDetails()}
      </VerticalStack>
    );
  }

  private renderPendulumCardDetails() {
    const tinySpacing = app.$theme.settings.commons?.['tiny-spacing']?.value || 4;
    return (
      <VerticalStack gutter className='card-editor-section pendulum-section'>
        <HorizontalStack fill gutter verticalItemAlignment='bottom'>
          <VerticalStack fill>
            <Typography variant='help' content='Échelle Gauche' />
            <NumberInput
              fill
              min={0}
              max={13}
              value={this.state.card.scales.left}
              onChange={(left) => this.onLeftScaleChange(left || 0)}
            />
          </VerticalStack>

          <Icon
            size={28 + tinySpacing}
            className={classNames(
              'pendulum-lock-icon',
              { unlocked: !this.state.lockPend },
              { locked: this.state.lockPend }
            )}
            icon={this.state.lockPend ? 'toolkit-lock-closed' : 'toolkit-lock-opened'}
            onTap={() => this.onPendLockChange()}
          />

          <VerticalStack fill>
            <Typography variant='help' content='Échelle Droite' />
            <NumberInput
              fill
              min={0}
              max={13}
              value={this.state.card.scales.right}
              onChange={(right) => this.onRightScaleChange(right || 0)}
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
            value={this.state.card.pendEffect}
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
          <HorizontalStack colSpans={{ small: 12, xxxlarge: 6 }} fill verticalItemAlignment='middle'>
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
              value={this.state.card.edition}
              onChange={(edition) => this.onEditionChange(edition)}
            />
          </HorizontalStack>
          <HorizontalStack colSpans={{ small: 12, xxxlarge: 6 }} fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-id' color='1' />
            <TextInput
              fill
              placeholder='Set'
              value={this.state.card.cardSet}
              onChange={(cardSet) => this.onCardSetChange(cardSet)}
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
              value={this.state.card.passcode}
              onChange={(passcode) => this.onPasscodeChange(passcode)}
            />
          </HorizontalStack>

          <Button size='small' color='positive' name='Générer' label='Générer' onTap={() => this.generatePasscode()} />
        </HorizontalStack>

        <Grid>
          <HorizontalStack colSpans={{ small: 12, xxxlarge: 6 }} fill verticalItemAlignment='middle'>
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
              value={this.state.card.sticker}
              onChange={(sticker) => this.onStickerChange(sticker)}
            />
          </HorizontalStack>

          <HorizontalStack colSpans={{ small: 12, xxxlarge: 6 }} fill verticalItemAlignment='middle' height='100%'>
            <Icon className='field-icon' size={24} icon='toolkit-copyright' color='1' />
            <HorizontalStack gutter fill verticalItemAlignment='middle'>
              <Checkbox
                label='Copyright'
                value={this.state.card.hasCopyright}
                onChange={() => this.onCopyrightChange()}
              />
              <Checkbox
                label='1996'
                value={this.state.card.oldCopyright}
                onChange={() => this.onOldCopyrightChange()}
              />
            </HorizontalStack>
          </HorizontalStack>
        </Grid>
      </VerticalStack>
    );
  }
}
