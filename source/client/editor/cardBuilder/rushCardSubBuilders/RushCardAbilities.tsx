import { createRef, Fragment } from 'react';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState, TDidUpdateSnapshot } from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { ICard, TStIcon } from '../../card';

interface IRushCardAbilitiesProps extends IToolkitComponentProps {
  card: ICard;
  abilities: string[];
  includesXyz: boolean;
  hasStIcon: boolean;
  onReady: () => void;
}

interface IRushCardAbilitiesState extends IToolkitComponentState {
  abilities: string[];
  stType: TStIcon;
  includesXyz: boolean;
  hasStIcon: boolean;
  checkState: boolean;
  xScale: number;
  rightBracketMargin: number;
}

const GAP = 3;
const MAX_WIDTH = 590;

export class RushCardAbilities extends ToolkitComponent<IRushCardAbilitiesProps, IRushCardAbilitiesState> {
  public containerRef = createRef<HTMLDivElement>();
  public leftBracketRef = createRef<HTMLParagraphElement>();
  public rightBracketRef = createRef<HTMLParagraphElement>();
  public abilitiesRef = createRef<HTMLParagraphElement>();

  public constructor(props: IRushCardAbilitiesProps) {
    super(props);
    this.state = {
      abilities: [...props.abilities],
      stType: props.card.stType,
      includesXyz: props.includesXyz,
      hasStIcon: props.hasStIcon,
      checkState: true,
      xScale: 1,
      rightBracketMargin: 0,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
  }

  public static getDerivedStateFromProps(
    nextProps: IRushCardAbilitiesProps,
    prevState: IRushCardAbilitiesState
  ): Partial<IRushCardAbilitiesState> | null {
    if (
      prevState.stType !== nextProps.card.stType ||
      prevState.includesXyz !== nextProps.includesXyz ||
      prevState.hasStIcon !== nextProps.hasStIcon ||
      prevState.abilities.length !== nextProps.abilities.length ||
      !prevState.abilities.every((value, index) => value === nextProps.abilities[index])
    ) {
      return {
        checkState: true,
        abilities: [...nextProps.abilities],
        stType: nextProps.card.stType,
        includesXyz: nextProps.includesXyz,
        hasStIcon: nextProps.hasStIcon,
        xScale: 1,
        rightBracketMargin: 0,
      };
    } else {
      return null;
    }
  }

  public override componentDidUpdate(
    prevProps: Readonly<IRushCardAbilitiesProps>,
    prevState: Readonly<IRushCardAbilitiesState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.state.checkState) {
      requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
    } else {
      this.props.onReady();
    }
  }

  private get isEmpty() {
    const { abilities } = this.state;
    return !abilities.length;
  }

  private checkReady() {
    if (
      this.isEmpty ||
      !this.containerRef.current ||
      !this.leftBracketRef.current ||
      !this.rightBracketRef.current ||
      !this.abilitiesRef.current
    ) {
      return this.setState({ checkState: false });
    }

    const abilitiesMaxWidth =
      MAX_WIDTH - this.leftBracketRef.current.clientWidth - this.rightBracketRef.current.clientWidth - GAP * 2;
    let xScale = abilitiesMaxWidth / this.abilitiesRef.current.clientWidth;
    if (xScale > 1) xScale = 1;

    let rightBracketMargin = abilitiesMaxWidth - this.abilitiesRef.current.clientWidth;
    if (rightBracketMargin > 0) rightBracketMargin = 0;
    this.setState({ xScale, rightBracketMargin, checkState: false });
  }

  public override render() {
    if (this.isEmpty) return null;

    const { abilities, stType, includesXyz, hasStIcon, xScale, rightBracketMargin } = this.state;

    let text = abilities.join(' / ');
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

    const useWhiteText = includesXyz;
    const paths = app.$card.paths.rush;

    return (
      <div className='custom-container card-layer card-abilities' ref={this.containerRef}>
        <p
          className={classNames('abilities-text', 'abilities-bracket', 'left-bracket', {
            'black-text': !useWhiteText,
            'white-text': useWhiteText,
          })}
          ref={this.leftBracketRef}
        >
          [
        </p>

        <p
          className={classNames('abilities-text', 'abilities', {
            'with-st-icon': hasStIcon,
            'black-text': !useWhiteText,
            'white-text': useWhiteText,
          })}
          style={{ transform: `scaleX(${xScale})` }}
          ref={this.abilitiesRef}
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

        {hasStIcon && (
          <img
            className='rush-st-icon'
            src={paths.spellTraps[stType]}
            alt='stIcon'
            style={{ marginLeft: `${rightBracketMargin}px` }}
          />
        )}

        <p
          className={classNames('abilities-text', 'abilities-bracket', 'right-bracket', {
            'black-text': !useWhiteText,
            'white-text': useWhiteText,
          })}
          style={hasStIcon ? undefined : { marginLeft: `${rightBracketMargin}px` }}
          ref={this.rightBracketRef}
        >
          ]
        </p>
      </div>
    );
  }
}
