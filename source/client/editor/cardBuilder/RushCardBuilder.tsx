/* eslint-disable @typescript-eslint/no-var-requires */
import { CSSProperties, Fragment } from 'react';
import html2canvas from 'html2canvas';
import { classNames, debounce, getCroppedArtworkBase64, isEmpty } from 'libraries/mn-tools';
import { ICard } from 'client/editor/card/card-interfaces';
import {
  IContainableProps,
  IContainableState,
  Containable,
  Spinner,
  Container,
  HorizontalStack,
  VerticalStack,
} from 'libraries/mn-toolkit';

interface IRushCardBuilderProps extends IContainableProps {
  forRender?: boolean;
  id: string;
  card: ICard;
  onCardReady: () => void;
}

type TAdjustState = 'waiting' | 'todo' | 'name' | 'atkMax' | 'atk' | 'def' | 'abilities' | 'desc' | 'done';

interface IRushCardBuilderState extends IContainableState {
  adjustState: TAdjustState;
  adjustTextState: 'unknown' | 'tooBig' | 'tooSmall';

  artworkBg: string;
  croppedArtworkBase64: string;

  cardFrames: string[];
  abilities: string[];
  hasStIcon: boolean;

  descFontSize: number;
  descLineHeight: number;
  description: JSX.Element[][];
  pendFontSize: number;
  pendLineHeight: number;

  legend: string;
  attribute: string;
  levelStar: string;
  level: string;
  rankStar: string;
  rank: string;
  stIcon: string;

  atkDefLine: string;
  atkMaxLine: string;
  sticker: string;
  copyright: string;
  edition: string;
}

export class RushCardBuilder extends Containable<IRushCardBuilderProps, IRushCardBuilderState> {
  private ref: HTMLDivElement | undefined;
  private debouncedRefreshState: (card: ICard) => void;

  public constructor(props: IRushCardBuilderProps) {
    super(props);
    this.debouncedRefreshState = debounce(
      (card: ICard) => app.$errorManager.handlePromise(this.refreshState(card)),
      500
    );
    if (!props.forRender) this.handleResize = this.handleResize.bind(this);
  }

  public componentDidMount() {
    if (!this.props.forRender) window.addEventListener('resize', this.handleResize);
    this.debouncedRefreshState(this.props.card);
  }

  public componentDidUpdate(prevProps: IRushCardBuilderProps) {
    if (prevProps.card !== this.props.card) {
      this.setState({ adjustState: 'waiting' }, () => {
        this.debouncedRefreshState(this.props.card);
      });
    }
  }

  public componentWillUnmount() {
    if (!this.props.forRender) window.removeEventListener('resize', this.handleResize);
  }

  private handleResize() {
    app.$errorManager.handlePromise(this.adjustAllFontSizes());
  }

