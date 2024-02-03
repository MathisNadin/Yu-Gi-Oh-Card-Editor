import './styles.scss';
import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { HomeLeftPane } from 'renderer/home-left-pane/HomeLeftPane';
import { HomeRightPane } from 'renderer/home-right-pane/HomeRightPane';
import { HomeCenterPane } from 'renderer/home-center-pane/HomeCenterPane';

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
