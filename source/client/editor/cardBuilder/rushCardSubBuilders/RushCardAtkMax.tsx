import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { classNames, integer } from 'mn-tools';
import { createRef } from 'react';

interface IRushCardAtkMaxProps extends IToolkitComponentProps {
  card: ICard;
  hasAbilities: boolean;
  includesSkill: boolean;
  onReady: () => void;
}

interface IRushCardAtkMaxState extends IToolkitComponentState {
  atkMax: string;
  dontCoverRushArt: boolean;
  isMaximum: boolean;
  hasAbilities: boolean;
  includesSkill: boolean;
  checkState: boolean;
  xScale: number;
}

export class RushCardAtkMax extends ToolkitComponent<IRushCardAtkMaxProps, IRushCardAtkMaxState> {
  public ref = createRef<HTMLDivElement>();

  public constructor(props: IRushCardAtkMaxProps) {
    super(props);
    this.state = {
      atkMax: props.card.atkMax,
      dontCoverRushArt: props.card.dontCoverRushArt,
      isMaximum: props.card.maximum,
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
    nextProps: IRushCardAtkMaxProps,
    prevState: IRushCardAtkMaxState
  ): Partial<IRushCardAtkMaxState> | null {
    if (
      prevState.dontCoverRushArt !== nextProps.card.dontCoverRushArt ||
      prevState.isMaximum !== nextProps.card.maximum ||
      prevState.hasAbilities !== nextProps.hasAbilities ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.atkMax !== nextProps.card.atkMax
    ) {
      return {
        checkState: true,
        atkMax: nextProps.card.atkMax,
        dontCoverRushArt: nextProps.card.dontCoverRushArt,
        isMaximum: nextProps.card.maximum,
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
    const { atkMax, hasAbilities, includesSkill, dontCoverRushArt, isMaximum } = this.state;
    return !hasAbilities || dontCoverRushArt || !isMaximum || includesSkill || !atkMax;
  }

  private checkReady() {
    const { atkMax } = this.state;
    if (this.isEmpty || atkMax === '?' || atkMax === '∞' || integer(atkMax) < 10000 || !this.ref.current) {
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
    const { atkMax, xScale } = this.state;
    return (
      <div
        className={classNames('custom-container', 'card-layer', 'atk-def', 'atk-max', {
          'question-mark': atkMax === '?',
          compressed: atkMax?.length > 4,
        })}
        ref={this.ref}
      >
        <p
          className={classNames('stat-text', 'atk-max-text', 'white-text', {
            infinity: atkMax === '∞',
          })}
          style={{ transform: `scaleX(${xScale})` }}
        >
          {atkMax}
        </p>
      </div>
    );
  }
}
