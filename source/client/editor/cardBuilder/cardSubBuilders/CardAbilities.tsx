import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState, TDidUpdateSnapshot } from 'mn-toolkit';
import { createRef, Fragment } from 'react';

interface ICardAbilitiesProps extends IToolkitComponentProps {
  card: ICard;
  hasAbilities: boolean;
  hasPendulumFrame: boolean;
  includesLink: boolean;
  onReady: () => void;
}

interface ICardAbilitiesState extends IToolkitComponentState {
  abilities: string[];
  hasAbilities: boolean;
  hasPendulumFrame: boolean;
  includesLink: boolean;
  checkState: boolean;
  xScale: number;
  rightBracketMargin: number;
}

const GAP = 3;
const MAX_WIDTH = 689;

export class CardAbilities extends ToolkitComponent<ICardAbilitiesProps, ICardAbilitiesState> {
  public containerRef = createRef<HTMLDivElement>();
  public leftBracketRef = createRef<HTMLParagraphElement>();
  public rightBracketRef = createRef<HTMLParagraphElement>();
  public abilitiesRef = createRef<HTMLParagraphElement>();

  public constructor(props: ICardAbilitiesProps) {
    super(props);
    this.state = {
      abilities: [...props.card.abilities],
      hasAbilities: props.hasAbilities,
      hasPendulumFrame: props.hasPendulumFrame,
      includesLink: props.includesLink,
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
    nextProps: ICardAbilitiesProps,
    prevState: ICardAbilitiesState
  ): Partial<ICardAbilitiesState> | null {
    if (
      prevState.hasAbilities !== nextProps.hasAbilities ||
      prevState.hasPendulumFrame !== nextProps.hasPendulumFrame ||
      prevState.includesLink !== nextProps.includesLink ||
      prevState.abilities.length !== nextProps.card.abilities.length ||
      !prevState.abilities.every((value, index) => value === nextProps.card.abilities[index])
    ) {
      return {
        checkState: true,
        abilities: [...nextProps.card.abilities],
        hasAbilities: nextProps.hasAbilities,
        hasPendulumFrame: nextProps.hasPendulumFrame,
        includesLink: nextProps.includesLink,
        xScale: 1,
        rightBracketMargin: 0,
      };
    } else {
      return null;
    }
  }

  public override componentDidUpdate(
    prevProps: Readonly<ICardAbilitiesProps>,
    prevState: Readonly<ICardAbilitiesState>,
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
    const { abilities, hasAbilities } = this.state;
    return !hasAbilities || !abilities.length;
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

    const { abilities, hasPendulumFrame, includesLink, xScale, rightBracketMargin } = this.state;

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

    let containerClass = 'custom-container card-layer card-abilities';
    if (hasPendulumFrame && includesLink) {
      containerClass = `${containerClass} on-pendulum-link`;
    }

    return (
      <div className={containerClass} ref={this.containerRef}>
        <p className='abilities-text black-text abilities-bracket left-bracket' ref={this.leftBracketRef}>
          [
        </p>
        <p
          className='abilities-text black-text abilities'
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
        <p
          className='abilities-text black-text abilities-bracket right-bracket'
          style={{ marginLeft: `${rightBracketMargin}px` }}
          ref={this.rightBracketRef}
        >
          ]
        </p>
      </div>
    );
  }
}
