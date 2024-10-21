import { ICard, TCardLanguage, TRushEffectType, TRushTextMode } from 'client/editor/card/card-interfaces';
import {
  ToolkitComponent,
  IToolkitComponentProps,
  IToolkitComponentState,
  JSXElementChild,
  TDidUpdateSnapshot,
} from 'mn-toolkit';
import { createRef } from 'react';

interface IRushCardDescProps extends IToolkitComponentProps {
  card: ICard;
  description: JSXElementChild[][];
  includesNormal: boolean;
  onReady: () => void;
}

interface IRushCardDescState extends IToolkitComponentState {
  description: JSXElementChild[][];
  includesNormal: boolean;
  checkState: boolean;
  adjustState: 'unknown' | 'tooBig' | 'tooSmall';
  fontSize: number;
  lineHeight: number;
}

export class RushCardDesc extends ToolkitComponent<IRushCardDescProps, IRushCardDescState> {
  public ref = createRef<HTMLDivElement>();

  public constructor(props: IRushCardDescProps) {
    super(props);
    const { fontSize, lineHeight } = RushCardDesc.predictSizes(
      props.card.language,
      props.card.description,
      props.card.rushTextMode,
      props.card.rushOtherEffects,
      props.card.rushCondition,
      props.card.rushEffect,
      props.card.rushEffectType,
      props.card.rushChoiceEffects
    );
    this.state = {
      description: [...props.description],
      includesNormal: props.includesNormal,
      checkState: true,
      adjustState: 'unknown',
      fontSize,
      lineHeight,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
  }

  public static getDerivedStateFromProps(
    nextProps: IRushCardDescProps,
    prevState: IRushCardDescState
  ): Partial<IRushCardDescState> | null {
    if (
      prevState.includesNormal !== nextProps.includesNormal ||
      prevState.description.length !== nextProps.description.length ||
      !prevState.description.every(
        (innerArray, index) =>
          innerArray.length === nextProps.description[index].length &&
          innerArray.every((value, idx) => value === nextProps.description[index][idx])
      )
    ) {
      const { fontSize, lineHeight } = RushCardDesc.predictSizes(
        nextProps.card.language,
        nextProps.card.description,
        nextProps.card.rushTextMode,
        nextProps.card.rushOtherEffects,
        nextProps.card.rushCondition,
        nextProps.card.rushEffect,
        nextProps.card.rushEffectType,
        nextProps.card.rushChoiceEffects
      );
      return {
        checkState: true,
        description: [...nextProps.description],
        includesNormal: nextProps.includesNormal,
        adjustState: 'unknown',
        fontSize,
        lineHeight,
      };
    } else {
      return null;
    }
  }

  public static predictSizes(
    language: TCardLanguage,
    description: string,
    rushTextMode: TRushTextMode,
    rushOtherEffects: string,
    rushCondition: string,
    rushEffect: string,
    rushEffectType: TRushEffectType,
    rushChoiceEffects: string[]
  ) {
    let lines: string[] = [];
    switch (rushTextMode) {
      case 'vanilla':
        if (!description) break;
        lines = description.split('\n');
        break;

      case 'regular':
        if (rushOtherEffects) {
          lines.push(...rushOtherEffects.split('\n'));
        }
        rushCondition.split('\n').forEach((line, i) => {
          if (!i) lines.push(`[Condition] ${line}`);
          else lines.push(line);
        });

        let effectLabel = '';
        switch (rushEffectType) {
          case 'effect':
            effectLabel = language === 'fr' ? '[Effet] ' : '[Effect] ';
            break;

          case 'continuous':
            effectLabel = language === 'fr' ? '[Effet Continu] ' : '[Continuous Effect] ';
            break;

          default:
            break;
        }
        rushEffect.split('\n').forEach((line, i) => {
          if (!i) lines.push(`${effectLabel} ${line}`);
          else lines.push(line);
        });
        break;

      case 'choice':
        if (rushOtherEffects) {
          lines.push(...rushOtherEffects.split('\n'));
        }
        rushCondition.split('\n').forEach((line, i) => {
          if (!i) lines.push(`[Condition] ${line}`);
          else lines.push(line);
        });

        let choiceEffects = language === 'fr' ? '[Effet Multi-Choix]' : '[Multi-Choice Effect]';
        for (const choice of rushChoiceEffects) {
          choiceEffects += ` • ${choice}`;
        }
        lines.push(...choiceEffects.split('\n'));
        break;

      default:
        break;
    }

    let fontSize = 30;
    let lineHeight = 1.2;
    if (!lines.length) return { fontSize, lineHeight };

    const maxWidth = 700;
    const maxHeight = 194;

    let estimatedWidth: number;
    let estimatedHeight: number;
    function adjustLineHeight(fontSize: number): number {
      let newLineHeight = 1 + (30 - fontSize) / 90;
      if (newLineHeight < 1.05) return 1.05;
      if (newLineHeight > 1.2) return 1.2;
      return newLineHeight;
    }

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

  public override componentDidUpdate(
    prevProps: Readonly<IRushCardDescProps>,
    prevState: Readonly<IRushCardDescState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.state.checkState) {
      requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => this.props.onReady()));
    }
  }

  private get isEmpty() {
    const { description } = this.state;
    return !description.length;
  }

  private checkReady() {
    if (this.isEmpty || !this.ref.current) return this.setState({ checkState: false });

    const texts = this.ref.current.childNodes as NodeListOf<HTMLParagraphElement>;
    if (!texts?.length || this.state.fontSize === 0) {
      return this.setState({
        checkState: false,
        adjustState: 'unknown',
        fontSize: this.state.fontSize,
        lineHeight: this.state.lineHeight,
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
          adjustState: 'tooBig',
          fontSize: newFontSize,
          lineHeight: newLineHeight,
        });
      } else {
        return this.setState({
          checkState: false,
          adjustState: 'unknown',
          fontSize: this.state.fontSize,
          lineHeight: this.state.lineHeight,
        });
      }
    } else if (textHeight < parentHeight || textWidth < parentWidth) {
      if (this.state.adjustState === 'tooBig') {
        if (this.state.lineHeight < 1.2) {
          let newLineHeight = this.state.lineHeight + 0.1;
          if (newLineHeight > 1.2) newLineHeight = 1.2;
          this.setState({ lineHeight: newLineHeight });
          return this.setState({
            adjustState: this.state.adjustState,
            fontSize: this.state.fontSize,
            lineHeight: newLineHeight,
          });
        } else {
          return this.setState({
            checkState: false,
            adjustState: 'unknown',
            fontSize: this.state.fontSize,
            lineHeight: this.state.lineHeight,
          });
        }
      } else {
        const newFontSize = fontSize + 0.5;
        let newLineHeight = 1 + (12 + newFontSize) / 90;
        if (newLineHeight > 1.2) newLineHeight = 1.2;

        if (newFontSize <= 30) {
          return this.setState({
            adjustState: 'tooSmall',
            fontSize: newFontSize,
            lineHeight: newLineHeight,
          });
        } else {
          return this.setState({
            checkState: false,
            adjustState: 'unknown',
            fontSize: this.state.fontSize,
            lineHeight: this.state.lineHeight,
          });
        }
      }
    } else {
      return this.setState({
        checkState: false,
        adjustState: 'unknown',
        fontSize: this.state.fontSize,
        lineHeight: this.state.lineHeight,
      });
    }
  }

  public override render() {
    if (this.isEmpty) return null;

    const { includesNormal, description, fontSize, lineHeight } = this.state;

    let containerClass = `custom-container vertical card-layer card-description-holder`;
    if (includesNormal) containerClass = `${containerClass} normal-text`;

    return (
      <div className={containerClass} ref={this.ref}>
        {description.map((d, i) => {
          return (
            <p
              key={`rush-description-text-${i}`}
              className='description-text black-text'
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                marginBottom: lineHeight / 2,
              }}
            >
              {d}
            </p>
          );
        })}
      </div>
    );
  }
}
