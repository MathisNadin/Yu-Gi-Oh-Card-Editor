import { IArtworkEditDialogResult, ArtworkEditDialog } from 'client/editor/artworkEditDialog';
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
} from 'client/editor/card/card-interfaces';
import {
  IContainableProps,
  IContainableState,
  Containable,
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
  TabPane,
  TextAreaInput,
  ButtonIcon,
  NumberInput,
  InplaceEdit,
  Image,
} from 'mn-toolkit';
import { classNames, debounce, integer, isEmpty, isUndefined } from 'mn-tools';

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
      ...this.state,
      loaded: true,
      import: '',
      card: props.card,
      cardFrames: [
        { id: 'normal', file: require(`../../../assets/images/menu-rd-card-frames/normal.png`) },
        { id: 'effect', file: require(`../../../assets/images/menu-rd-card-frames/effect.png`) },
        { id: 'ritual', file: require(`../../../assets/images/menu-rd-card-frames/ritual.png`) },
        { id: 'fusion', file: require(`../../../assets/images/menu-rd-card-frames/fusion.png`) },
        { id: 'synchro', file: require(`../../../assets/images/menu-rd-card-frames/synchro.png`) },
        { id: 'xyz', file: require(`../../../assets/images/menu-rd-card-frames/xyz.png`) },
        { id: 'spell', file: require(`../../../assets/images/menu-rd-card-frames/spell.png`) },
        { id: 'trap', file: require(`../../../assets/images/menu-rd-card-frames/trap.png`) },
        { id: 'monsterToken', file: require(`../../../assets/images/menu-rd-card-frames/monsterToken.png`) },
        { id: 'token', file: require(`../../../assets/images/menu-rd-card-frames/token.png`) },
      ],
      cardAttributes: [
        { id: 'light', file: require(`../../../assets/images/rd-icons/vanilla/attributeLight.png`) },
        { id: 'dark', file: require(`../../../assets/images/rd-icons/vanilla/attributeDark.png`) },
        { id: 'water', file: require(`../../../assets/images/rd-icons/vanilla/attributeWater.png`) },
        { id: 'fire', file: require(`../../../assets/images/rd-icons/vanilla/attributeFire.png`) },
        { id: 'earth', file: require(`../../../assets/images/rd-icons/vanilla/attributeEarth.png`) },
        { id: 'wind', file: require(`../../../assets/images/rd-icons/vanilla/attributeWind.png`) },
        { id: 'spell', file: require(`../../../assets/images/rd-icons/vanilla/attributeSpell.png`) },
        { id: 'trap', file: require(`../../../assets/images/rd-icons/vanilla/attributeTrap.png`) },
      ],
      cardStTypes: [
        { id: 'normal', file: require(`../../../assets/images/rd-icons/st/normal.png`) },
        { id: 'ritual', file: require(`../../../assets/images/rd-icons/st/ritual.png`) },
        { id: 'quickplay', file: require(`../../../assets/images/rd-icons/st/quickplay.png`) },
        { id: 'continuous', file: require(`../../../assets/images/rd-icons/st/continuous.png`) },
        { id: 'equip', file: require(`../../../assets/images/rd-icons/st/equip.png`) },
        { id: 'field', file: require(`../../../assets/images/rd-icons/st/field.png`) },
        { id: 'counter', file: require(`../../../assets/images/rd-icons/st/counter.png`) },
      ],
      appVersion: `v. ${app.version}`,
    };
  }

  public componentDidUpdate() {
    if (this.props.card !== this.state.card) {
      this.setState({ card: this.props.card });
    }
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

  public onLevelChange(level: number, max: number) {
    if (isUndefined(level)) return;
    if (level > max) return;
    this.state.card.level = level;
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
    if (atk && atk !== '?' && atk !== '∞' && !atk.startsWith('X') && integer(atk) === 0) atk = '0';
    this.state.card.atk = atk;
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  public onDefChange(def: string) {
    if (isUndefined(def) || def.length > 6) return;
    if (def && def !== '?' && def !== '∞' && !def.startsWith('X') && integer(def) === 0) def = '0';
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

  private onRushEffectTypeChange(rushEffectType: TRushEffectType) {
    this.state.card.rushEffectType = rushEffectType;
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
      keepRatio: infos.keepRatio,
    };
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
      keepRatio: false,
    };
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

  private onAddChoiceEffect() {
    this.state.card.rushChoiceEffects.push('');
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onRemoveChoiceEffect(index: number) {
    this.state.card.rushChoiceEffects.splice(index, 1);
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMoveChoiceEffectUp(index: number) {
    if (!index) return;
    const newIndex = index - 1;
    let element = this.state.card.rushChoiceEffects[index];
    this.state.card.rushChoiceEffects.splice(index, 1);
    this.state.card.rushChoiceEffects.splice(newIndex, 0, element);
    this.forceUpdate();
    this.debouncedOnCardChange(this.state.card);
  }

  private onMoveChoiceEffectDown(index: number) {
    if (index === this.state.card.rushChoiceEffects.length - 1) return;
    const newIndex = index + 1;
    let element = this.state.card.rushChoiceEffects[index];
    this.state.card.rushChoiceEffects.splice(index, 1);
    this.state.card.rushChoiceEffects.splice(newIndex, 0, element);
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
    if (!index) return;
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
    if (result) this.onArtworkInfoChange(result);
  }

  public render() {
    return (
      <VerticalStack className='card-editor' fill>
        <HorizontalStack padding className='top-options'>
          <Button
            label='Faire le rendu'
            color='neutral'
            onTap={() => app.$errorManager.handlePromise(app.$card.renderCurrentCard())}
          />
          <Spacer />
          {!app.$card.tempCurrentCard && (
            <Button
              label='Réinitialiser'
              color='negative'
              onTap={() => app.$errorManager.handlePromise(app.$card.resetCurrentCard())}
            />
          )}
          <Spacer />
          <Button
            label='Sauvegarder'
            color='positive'
            onTap={() => app.$errorManager.handlePromise(app.$card.saveCurrentOrTempToLocal())}
          />
        </HorizontalStack>

        <VerticalStack scroll padding gutter className='card-editor-sections'>
          {this.renderBasicCardDetails()}
          {app.$card.hasAbilities(this.state.card) && this.renderMonsterCardDetails()}
          {this.renderMiscDetails()}
          <HorizontalStack itemAlignment='right'>
            <Typography variant='help' content={this.state.appVersion} />
          </HorizontalStack>
        </VerticalStack>
      </VerticalStack>
    );
  }

  private renderBasicCardDetails() {
    return (
      <VerticalStack gutter className='card-editor-section basic-section'>
        <HorizontalStack verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-title' color='1' />
          <TextInput
            fill
            placeholder='Nom'
            defaultValue={this.state.card.name}
            onChange={(name) => this.onNameChange(name)}
          />
        </HorizontalStack>

        <HorizontalStack gutter>
          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' iconId='toolkit-color-palette' color='1' />
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
            <Icon className='field-icon' iconId='toolkit-language' color='1' />
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
        </HorizontalStack>

        <HorizontalStack verticalItemAlignment='middle'>
          <Icon className='field-icon' iconId='toolkit-image' color='1' />
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
              const frameIndex = this.state.card.frames.indexOf(frame.id);
              if (frameIndex >= 0) {
                className = `${className} selected`;
                if (this.state.card.multipleFrames) {
                  className = `${className} selected-${frameIndex + 1}`;
                }
              }
              return (
                <HorizontalStack key={`card-frame-${i}`} className={className} s='12' m='6' l='3' xl='2' xxl='1'>
                  <Image
                    src={frame.file}
                    alt={`frame-${frame.id}`}
                    title={app.$card.getFrameName(frame.id)}
                    onTap={() => this.onFrameChange(frame.id)}
                    maxHeight={60}
                  />
                </HorizontalStack>
              );
            })}
          </Grid>
        </VerticalStack>

        {!app.$card.isOnlySkill(this.state.card) && (
          <VerticalStack gutter>
            <HorizontalStack gutter className='sub-title-container' itemAlignment='center'>
              <Typography fill variant='help' content='Icône' />
            </HorizontalStack>

            <Grid className='card-icons-grid'>
              {this.state.cardAttributes.map((attribute, i) => (
                <HorizontalStack
                  key={`card-attribute-${i}`}
                  className={`card-attribute${this.state.card.attribute === attribute.id ? ' selected' : ''}`}
                  s='12'
                  m='6'
                  l='3'
                  xl='2'
                  xxl='1'
                >
                  <Image
                    src={attribute.file}
                    alt={`attribute-${attribute.id}`}
                    title={app.$card.getAttributeName(attribute.id)}
                    onTap={() => this.onAttributeChange(attribute.id)}
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
                  className={classNames('card-st-icon', { selected: this.state.card.stType === stType.id })}
                  s='12'
                  m='6'
                  l='3'
                  xl='2'
                  xxl='1'
                >
                  <Image
                    src={stType.file}
                    alt={`st-icon-${stType.id}`}
                    title={app.$card.getStIconName(stType.id)}
                    onTap={() => this.onStTypeChange(stType.id)}
                    maxHeight={40}
                  />
                </HorizontalStack>
              ))}
            </Grid>
          </VerticalStack>
        )}

        <TabbedPane
          tabPosition='top'
          defaultValue={this.state.card.rushTextMode}
          onChange={(rushTextMode) => this.onRushTextModeChange(rushTextMode as TRushTextMode)}
        >
          <TabPane id='vanilla' fill={false} label='Entier' gutter>
            <HorizontalStack>
              <Icon className='field-icon' iconId='toolkit-script' color='1' />
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
          </TabPane>

          <TabPane id='regular' fill={false} label='Condition / Effet' gutter>
            <HorizontalStack>
              <Icon className='field-icon' iconId='toolkit-empty-small-script' color='1' />
              <TextAreaInput
                autoGrow
                minRows={3}
                maxRows={100}
                spellCheck={false}
                defaultValue={this.state.card.rushOtherEffects}
                placeholder='Autres'
                onChange={(rushOtherEffects) => this.onRushOtherEffectsChange(rushOtherEffects)}
              />
            </HorizontalStack>

            <HorizontalStack>
              <Icon className='field-icon' iconId='toolkit-small-script' color='1' />
              <TextAreaInput
                autoGrow
                minRows={3}
                maxRows={100}
                spellCheck={false}
                defaultValue={this.state.card.rushCondition}
                placeholder='Condition'
                onChange={(rushCondition) => this.onRushConditionChange(rushCondition)}
              />
            </HorizontalStack>

            <HorizontalStack>
              <Icon className='field-icon' iconId='toolkit-script' color='1' />
              <TextAreaInput
                autoGrow
                minRows={3}
                maxRows={100}
                spellCheck={false}
                defaultValue={this.state.card.rushEffect}
                placeholder='Effet'
                onChange={(rushEffect) => this.onRushEffectChange(rushEffect)}
              />
            </HorizontalStack>

            <HorizontalStack fill verticalItemAlignment='middle'>
              <Icon className='field-icon' iconId='toolkit-print' color='1' />
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
            </HorizontalStack>
          </TabPane>

          <TabPane id='choice' fill={false} label='Effet au Choix' gutter>
            <HorizontalStack>
              <Icon className='field-icon' iconId='toolkit-empty-small-script' color='1' />
              <TextAreaInput
                autoGrow
                minRows={3}
                maxRows={100}
                spellCheck={false}
                placeholder='Autres'
                defaultValue={this.state.card.rushOtherEffects}
                onChange={(rushOtherEffects) => this.onRushOtherEffectsChange(rushOtherEffects)}
              />
            </HorizontalStack>

            <HorizontalStack>
              <Icon className='field-icon' iconId='toolkit-small-script' color='1' />
              <TextAreaInput
                autoGrow
                minRows={3}
                maxRows={100}
                spellCheck={false}
                placeholder='Condition'
                defaultValue={this.state.card.rushCondition}
                onChange={(rushCondition) => this.onRushConditionChange(rushCondition)}
              />
            </HorizontalStack>

            <VerticalStack className='card-choice-effects'>
              <HorizontalStack fill className='choice-effects-add' itemAlignment='right' verticalItemAlignment='middle'>
                <Icon className='field-icon' iconId='toolkit-script' color='1' />
                <Typography fill variant='help' content='Choix' />
                <ButtonIcon icon='toolkit-plus' color='positive' onTap={() => this.onAddChoiceEffect()} />
              </HorizontalStack>

              <VerticalStack className='card-choice-effects-list'>
                {this.state.card.rushChoiceEffects.map((choiceEff, iChoiceEff) => (
                  <VerticalStack
                    key={`choice-effect-line-${iChoiceEff}`}
                    fill
                    className='choice-effects-line'
                    verticalItemAlignment='middle'
                  >
                    <HorizontalStack className='choice-effects-line-icons' verticalItemAlignment='middle'>
                      <Typography fill variant='help' content={`• ${iChoiceEff + 1}`} />
                      <ButtonIcon
                        icon='toolkit-minus'
                        color='negative'
                        onTap={() => this.onRemoveChoiceEffect(iChoiceEff)}
                      />
                      <ButtonIcon icon='toolkit-angle-up' onTap={() => this.onMoveChoiceEffectUp(iChoiceEff)} />
                      <ButtonIcon icon='toolkit-angle-down' onTap={() => this.onMoveChoiceEffectDown(iChoiceEff)} />
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
            </VerticalStack>
          </TabPane>
        </TabbedPane>

        <HorizontalStack>
          <Icon className='field-icon' iconId='toolkit-eye-close' color='1' />
          <CheckBox
            label="Ne pas couvrir l'artwork"
            defaultValue={this.state.card.dontCoverRushArt}
            onChange={() => this.onDontCoverRushArtChange()}
          />
        </HorizontalStack>

        {!this.state.card.dontCoverRushArt && (
          <HorizontalStack gutter className='line-with-checkbox'>
            <HorizontalStack verticalItemAlignment='middle'>
              <Icon className='field-icon' iconId='toolkit-diamond-shine' color='1' />
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
              <Icon className='field-icon' iconId='toolkit-star' color='1' />
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
              <Icon className='field-icon' iconId='toolkit-sword' color='1' />
              <TextInput
                fill
                placeholder='ATK'
                defaultValue={this.state.card.atk}
                onChange={(atk) => this.onAtkChange(atk)}
              />
            </HorizontalStack>

            <HorizontalStack fill verticalItemAlignment='middle'>
              <Icon className='field-icon' iconId='toolkit-shield' color='1' />
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
                <Icon className='field-icon' iconId='toolkit-origami-sword' color='1' />
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
            <ButtonIcon icon='toolkit-plus' color='positive' onTap={() => this.onAddAbility()} />
          </HorizontalStack>

          <VerticalStack className='card-abilities-list'>
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
                  focusOnSingleClick
                  validateOnEnter
                  key={`${iAbility}-${ability}`}
                  value={ability}
                  onChange={(newValue) => this.onAbilityChange(newValue, iAbility)}
                />

                <HorizontalStack className='abilities-line-icons'>
                  <ButtonIcon icon='toolkit-minus' color='negative' onTap={() => this.onRemoveAbility(iAbility)} />
                  {this.state.card.abilities.length > 1 && (
                    <ButtonIcon icon='toolkit-angle-up' onTap={() => this.onMoveAbilityUp(iAbility)} />
                  )}
                  {this.state.card.abilities.length > 1 && (
                    <ButtonIcon icon='toolkit-angle-down' onTap={() => this.onMoveAbilityDown(iAbility)} />
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

        <HorizontalStack gutter>
          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' iconId='toolkit-id' color='1' />
            <TextInput
              fill
              placeholder='Set'
              defaultValue={this.state.card.cardSet}
              onChange={(cardSet) => this.onCardSetChange(cardSet)}
            />
          </HorizontalStack>

          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' iconId='toolkit-print' color='1' />
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
        </HorizontalStack>

        <HorizontalStack gutter>
          <HorizontalStack fill verticalItemAlignment='middle'>
            <Icon className='field-icon' iconId='toolkit-sticker' color='1' />
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
      </VerticalStack>
    );
  }
}
