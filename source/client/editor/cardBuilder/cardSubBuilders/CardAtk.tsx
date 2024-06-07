import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { classNames, integer } from 'mn-tools';
import { createRef } from 'react';

interface ICardAtkProps extends IToolkitComponentProps {
  card: ICard;
  hasAbilities: boolean;
  includesSkill: boolean;
  onReady: () => void;
}

interface ICardAtkState extends IToolkitComponentState {
  atk: string;
  hasAbilities: boolean;
  includesSkill: boolean;
  checkState: boolean;
  xScale: number;
}

export class CardAtk extends ToolkitComponent<ICardAtkProps, ICardAtkState> {
  public ref = createRef<HTMLDivElement>();

  public constructor(props: ICardAtkProps) {
    super(props);
    this.state = {
      atk: props.card.atk,
      hasAbilities: props.hasAbilities,
      includesSkill: props.includesSkill,
      checkState: true,
      xScale: 1,
    };
  }

  public componentDidMount() {
    setTimeout(() => this.checkReady(), 100);
  }

  public static getDerivedStateFromProps(
    nextProps: ICardAtkProps,
    prevState: ICardAtkState
  ): Partial<ICardAtkState> | null {
    if (
      prevState.hasAbilities !== nextProps.hasAbilities ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.atk !== nextProps.card.atk
    ) {
      return {
        checkState: true,
        atk: nextProps.card.atk,
        hasAbilities: nextProps.hasAbilities,
        includesSkill: nextProps.includesSkill,
        xScale: 1,
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
    const { atk, hasAbilities, includesSkill } = this.state;
    return !hasAbilities || includesSkill || !atk;
  }

  private checkReady() {
    const { atk } = this.state;
    if (this.isEmpty || atk === '?' || atk === '∞' || integer(atk) < 10000 || !this.ref.current) {
      return this.setState({ checkState: false });
    }

    const paragraph = this.ref.current.querySelector('p');
    if (!paragraph) return this.setState({ checkState: false });

    let xScale = this.ref.current.clientWidth / paragraph.clientWidth;
    if (xScale > 1) xScale = 1;
    this.setState({ xScale, checkState: false });
  }

  public render() {
    if (this.isEmpty) return null;
    const { atk, xScale } = this.state;
    return (
      <div
        ref={this.ref}
        className={classNames('custom-container', 'card-layer', 'atk-def', 'atk', {
          'question-mark': atk === '?',
        })}
      >
        <p
          className={classNames('stat-text', 'atk-text', 'black-text', { infinity: atk === '∞' })}
          style={{ transform: `scaleX(${xScale})` }}
        >
          {atk}
        </p>
      </div>
    );
  }
}
