import { ICard, TStIcon } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { createRef, Fragment } from 'react';

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
  public ref = createRef<HTMLDivElement>();

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

  public componentDidMount() {
    setTimeout(() => this.checkReady(), 100);
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

  public componentDidUpdate() {
    if (this.state.checkState) {
      this.checkReady();
    } else {
      this.props.onReady();
    }
  }

  private get isEmpty() {
    const { abilities } = this.state;
    return !abilities.length;
  }

  private checkReady() {
    if (this.isEmpty || !this.ref.current) return this.setState({ checkState: false });

    const leftBracketP = this.ref.current.querySelector('.left-bracket');
    const rightBracketP = this.ref.current.querySelector('.right-bracket');
    const abilitiesP = this.ref.current.querySelector('.abilities');
    if (!leftBracketP || !rightBracketP || !abilitiesP) return this.setState({ checkState: false });

    const abilitiesMaxWidth = MAX_WIDTH - leftBracketP.clientWidth - rightBracketP.clientWidth - GAP * 2;
    let xScale = abilitiesMaxWidth / abilitiesP.clientWidth;
    if (xScale > 1) xScale = 1;

    let rightBracketMargin = abilitiesMaxWidth - abilitiesP.clientWidth;
    if (rightBracketMargin > 0) rightBracketMargin = 0;
    this.setState({ xScale, rightBracketMargin, checkState: false });
  }

  public render() {
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
      <div className='custom-container card-layer card-abilities' ref={this.ref}>
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
            'with-st-icon': hasStIcon,
            'black-text': !useWhiteText,
            'white-text': useWhiteText,
          })}
          style={{ transform: `scaleX(${xScale})` }}
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
        >
          ]
        </p>
      </div>
    );
  }
}
