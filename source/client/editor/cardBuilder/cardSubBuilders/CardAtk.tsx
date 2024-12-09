import { createRef } from 'react';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState, TDidUpdateSnapshot } from 'mn-toolkit';
import { classNames, integer } from 'mn-tools';
import { ICard } from '../../card';

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
  public containerRef = createRef<HTMLDivElement>();
  public atkRef = createRef<HTMLParagraphElement>();

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

  public override componentDidMount() {
    super.componentDidMount();
    requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
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

  public override componentDidUpdate(
    prevProps: Readonly<ICardAtkProps>,
    prevState: Readonly<ICardAtkState>,
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
    const { atk, hasAbilities, includesSkill } = this.state;
    return !hasAbilities || includesSkill || !atk;
  }

  private checkReady() {
    const { atk } = this.state;
    if (
      this.isEmpty ||
      atk === '?' ||
      atk === '∞' ||
      integer(atk) < 10000 ||
      !this.containerRef.current ||
      !this.atkRef.current
    ) {
      return this.setState({ checkState: false });
    }

    let xScale = this.containerRef.current.clientWidth / this.atkRef.current.clientWidth;
    if (xScale > 1) xScale = 1;
    this.setState({ xScale, checkState: false });
  }

  public override render() {
    if (this.isEmpty) return null;
    const { atk, xScale } = this.state;
    return (
      <div
        ref={this.containerRef}
        className={classNames('custom-container', 'card-layer', 'atk-def', 'atk', {
          'question-mark': atk === '?',
        })}
      >
        <p
          className={classNames('stat-text', 'atk-text', 'black-text', { infinity: atk === '∞' })}
          style={{ transform: `scaleX(${xScale})` }}
          ref={this.atkRef}
        >
          {atk}
        </p>
      </div>
    );
  }
}
