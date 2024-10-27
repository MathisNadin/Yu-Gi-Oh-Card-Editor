/* eslint-disable @typescript-eslint/no-var-requires */
import { createRef, CSSProperties, Fragment } from 'react';
import { classNames, deepClone, isDeepEqual, preloadImage } from 'mn-tools';
import { ICard } from 'client/editor/card/card-interfaces';
import { IContainableProps, IContainableState, Containable, JSXElementChild, TDidUpdateSnapshot } from 'mn-toolkit';
import {
  RushCardArtwork,
  RushCardDesc,
  RushCardName,
  RushCardAbilities,
  RushCardAtkMax,
  RushCardAtk,
  RushCardDef,
} from './rushCardSubBuilders';

interface IRushCardBuilderProps extends IContainableProps {
  forRender?: boolean;
  id: string;
  card: ICard;
  onUpdating?: () => void;
  onCardReady: (element: HTMLDivElement) => void;
}

interface IRushCardBuilderState extends IContainableState {
  needsUpdate: boolean;
  card: ICard;

  hasRushMonsterDetails: boolean;
  isBackrow: boolean;

  includesToken: boolean;
  includesNormal: boolean;
  includesXyz: boolean;
  includesLink: boolean;
  includesSkill: boolean;

  artworkBg: string;
  cardFrames: string[];
  abilities: string[];
  description: JSXElementChild[][];
  hasStIcon: boolean;
}

type TChild = 'name' | 'desc' | 'atkMax' | 'atk' | 'def' | 'abilities' | 'artwork';

export class RushCardBuilder extends Containable<IRushCardBuilderProps, IRushCardBuilderState> {
  private ref = createRef<HTMLDivElement>();
  private nameReady: boolean;
  private descReady: boolean;
  private atkMaxReady: boolean;
  private atkReady: boolean;
  private defReady: boolean;
  private abilitiesReady: boolean;
  private artworkReady: boolean;

