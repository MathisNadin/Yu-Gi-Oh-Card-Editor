import { ICard } from 'client/editor/card/card-interfaces';
import {
  ToolkitComponent,
  IToolkitComponentProps,
  IToolkitComponentState,
  JSXElementChild,
  TDidUpdateSnapshot,
} from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { createRef, Fragment } from 'react';

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
  adjustState: 'unknown' | 'tooBig' | 'tooSmall';
  splitPendEff: JSXElementChild[];
  fontSize: number;
  lineHeight: number;
}

export class CardPend extends ToolkitComponent<ICardPendProps, ICardPendState> {
  public ref = createRef<HTMLDivElement>();
  private checkReadyProcessId = 0;

  public constructor(props: ICardPendProps) {
    super(props);
    const { fontSize, lineHeight } = CardPend.predictSizes(
      props.card.pendEffect,
      props.hasPendulumFrame,
      props.includesLink
    );
    this.state = {
      pendEffect: props.card.pendEffect,
      tcgAt: props.card.tcgAt,
      hasPendulumFrame: props.hasPendulumFrame,
      includesLink: props.includesLink,
      checkState: 1,
      adjustState: 'unknown',
      splitPendEff: props.card.pendEffect.split('\n').map((d, i) => CardPend.getProcessedText(d, i, props.card.tcgAt)),
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
      const { fontSize, lineHeight } = CardPend.predictSizes(
        nextProps.card.pendEffect,
        nextProps.hasPendulumFrame,
        nextProps.includesLink
      );
      return {
        checkState: 1,
        tcgAt: nextProps.card.tcgAt,
        pendEffect: nextProps.card.pendEffect,
        hasPendulumFrame: nextProps.hasPendulumFrame,
        includesLink: nextProps.includesLink,
        adjustState: 'unknown',
        splitPendEff: nextProps.card.pendEffect
          .split('\n')
          .map((d, i) => CardPend.getProcessedText(d, i, nextProps.card.tcgAt)),
        fontSize,
        lineHeight,
      };
    } else {
      return null;
    }
  }

  public static predictSizes(pendEff: string, hasPendulumFrame: boolean, includesLink: boolean) {
    let fontSize = 30;
    let lineHeight = 1.2;
    if (!pendEff || !hasPendulumFrame) return { fontSize, lineHeight };

    let maxHeight = 124;
    let maxWidth = 556;
    if (includesLink) maxWidth = 513;

    let estimatedWidth: number;
    let estimatedHeight: number;
    function adjustLineHeight(fontSize: number): number {
      let newLineHeight = 1 + (30 - fontSize) / 90;
      if (newLineHeight < 1.05) return 1.05;
      if (newLineHeight > 1.2) return 1.2;
      return newLineHeight;
    }

    const lines = pendEff.split('\n');
    do {
      const averageCharWidth = fontSize * 0.6;
      const charsPerLine = Math.floor(maxWidth / averageCharWidth);
      let lineCount = 0;
      for (const line of lines) {
        lineCount += Math.ceil(line.length / charsPerLine);
      }

      estimatedWidth = charsPerLine * averageCharWidth;
      estimatedHeight = lineCount * lineHeight * fontSize;

      if (estimatedWidth > maxWidth || estimatedHeight > maxHeight) {
        fontSize -= 0.5; // Diminuer la taille de la police
        lineHeight = adjustLineHeight(fontSize); // Ajuster l'interligne
      } else {
        break; // Taille acceptable trouvée
      }
    } while (fontSize > 5 && (estimatedWidth > maxWidth || estimatedHeight > maxHeight));

    return { fontSize, lineHeight };
  }

  public static getProcessedText(text: string, index: number, tcgAt: boolean) {
    const parts = text.split(/(●|•)/).map((part) => part.trim() || '\u00A0');
    // If there are multiple strings, but the first is empty,
    // then it means the second one is a bullet point because the text started with one
    if (parts.length > 1 && parts[0] === '\u00A0') parts.shift();

    let nextHasBullet = false;
    const processedText: JSX.Element[] = [];
    parts.forEach((part, i) => {
      if (part === '●' || part === '•') {
        nextHasBullet = true;
      } else {
        // Replace each occurrence of "@" with a span
        const modifiedPart = part.split('@').map((subPart, subIndex, array) => (
          <Fragment key={`fragment-${index}-${i}-${subIndex}`}>
            {subPart}
            {subIndex < array.length - 1 && (
              <span key={`at-${index}-${i}-${subIndex}`} className='at-char'>
                @
              </span>
            )}
          </Fragment>
        ));
        processedText.push(
          <span
            key={`processed-text-${index}-${i}`}
            className={classNames('span-text', {
              'with-bullet-point': nextHasBullet,
              'in-middle': i > 1,
              'with-tcg-at': tcgAt,
            })}
          >
            {modifiedPart}
          </span>
        );
        nextHasBullet = false;
      }
    });

    return processedText;
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
    // Un nouveau processus de checkReady a été démarré, on ignore celui-ci
    if (currentProcessId !== this.checkReadyProcessId) return;

    if (this.isEmpty || !this.ref.current) return this.setState({ checkState: 0 });

    const texts = this.ref.current.childNodes as NodeListOf<HTMLParagraphElement>;
    if (!texts?.length || this.state.fontSize === 0) {
      return this.setState({
        checkState: 0,
        adjustState: 'unknown',
      });
    }

    let textHeight = 0;
    let textWidth = 0;
    textWidth = texts[0].clientWidth;
    texts.forEach((text) => {
      textHeight += text.clientHeight;
    });
    const parentHeight = this.ref.current.clientHeight;
    const parentWidth = this.ref.current.clientWidth;
    const fontSize = this.state.fontSize;

    if (textHeight > parentHeight || textWidth > parentWidth) {
      const newFontSize = fontSize - 0.5;
      let newLineHeight = 1 + (12 - newFontSize) / 90;
      if (newLineHeight < 1.05) newLineHeight = 1.05;

      if (newFontSize >= 5) {
        return this.setState({
          checkState: this.state.checkState + 1,
          adjustState: 'tooBig',
          fontSize: newFontSize,
          lineHeight: newLineHeight,
        });
      } else {
        return this.setState({
          checkState: 0,
          adjustState: 'unknown',
        });
      }
    } else if (textHeight < parentHeight || textWidth < parentWidth) {
      if (this.state.adjustState === 'tooBig') {
        if (this.state.lineHeight < 1.2) {
          let newLineHeight = this.state.lineHeight + 0.1;
          if (newLineHeight > 1.2) newLineHeight = 1.2;
          return this.setState({
            checkState: this.state.checkState + 1,
            lineHeight: newLineHeight,
          });
        } else {
          return this.setState({
            checkState: 0,
            adjustState: 'unknown',
          });
        }
      } else {
        const newFontSize = fontSize + 0.5;
        let newLineHeight = 1 + (12 + newFontSize) / 90;
        if (newLineHeight > 1.2) newLineHeight = 1.2;

        if (newFontSize <= 30) {
          return this.setState({
            checkState: this.state.checkState + 1,
            adjustState: 'tooSmall',
            fontSize: newFontSize,
            lineHeight: newLineHeight,
          });
        } else {
          return this.setState({
            checkState: 0,
            adjustState: 'unknown',
          });
        }
      }
    } else {
      return this.setState({
        checkState: 0,
        adjustState: 'unknown',
      });
    }
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
