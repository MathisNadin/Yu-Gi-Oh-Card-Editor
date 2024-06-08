import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { classNames, integer } from 'mn-tools';
import { createRef } from 'react';

interface IRushCardAtkMaxProps extends IToolkitComponentProps {
  card: ICard;
  hasRushMonsterDetails: boolean;
  includesSkill: boolean;
  onReady: () => void;
}

interface IRushCardAtkMaxState extends IToolkitComponentState {
  atkMax: string;
  dontCoverRushArt: boolean;
  isMaximum: boolean;
  hasRushMonsterDetails: boolean;
  includesSkill: boolean;
  checkState: boolean;
  xScale: number;
}

export class RushCardAtkMax extends ToolkitComponent<IRushCardAtkMaxProps, IRushCardAtkMaxState> {
  public containerRef = createRef<HTMLDivElement>();
  public atkMaxRef = createRef<HTMLParagraphElement>();

  public constructor(props: IRushCardAtkMaxProps) {
    super(props);
    this.state = {
      atkMax: props.card.atkMax,
      dontCoverRushArt: props.card.dontCoverRushArt,
      isMaximum: props.card.maximum,
      hasRushMonsterDetails: props.hasRushMonsterDetails,
      includesSkill: props.includesSkill,
      checkState: true,
      xScale: 1,
    };
  }

  public componentDidMount() {
    requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
  }

  public static getDerivedStateFromProps(
    nextProps: IRushCardAtkMaxProps,
    prevState: IRushCardAtkMaxState
  ): Partial<IRushCardAtkMaxState> | null {
    if (
      prevState.dontCoverRushArt !== nextProps.card.dontCoverRushArt ||
      prevState.isMaximum !== nextProps.card.maximum ||
      prevState.hasRushMonsterDetails !== nextProps.hasRushMonsterDetails ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.atkMax !== nextProps.card.atkMax
    ) {
      return {
        checkState: true,
        atkMax: nextProps.card.atkMax,
        dontCoverRushArt: nextProps.card.dontCoverRushArt,
        isMaximum: nextProps.card.maximum,
        hasRushMonsterDetails: nextProps.hasRushMonsterDetails,
        includesSkill: nextProps.includesSkill,
        xScale: 1,
      };
    } else {
      return null;
    }
  }

  public componentDidUpdate() {
    if (this.state.checkState) {
      requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => this.props.onReady()));
    }
  }

  private get isEmpty() {
    const { atkMax, hasRushMonsterDetails, includesSkill, dontCoverRushArt, isMaximum } = this.state;
    return !hasRushMonsterDetails || dontCoverRushArt || !isMaximum || includesSkill || !atkMax;
  }

  private checkReady() {
    const { atkMax } = this.state;
    if (
      this.isEmpty ||
      atkMax === '?' ||
      atkMax === '∞' ||
      integer(atkMax) < 10000 ||
      !this.containerRef.current ||
      !this.atkMaxRef.current
    ) {
      return this.setState({ checkState: false });
    }

    let xScale = this.containerRef.current.clientWidth / this.atkMaxRef.current.clientWidth;
    if (xScale > 1) xScale = 1;
    this.setState({ xScale, checkState: false });
  }

  public render() {
    if (this.isEmpty) return null;
    const { atkMax, xScale } = this.state;
    return (
      <div
        className={classNames('custom-container', 'card-layer', 'atk-def', 'atk-max', {
          'question-mark': atkMax === '?',
          compressed: atkMax?.length > 4,
        })}
        ref={this.containerRef}
      >
        <p
          className={classNames('stat-text', 'atk-max-text', 'white-text', {
            infinity: atkMax === '∞',
          })}
          style={{ transform: `scaleX(${xScale})` }}
          ref={this.atkMaxRef}
        >
          {atkMax}
        </p>
      </div>
    );
  }
}
