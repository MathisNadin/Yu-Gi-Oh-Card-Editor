import { IContainableProps, IAbstractViewState, AbstractView, Content } from 'mn-toolkit';
import { HomeCenterPane } from './HomeCenterPane';
import { HomeLeftPane } from './HomeLeftPane';
import { HomeRightPane } from './HomeRightPane';

interface IHomeViewProps extends IContainableProps {}

interface IHomeViewState extends IAbstractViewState {}

export class HomeView extends AbstractView<IHomeViewProps, IHomeViewState> {
  public constructor(props: IHomeViewProps) {
    super(props, 'home');
  }

  public override renderContent() {
    return (
      <Content padding={false} itemAlignment='center' layout='horizontal'>
        <HomeLeftPane key='home-left-pane' fill />
        <HomeCenterPane key='home-center-pane' fill />
        <HomeRightPane key='home-right-pane' fill />
      </Content>
    );
  }
}
