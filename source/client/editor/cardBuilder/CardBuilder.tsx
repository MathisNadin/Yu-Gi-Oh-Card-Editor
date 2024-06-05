import { createRef, CSSProperties } from 'react';
import { classNames } from 'mn-tools';
import { ICard } from 'client/editor/card/card-interfaces';
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit';
import { CardName, CardAtk, CardDef, CardAbilities, CardDesc, CardPend, CardArtwork } from './cardSubBuilders';

interface ICardBuilderProps extends IContainableProps {
  forRender?: boolean;
  id: string;
  card: ICard;
  onCardReady: (element: HTMLDivElement) => void;
}

interface ICardBuilderState extends IContainableState {
  needsUpdate: boolean;

  hasAbilities: boolean;
  hasPendulumFrame: boolean;
  hasLinkArrows: boolean;
  isBackrow: boolean;

  includesToken: boolean;
  includesNormal: boolean;
  includesXyz: boolean;
  includesLink: boolean;
  includesSkill: boolean;

  artworkBg: string;
  cardFrames: string[];
  pendulumCovers: string[];
}

type TChild = 'name' | 'desc' | 'pend' | 'atk' | 'def' | 'abilities' | 'artwork';

export class CardBuilder extends Containable<ICardBuilderProps, ICardBuilderState> {
  private ref = createRef<HTMLDivElement>();
  private nameReady: boolean;
  private descReady: boolean;
  private pendReady: boolean;
  private atkReady: boolean;
  private defReady: boolean;
  private abilitiesReady: boolean;
  private artworkReady: boolean;

  public constructor(props: ICardBuilderProps) {
    super(props);

    this.nameReady = false;
    this.descReady = false;
    this.pendReady = false;
    this.atkReady = false;
    this.defReady = false;
    this.abilitiesReady = false;
    this.artworkReady = false;

    this.state = {
      ...this.state,
      loaded: false,
      needsUpdate: false,
      hasAbilities: false,
      hasPendulumFrame: false,
      hasLinkArrows: false,
      isBackrow: false,
      includesToken: false,
      includesNormal: false,
      includesXyz: false,
      includesLink: false,
      includesSkill: false,
      artworkBg: '',
      cardFrames: [],
      pendulumCovers: [],
    };
  }

  public componentDidMount() {
    setTimeout(() => app.$errorManager.handlePromise(this.prepareState()));
  }

  public static getDerivedStateFromProps(
    _nextProps: ICardBuilderProps,
    prevState: ICardBuilderState
  ): Partial<ICardBuilderState> | null {
    return { needsUpdate: !prevState.needsUpdate };
  }

  public componentDidUpdate() {
    if (!this.state.needsUpdate) return;
    app.$errorManager.handlePromise(this.prepareState());
  }