  private async refreshState(card: ICard) {
    if (!card) return;

    const artworkBg = require(`../../../assets/images/rdWhiteArtwork.png`);
    let croppedArtworkBase64: string;

    let artworkExists = false;
    if (!isEmpty(card.artwork.url) && app.$device.isDesktop) {
      try {
        artworkExists = await window.electron.ipcRenderer.checkFileExists(card.artwork.url);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }

    if (artworkExists) {
      croppedArtworkBase64 = `file://${card.artwork.url}`;
      try {
        croppedArtworkBase64 = await window.electron.ipcRenderer.createImgFromPath(card.artwork.url);
        croppedArtworkBase64 = await getCroppedArtworkBase64(croppedArtworkBase64, {
          x: card.artwork.x,
          y: card.artwork.y,
          height: card.artwork.height,
          width: card.artwork.width,
          unit: '%',
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    } else {
      croppedArtworkBase64 = artworkBg;
    }

    let cardFrames: string[] = [];

    let includesSpell = false;
    let includesOther = false;
    for (let frame of card.frames) {
      switch (frame) {
        case 'spell':
          includesSpell = true;
          break;

        case 'trap':
          break;

        default:
          includesOther = true;
          break;
      }
      cardFrames.push(require(`../../../assets/images/rd-card-frames/${frame}.png`));
    }

    let hasStIcon = false;
    let abilities: string[] = [];
    if (includesOther) {
      abilities = card.abilities;
    } else if (includesSpell) {
      abilities.push(card.language === 'fr' ? 'Carte Magie' : 'Spell Card');
      if (card.stType !== 'normal') {
        hasStIcon = true;
        abilities.push(app.$card.getStTypeName(card.stType, card.language, true));
      }
    } else {
      abilities.push(card.language === 'fr' ? 'Carte Piège' : 'Trap Card');
      if (card.stType !== 'normal') {
        hasStIcon = true;
        abilities.push(app.$card.getStTypeName(card.stType, card.language, true));
      }
    }

    const copyrightPath = `${card.oldCopyright ? '1996' : '2020'}`;

    let description: JSX.Element[][] = [];
    switch (card.rushTextMode) {
      case 'vanilla':
        description = card.description.split('\n').map((d, i) => this.getProcessedText(d, i));
        break;

      case 'regular':
        let effectLabel = '';
        switch (card.rushEffectType) {
          case 'effect':
            effectLabel = card.language === 'fr' ? '[Effet] ' : '[Effect] ';
            break;

          case 'continuous':
            effectLabel = card.language === 'fr' ? '[Effet Continu] ' : '[Continuous Effect] ';
            break;

          default:
            break;
        }
        if (card.rushOtherEffects) {
          description.push(...card.rushOtherEffects.split('\n').map((d, i) => this.getProcessedText(d, i)));
        }
        description.push(
          [
            <span key={`rush-label-condition`} className='span-text rush-label condition'>
              {'[Condition] '}
            </span>,
          ].concat(...card.rushCondition.split('\n').map((d, i) => this.getProcessedText(d, i))),
          [
            <span key={`rush-label-effect`} className='span-text rush-label effect'>
              {effectLabel}
            </span>,
          ].concat(...card.rushEffect.split('\n').map((d, i) => this.getProcessedText(d, i)))
        );
        break;

      case 'choice':
        if (card.rushOtherEffects) {
          description.push(...card.rushOtherEffects.split('\n').map((d, i) => this.getProcessedText(d, i)));
        }
        let choiceEffectsLabel = card.language === 'fr' ? '[Effet au Choix] ' : '[Multi-Choice Effect] ';
        description.push(
          [
            <span key={`rush-label-condition`} className='span-text rush-label condition'>
              {'[Condition] '}
            </span>,
          ].concat(...card.rushCondition.split('\n').map((d, i) => this.getProcessedText(d, i))),
          [
            <span key={`rush-label-effect`} className='span-text rush-label effect'>
              {choiceEffectsLabel}
            </span>,
          ]
        );
        for (let choice of card.rushChoiceEffects) {
          description.push(...choice.split('\n').map((d, i) => this.getProcessedText(d, i, true)));
        }
        break;

      default:
        break;
    }

    const state: IRushCardBuilderState = {
      loaded: true,
      adjustState: 'todo',
      adjustTextState: 'unknown',

      artworkBg,
      croppedArtworkBase64,

      cardFrames,
      abilities,
      hasStIcon,

      descFontSize: 30,
      descLineHeight: 1.2,
      description,
      pendFontSize: 30,
      pendLineHeight: 1.2,

      legend: require(`../../../assets/images/rd-legend/${card.legendType}.png`),
      attribute: require(`../../../assets/images/rd-attributes/${card.language}/${card.attribute}.png`),
      levelStar: require(`../../../assets/images/rd-levels/star.png`),
      level: require(`../../../assets/images/rd-levels/${card.level}.png`),
      rankStar: require(`../../../assets/images/rd-ranks/star.png`),
      rank: require(`../../../assets/images/rd-ranks/${card.level}.png`),
      stIcon: require(`../../../assets/images/rd-icons/st/${card.stType}.png`),

      atkDefLine: require(`../../../assets/images/rdAtkDefLine.png`),
      atkMaxLine: require(`../../../assets/images/rdAtkMaxLine.png`),
      sticker: require(`../../../assets/images/rd-stickers/${card.sticker === 'none' ? 'silver' : card.sticker}.png`),
      copyright: require(`../../../assets/images/rd-limitations/${card.language}/${copyrightPath}/copyright.png`),
      edition: require(
        `../../../assets/images/rd-limitations/${card.language}/${copyrightPath}/${card.edition === 'unlimited' ? 'limited' : card.edition}.png`
      ),
    };

    this.setState(state);
    app.$errorManager.handlePromise(this.adjustAllFontSizes());
  }

  private getProcessedText(text: string, index: number, forceBulletAtStart?: boolean) {
    const parts = text.split(/(●|•)/).map((part) => part.trim());
    if (parts.length && !parts[0]) parts.shift();

    let nextHasBullet = false;
    const processedText: JSX.Element[] = [];
    parts.forEach((part, i) => {
      if (part === '●' || part === '•') {
        nextHasBullet = true;
      } else {
        let classes = classNames('span-text', {
          'with-bullet-point': nextHasBullet || (!i && forceBulletAtStart),
          'in-middle': i > 1,
        });
        nextHasBullet = false;
        processedText.push(
          <span key={`processed-text-${index}-${i}`} className={classes}>
            {part}
          </span>
        );
      }
    });

    return processedText;
  }

  private async adjustAllFontSizes() {
    switch (this.state.adjustState) {
      case 'todo':
        this.setState({ adjustState: 'name' });
        break;
      case 'name':
        await this.convertNameToImg();
        break;
      case 'atkMax':
        this.convertAtkMaxToImg();
        break;
      case 'atk':
        this.convertAtkToImg();
        break;
      case 'def':
        this.convertDefToImg();
        break;
      case 'abilities':
        await this.convertAbilitiesToImg();
        break;
      case 'desc':
        this.adjustDescFontSize();
        break;
      case 'done':
        if (this.props.onCardReady) this.props.onCardReady();
        break;
      default:
        break;
    }
  }

  public async convertNameToImg() {
    const container = this.ref?.querySelector('.card-name-container') as HTMLDivElement;
    if (!container) return;

    const name = container.querySelector('.card-name') as HTMLDivElement;
    if (!name) return;

    if (this.props.card.frames.includes('skill')) {
      name.style.width = `${name.scrollWidth + 6}px`;
      name.style.height = `${name.scrollHeight + 3}px`;
    } else {
      name.style.width = '';
      name.style.height = '';
    }

    const canvas = await html2canvas(name, { backgroundColor: null });
    canvas.className = 'html2canvas-name';
    const existingCanvas = container.querySelector('.html2canvas-name');
    if (existingCanvas) {
      container.replaceChild(canvas, existingCanvas);
    } else {
      container.appendChild(canvas);
    }
    this.setState({ adjustState: 'atkMax' });
  }

  public async convertAtkMaxToImg() {
    if (!this.props.card.dontCoverRushArt && app.$card.hasAbilities(this.props.card) && this.props.card.maximum) {
      const container = this.ref?.querySelector('.atk-max') as HTMLDivElement;
      if (!container) return;
      const atkMax = container.querySelector('.atk-max-text') as HTMLParagraphElement;
      if (!atkMax) return;
      atkMax.classList.remove('hidden');

      const canvas = await html2canvas(atkMax, { backgroundColor: null });
      canvas.className = 'html2canvas html2canvas-atk-max';
      if (container.classList.contains('compressed')) {
        canvas.classList.add('compressed');
      }

      const existingCanvas = container.querySelector('.html2canvas-atk-max');
      if (existingCanvas) {
        container.replaceChild(canvas, existingCanvas);
      } else {
        container.appendChild(canvas);
      }
      atkMax.classList.add('hidden');
    }
    this.setState({ adjustState: 'atk' });
  }

  public async convertAtkToImg() {
    if (!this.props.card.dontCoverRushArt && app.$card.hasAbilities(this.props.card)) {
      const container = this.ref?.querySelector('.atk') as HTMLDivElement;
      if (!container) return;
      const atk = container.querySelector('.atk-text') as HTMLParagraphElement;
      if (!atk) return;
      atk.classList.remove('hidden');

      const canvas = await html2canvas(atk, { backgroundColor: null });
      canvas.className = 'html2canvas html2canvas-atk';
      if (container.classList.contains('compressed')) {
        canvas.classList.add('compressed');
      }

      const existingCanvas = container.querySelector('.html2canvas-atk');
      if (existingCanvas) {
        container.replaceChild(canvas, existingCanvas);
      } else {
        container.appendChild(canvas);
      }
      atk.classList.add('hidden');
    }
    this.setState({ adjustState: 'def' });
  }

  public async convertDefToImg() {
    if (!this.props.card.dontCoverRushArt && app.$card.hasAbilities(this.props.card)) {
      const container = this.ref?.querySelector('.def') as HTMLDivElement;
      if (!container) return;
      const def = container.querySelector('.def-text') as HTMLParagraphElement;
      if (!def) return;
      def.classList.remove('hidden');

      const canvas = await html2canvas(def, { backgroundColor: null });
      canvas.className = 'html2canvas html2canvas-def';
      if (container.classList.contains('compressed')) {
        canvas.classList.add('compressed');
      }

      const existingCanvas = container.querySelector('.html2canvas-def');
      if (existingCanvas) {
        container.replaceChild(canvas, existingCanvas);
      } else {
        container.appendChild(canvas);
      }
      def.classList.add('hidden');
    }
    this.setState({ adjustState: 'abilities' });
  }

  public async convertAbilitiesToImg() {
    const container = this.ref?.querySelector('.card-abilities') as HTMLDivElement;
    if (!container) return;
    const rightBracket = container.querySelector('.right-bracket') as HTMLDivElement;
    const abilities = container.querySelector('.abilities') as HTMLDivElement;
    if (!rightBracket || !abilities) return;

    const canvas = await html2canvas(abilities, { backgroundColor: null });
    canvas.className = 'html2canvas-abilities';
    if (abilities.classList.contains('with-st-icon')) {
      canvas.classList.add('with-st-icon');
    }

    const existingCanvas = container.querySelector('.html2canvas-abilities');
    if (existingCanvas) {
      container.replaceChild(canvas, existingCanvas);
    } else {
      const rushStIcon = container.querySelector('.rush-st-icon') as HTMLDivElement;
      container.insertBefore(canvas, rushStIcon || rightBracket);
    }
    this.setState({ adjustState: 'desc' });
  }

  public adjustDescFontSize() {
    const container = this.ref?.querySelector('.card-description-holder') as HTMLDivElement;
    const texts = this.ref?.querySelectorAll('.description-text') as NodeListOf<HTMLDivElement>;
    if (!container || !texts?.length || this.state.descFontSize === 0) {
      this.setState({ adjustState: 'done' });
      return;
    }

    let textHeight = 0;
    let textWidth = 0;
    textWidth = texts[0].clientWidth;
    texts.forEach((text) => {
      textHeight += text.clientHeight;
    });
    const parentHeight = container.clientHeight;
    const parentWidth = container.clientWidth;
    const fontSize = this.state.descFontSize;

    if (textHeight > parentHeight || textWidth > parentWidth) {
      const newFontSize = fontSize - 0.5;
      let newLineHeight = 1 + (12 - newFontSize) / 90;
      if (newLineHeight < 1.05) newLineHeight = 1.05;

      if (newFontSize >= 5) {
        this.setState({ descFontSize: newFontSize, descLineHeight: newLineHeight, adjustTextState: 'tooBig' });
      } else {
        this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
      }
    } else if (textHeight < parentHeight || textWidth < parentWidth) {
      if (this.state.adjustTextState === 'tooBig') {
        if (this.state.descLineHeight < 1.2) {
          let newLineHeight = this.state.descLineHeight + 0.1;
          if (newLineHeight > 1.2) newLineHeight = 1.2;
          this.setState({ descLineHeight: newLineHeight });
        } else {
          this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
        }
      } else {
        const newFontSize = fontSize + 0.5;
        let newLineHeight = 1 + (12 + newFontSize) / 90;
        if (newLineHeight > 1.2) newLineHeight = 1.2;

        if (newFontSize <= 30) {
          this.setState({ descFontSize: newFontSize, descLineHeight: newLineHeight, adjustTextState: 'tooSmall' });
        } else {
          this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
        }
      }
    } else {
      this.setState({ adjustState: 'done', adjustTextState: 'unknown' });
    }
  }

  private getFramesStylesArray(num: number): string[] {
    const array: number[] = [];
    let sum = 0;
    let middleIndex: number;

    if (num % 2 === 0) {
      middleIndex = num / 2;
      for (let i = 1; i <= middleIndex; i++) {
        const distanceFromMiddle = i - 0.5;
        const multiplier = 1.4 ** (middleIndex - distanceFromMiddle);
        const value = (multiplier * 100) / (1.4 ** middleIndex * 2 - 1);
        array.unshift(value); // Ajouter à gauche
        array.push(value); // Ajouter à droite
        sum += 2 * value;
      }
    } else {
      middleIndex = Math.floor(num / 2);
      for (let i = 0; i < num; i++) {
        let value: number;
        if (i === middleIndex) {
          value = 1;
        } else {
          const distanceFromMiddle = Math.abs(i - middleIndex);
          value = 1 / 1.4 ** distanceFromMiddle;
        }

        array.push(value);
        sum += value;
      }
    }

    const scaleFactor = 100 / sum;
    let add = 0;
    const scaledArray = array.map((value, index) => {
      let stringValue: string;
      if (!index) {
        stringValue = `0%`;
      } else {
        stringValue = `${add * scaleFactor}%`;
      }
      add += value;
      return stringValue;
    });
    return scaledArray;
  }

  public render() {
    if (!this.props.card) return <div></div>;

    if (!this.state?.loaded) return <Spinner />;

    let artworkClass = 'card-layer artwork-container';
    if (app.$card.hasPendulumFrame(this.props.card)) {
      if (this.props.card.frames.includes('link')) {
        artworkClass = `${artworkClass} artwork-pendulum-link`;
      } else {
        artworkClass = `${artworkClass} artwork-pendulum`;
      }

      if (this.props.card.artwork.pendulum) {
        artworkClass = `${artworkClass} in-pendulum-effect`;
      }
    }

    const specificties = this.getSpecifities();

    return this.renderAttributes(
      <Container id={this.props.id} ref={() => (this.ref = document.getElementById(this.props.id) as HTMLDivElement)}>
        <img className='card-layer artworkBg' src={this.state.artworkBg} alt='artworkBg' />
        {this.renderAttributes(
          <div>
            <img className='artwork' src={this.state.croppedArtworkBase64} alt='artwork' />
          </div>,
          artworkClass
        )}

        {this.renderFrames(this.state.cardFrames, 'card-frame')}

        {!this.props.card.dontCoverRushArt && this.props.card.legend && (
          <img className='card-layer legend' src={this.state.legend} alt='legend' />
        )}

        <img className='card-layer attribute' src={this.state.attribute} alt='attribute' />

        {app.$card.hasAbilities(this.props.card) && !this.props.card.dontCoverRushArt && this.props.card.maximum && (
          <img className='card-layer atk-max-line' src={this.state.atkMaxLine} alt='atkMaxLine' />
        )}
        {app.$card.hasAbilities(this.props.card) && !this.props.card.dontCoverRushArt && (
          <img className='card-layer atk-def-line' src={this.state.atkDefLine} alt='atkDefLine' />
        )}

        {specificties.lv && <img className='card-layer level-star' src={this.state.levelStar} alt='levelStar' />}
        {specificties.lv && <img className='card-layer level' src={this.state.level} alt='level' />}

        {specificties.rk && <img className='card-layer rank-star' src={this.state.rankStar} alt='rankStar' />}
        {specificties.rk && <img className='card-layer rank' src={this.state.rank} alt='rank' />}

        {this.props.card.sticker !== 'none' && (
          <img className='card-layer sticker' src={this.state.sticker} alt='sticker' />
        )}

        {this.props.card.edition === 'unlimited' && (
          <p className='card-layer card-set white-text'>{this.props.card.cardSet}</p>
        )}

        {!this.props.card.dontCoverRushArt && this.props.card.maximum && app.$card.hasAbilities(this.props.card) && (
          <Container
            className={classNames('card-layer', 'atk-def', 'atk-max', {
              'question-mark': this.props.card.atkMax === '?',
              compressed: this.props.card.atkMax?.length > 4,
            })}
          >
            <p
              className={classNames('stat-text', 'atk-max-text', 'white-text', 'hidden', {
                infinity: this.props.card.atkMax === '∞',
              })}
            >
              {this.props.card.atkMax}
            </p>
          </Container>
        )}

        {!this.props.card.dontCoverRushArt && app.$card.hasAbilities(this.props.card) && (
          <Container
            className={classNames('card-layer', 'atk-def', 'atk', {
              'question-mark': this.props.card.atk === '?',
              compressed: this.props.card.atk?.length > 4,
            })}
          >
            <p
              className={classNames('stat-text', 'atk-text', 'white-text', 'hidden', {
                infinity: this.props.card.atk === '∞',
              })}
            >
              {this.props.card.atk}
            </p>
          </Container>
        )}

        {!this.props.card.dontCoverRushArt && app.$card.hasAbilities(this.props.card) && (
          <Container
            className={classNames('card-layer', 'atk-def', 'def', {
              'question-mark': this.props.card.def === '?',
              compressed: this.props.card.def?.length > 4,
            })}
          >
            <p
              className={classNames('stat-text', 'def-text', 'white-text', 'hidden', {
                infinity: this.props.card.def === '∞',
              })}
            >
              {this.props.card.def}
            </p>
          </Container>
        )}

        {this.props.card.hasCopyright && (
          <img className='card-layer copyright' src={this.state.copyright} alt='copyright' />
        )}
        {this.props.card.edition !== 'unlimited' && (
          <img className='card-layer edition' src={this.state.edition} alt='edition' />
        )}

        {this.renderAbilities()}

        {this.renderDescription()}

        {this.renderName()}
      </Container>,
      'card-builder rush-card-builder'
    );
  }

  private renderName() {
    let hStackClassName = `card-layer card-name-container`;
    let pClassName = `card-layer card-name ${this.props.card.nameStyle}`;
    if (this.props.card.frames.includes('skill')) {
      pClassName = `${pClassName} white-text skill-name`;
      hStackClassName = `${hStackClassName} skill-name-container`;
    } else {
      pClassName = `${pClassName} ${this.props.card.frames.includes('xyz') || this.props.card.frames.includes('link') || app.$card.isBackrow(this.props.card) ? 'white' : 'black'}-text`;
      if (this.props.card.frames.includes('link')) {
        pClassName = `${pClassName} on-link`;
      }
    }

    const specialCharsRegex = /([^a-zA-Z0-9éäöüçñàèùâêîôûÉÄÖÜÇÑÀÈÙÂÊÎÔÛ\s.,;:'"/?!+-/&"'()`_^=])/;
    const parts = this.props.card.name.split(specialCharsRegex);

    let processedText = parts.map((part, i) =>
      specialCharsRegex.test(part) ? (
        <span key={`special-char-span-${i}`} className='special-char-span'>
          {part}
        </span>
      ) : (
        part
      )
    );

    return this.renderAttributes(
      <HorizontalStack>
        <p className={pClassName}>{processedText}</p>
      </HorizontalStack>,
      hStackClassName
    );
  }

  private renderFrames(frames: string[], className: string) {
    const styleArray = this.getFramesStylesArray(frames.length);
    return this.renderAttributes(
      <HorizontalStack>
        {frames.map((frame, index) => {
          const style: CSSProperties = {};
          if (index)
            style.clipPath = `polygon(100% 0%, ${styleArray[index]} 0%, 50% 50%, ${styleArray[index]} 100%, 100% 100%)`;
          return (
            <img
              key={`rush-card-frame-${index}`}
              style={style}
              className={classNames('card-frame', className)}
              src={frame}
              alt={className}
            />
          );
        })}
      </HorizontalStack>,
      'card-layer card-frames-container'
    );
  }

  private renderAbilities() {
    let text = this.state.abilities.join(' / ');
    const upperCaseIndexes = text
      .split('')
      .map((char, index) => (char === char.toUpperCase() ? index : -1))
      .filter((i) => i !== -1);
    const lowerCaseText = text.toLowerCase();
    let firstIndexLowerCase: boolean;
    if (!upperCaseIndexes.includes(0)) {
      upperCaseIndexes.unshift(0);
      firstIndexLowerCase = true;
    }

    let useWhiteText = this.props.card.frames.includes('xyz');

    return this.renderAttributes(
      <HorizontalStack>
        <p
          className={classNames('abilities-text', 'abilities-bracket', 'left-bracket', {
            'black-text': !useWhiteText,
            'white-text': useWhiteText,
          })}
        >
          [
        </p>

        <p
          className={classNames('abilities-text', 'abilities', {
            'with-st-icon': this.state.hasStIcon,
            'black-text': !useWhiteText,
            'white-text': useWhiteText,
          })}
        >
          {upperCaseIndexes.map((index, i) => (
            <Fragment key={`uppercase-index-${i}`}>
              <span className={i === 0 && firstIndexLowerCase ? 'lowercase' : 'uppercase'}>
                {text.slice(index, index + 1)}
              </span>
              <span className='lowercase'>
                {lowerCaseText.slice(index + 1, upperCaseIndexes[i + 1] || text.length)}
              </span>
            </Fragment>
          ))}
        </p>

        {this.state.hasStIcon && <img className='rush-st-icon' src={this.state.stIcon} alt='stIcon' />}

        <p
          className={classNames('abilities-text', 'abilities-bracket', 'right-bracket', {
            'black-text': !useWhiteText,
            'white-text': useWhiteText,
          })}
        >
          ]
        </p>
      </HorizontalStack>,
      'card-layer card-abilities'
    );
  }

  private renderPendulum() {
    const pendEffect = this.props.card.pendEffect.split('\n');

    return this.renderAttributes(
      <VerticalStack>
        {pendEffect.map((text, i) => {
          let withBulletPoint = false;
          if (text.startsWith('●')) {
            withBulletPoint = true;
            text = text.replace(/^●\s*/, '');
          }
          return (
            <p
              key={`pendulum-effect-${i}`}
              className={classNames('pendulum-effect-text', 'black-text', { 'with-bullet-point': withBulletPoint })}
              style={{
                fontSize: `${this.state.pendFontSize}px`,
                lineHeight: this.state.pendLineHeight,
                marginBottom: this.state.pendLineHeight / 2,
              }}
            >
              {text}
            </p>
          );
        })}
      </VerticalStack>,
      `card-layer card-pendulum-effect-holder ${this.props.card.frames.includes('link') ? 'on-link' : ''} ${this.state.adjustState === 'done' ? '' : 'hidden'}`
    );
  }

  private renderDescription() {
    let containerClass = `card-layer card-description-holder${this.state.adjustState === 'done' ? '' : ' hidden'}`;
    if (this.props.card.frames.includes('normal')) containerClass = `${containerClass} normal-text`;
    if (app.$card.hasPendulumFrame(this.props.card) && this.props.card.frames.includes('link'))
      containerClass = `${containerClass} on-pendulum-link`;

    return this.renderAttributes(
      <VerticalStack>
        {this.state.description.map((d, i) => {
          return (
            <p
              key={`rush-description-text-${i}`}
              className='description-text black-text'
              style={{
                fontSize: `${this.state.descFontSize}px`,
                lineHeight: this.state.descLineHeight,
                marginBottom: this.state.descLineHeight / 2,
              }}
            >
              {d}
            </p>
          );
        })}
      </VerticalStack>,
      containerClass
    );
  }

  private getSpecifities(): { lv: boolean; rk: boolean } {
    let includesXyz = false;

    for (let frame of this.props.card.frames) {
      if (frame === 'spell' || frame === 'trap' || frame === 'token') {
        return { lv: false, rk: false };
      } else if (frame === 'xyz') {
        includesXyz = true;
      }
    }

    if (!this.props.card.dontCoverRushArt) {
      if (includesXyz) {
        return { lv: false, rk: true };
      } else {
        return { lv: true, rk: false };
      }
    } else {
      return { lv: false, rk: false };
    }
  }
}