  public constructor(props: IRushCardBuilderProps) {
    super(props);

    this.nameReady = false;
    this.descReady = false;
    this.atkMaxReady = false;
    this.atkReady = false;
    this.defReady = false;
    this.abilitiesReady = false;
    this.artworkReady = false;

    this.state = {
      ...this.state,
      loaded: false,
      card: deepClone(props.card),
      needsUpdate: false,
      hasRushMonsterDetails: false,
      isBackrow: false,
      includesToken: false,
      includesNormal: false,
      includesXyz: false,
      includesLink: false,
      includesSkill: false,
      artworkBg: '',
      cardFrames: [],
      abilities: [],
      description: [],
      hasStIcon: false,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    requestAnimationFrame(() => requestAnimationFrame(() => app.$errorManager.handlePromise(this.prepareState())));
  }

  public static getDerivedStateFromProps(
    nextProps: IRushCardBuilderProps,
    prevState: IRushCardBuilderState
  ): Partial<IRushCardBuilderState> | null {
    if (isDeepEqual(nextProps.card, prevState.card)) return null;
    return { needsUpdate: true, card: deepClone(nextProps.card) };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IRushCardBuilderProps>,
    prevState: Readonly<IRushCardBuilderState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (!this.state.needsUpdate || prevState.needsUpdate === this.state.needsUpdate) return;
    if (this.props.onUpdating) this.props.onUpdating();
    app.$errorManager.handlePromise(this.prepareState());
  }

  private async prepareState() {
    const { card } = this.state;
    if (!card) return;

    const paths = app.$card.paths.rush;
    const hasRushMonsterDetails = app.$card.hasRushMonsterDetails(card);
    const isBackrow = app.$card.isBackrow(card);

    let includesNormal = false;
    let includesXyz = false;
    let includesLink = false;
    let includesSkill = false;
    let includesSpell = false;
    let includesToken = false;
    let cardFrames: string[] = [];
    for (const frame of card.frames) {
      if (frame === 'spell') {
        includesSpell = true;
      } else if (frame === 'normal') {
        includesNormal = true;
      } else if (frame === 'xyz') {
        includesXyz = true;
      } else if (frame === 'link') {
        includesLink = true;
      } else if (frame === 'skill') {
        includesSkill = true;
      } else if (frame === 'token') {
        includesToken = true;
      }

      cardFrames.push(paths.frames[frame]);
    }

    let hasStIcon = false;
    let abilities: string[] = [];
    if (hasRushMonsterDetails) {
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

    let description: JSXElementChild[][] = [];
    switch (card.rushTextMode) {
      case 'vanilla':
        description = card.description.split('\n').map((d, i) => this.getProcessedText(d, i, card.tcgAt));
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
          description.push(...card.rushOtherEffects.split('\n').map((d, i) => this.getProcessedText(d, i, card.tcgAt)));
        }
        description.push(
          [
            <span
              key={`rush-label-condition`}
              className={classNames('span-text', 'rush-label', 'condition', { 'with-tcg-at': card.tcgAt })}
            >
              {'[Condition] '}
            </span>,
          ].concat(...card.rushCondition.split('\n').map((d, i) => this.getProcessedText(d, i, card.tcgAt))),
          [
            <span
              key={`rush-label-effect`}
              className={classNames('span-text', 'rush-label', 'effect', { 'with-tcg-at': card.tcgAt })}
            >
              {effectLabel}
            </span>,
          ].concat(...card.rushEffect.split('\n').map((d, i) => this.getProcessedText(d, i, card.tcgAt)))
        );
        break;

      case 'choice':
        if (card.rushOtherEffects) {
          description.push(...card.rushOtherEffects.split('\n').map((d, i) => this.getProcessedText(d, i, card.tcgAt)));
        }
        const choiceEffectsLabel = card.language === 'fr' ? '[Effet Multi-Choix]' : '[Multi-Choice Effect]';
        const choiceEffects: (string | JSXElementChild[])[] = [];
        for (const choice of card.rushChoiceEffects) {
          choiceEffects.push(' ');
          choiceEffects.push(...choice.split('\n').map((d, i) => this.getProcessedText(d, i, card.tcgAt, true)));
        }
        description.push(
          [
            <span
              key={`rush-label-condition`}
              className={classNames('span-text', 'rush-label', 'condition', { 'with-tcg-at': card.tcgAt })}
            >
              {'[Condition] '}
            </span>,
            ...card.rushCondition.split('\n').map((d, i) => this.getProcessedText(d, i, card.tcgAt)),
          ],
          [
            <span
              key={`rush-label-effect`}
              className={classNames('span-text', 'rush-label', 'effect', { 'with-tcg-at': card.tcgAt })}
            >
              {choiceEffectsLabel}
            </span>,
            ...choiceEffects,
          ]
        );
        break;

      default:
        break;
    }

    const artworkBg = paths.whiteArtwork;

    await Promise.all([preloadImage(artworkBg), ...cardFrames.map((frame) => preloadImage(frame))]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    this.nameReady = false;
    this.descReady = false;
    this.atkMaxReady = false;
    this.atkReady = false;
    this.defReady = false;
    this.abilitiesReady = false;
    this.artworkReady = false;

    await this.setStateAsync({
      loaded: true,
      needsUpdate: false,
      hasRushMonsterDetails,
      isBackrow,
      includesToken,
      includesNormal,
      includesXyz,
      includesLink,
      includesSkill,
      artworkBg,
      cardFrames,
      abilities,
      description,
      hasStIcon,
    });
  }

  private onChildReady(child: TChild) {
    switch (child) {
      case 'name':
        if (this.nameReady) return;
        this.nameReady = true;
        break;

      case 'desc':
        if (this.descReady) return;
        this.descReady = true;
        break;

      case 'atkMax':
        if (this.atkMaxReady) return;
        this.atkMaxReady = true;
        break;

      case 'atk':
        if (this.atkReady) return;
        this.atkReady = true;
        break;

      case 'def':
        if (this.defReady) return;
        this.defReady = true;
        break;

      case 'abilities':
        if (this.abilitiesReady) return;
        this.abilitiesReady = true;
        break;

      case 'artwork':
        if (this.artworkReady) return;
        this.artworkReady = true;
        break;
    }

    if (
      this.nameReady &&
      this.descReady &&
      this.atkMaxReady &&
      this.atkReady &&
      this.defReady &&
      this.abilitiesReady &&
      this.artworkReady
    ) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => this.ref.current && this.props.onCardReady(this.ref.current))
      );
    }
  }

  private getProcessedText(text: string, index: number, tcgAt: boolean, forceBulletAtStart?: boolean) {
    const parts = text.split(/(●|•)/).map((part) => part.trim());
    if (parts.length && !parts[0]) parts.shift();

    let nextHasBullet = false;
    const processedText: JSX.Element[] = [];
    parts.forEach((part, i) => {
      if (part === '●' || part === '•') {
        nextHasBullet = true;
      } else {
        // Replace each occurrence of "@" with a span
        const modifiedPart = part.split('@').map((subPart, subIndex, array) => (
          <Fragment key={`fragment-${index}-${i}-${subIndex}`}>
            {subPart}
            {subIndex < array.length - 1 && (
              <span key={`at-${index}-${i}-${subIndex}`} className='at-char'>
                @
              </span>
            )}
          </Fragment>
        ));
        processedText.push(
          <span
            key={`processed-text-${index}-${i}`}
            className={classNames('span-text', {
              'with-bullet-point': nextHasBullet || (!i && forceBulletAtStart),
              'in-middle': i > 1,
              'with-tcg-at': tcgAt,
            })}
          >
            {modifiedPart}
          </span>
        );
        nextHasBullet = false;
      }
    });

    return processedText;
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

  public override render() {
    const {
      loaded,
      card,
      hasRushMonsterDetails,
      isBackrow,
      hasStIcon,
      includesToken,
      includesNormal,
      includesXyz,
      includesLink,
      includesSkill,
      artworkBg,
      abilities,
      description,
    } = this.state;

    if (!card || !loaded) return <div></div>;

    const paths = app.$card.paths.rush;
    const copyrightPath = paths.limitations[card.language][card.oldCopyright ? '1996' : '2020'];
    const specificties = this.getSpecifities();

    return (
      <div className='custom-container card-builder rush-card-builder' id={this.props.id} ref={this.ref}>
        <img className='card-layer artworkBg' src={artworkBg} alt='artworkBg' />

        <RushCardArtwork card={card} artworkBg={artworkBg} onReady={() => this.onChildReady('artwork')} />

        {this.renderFrames()}

        {!card.dontCoverRushArt && card.legend && (
          <img className='card-layer legend' src={paths.legends[card.legendType]} alt='legend' />
        )}

        {!includesToken && (
          <img className='card-layer attribute' src={paths.attributes[card.language][card.attribute]} alt='attribute' />
        )}

        {hasRushMonsterDetails && !card.dontCoverRushArt && card.maximum && (
          <img className='card-layer atk-max-line' src={paths.atkMaxLine} alt='atkMaxLine' />
        )}
        {hasRushMonsterDetails && !card.dontCoverRushArt && (
          <img className='card-layer atk-def-line' src={paths.atkDefLine} alt='atkDefLine' />
        )}

        {specificties.lv && <img className='card-layer level-star' src={paths.levelStars.level} alt='levelStar' />}
        {specificties.lv && <img className='card-layer level' src={paths.levels.level[card.level]} alt='level' />}

        {specificties.rk && <img className='card-layer rank-star' src={paths.levelStars.rank} alt='rankStar' />}
        {specificties.rk && <img className='card-layer rank' src={paths.levels.rank[card.level]} alt='rank' />}

        {card.sticker !== 'none' && (
          <img className='card-layer sticker' src={paths.stickers[card.sticker]} alt='sticker' />
        )}

        {card.edition === 'unlimited' && <p className='card-layer card-set white-text'>{card.cardSet}</p>}

        <RushCardAtkMax
          card={card}
          hasRushMonsterDetails={hasRushMonsterDetails}
          includesSkill={includesSkill}
          onReady={() => this.onChildReady('atkMax')}
        />

        <RushCardAtk
          card={card}
          hasRushMonsterDetails={hasRushMonsterDetails}
          includesSkill={includesSkill}
          onReady={() => this.onChildReady('atk')}
        />

        <RushCardDef
          card={card}
          hasRushMonsterDetails={hasRushMonsterDetails}
          includesLink={includesLink}
          includesSkill={includesSkill}
          onReady={() => this.onChildReady('def')}
        />

        {card.hasCopyright && <img className='card-layer copyright' src={copyrightPath.copyright} alt='copyright' />}

        {card.edition !== 'unlimited' && (
          <img className='card-layer edition' src={copyrightPath[card.edition]} alt='edition' />
        )}

        <RushCardAbilities
          card={card}
          abilities={abilities}
          includesXyz={includesXyz}
          hasStIcon={hasStIcon}
          onReady={() => this.onChildReady('abilities')}
        />

        <RushCardDesc
          card={card}
          description={description}
          includesNormal={includesNormal}
          onReady={() => this.onChildReady('desc')}
        />

        <RushCardName
          card={card}
          includesToken={includesToken}
          includesXyz={includesXyz}
          includesLink={includesLink}
          includesSkill={includesSkill}
          isBackrow={isBackrow}
          onReady={() => this.onChildReady('name')}
        />
      </div>
    );
  }

  private renderFrames() {
    const { cardFrames } = this.state;
    const styleArray = this.getFramesStylesArray(cardFrames.length);
    return (
      <div className='custom-container card-layer card-frames-container'>
        {cardFrames.map((frame, index) => {
          const style: CSSProperties = {};
          if (index) {
            style.clipPath = `polygon(100% 0%, ${styleArray[index]} 0%, 50% 50%, ${styleArray[index]} 100%, 100% 100%)`;
          }
          return (
            <img key={`rush-card-frame-${index}`} style={style} className='card-frame' src={frame} alt='card-frame' />
          );
        })}
      </div>
    );
  }

  private getSpecifities(): { lv: boolean; rk: boolean } {
    const { card, hasRushMonsterDetails } = this.state;
    if (!hasRushMonsterDetails || card.dontCoverRushArt) {
      return { lv: false, rk: false };
    } else if (card.frames.find((f) => f === 'xyz')) {
      return { lv: false, rk: true };
    } else {
      return { lv: true, rk: false };
    }
  }
}