  private async prepareState() {
    const { card } = this.props;
    if (!card) return;

    this.nameReady = false;
    this.descReady = false;
    this.pendReady = false;
    this.atkReady = false;
    this.defReady = false;
    this.abilitiesReady = false;
    this.artworkReady = false;

    const paths = app.$card.paths.master;
    const hasAbilities = app.$card.hasAbilities(card);
    const hasPendulumFrame = app.$card.hasPendulumFrame(card);
    const hasLinkArrows = app.$card.hasLinkArrows(card);
    const isBackrow = app.$card.isBackrow(card);

    let includesToken = false;
    let includesNormal = false;
    let includesXyz = false;
    let includesLink = false;
    let includesSkill = false;
    let cardFrames: string[] = [];
    let pendulumCovers: string[] = [];
    for (const frame of card.frames) {
      if (frame === 'normal') {
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
      if (hasPendulumFrame) {
        pendulumCovers.push(paths.pendCovers[frame]);
      }
    }

    let artworkBg: string;
    if (hasPendulumFrame) {
      if (includesLink) {
        artworkBg = paths.whiteArtworks.whiteArtworkPendulumLink;
      } else {
        artworkBg = paths.whiteArtworks.whiteArtworkPendulum;
      }
    } else {
      artworkBg = paths.whiteArtworks.whiteArtwork;
    }

    this.setState({
      loaded: true,
      hasAbilities,
      hasPendulumFrame,
      hasLinkArrows,
      isBackrow,
      includesToken,
      includesNormal,
      includesXyz,
      includesLink,
      includesSkill,
      artworkBg,
      cardFrames,
      pendulumCovers,
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

      case 'pend':
        if (this.pendReady) return;
        this.pendReady = true;
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
      this.pendReady &&
      this.atkReady &&
      this.defReady &&
      this.abilitiesReady &&
      this.artworkReady
    ) {
      setTimeout(() => this.props.onCardReady(this.ref.current!), 200);
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
    const { card } = this.props;
    const {
      loaded,
      hasAbilities,
      hasPendulumFrame,
      hasLinkArrows,
      isBackrow,
      includesToken,
      includesNormal,
      includesXyz,
      includesLink,
      includesSkill,
      artworkBg,
      cardFrames,
      pendulumCovers,
    } = this.state;

    if (!card || !loaded) return <div></div>;

    const paths = app.$card.paths.master;
    const copyrightPath =
      paths.limitations[card.language][card.oldCopyright ? '1996' : '2020'][
        (!card.pendulum && includesXyz) || includesSkill ? 'white' : 'black'
      ];

    return (
      <div className='custom-container card-builder' id={this.props.id} ref={this.ref}>
        <img className='card-layer border' src={paths.border} alt='border' />

        {hasPendulumFrame && this.renderFrames(cardFrames, 'card-frame')}

        <img className='card-layer artworkBg' src={artworkBg} alt='artworkBg' />

        <CardArtwork
          card={card}
          artworkBg={artworkBg}
          hasPendulumFrame={hasPendulumFrame}
          includesLink={includesLink}
          onReady={() => this.onChildReady('artwork')}
        />

        {!hasPendulumFrame && this.renderFrames(cardFrames, 'card-frame')}

        {hasPendulumFrame && this.renderFrames(pendulumCovers, 'cover-frame')}

        {hasPendulumFrame && (
          <img
            className='card-layer pendulum-frame'
            src={paths.pendFrames[includesLink ? 'link' : 'regular']}
            alt='pendulumFrame'
          />
        )}

        {!includesSkill && !includesToken && (
          <img
            className='card-layer attribute'
            src={paths.attributes[card.noTextAttribute ? 'vanilla' : card.language][card.attribute]}
            alt='attribute'
          />
        )}

        {this.renderLevelOrStIcon()}

        {this.renderStPlus()}

        {this.renderLinkArrows()}

        {hasAbilities &&
          !includesSkill &&
          (includesLink ? (
            <img className='card-layer atk-link-line' src={paths.atkLinkLine} alt='atkLinkLine' />
          ) : (
            <img className='card-layer atk-def-line' src={paths.atkDefLine} alt='atkDefLine' />
          ))}

        {card.sticker !== 'none' && (
          <img className='card-layer sticker' src={paths.stickers[card.sticker]} alt='sticker' />
        )}

        {card.edition !== 'forbidden' && (
          <p
            className={`card-layer passcode ${(!card.pendulum && includesXyz) || includesSkill ? 'white' : 'black'}-text`}
          >
            {card.passcode}
          </p>
        )}

        <p
          className={`card-layer card-set ${(!card.pendulum && includesXyz) || includesSkill ? 'white' : 'black'}-text ${hasLinkArrows ? 'with-arrows' : ''} ${hasPendulumFrame ? 'on-pendulum' : ''}`}
        >
          {card.cardSet}
        </p>

        <CardAtk
          card={card}
          hasAbilities={hasAbilities}
          includesSkill={includesSkill}
          onReady={() => this.onChildReady('atk')}
        />

        <CardDef
          card={card}
          hasAbilities={hasAbilities}
          includesLink={includesLink}
          includesSkill={includesSkill}
          onReady={() => this.onChildReady('def')}
        />

        {card.hasCopyright && <img className='card-layer copyright' src={copyrightPath.copyright} alt='copyright' />}

        {card.edition !== 'unlimited' && (
          <img className='card-layer edition' src={copyrightPath[card.edition]} alt='edition' />
        )}

        <CardAbilities
          card={card}
          hasAbilities={hasAbilities}
          hasPendulumFrame={hasPendulumFrame}
          includesLink={includesLink}
          onReady={() => this.onChildReady('abilities')}
        />

        <CardDesc
          card={card}
          hasAbilities={hasAbilities}
          hasPendulumFrame={hasPendulumFrame}
          includesNormal={includesNormal}
          includesLink={includesLink}
          includesSkill={includesSkill}
          onReady={() => this.onChildReady('desc')}
        />

        <CardPend
          card={card}
          hasPendulumFrame={hasPendulumFrame}
          includesLink={includesLink}
          onReady={() => this.onChildReady('pend')}
        />

        {hasPendulumFrame && (
          <img
            className='card-layer card-scale left-scale'
            src={paths.scales[includesLink ? 'link' : 'regular'].left[card.scales.left]}
            alt='leftScale'
          />
        )}

        {hasPendulumFrame && (
          <img
            className='card-layer card-scale right-scale'
            src={paths.scales[includesLink ? 'link' : 'regular'].right[card.scales.right]}
            alt='rightScale'
          />
        )}

        <CardName
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

  private renderFrames(frames: string[], className: string) {
    const styleArray = this.getFramesStylesArray(frames.length);
    return (
      <div className='custom-container card-layer card-frames-container'>
        {frames.map((frame, index) => {
          const style: CSSProperties = {};
          if (index) {
            style.clipPath = `polygon(100% 0%, ${styleArray[index]} 0%, 50% 50%, ${styleArray[index]} 100%, 100% 100%)`;
          }
          return (
            <img
              key={`card-frame-${index}`}
              style={style}
              className={classNames('card-frame', className)}
              src={frame}
              alt={className}
            />
          );
        })}
      </div>
    );
  }

  private renderStPlus() {
    const { card } = this.props;
    const { isBackrow } = this.state;
    const paths = app.$card.paths.master;
    if (isBackrow && card.stType !== 'normal' && card.stType !== 'link') {
      return (
        <img
          className='card-layer st-plus'
          src={
            card.frames.includes('spell')
              ? paths.spellTraps[card.language].spellPlus
              : paths.spellTraps[card.language].trapPlus
          }
          alt='stPlus'
        />
      );
    }
    return null;
  }

  private renderLevelOrStIcon() {
    if (this.state.includesSkill) return null;

    const { card } = this.props;
    const paths = app.$card.paths.master;

    let includesDarkSynchro = false;
    let includesXyz = false;
    let includesLink = false;
    let includesOther = false;
    for (const frame of card.frames) {
      if (frame === 'spell' || frame === 'trap') {
        return <img className='card-layer st-icon' src={app.$card.getMasterStIcon(card)} alt='stIcon' />;
      } else if (frame === 'link') {
        includesLink = true;
      } else if (frame === 'xyz') {
        includesXyz = true;
      } else if (frame === 'darkSynchro') {
        includesDarkSynchro = true;
      } else {
        includesOther = true;
      }
    }

    if (includesLink) {
      return <img className='card-layer link-rating' src={paths.levels.linkRating[card.level]} alt='linkRating' />;
    } else if (includesOther) {
      return <img className='card-layer level' src={paths.levels.level[card.level]} alt='level' />;
    } else if (includesDarkSynchro) {
      return (
        <img className='card-layer negative-level' src={paths.levels.negativeLevel[card.level]} alt='negativeLevel' />
      );
    } else if (includesXyz) {
      return <img className='card-layer rank' src={paths.levels.rank[card.level]} alt='rank' />;
    }
    return null;
  }

  private renderLinkArrows() {
    const { hasPendulumFrame, hasLinkArrows } = this.state;
    if (!hasLinkArrows) return null;

    const { card } = this.props;
    const paths = app.$card.paths.master;
    const linkArrowPaths = paths.linkArrows[hasPendulumFrame ? 'pendulum' : 'regular'];
    return (
      <div className='custom-container card-layer card-link-arrows'>
        {card.linkArrows.top && (
          <img
            className='card-layer link-arrow link-arrow-t'
            key='link-arrow-t'
            src={linkArrowPaths.top}
            alt='linkArrowT'
          />
        )}
        {card.linkArrows.bottom && (
          <img
            className='card-layer link-arrow link-arrow-b'
            key='link-arrow-b'
            src={linkArrowPaths.bottom}
            alt='linkArrowB'
          />
        )}
        {card.linkArrows.left && (
          <img
            className='card-layer link-arrow link-arrow-l'
            key='link-arrow-l'
            src={linkArrowPaths.left}
            alt='linkArrowL'
          />
        )}
        {card.linkArrows.right && (
          <img
            className='card-layer link-arrow link-arrow-r'
            key='link-arrow-r'
            src={linkArrowPaths.right}
            alt='linkArrowR'
          />
        )}
        {card.linkArrows.topLeft && (
          <img
            className='card-layer link-arrow link-arrow-tl'
            key='link-arrow-tl'
            src={linkArrowPaths.topLeft}
            alt='linkArrowTL'
          />
        )}
        {card.linkArrows.topRight && (
          <img
            className='card-layer link-arrow link-arrow-tr'
            key='link-arrow-tr'
            src={linkArrowPaths.topRight}
            alt='linkArrowTR'
          />
        )}
        {card.linkArrows.bottomLeft && (
          <img
            className='card-layer link-arrow link-arrow-bl'
            key='link-arrow-bl'
            src={linkArrowPaths.bottomLeft}
            alt='linkArrowBL'
          />
        )}
        {card.linkArrows.bottomRight && (
          <img
            className='card-layer link-arrow link-arrow-br'
            key='link-arrow-br'
            src={linkArrowPaths.bottomRight}
            alt='linkArrowBR'
          />
        )}
      </div>
    );
  }
}
