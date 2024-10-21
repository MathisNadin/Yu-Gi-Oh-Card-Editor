import { ICard } from 'client/editor/card/card-interfaces';
import {
  ToolkitComponent,
  IToolkitComponentProps,
  IToolkitComponentState,
  JSXElementChild,
  TDidUpdateSnapshot,
} from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { createRef } from 'react';

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
  hasAbilities: boolean;
  hasPendulumFrame: boolean;
  includesNormal: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  checkState: boolean;
  adjustState: 'unknown' | 'tooBig' | 'tooSmall';
  splitDesc: JSXElementChild[];
  fontSize: number;
  lineHeight: number;
}

export class CardDesc extends ToolkitComponent<ICardDescProps, ICardDescState> {
  public ref = createRef<HTMLDivElement>();

  public constructor(props: ICardDescProps) {
    super(props);
    const { fontSize, lineHeight } = CardDesc.predictSizes(
      props.card.description,
      props.hasAbilities,
      props.hasPendulumFrame,
      props.includesLink,
      props.includesSkill
    );
    this.state = {
      ...this.state,
      description: props.card.description,
      hasAbilities: props.hasAbilities,
      hasPendulumFrame: props.hasPendulumFrame,
      includesNormal: props.includesNormal,
      includesLink: props.includesLink,
      includesSkill: props.includesSkill,
      checkState: true,
      adjustState: 'unknown',
      splitDesc: props.card.description.split('\n').map((d, i) => CardDesc.getProcessedText(d, i)),
      fontSize,
      lineHeight,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
  }

  public static getDerivedStateFromProps(
    nextProps: ICardDescProps,
    prevState: ICardDescState
  ): Partial<ICardDescState> | null {
    if (
      prevState.hasAbilities !== nextProps.hasAbilities ||
      prevState.hasPendulumFrame !== nextProps.hasPendulumFrame ||
      prevState.includesNormal !== nextProps.includesNormal ||
      prevState.includesLink !== nextProps.includesLink ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.description !== nextProps.card.description
    ) {
      const { fontSize, lineHeight } = CardDesc.predictSizes(
        nextProps.card.description,
        nextProps.hasAbilities,
        nextProps.hasPendulumFrame,
        nextProps.includesLink,
        nextProps.includesSkill
      );
      return {
        checkState: true,
        description: nextProps.card.description,
        hasAbilities: nextProps.hasAbilities,
        hasPendulumFrame: nextProps.hasPendulumFrame,
        includesNormal: nextProps.includesNormal,
        includesLink: nextProps.includesLink,
        includesSkill: nextProps.includesSkill,
        adjustState: 'unknown',
        splitDesc: nextProps.card.description.split('\n').map((d, i) => CardDesc.getProcessedText(d, i)),
        fontSize,
        lineHeight,
      };
    } else {
      return null;
    }
  }

  public static predictSizes(
    description: string,
    hasAbilities: boolean,
    hasPendulumFrame: boolean,
    includesLink: boolean,
    includesSkill: boolean
  ) {
    let fontSize = 30;
    let lineHeight = 1.2;
    if (!description) return { fontSize, lineHeight };

    let maxWidth = 680;
    let maxHeight = 214;
    if (hasAbilities) maxHeight = 147;
    if (hasAbilities && includesSkill) maxHeight = 178;
    if (hasPendulumFrame && includesLink) maxHeight = 115;

    let estimatedWidth: number;
    let estimatedHeight: number;
    function adjustLineHeight(fontSize: number): number {
      let newLineHeight = 1 + (30 - fontSize) / 90;
      if (newLineHeight < 1.05) return 1.05;
      if (newLineHeight > 1.2) return 1.2;
      return newLineHeight;
    }

    const lines = description.split('\n');
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

  public static getProcessedText(text: string, index: number) {
    const parts = text.split(/(●|•)/).map((part) => part.trim());
    if (parts.length && !parts[0]) parts.shift();

    let nextHasBullet = false;
    const processedText: JSX.Element[] = [];
    parts.forEach((part, i) => {
      if (part === '●' || part === '•') {
        nextHasBullet = true;
      } else {
        let classes = classNames('span-text', { 'with-bullet-point': nextHasBullet, 'in-middle': i > 1 });
        nextHasBullet = false;
        processedText.push(
          <span key={`processed-text-${index}-${i}`} className={classes}>
            {part}
          </span>
        );
      }
    });

    return processedText;
  }

  public override componentDidUpdate(
    prevProps: Readonly<ICardDescProps>,
    prevState: Readonly<ICardDescState>,
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
    return !description;
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

    let containerClass = 'custom-container vertical card-layer card-description-holder';
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
      <div className={containerClass} ref={this.ref}>
        {splitDesc.map((d, i) => {
          return (
            <p
              key={`description-text-${i}`}
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
