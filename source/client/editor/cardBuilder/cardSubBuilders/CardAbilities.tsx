import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
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
  public ref = createRef<HTMLDivElement>();

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

  public componentDidMount() {
    setTimeout(() => this.checkReady(), 100);
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

  public componentDidUpdate() {
    if (this.state.checkState) {
      this.checkReady();
    } else {
      setTimeout(() => this.props.onReady());
    }
  }

  private get isEmpty() {
    const { abilities, hasAbilities } = this.state;
    return !hasAbilities || !abilities.length;
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
      <div className={containerClass} ref={this.ref}>
        <p className='abilities-text black-text abilities-bracket left-bracket'>[</p>
        <p className='abilities-text black-text abilities' style={{ transform: `scaleX(${xScale})` }}>
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
        >
          ]
        </p>
      </div>
    );
  }
}
