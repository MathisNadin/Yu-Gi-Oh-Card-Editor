import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { classNames, integer } from 'mn-tools';
import { createRef } from 'react';

interface IRushCardDefProps extends IToolkitComponentProps {
  card: ICard;
  hasRushMonsterDetails: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  onReady: () => void;
}

interface IRushCardDefState extends IToolkitComponentState {
  def: string;
  dontCoverRushArt: boolean;
  hasRushMonsterDetails: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  checkState: boolean;
  xScale: number;
}

export class RushCardDef extends ToolkitComponent<IRushCardDefProps, IRushCardDefState> {
  public containerRef = createRef<HTMLDivElement>();
  public defRef = createRef<HTMLParagraphElement>();

  public constructor(props: IRushCardDefProps) {
    super(props);
    this.state = {
      def: props.card.def,
      dontCoverRushArt: props.card.dontCoverRushArt,
      hasRushMonsterDetails: props.hasRushMonsterDetails,
      includesLink: props.includesLink,
      includesSkill: props.includesSkill,
      checkState: true,
      xScale: 1,
    };
  }

  public componentDidMount() {
    requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
  }

  public static getDerivedStateFromProps(
    nextProps: IRushCardDefProps,
    prevState: IRushCardDefState
  ): Partial<IRushCardDefState> | null {
    if (
      prevState.dontCoverRushArt !== nextProps.card.dontCoverRushArt ||
      prevState.hasRushMonsterDetails !== nextProps.hasRushMonsterDetails ||
      prevState.includesLink !== nextProps.includesLink ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.def !== nextProps.card.def
    ) {
      return {
        checkState: false,
        def: nextProps.card.def,
        dontCoverRushArt: nextProps.card.dontCoverRushArt,
        hasRushMonsterDetails: nextProps.hasRushMonsterDetails,
        includesLink: nextProps.includesLink,
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
    const { def, hasRushMonsterDetails, dontCoverRushArt, includesLink, includesSkill } = this.state;
    return !hasRushMonsterDetails || dontCoverRushArt || includesLink || includesSkill || !def;
  }

  private checkReady() {
    const { def } = this.state;
    if (
      this.isEmpty ||
      def === '?' ||
      def === '∞' ||
      integer(def) < 10000 ||
      !this.containerRef.current ||
      !this.defRef.current
    ) {
      return this.setState({ checkState: false });
    }

    let xScale = this.containerRef.current.clientWidth / this.defRef.current.clientWidth;
    if (xScale > 1) xScale = 1;
    this.setState({ xScale, checkState: false });
  }

  public render() {
    if (this.isEmpty) return null;
    const { def, xScale } = this.state;
    return (
      <div
        className={classNames('custom-container', 'card-layer', 'atk-def', 'def', {
          'question-mark': def === '?',
          compressed: def?.length > 4,
        })}
        ref={this.containerRef}
      >
        <p
          className={classNames('stat-text', 'def-text', 'white-text', {
            infinity: def === '∞',
          })}
          style={{ transform: `scaleX(${xScale})` }}
          ref={this.defRef}
        >
          {def}
        </p>
      </div>
    );
  }
}
