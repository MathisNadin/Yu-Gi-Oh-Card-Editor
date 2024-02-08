import { ICard, ICardListener } from 'client/editor/card';
import { CardPreview, RushCardPreview } from 'client/editor/cardPreview';
import { IContainableProps, IContainableState, Containable, VerticalStack, Spinner } from 'libraries/mn-toolkit';

interface IHomeCenterPaneProps extends IContainableProps {}

interface IHomeCenterPaneState extends IContainableState {
  currentCard: ICard;
  tempCurrentCard: ICard;
}

export class HomeCenterPane
  extends Containable<IHomeCenterPaneProps, IHomeCenterPaneState>
  implements Partial<ICardListener>
{
  public constructor(props: IHomeCenterPaneProps) {
    super(props);
    this.state = {
      loaded: false,
    } as IHomeCenterPaneState;
    app.$card.addListener(this);
  }

  public componentWillUnmount() {
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

  public render() {
    const { loaded, currentCard, tempCurrentCard } = this.state;
    const card = tempCurrentCard || currentCard;
    return this.renderAttributes(
      <VerticalStack>
        {!loaded && <Spinner />}
        {loaded && !card.rush && <CardPreview card={card} />}
        {loaded && card.rush && <RushCardPreview card={card} />}
      </VerticalStack>,
      'home-center-pane'
    );
  }
}
