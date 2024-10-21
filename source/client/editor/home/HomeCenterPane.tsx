import { ICard, ICardListener } from 'client/editor/card';
import { CardPreview, RushCardPreview } from 'client/editor/cardPreview';
import { IContainerProps, IContainerState, Container, Spinner } from 'mn-toolkit';

interface IHomeCenterPaneProps extends IContainerProps {}

interface IHomeCenterPaneState extends IContainerState {
  currentCard: ICard;
  tempCurrentCard: ICard;
}

export class HomeCenterPane
  extends Container<IHomeCenterPaneProps, IHomeCenterPaneState>
  implements Partial<ICardListener>
{
  public constructor(props: IHomeCenterPaneProps) {
    super(props);
    app.$card.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$card.removeListener(this);
  }

  public currentCardLoaded(currentCard: ICard) {
    this.setState({ loaded: true, currentCard });
  }

  public currentCardUpdated(currentCard: ICard) {
    this.setState({ loaded: true, currentCard });
  }

  public tempCurrentCardLoaded(tempCurrentCard: ICard) {
    this.setState({ loaded: true, tempCurrentCard });
  }

  public tempCurrentCardUpdated(tempCurrentCard: ICard) {
    this.setState({ loaded: true, tempCurrentCard });
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['home-center-pane'] = true;
    return classes;
  }

  public get children() {
    if (!this.state.loaded) return <Spinner />;
    const { currentCard, tempCurrentCard } = this.state;
    const card = tempCurrentCard || currentCard;
    return [
      !card.rush && <CardPreview key='card-preview' card={card} />,
      card.rush && <RushCardPreview key='rush-card-preview' card={card} />,
    ];
  }
}
