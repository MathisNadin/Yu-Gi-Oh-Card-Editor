import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { classNames, integer } from 'mn-tools';
import { createRef } from 'react';

interface ICardDefProps extends IToolkitComponentProps {
  card: ICard;
  hasAbilities: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  onReady: () => void;
}

interface ICardDefState extends IToolkitComponentState {
  def: string;
  hasAbilities: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  checkState: boolean;
  xScale: number;
}

export class CardDef extends ToolkitComponent<ICardDefProps, ICardDefState> {
  public ref = createRef<HTMLDivElement>();

  public constructor(props: ICardDefProps) {
    super(props);
    this.state = {
      def: props.card.def,
      hasAbilities: props.hasAbilities,
      includesLink: props.includesLink,
      includesSkill: props.includesSkill,
      checkState: true,
      xScale: 1,
    };
  }

  public componentDidMount() {
    this.checkReady();
  }

  public static getDerivedStateFromProps(
    nextProps: ICardDefProps,
    prevState: ICardDefState
  ): Partial<ICardDefState> | null {
    if (
      prevState.hasAbilities !== nextProps.hasAbilities ||
      prevState.includesLink !== nextProps.includesLink ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.def !== nextProps.card.def
    ) {
      return {
        checkState: false,
        def: nextProps.card.def,
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
    const { def, hasAbilities, includesLink, includesSkill } = this.state;
    return !hasAbilities || includesLink || includesSkill || !def;
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
        ref={this.ref}
        className={classNames('custom-container', 'card-layer', 'atk-def', 'def', {
          'question-mark': def === '?',
        })}
      >
        <p
          className={classNames('stat-text', 'def-text', 'black-text', { infinity: def === '∞' })}
          style={{ transform: `scaleX(${xScale})` }}
        >
          {def}
        </p>
      </div>
    );
  }
}
