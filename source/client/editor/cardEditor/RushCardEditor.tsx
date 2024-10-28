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
  Icon,
  TextInput,
  Select,
  FileInput,
  CheckBox,
  Grid,
  TabbedPane,
  TextAreaInput,
  NumberInput,
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
  TLegendType,
  TRushEffectType,
  TRushTextMode,
  TEdition,
  TSticker,
} from '../card';
import { ArtworkEditDialog } from '../artworkEditDialog';

interface IRushCardEditorProps extends IContainerProps {
  card: ICard;
  onCardChange: (card: ICard) => void;
}

interface IRushCardEditorState extends IContainerState {
  rendering: boolean;
  import: string;
  card: ICard;
  cardFrames: TFrame[];
  cardAttributes: TAttribute[];
  cardStTypes: TStIcon[];
  appVersion: string;
}

export class RushCardEditor extends Container<IRushCardEditorProps, IRushCardEditorState> {
  private debounceTimeout: NodeJS.Timeout | null = null;

  public static get defaultProps(): Partial<IRushCardEditorProps> {
    return {
      ...super.defaultProps,
      bg: '1',
      scroll: true,
      layout: 'vertical',
    };
  }

  public constructor(props: IRushCardEditorProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      rendering: false,
      import: '',
      card: props.card,
      cardFrames: ['normal', 'effect', 'ritual', 'fusion', 'synchro', 'xyz', 'spell', 'trap', 'monsterToken', 'token'],
      cardAttributes: ['light', 'dark', 'water', 'fire', 'earth', 'wind', 'spell', 'trap'],
      cardStTypes: ['normal', 'ritual', 'quickplay', 'continuous', 'equip', 'field', 'counter'],
      appVersion: `v. ${app.version}`,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IRushCardEditorProps>,
    prevState: Readonly<IRushCardEditorState>,
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
    else if (this.state.card !== prevState.card) {
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

  private async onMultipleFramesChange() {
    const newCard: ICard = { ...this.state.card, multipleFrames: !this.state.card.multipleFrames };
    if (newCard.frames.length > 1) {
      newCard.frames = [newCard.frames[0]];
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

  private async onMaximumChange() {
    await this.setStateAsync({ card: { ...this.state.card, maximum: !this.state.card.maximum } });
  }

  private async onAtkMaxChange(atkMax: string) {
    if (isUndefined(atkMax) || atkMax.length > 6) return;
    if (atkMax && atkMax !== '?' && integer(atkMax) === 0) atkMax = '0';
    await this.setStateAsync({ card: { ...this.state.card, atkMax } });
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

  private async onDontCoverRushArtChange() {
    await this.setStateAsync({ card: { ...this.state.card, dontCoverRushArt: !this.state.card.dontCoverRushArt } });
  }

  private async onLegendChange() {
    await this.setStateAsync({ card: { ...this.state.card, legend: !this.state.card.legend } });
  }

  private async onLegendTypeChange(legendType: TLegendType) {
    await this.setStateAsync({ card: { ...this.state.card, legendType } });
  }

  private async onRushEffectTypeChange(rushEffectType: TRushEffectType) {
    await this.setStateAsync({ card: { ...this.state.card, rushEffectType } });
  }

  private async onRushTextModeChange(rushTextMode: TRushTextMode) {
    await this.setStateAsync({ card: { ...this.state.card, rushTextMode } });
  }

  private async onRushOtherEffectsChange(rushOtherEffects: string) {
    if (isUndefined(rushOtherEffects)) return;
    await this.setStateAsync({ card: { ...this.state.card, rushOtherEffects } });
  }

  private async onRushConditionChange(rushCondition: string) {
    if (isUndefined(rushCondition)) return;
    await this.setStateAsync({ card: { ...this.state.card, rushCondition } });
  }

  private async onRushEffectChange(rushEffect: string) {
    if (isUndefined(rushEffect)) return;
    await this.setStateAsync({ card: { ...this.state.card, rushEffect } });
  }

  private async onCardSetChange(cardSet: string) {
    if (isUndefined(cardSet)) return;
    await this.setStateAsync({ card: { ...this.state.card, cardSet } });
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

  private async onRushChoiceEffectsChange(newValue: string, iChoiceEffect: number) {
    const newCard: ICard = { ...this.state.card };
    newCard.rushChoiceEffects[iChoiceEffect] = newValue;
    await this.setStateAsync({ card: newCard });
  }

  private async onAddChoiceEffect() {
    const newCard: ICard = { ...this.state.card };
    newCard.rushChoiceEffects.push('');
    await this.setStateAsync({ card: newCard });
  }

  private async onRemoveChoiceEffect(index: number) {
    const newCard: ICard = { ...this.state.card };
    newCard.rushChoiceEffects.splice(index, 1);
    await this.setStateAsync({ card: newCard });
  }

  private async onMoveChoiceEffectUp(index: number) {
    if (!index) return;
    const newCard: ICard = { ...this.state.card };
    const newIndex = index - 1;
    const element = newCard.rushChoiceEffects[index];
    newCard.rushChoiceEffects.splice(index, 1);
    newCard.rushChoiceEffects.splice(newIndex, 0, element);
    await this.setStateAsync({ card: newCard });
  }

  private async onMoveChoiceEffectDown(index: number) {
    if (index === this.state.card.rushChoiceEffects.length - 1) return;
    const newCard: ICard = { ...this.state.card };
    const newIndex = index + 1;
    const element = newCard.rushChoiceEffects[index];
    newCard.rushChoiceEffects.splice(index, 1);
    newCard.rushChoiceEffects.splice(newIndex, 0, element);
    await this.setStateAsync({ card: newCard });
  }

  private async onAbilityChange(newValue: string, iAbility: number) {
    const newCard: ICard = { ...this.state.card };
    newCard.abilities[iAbility] = newValue;
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

  private async onMoveAbilityUp(index: number) {
    if (index === 0) return;
    const newCard: ICard = { ...this.state.card };
    const newIndex = index - 1;
    const element = newCard.abilities[index];
    newCard.abilities.splice(index, 1);
    newCard.abilities.splice(newIndex, 0, element);
    await this.setStateAsync({ card: newCard });
  }

  private async onMoveAbilityDown(index: number) {
    if (index === this.state.card.abilities.length - 1) return;
    const newCard: ICard = { ...this.state.card };
    const newIndex = index + 1;
    const element = newCard.abilities[index];
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

  private async showArtworkPopup() {
    const result = await ArtworkEditDialog.show({
      isRush: true,
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
          label={this.state.rendering ? 'Rendu en cours...' : 'Faire le rendu'}
          color='neutral'
          onTap={() => this.renderCurrentCard()}
        />
        <Spacer />
        {!app.$card.tempCurrentCard && (
          <Button
            disabled={this.state.rendering}
            label='Réinitialiser'
            color='negative'
            onTap={() => app.$card.resetCurrentCard()}
          />
        )}
        <Spacer />
        <Button
          disabled={this.state.rendering}
          label='Sauvegarder'
          color='positive'
          onTap={() => app.$card.saveCurrentOrTempToLocal()}
        />
      </HorizontalStack>,

      <VerticalStack key='card-editor-sections' scroll padding gutter className='card-editor-sections'>
        {this.renderBasicCardDetails()}
        {app.$card.hasRushMonsterDetails(this.state.card) && this.renderMonsterCardDetails()}
        {this.renderMiscDetails()}
        <HorizontalStack itemAlignment='right'>
          <Typography variant='help' content={this.state.appVersion} />
        </HorizontalStack>
      </VerticalStack>,
    ];
  }

  private renderBasicCardDetails() {
    const paths = app.$card.paths.rush;
    return (
      <VerticalStack gutter className='card-editor-section basic-section'>
        <HorizontalStack verticalItemAlignment='middle'>
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

        <HorizontalStack verticalItemAlignment='middle'>
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
                    src={paths.spellTraps[stType]}
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

        <TabbedPane<TRushTextMode>
          tabPosition='top'
          bg='2'
          noSpacer
          defaultValue={this.state.card.rushTextMode}
          onChange={(rushTextMode) => this.onRushTextModeChange(rushTextMode)}
          panes={[
            {
              props: { tabId: 'vanilla', label: 'Entier', gutter: true },
              content: (
                <HorizontalStack key='vanilla-desc'>
                  <Icon className='field-icon' size={24} icon='toolkit-script' color='1' />
                  <TextAreaInput
                    autoGrow
                    minRows={5}
                    maxRows={100}
                    spellCheck={false}
                    defaultValue={this.state.card.description}
                    placeholder='Description'
                    onChange={(description) => this.onDescChange(description)}
                  />
                </HorizontalStack>
              ),
            },
            {
              props: { tabId: 'regular', label: 'Condition / Effet', gutter: true },
              content: [
                <HorizontalStack key='regular-other-effects'>
                  <Icon className='field-icon' size={24} icon='toolkit-empty-small-script' color='1' />
                  <TextAreaInput
                    autoGrow
                    minRows={3}
                    maxRows={100}
                    spellCheck={false}
                    defaultValue={this.state.card.rushOtherEffects}
                    placeholder='Autres'
                    onChange={(rushOtherEffects) => this.onRushOtherEffectsChange(rushOtherEffects)}
                  />
                </HorizontalStack>,

                <HorizontalStack key='regular-condition'>
                  <Icon className='field-icon' size={24} icon='toolkit-small-script' color='1' />
                  <TextAreaInput
                    autoGrow
                    minRows={3}
                    maxRows={100}
                    spellCheck={false}
                    defaultValue={this.state.card.rushCondition}
                    placeholder='Condition'
                    onChange={(rushCondition) => this.onRushConditionChange(rushCondition)}
                  />
                </HorizontalStack>,

                <HorizontalStack key='regular-effect'>
                  <Icon className='field-icon' size={24} icon='toolkit-script' color='1' />
                  <TextAreaInput
                    autoGrow
                    minRows={3}
                    maxRows={100}
                    spellCheck={false}
                    defaultValue={this.state.card.rushEffect}
                    placeholder='Effet'
                    onChange={(rushEffect) => this.onRushEffectChange(rushEffect)}
                  />
                </HorizontalStack>,

                <HorizontalStack key='regular-effect-type' fill verticalItemAlignment='middle'>
                  <Icon className='field-icon' size={24} icon='toolkit-print' color='1' />
                  <Select<TRushEffectType>
                    fill
                    minWidth={150}
                    items={[
                      { id: 'effect', label: 'Effet' },
                      { id: 'continuous', label: 'Effet Continu' },
                    ]}
                    defaultValue={this.state.card.rushEffectType}
                    onChange={(rushEffectType) => this.onRushEffectTypeChange(rushEffectType)}
                  />
                </HorizontalStack>,
              ],
            },
            {
              props: { tabId: 'choice', label: 'Effet Multi-Choix', gutter: true },
              content: [
                <HorizontalStack key='choice-other-effects'>
                  <Icon className='field-icon' size={24} icon='toolkit-empty-small-script' color='1' />
                  <TextAreaInput
                    autoGrow
                    minRows={3}
                    maxRows={100}
                    spellCheck={false}
                    placeholder='Autres'
                    defaultValue={this.state.card.rushOtherEffects}
                    onChange={(rushOtherEffects) => this.onRushOtherEffectsChange(rushOtherEffects)}
                  />
                </HorizontalStack>,

                <HorizontalStack key='choice-condition'>
                  <Icon className='field-icon' size={24} icon='toolkit-small-script' color='1' />
                  <TextAreaInput
                    autoGrow
                    minRows={3}
                    maxRows={100}
                    spellCheck={false}
                    placeholder='Condition'
                    defaultValue={this.state.card.rushCondition}
                    onChange={(rushCondition) => this.onRushConditionChange(rushCondition)}
                  />
                </HorizontalStack>,

                <VerticalStack key='choice-choice-effects' className='card-choice-effects'>
                  <HorizontalStack
                    fill
                    className='choice-effects-add'
                    itemAlignment='right'
                    verticalItemAlignment='middle'
                  >
                    <Icon className='field-icon' size={24} icon='toolkit-script' color='1' />
                    <Typography fill variant='help' content='Choix' />
                    <Icon size={24} icon='toolkit-plus' color='positive' onTap={() => this.onAddChoiceEffect()} />
                  </HorizontalStack>

                  <VerticalStack className='card-choice-effects-list'>
                    {this.state.card.rushChoiceEffects.map((choiceEff, iChoiceEff) => (
                      <VerticalStack
                        key={`choice-effect-line-${iChoiceEff}`}
                        className='choice-effects-line'
                        verticalItemAlignment='middle'
                      >
                        <HorizontalStack className='choice-effects-line-icons' verticalItemAlignment='middle'>
                          <Typography fill variant='help' content={`• ${iChoiceEff + 1}`} />
                          <Icon
                            size={24}
                            icon='toolkit-minus'
                            color='negative'
                            onTap={() => this.onRemoveChoiceEffect(iChoiceEff)}
                          />
                          <Icon size={24} icon='toolkit-angle-up' onTap={() => this.onMoveChoiceEffectUp(iChoiceEff)} />
                          <Icon
                            size={24}
                            icon='toolkit-angle-down'
                            onTap={() => this.onMoveChoiceEffectDown(iChoiceEff)}
                          />
                        </HorizontalStack>

                        <TextAreaInput
                          autoGrow
                          minRows={3}
                          maxRows={100}
                          spellCheck={false}
                          placeholder='Effet'
                          defaultValue={choiceEff}
                          onChange={(choiceEff) => this.onRushChoiceEffectsChange(choiceEff, iChoiceEff)}
                        />
                      </VerticalStack>
                    ))}
                  </VerticalStack>
                </VerticalStack>,
              ],
            },
          ]}
        />

        <HorizontalStack>
          <Icon className='field-icon' size={24} icon='toolkit-eye-close' color='1' />
          <CheckBox
            label="Ne pas couvrir l'artwork"
            defaultValue={this.state.card.dontCoverRushArt}
            onChange={() => this.onDontCoverRushArtChange()}
          />
        </HorizontalStack>

        {!this.state.card.dontCoverRushArt && (
          <HorizontalStack gutter className='line-with-checkbox'>
            <HorizontalStack verticalItemAlignment='middle'>
              <Icon className='field-icon' size={24} icon='toolkit-diamond-shine' color='1' />
              <CheckBox label='LEGEND' defaultValue={this.state.card.legend} onChange={() => this.onLegendChange()} />
            </HorizontalStack>

            {this.state.card.legend && (
              <HorizontalStack fill verticalItemAlignment='middle'>
                <Select<TLegendType>
                  fill
                  minWidth={150}
                  items={[
                    { id: 'gold', label: 'Or' },
                    { id: 'goldFoil', label: 'Or Foil' },
                    { id: 'silver', label: 'Argent' },
                    { id: 'silverFoil', label: 'Argent Foil' },
                  ]}
                  defaultValue={this.state.card.legendType}
                  onChange={(legendType) => this.onLegendTypeChange(legendType)}
                />
              </HorizontalStack>
            )}
          </HorizontalStack>
        )}
      </VerticalStack>
    );
  }

  private renderMonsterCardDetails() {
    let levelPlaceholder: string;
    let max: number;
    if (this.state.card.frames.includes('link')) {
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

    return (
      <VerticalStack gutter className='card-editor-section abilities-section'>
        <Typography fill className='sub-title' variant='help' content='Détails' />

        {!this.state.card.dontCoverRushArt && (
          <HorizontalStack gutter>
            <HorizontalStack fill verticalItemAlignment='middle'>
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

            <HorizontalStack fill verticalItemAlignment='middle'>
              <Icon className='field-icon' size={24} icon='toolkit-sword' color='1' />
              <TextInput
                fill
                placeholder='ATK'
                defaultValue={this.state.card.atk}
                onChange={(atk) => this.onAtkChange(atk)}
              />
            </HorizontalStack>

            <HorizontalStack fill verticalItemAlignment='middle'>
              <Icon className='field-icon' size={24} icon='toolkit-shield' color='1' />
              <TextInput
                fill
                placeholder='DEF'
                defaultValue={this.state.card.def}
                onChange={(def) => this.onDefChange(def)}
              />
            </HorizontalStack>
          </HorizontalStack>
        )}

        {!this.state.card.dontCoverRushArt && (
          <HorizontalStack gutter className='line-with-checkbox'>
            <HorizontalStack verticalItemAlignment='middle'>
              <CheckBox
                label='Maximum'
                defaultValue={this.state.card.maximum}
                onChange={() => this.onMaximumChange()}
              />
            </HorizontalStack>

            {this.state.card.maximum && (
              <HorizontalStack fill verticalItemAlignment='middle'>
                <Icon className='field-icon' size={24} icon='toolkit-origami-sword' color='1' />
                <TextInput
                  fill
                  placeholder='ATK MAX'
                  defaultValue={this.state.card.atkMax}
                  onChange={(atkMax) => this.onAtkMaxChange(atkMax)}
                />
              </HorizontalStack>
            )}
          </HorizontalStack>
        )}

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
              minWidth={200}
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

        <Grid>
          <HorizontalStack xl='12' xxl='6' fill verticalItemAlignment='middle'>
            <Icon className='field-icon' size={24} icon='toolkit-sticker' color='1' />
            <Select<TSticker>
              fill
              minWidth={150}
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
