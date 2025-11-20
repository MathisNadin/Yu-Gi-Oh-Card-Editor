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

interface ICardPendProps extends IToolkitComponentProps {
  card: ICard;
  hasPendulumFrame: boolean;
  includesLink: boolean;
  onReady: () => void;
}

interface ICardPendState extends IToolkitComponentState {
  pendEffect: string;
  tcgAt: boolean;
  hasPendulumFrame: boolean;
  includesLink: boolean;
  checkState: number;
  adjustState: TTextAdjustState;
  splitPendEff: TJSXElementChild[];
  fontSize: number;
  lineHeight: number;
}

export class CardPend extends ToolkitComponent<ICardPendProps, ICardPendState> {
  public ref = createRef<HTMLDivElement>();
  private checkReadyProcessId = 0;

  public constructor(props: ICardPendProps) {
    super(props);
    const { fontSize, lineHeight } = CardPend.predictSizes({
      text: props.card.pendEffect,
      hasPendulumFrame: props.hasPendulumFrame,
      includesLink: props.includesLink,
    });
    this.state = {
      pendEffect: props.card.pendEffect,
      tcgAt: props.card.tcgAt,
      hasPendulumFrame: props.hasPendulumFrame,
      includesLink: props.includesLink,
      checkState: 1,
      adjustState: 'unknown',
      splitPendEff: props.card.pendEffect
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
    nextProps: ICardPendProps,
    prevState: ICardPendState
  ): Partial<ICardPendState> | null {
    if (
      prevState.tcgAt !== nextProps.card.tcgAt ||
      prevState.hasPendulumFrame !== nextProps.hasPendulumFrame ||
      prevState.includesLink !== nextProps.includesLink ||
      prevState.pendEffect !== nextProps.card.pendEffect
    ) {
      const { fontSize, lineHeight } = CardPend.predictSizes({
        text: nextProps.card.pendEffect,
        hasPendulumFrame: nextProps.hasPendulumFrame,
        includesLink: nextProps.includesLink,
      });
      return {
        checkState: 1,
        tcgAt: nextProps.card.tcgAt,
        pendEffect: nextProps.card.pendEffect,
        hasPendulumFrame: nextProps.hasPendulumFrame,
        includesLink: nextProps.includesLink,
        adjustState: 'unknown',
        splitPendEff: nextProps.card.pendEffect
          .split('\n')
          .map((d, i) => app.$cardBuilder.getProcessedText({ text: d, index: i, tcgAt: nextProps.card.tcgAt })),
        fontSize,
        lineHeight,
      };
    } else {
      return null;
    }
  }

  public static predictSizes(options: { text: string; hasPendulumFrame: boolean; includesLink: boolean }) {
    const { text, hasPendulumFrame, includesLink } = options;
    if (!text || !hasPendulumFrame) {
      return { fontSize: CardBuilderService.MAX_FONT_SIZE, lineHeight: CardBuilderService.MAX_LINE_HEIGHT };
    }

    let maxWidth = 556;
    if (includesLink) maxWidth = 513;

    return app.$cardBuilder.predictSizes({
      lines: text.split('\n'),
      maxWidth,
      maxHeight: 124,
    });
  }

  public override componentDidUpdate(
    prevProps: Readonly<ICardPendProps>,
    prevState: Readonly<ICardPendState>,
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
    const { pendEffect, hasPendulumFrame } = this.state;
    return !hasPendulumFrame || !pendEffect;
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

    const { includesLink, splitPendEff, fontSize, lineHeight } = this.state;
    return (
      <div
        ref={this.ref}
        className={classNames('custom-container', 'vertical', 'card-layer', 'card-pendulum-effect-holder', {
          'on-link': includesLink,
        })}
        style={
          {
            '--pendulum-effect-text-font-size': `${fontSize}px`,
            '--pendulum-effect-text-line-height': lineHeight,
            '--pendulum-effect-text-margin-bottom': `${lineHeight / 2}px`,
          } as React.CSSProperties
        }
      >
        {splitPendEff.map((text, i) => {
          return (
            <p key={`pendulum-effect-${i}`} className={classNames('pendulum-effect-text', 'black-text')}>
              {text}
            </p>
          );
        })}
      </div>
    );
  }
}
