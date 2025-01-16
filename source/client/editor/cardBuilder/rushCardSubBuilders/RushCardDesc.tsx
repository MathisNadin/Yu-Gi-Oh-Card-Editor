import { createRef } from 'react';
import {
  ToolkitComponent,
  IToolkitComponentProps,
  IToolkitComponentState,
  TJSXElementChild,
  TDidUpdateSnapshot,
} from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { ICard, TCardLanguage, TRushEffectType, TRushTextMode } from '../../card';
import { TTextAdjustState } from '../CardBuilderService';

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
  adjustState: TTextAdjustState;
  splitDesc: TJSXElementChild[][];
  fontSize: number;
  lineHeight: number;
}

export class RushCardDesc extends ToolkitComponent<IRushCardDescProps, IRushCardDescState> {
  public ref = createRef<HTMLDivElement>();
  private checkReadyProcessId = 0;

  public constructor(props: IRushCardDescProps) {
    super(props);
    const { fontSize, lineHeight } = RushCardDesc.predictSizes({
      language: props.card.language,
      description: props.card.description,
      rushTextMode: props.card.rushTextMode,
      rushOtherEffects: props.card.rushOtherEffects,
      rushCondition: props.card.rushCondition,
      rushEffect: props.card.rushEffect,
      rushEffectType: props.card.rushEffectType,
      rushChoiceEffects: props.card.rushChoiceEffects,
    });
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
      prevState.rushChoiceEffects.length !== nextProps.card.rushChoiceEffects.length ||
      !prevState.rushChoiceEffects.every((innerArray, index) => innerArray === nextProps.card.rushChoiceEffects[index])
    ) {
      const { fontSize, lineHeight } = RushCardDesc.predictSizes({
        language: nextProps.card.language,
        description: nextProps.card.description,
        rushTextMode: nextProps.card.rushTextMode,
        rushOtherEffects: nextProps.card.rushOtherEffects,
        rushCondition: nextProps.card.rushCondition,
        rushEffect: nextProps.card.rushEffect,
        rushEffectType: nextProps.card.rushEffectType,
        rushChoiceEffects: nextProps.card.rushChoiceEffects,
      });
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

  public static getDescription(card: ICard) {
    const description: TJSXElementChild[][] = [];
    const addLineBreaks = (texts: TJSXElementChild[] | TJSXElementChild[][]) =>
      texts.map((text, i) => (i < texts.length - 1 ? [text, <br key={`br-${i}`} />] : text));

    switch (card.rushTextMode) {
      case 'vanilla':
        description.push(
          addLineBreaks(
            card.description
              .split('\n')
              .map((text, index) => app.$cardBuilder.getProcessedText({ text, index, tcgAt: card.tcgAt }))
          )
        );
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
            addLineBreaks(
              card.rushOtherEffects
                .split('\n')
                .map((text, index) => app.$cardBuilder.getProcessedText({ text, index, tcgAt: card.tcgAt }))
            )
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
            addLineBreaks(
              card.rushCondition
                .split('\n')
                .map((text, index) => app.$cardBuilder.getProcessedText({ text, index, tcgAt: card.tcgAt }))
            ),
          ],
          [
            <span
              key={`rush-label-effect`}
              className={classNames('span-text', 'rush-label', 'effect', { 'with-tcg-at': card.tcgAt })}
            >
              {effectLabel}
            </span>,
            addLineBreaks(
              card.rushEffect
                .split('\n')
                .map((text, index) => app.$cardBuilder.getProcessedText({ text, index, tcgAt: card.tcgAt }))
            ),
          ]
        );
        break;

      case 'choice':
        if (card.rushOtherEffects) {
          description.push(
            addLineBreaks(
              card.rushOtherEffects
                .split('\n')
                .map((text, index) => app.$cardBuilder.getProcessedText({ text, index, tcgAt: card.tcgAt }))
            )
          );
        }
        const choiceEffectsLabel = card.language === 'fr' ? '[Effet Multi-Choix]' : '[Multi-Choice Effect]';
        const choiceEffects: (string | TJSXElementChild[])[] = [];
        for (const choice of card.rushChoiceEffects) {
          choiceEffects.push(' ');
          choiceEffects.push(
            addLineBreaks(
              choice
                .split('\n')
                .map((text, index) =>
                  app.$cardBuilder.getProcessedText({ text, index, tcgAt: card.tcgAt, forceBulletAtStart: !index })
                )
            )
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
            addLineBreaks(
              card.rushCondition
                .split('\n')
                .map((text, index) => app.$cardBuilder.getProcessedText({ text, index, tcgAt: card.tcgAt }))
            ),
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

  public static predictSizes(options: {
    language: TCardLanguage;
    description: string;
    rushTextMode: TRushTextMode;
    rushOtherEffects: string;
    rushCondition: string;
    rushEffect: string;
    rushEffectType: TRushEffectType;
    rushChoiceEffects: string[];
  }) {
    const {
      language,
      description,
      rushTextMode,
      rushOtherEffects,
      rushCondition,
      rushEffect,
      rushEffectType,
      rushChoiceEffects,
    } = options;

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

    const fontSize = 30;
    const lineHeight = 1.2;
    if (!lines.length) return { fontSize, lineHeight };

    return app.$cardBuilder.predictSizes({
      lines,
      fontSize,
      lineHeight,
      maxWidth: 700,
      maxHeight: 194,
    });
  }

  private get isEmpty() {
    const { description, rushOtherEffects, rushCondition, rushEffect, rushChoiceEffects } = this.state;
    return !description && !rushOtherEffects && !rushCondition && !rushEffect && !rushChoiceEffects.length;
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
    });
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
