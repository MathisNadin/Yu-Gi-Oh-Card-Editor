import { ICard, TNameStyle } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { createRef } from 'react';

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
  includesToken: boolean;
  includesXyz: boolean;
  includesLink: boolean;
  includesSkill: boolean;
  isBackrow: boolean;
  checkState: boolean;
  xScale: number;
}

export class CardName extends ToolkitComponent<ICardNameProps, ICardNameState> {
  public ref = createRef<HTMLDivElement>();

  public constructor(props: ICardNameProps) {
    super(props);
    this.state = {
      cardName: props.card.name,
      nameStyle: props.card.nameStyle,
      includesToken: props.includesToken,
      includesXyz: props.includesXyz,
      includesLink: props.includesLink,
      includesSkill: props.includesSkill,
      isBackrow: props.isBackrow,
      checkState: true,
      xScale: 1,
    };
  }

  public componentDidMount() {
    setTimeout(() => this.checkReady(), 100);
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
      prevState.cardName !== nextProps.card.name
    ) {
      return {
        checkState: true,
        cardName: nextProps.card.name,
        nameStyle: nextProps.card.nameStyle,
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

  public componentDidUpdate() {
    if (this.state.checkState) {
      this.checkReady();
    } else {
      setTimeout(() => this.props.onReady());
    }
  }

  private get isEmpty() {
    const { cardName } = this.state;
    return !cardName;
  }

  private checkReady() {
    if (this.isEmpty || !this.ref.current) return this.setState({ checkState: false });

    const paragraph = this.ref.current.querySelector('p');
    if (!paragraph) return this.setState({ checkState: false });

    let xScale = this.ref.current.clientWidth / paragraph.clientWidth;
    if (xScale > 1) xScale = 1;
    this.setState({ xScale, checkState: false });
  }

  public render() {
    if (this.isEmpty) return null;

    const { cardName, nameStyle, includesXyz, includesLink, includesToken, includesSkill, isBackrow, xScale } =
      this.state;

    let containerClass = `custom-container card-layer card-name-container`;
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
        <span key={index} className='special-char-span'>
          {part}
        </span>
      ) : (
        part
      )
    );

    return (
      <div className={containerClass} ref={this.ref}>
        <p className={pClass} style={{ transform: `scaleX(${xScale})` }}>
          {processedText}
        </p>
      </div>
    );
  }
}
