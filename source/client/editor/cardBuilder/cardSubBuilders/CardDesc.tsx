import { createRef } from 'react';
import {
  ToolkitComponent,
  IToolkitComponentProps,
  IToolkitComponentState,
  TJSXElementChild,
  TDidUpdateSnapshot,
} from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { ICard } from '../../card';
import { CardBuilderService, TTextAdjustState } from '../CardBuilderService';

interface ICardDescProps extends IToolkitComponentProps {
  card: ICard;
  hasAbilities: boolean;
  hasPendulumFrame: boolean;
  includesNormal: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  onReady: () => void;
}

interface ICardDescState extends IToolkitComponentState {
  description: string;
  tcgAt: boolean;
  hasAbilities: boolean;
  hasPendulumFrame: boolean;
  includesNormal: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  checkState: number;
  adjustState: TTextAdjustState;
  splitDesc: TJSXElementChild[];
  fontSize: number;
  lineHeight: number;
}

export class CardDesc extends ToolkitComponent<ICardDescProps, ICardDescState> {
  public ref = createRef<HTMLDivElement>();
  private checkReadyProcessId = 0;

  public constructor(props: ICardDescProps) {
    super(props);
    const { fontSize, lineHeight } = CardDesc.predictSizes({
      text: props.card.description,
      hasAbilities: props.hasAbilities,
      hasPendulumFrame: props.hasPendulumFrame,
      includesLink: props.includesLink,
      includesSkill: props.includesSkill,
    });
    this.state = {
      description: props.card.description,
      tcgAt: props.card.tcgAt,
      hasAbilities: props.hasAbilities,
      hasPendulumFrame: props.hasPendulumFrame,
      includesNormal: props.includesNormal,
      includesLink: props.includesLink,
      includesSkill: props.includesSkill,
      checkState: 1,
      adjustState: 'unknown',
      splitDesc: props.card.description
        .split('\n')
        .map((d, i) => app.$cardBuilder.getProcessedText({ text: d, index: i, tcgAt: props.card.tcgAt })),
      fontSize,
      lineHeight,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    this.startCheckReady();
  }

  private startCheckReady() {
    this.checkReadyProcessId++;
    const currentProcessId = this.checkReadyProcessId;
    requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady(currentProcessId)));
  }

  public static getDerivedStateFromProps(
    nextProps: ICardDescProps,
    prevState: ICardDescState
  ): Partial<ICardDescState> | null {
    if (
      prevState.tcgAt !== nextProps.card.tcgAt ||
      prevState.hasAbilities !== nextProps.hasAbilities ||
      prevState.hasPendulumFrame !== nextProps.hasPendulumFrame ||
      prevState.includesNormal !== nextProps.includesNormal ||
      prevState.includesLink !== nextProps.includesLink ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.description !== nextProps.card.description
    ) {
      const { fontSize, lineHeight } = CardDesc.predictSizes({
        text: nextProps.card.description,
        hasAbilities: nextProps.hasAbilities,
        hasPendulumFrame: nextProps.hasPendulumFrame,
        includesLink: nextProps.includesLink,
        includesSkill: nextProps.includesSkill,
      });
      return {
        checkState: 1,
        description: nextProps.card.description,
        tcgAt: nextProps.card.tcgAt,
        hasAbilities: nextProps.hasAbilities,
        hasPendulumFrame: nextProps.hasPendulumFrame,
        includesNormal: nextProps.includesNormal,
        includesLink: nextProps.includesLink,
        includesSkill: nextProps.includesSkill,
        adjustState: 'unknown',
        splitDesc: nextProps.card.description
          .split('\n')
          .map((d, i) => app.$cardBuilder.getProcessedText({ text: d, index: i, tcgAt: nextProps.card.tcgAt })),
        fontSize,
        lineHeight,
      };
    } else {
      return null;
    }
  }

  public static predictSizes(options: {
    text: string;
    hasAbilities: boolean;
    hasPendulumFrame: boolean;
    includesLink: boolean;
    includesSkill: boolean;
  }) {
    const { text, hasAbilities, hasPendulumFrame, includesLink, includesSkill } = options;
    if (!text) {
      return { fontSize: CardBuilderService.MAX_FONT_SIZE, lineHeight: CardBuilderService.MAX_LINE_HEIGHT };
    }

    let maxHeight = 214;
    if (hasAbilities) maxHeight = 147;
    if (hasAbilities && includesSkill) maxHeight = 178;
    if (hasPendulumFrame && includesLink) maxHeight = 115;

    return app.$cardBuilder.predictSizes({
      lines: text.split('\n'),
      maxWidth: 680,
      maxHeight,
    });
  }

  public override componentDidUpdate(
    prevProps: Readonly<ICardDescProps>,
    prevState: Readonly<ICardDescState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.state.checkState) {
      this.startCheckReady();
    } else {
      this.props.onReady();
    }
  }

  private get isEmpty() {
    const { description } = this.state;
    return !description;
  }

  private checkReady(currentProcessId: number) {
    // If a new process started, ignore this one
    if (currentProcessId !== this.checkReadyProcessId) return;

    // If empty or no ref, just stop checking
    if (this.isEmpty || !this.ref.current) return this.setState({ checkState: 0 });

    // Use the generic utility function to determine if we need to adjust sizes
    const result = app.$cardBuilder.checkTextSize({
      container: this.ref.current,
      currentAdjustState: this.state.adjustState,
      currentFontSize: this.state.fontSize,
      currentLineHeight: this.state.lineHeight,
    });

    // If we still need to adjust, update the state and increment the checkState
    if (!result.fit) {
      return this.setState({
        checkState: this.state.checkState + 1,
        adjustState: result.adjustState,
        fontSize: result.fontSize ?? this.state.fontSize,
        lineHeight: result.lineHeight ?? this.state.lineHeight,
      });
    }

    // If fit is true, we stop adjusting and mark ourselves as ready
    this.setState({
      checkState: 0,
      adjustState: 'unknown',
      fontSize: result.fontSize ?? this.state.fontSize,
      lineHeight: result.lineHeight ?? this.state.lineHeight,
    });
  }

  public override render() {
    if (this.isEmpty) return null;

    const {
      hasAbilities,
      hasPendulumFrame,
      includesNormal,
      includesLink,
      includesSkill,
      splitDesc,
      fontSize,
      lineHeight,
    } = this.state;

    let containerClass = classNames('custom-container', 'vertical card-layer', 'card-description-holder');
    if (hasAbilities) {
      containerClass = `${containerClass} with-abilities`;

      if (includesSkill) {
        containerClass = `${containerClass} on-skill`;
      }
    }
    if (includesNormal) {
      containerClass = `${containerClass} normal-text`;
    }
    if (hasPendulumFrame && includesLink) {
      containerClass = `${containerClass} on-pendulum-link`;
    }

    return (
      <div
        className={containerClass}
        ref={this.ref}
        style={
          {
            '--description-text-font-size': `${fontSize}px`,
            '--description-text-line-height': lineHeight,
            '--description-text-margin-bottom': `${lineHeight / 2}px`,
          } as React.CSSProperties
        }
      >
        {splitDesc.map((d, i) => {
          return (
            <p key={`description-text-${i}`} className={classNames('description-text', 'black-text')}>
              {d}
            </p>
          );
        })}
      </div>
    );
  }
}
