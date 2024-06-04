import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { classNames, integer } from 'mn-tools';
import { createRef } from 'react';

interface IRushCardDefProps extends IToolkitComponentProps {
  card: ICard;
  hasAbilities: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  onReady: () => void;
}

interface IRushCardDefState extends IToolkitComponentState {
  def: string;
  dontCoverRushArt: boolean;
  hasAbilities: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  checkState: boolean;
  xScale: number;
}

export class RushCardDef extends ToolkitComponent<IRushCardDefProps, IRushCardDefState> {
  public ref = createRef<HTMLDivElement>();

  public constructor(props: IRushCardDefProps) {
    super(props);
    this.state = {
      def: props.card.def,
      dontCoverRushArt: props.card.dontCoverRushArt,
      hasAbilities: props.hasAbilities,
      includesLink: props.includesLink,
      includesSkill: props.includesSkill,
      checkState: true,
      xScale: 1,
    };
  }

  public componentDidMount() {
    setTimeout(() => this.checkReady(), 100);
  }

  public static getDerivedStateFromProps(
    nextProps: IRushCardDefProps,
    prevState: IRushCardDefState
  ): Partial<IRushCardDefState> | null {
    if (
      prevState.dontCoverRushArt !== nextProps.card.dontCoverRushArt ||
      prevState.hasAbilities !== nextProps.hasAbilities ||
      prevState.includesLink !== nextProps.includesLink ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.def !== nextProps.card.def
    ) {
      return {
        checkState: false,
        def: nextProps.card.def,
        dontCoverRushArt: nextProps.card.dontCoverRushArt,
        hasAbilities: nextProps.hasAbilities,
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
      this.checkReady();
    } else {
      this.props.onReady();
    }
  }

  private get isEmpty() {
    const { def, hasAbilities, dontCoverRushArt, includesLink, includesSkill } = this.state;
    return !hasAbilities || dontCoverRushArt || includesLink || includesSkill || !def;
  }

  private checkReady() {
    const { def } = this.state;
    if (this.isEmpty || def === '?' || def === '∞' || integer(def) < 10000 || !this.ref.current) {
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
    const { def, xScale } = this.state;
    return (
      <div
        className={classNames('custom-container', 'card-layer', 'atk-def', 'def', {
          'question-mark': def === '?',
          compressed: def?.length > 4,
        })}
      >
        <p
          className={classNames('stat-text', 'def-text', 'white-text', {
            infinity: def === '∞',
          })}
          style={{ transform: `scaleX(${xScale})` }}
        >
          {def}
        </p>
      </div>
    );
  }
}
