import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { classNames, integer } from 'mn-tools';
import { createRef } from 'react';

interface IRushCardAtkProps extends IToolkitComponentProps {
  card: ICard;
  hasRushMonsterDetails: boolean;
  includesSkill: boolean;
  onReady: () => void;
}

interface IRushCardAtkState extends IToolkitComponentState {
  atk: string;
  dontCoverRushArt: boolean;
  hasRushMonsterDetails: boolean;
  includesSkill: boolean;
  checkState: boolean;
  xScale: number;
}

export class RushCardAtk extends ToolkitComponent<IRushCardAtkProps, IRushCardAtkState> {
  public containerRef = createRef<HTMLDivElement>();
  public atkRef = createRef<HTMLParagraphElement>();

  public constructor(props: IRushCardAtkProps) {
    super(props);
    this.state = {
      atk: props.card.atk,
      dontCoverRushArt: props.card.dontCoverRushArt,
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
    nextProps: IRushCardAtkProps,
    prevState: IRushCardAtkState
  ): Partial<IRushCardAtkState> | null {
    if (
      prevState.dontCoverRushArt !== nextProps.card.dontCoverRushArt ||
      prevState.hasRushMonsterDetails !== nextProps.hasRushMonsterDetails ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.atk !== nextProps.card.atk
    ) {
      return {
        checkState: true,
        atk: nextProps.card.atk,
        dontCoverRushArt: nextProps.card.dontCoverRushArt,
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
    const { atk, hasRushMonsterDetails, dontCoverRushArt, includesSkill } = this.state;
    return !hasRushMonsterDetails || dontCoverRushArt || includesSkill || !atk;
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

  public render() {
    if (this.isEmpty) return null;
    const { atk, xScale } = this.state;
    return (
      <div
        className={classNames('custom-container', 'card-layer', 'atk-def', 'atk', {
          'question-mark': atk === '?',
          compressed: atk?.length > 4,
        })}
        ref={this.containerRef}
      >
        <p
          className={classNames('stat-text', 'atk-text', 'white-text', {
            infinity: atk === '∞',
          })}
          style={{ transform: `scaleX(${xScale})` }}
          ref={this.atkRef}
        >
          {atk}
        </p>
      </div>
    );
  }
}
