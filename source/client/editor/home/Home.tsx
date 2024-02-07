import { HomeCenterPane } from "client/editor/homeCenterPane";
import { HomeLeftPane } from "client/editor/homeLeftPane";
import { HomeRightPane } from "client/editor/homeRightPane";
import { IContainableProps, IContainableState, Containable, HorizontalStack } from "libraries/mn-toolkit";

interface ICardHandlerProps extends IContainableProps {}

interface ICardHandlerState extends IContainableState {}

export class CardHandler extends Containable<ICardHandlerProps, ICardHandlerState> {

  public constructor(props: ICardHandlerProps) {
    super(props);
    this.state = {
      loaded: true,
    };
  }

  public render() {
    return this.renderAttributes(<HorizontalStack gutter itemAlignment='center'>
      <HomeLeftPane />
      <HomeCenterPane />
      <HomeRightPane />
    </HorizontalStack>, 'home');
  }
}
