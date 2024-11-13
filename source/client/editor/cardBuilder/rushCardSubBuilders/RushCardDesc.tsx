import { ICard, TCardLanguage, TRushEffectType, TRushTextMode } from 'client/editor/card/card-interfaces';
import {
  ToolkitComponent,
  IToolkitComponentProps,
  IToolkitComponentState,
  JSXElementChild,
  TDidUpdateSnapshot,
} from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { createRef, Fragment } from 'react';

interface IRushCardDescProps extends IToolkitComponentProps {
  card: ICard;
  includesNormal: boolean;
  onReady: () => void;
}

interface IRushCardDescState extends IToolkitComponentState {
  description: string;
  rushTextMode: TRushTextMode;
  rushOtherEffects: string;
  rushCondition: string;
  rushEffect: string;
  rushEffectType: TRushEffectType;
  rushChoiceEffects: string[];
  tcgAt: boolean;
  includesNormal: boolean;
  checkState: number;
  adjustState: 'unknown' | 'tooBig' | 'tooSmall';
  splitDesc: JSXElementChild[][];
  fontSize: number;
  lineHeight: number;
}

export class RushCardDesc extends ToolkitComponent<IRushCardDescProps, IRushCardDescState> {
  public ref = createRef<HTMLDivElement>();
  private checkReadyProcessId = 0;

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
      description: props.card.description,
      rushTextMode: props.card.rushTextMode,
      rushOtherEffects: props.card.rushOtherEffects,
      rushCondition: props.card.rushCondition,
      rushEffect: props.card.rushEffect,
      rushEffectType: props.card.rushEffectType,
      rushChoiceEffects: props.card.rushChoiceEffects,
      tcgAt: props.card.tcgAt,
      includesNormal: props.includesNormal,
      checkState: 1,
      adjustState: 'unknown',
      splitDesc: RushCardDesc.getDescription(props.card),
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
    nextProps: IRushCardDescProps,
    prevState: IRushCardDescState
  ): Partial<IRushCardDescState> | null {
    if (
      prevState.tcgAt !== nextProps.card.tcgAt ||
      prevState.includesNormal !== nextProps.includesNormal ||
      prevState.description !== nextProps.card.description ||
      prevState.rushTextMode !== nextProps.card.rushTextMode ||
      prevState.rushOtherEffects !== nextProps.card.rushOtherEffects ||
      prevState.rushCondition !== nextProps.card.rushCondition ||
      prevState.rushEffect !== nextProps.card.rushEffect ||
      prevState.rushEffectType !== nextProps.card.rushEffectType ||
      !prevState.rushChoiceEffects.every((innerArray, index) => innerArray === nextProps.card.rushChoiceEffects[index])
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
        checkState: 1,
        description: nextProps.card.description,
        rushTextMode: nextProps.card.rushTextMode,
        rushOtherEffects: nextProps.card.rushOtherEffects,
        rushCondition: nextProps.card.rushCondition,
        rushEffect: nextProps.card.rushEffect,
        rushEffectType: nextProps.card.rushEffectType,
        rushChoiceEffects: nextProps.card.rushChoiceEffects,
        tcgAt: nextProps.card.tcgAt,
        includesNormal: nextProps.includesNormal,
        adjustState: 'unknown',
        splitDesc: RushCardDesc.getDescription(nextProps.card),
        fontSize,
        lineHeight,
      };
    } else {
      return null;
    }
  }

  public static getDescription(card: ICard) {
    let description: JSXElementChild[][] = [];
    switch (card.rushTextMode) {
      case 'vanilla':
        description = card.description.split('\n').map((d, i) => RushCardDesc.getProcessedText(d, i, card.tcgAt));
        break;

      case 'regular':
        let effectLabel = '';
        switch (card.rushEffectType) {
          case 'effect':
            effectLabel = card.language === 'fr' ? '[Effet] ' : '[Effect] ';
            break;

          case 'continuous':
            effectLabel = card.language === 'fr' ? '[Effet Continu] ' : '[Continuous Effect] ';
            break;

          default:
            break;
        }
        if (card.rushOtherEffects) {
          description.push(
            ...card.rushOtherEffects.split('\n').map((d, i) => RushCardDesc.getProcessedText(d, i, card.tcgAt))
          );
        }
        description.push(
          [
            <span
              key={`rush-label-condition`}
              className={classNames('span-text', 'rush-label', 'condition', { 'with-tcg-at': card.tcgAt })}
            >
              {'[Condition] '}
            </span>,
          ].concat(...card.rushCondition.split('\n').map((d, i) => RushCardDesc.getProcessedText(d, i, card.tcgAt))),
          [
            <span
              key={`rush-label-effect`}
              className={classNames('span-text', 'rush-label', 'effect', { 'with-tcg-at': card.tcgAt })}
            >
              {effectLabel}
            </span>,
          ].concat(...card.rushEffect.split('\n').map((d, i) => RushCardDesc.getProcessedText(d, i, card.tcgAt)))
        );
        break;

      case 'choice':
        if (card.rushOtherEffects) {
          description.push(
            ...card.rushOtherEffects.split('\n').map((d, i) => RushCardDesc.getProcessedText(d, i, card.tcgAt))
          );
        }
        const choiceEffectsLabel = card.language === 'fr' ? '[Effet Multi-Choix]' : '[Multi-Choice Effect]';
        const choiceEffects: (string | JSXElementChild[])[] = [];
        for (const choice of card.rushChoiceEffects) {
          choiceEffects.push(' ');
          choiceEffects.push(
            ...choice.split('\n').map((d, i) => RushCardDesc.getProcessedText(d, i, card.tcgAt, true))
          );
        }
        description.push(
          [
            <span
              key={`rush-label-condition`}
              className={classNames('span-text', 'rush-label', 'condition', { 'with-tcg-at': card.tcgAt })}
            >
              {'[Condition] '}
            </span>,
            ...card.rushCondition.split('\n').map((d, i) => RushCardDesc.getProcessedText(d, i, card.tcgAt)),
          ],
          [
            <span
              key={`rush-label-effect`}
              className={classNames('span-text', 'rush-label', 'effect', { 'with-tcg-at': card.tcgAt })}
            >
              {choiceEffectsLabel}
            </span>,
            ...choiceEffects,
          ]
        );
        break;

      default:
        break;
    }

    return description;
  }

  public static getProcessedText(text: string, index: number, tcgAt: boolean, forceBulletAtStart?: boolean) {
    const parts = text.split(/(●|•)/).map((part) => part.trim());
    if (parts.length && !parts[0]) parts.shift();

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
              'with-bullet-point': nextHasBullet || (!i && forceBulletAtStart),
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
      this.startCheckReady();
    } else {
      this.props.onReady();
    }
  }

  private get isEmpty() {
    const { description, rushOtherEffects, rushCondition, rushEffect, rushChoiceEffects } = this.state;
    return !description && !rushOtherEffects && !rushCondition && !rushEffect && !rushChoiceEffects.length;
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
    texts.forEach((text) => {
      textHeight += text.clientHeight;
      if (text.clientWidth > textWidth) textWidth = text.clientWidth;
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

    const { includesNormal, splitDesc, fontSize, lineHeight } = this.state;

    let containerClass = classNames('custom-container', 'vertical card-layer', 'card-description-holder');
    if (includesNormal) containerClass = `${containerClass} normal-text`;

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
            <p key={`rush-description-text-${i}`} className={classNames('description-text', 'black-text')}>
              {d}
            </p>
          );
        })}
      </div>
    );
  }
}
