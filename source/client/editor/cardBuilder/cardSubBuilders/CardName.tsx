import { createRef } from 'react';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState, TDidUpdateSnapshot } from 'mn-toolkit';
import { classNames } from 'mn-tools';
import { ICard, TNameStyle } from '../../card';

interface ICardNameProps extends IToolkitComponentProps {
  card: ICard;
  includesToken: boolean;
  includesXyz: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  isBackrow: boolean;
  onReady: () => void;
}

interface ICardNameState extends IToolkitComponentState {
  cardName: string;
  nameStyle: TNameStyle;
  tcgAt: boolean;
  includesToken: boolean;
  includesXyz: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  isBackrow: boolean;
  checkState: boolean;
  xScale: number;
}

export class CardName extends ToolkitComponent<ICardNameProps, ICardNameState> {
  public containerRef = createRef<HTMLDivElement>();
  public nameRef = createRef<HTMLParagraphElement>();

  public constructor(props: ICardNameProps) {
    super(props);
    this.state = {
      cardName: props.card.name,
      nameStyle: props.card.nameStyle,
      tcgAt: props.card.tcgAt,
      includesToken: props.includesToken,
      includesXyz: props.includesXyz,
      includesLink: props.includesLink,
      includesSkill: props.includesSkill,
      isBackrow: props.isBackrow,
      checkState: true,
      xScale: 1,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
  }

  public static getDerivedStateFromProps(
    nextProps: ICardNameProps,
    prevState: ICardNameState
  ): Partial<ICardNameState> | null {
    if (
      prevState.includesToken !== nextProps.includesToken ||
      prevState.includesXyz !== nextProps.includesXyz ||
      prevState.includesLink !== nextProps.includesLink ||
      prevState.includesSkill !== nextProps.includesSkill ||
      prevState.isBackrow !== nextProps.isBackrow ||
      prevState.nameStyle !== nextProps.card.nameStyle ||
      prevState.tcgAt !== nextProps.card.tcgAt ||
      prevState.cardName !== nextProps.card.name
    ) {
      return {
        checkState: true,
        cardName: nextProps.card.name,
        nameStyle: nextProps.card.nameStyle,
        tcgAt: nextProps.card.tcgAt,
        includesToken: nextProps.includesToken,
        includesXyz: nextProps.includesXyz,
        includesLink: nextProps.includesLink,
        includesSkill: nextProps.includesSkill,
        isBackrow: nextProps.isBackrow,
        xScale: 1,
      };
    } else {
      return null;
    }
  }

  public override componentDidUpdate(
    prevProps: Readonly<ICardNameProps>,
    prevState: Readonly<ICardNameState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.state.checkState) {
      requestAnimationFrame(() => requestAnimationFrame(() => this.checkReady()));
    } else {
      this.props.onReady();
    }
  }

  private get isEmpty() {
    const { cardName } = this.state;
    return !cardName;
  }

  private checkReady() {
    if (this.isEmpty || !this.containerRef.current || !this.nameRef.current) {
      return this.setState({ checkState: false });
    }

    let xScale = this.containerRef.current.clientWidth / this.nameRef.current.clientWidth;
    if (xScale > 1) xScale = 1;
    this.setState({ xScale, checkState: false });
  }

  public override render() {
    if (this.isEmpty) return null;

    const { cardName, nameStyle, tcgAt, includesXyz, includesLink, includesToken, includesSkill, isBackrow, xScale } =
      this.state;

    let containerClass = classNames('custom-container', 'card-layer', 'card-name-container', { 'with-tcg-at': tcgAt });
    let pClass = `card-layer card-name ${nameStyle}`;
    if (includesToken) {
      containerClass = `${containerClass} token-name-container`;
      pClass = `${pClass} black-text token-name`;
    } else if (includesSkill) {
      containerClass = `${containerClass} skill-name-container`;
      pClass = `${pClass} white-text skill-name`;
    } else {
      pClass = `${pClass} ${includesXyz || includesLink || isBackrow ? 'white' : 'black'}-text`;
      if (includesLink) {
        pClass = `${pClass} on-link`;
      }
    }

    const specialCharsRegex = /([^a-zA-Z0-9éäöüçñàèùâêîôûÉÄÖÜÇÑÀÈÙÂÊÎÔÛ\s.,;:'"/?!+-/&"'()`_^=])/;
    const parts = cardName.split(specialCharsRegex);
    const processedText = parts.map((part, index) =>
      specialCharsRegex.test(part) ? (
        <span key={index} className={classNames('special-char-span', { 'tcg-at': tcgAt && part === '@' })}>
          {part}
        </span>
      ) : (
        part
      )
    );

    return (
      <div className={containerClass} ref={this.containerRef}>
        <p className={pClass} style={{ transform: `scaleX(${xScale})` }} ref={this.nameRef}>
          {processedText}
        </p>
      </div>
    );
  }
}
