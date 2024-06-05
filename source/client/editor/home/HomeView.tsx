import { IContainableProps, IAbstractViewComponentState, AbstractViewComponent, View, Content } from 'mn-toolkit';
import { HomeCenterPane } from './HomeCenterPane';
import { HomeLeftPane } from './HomeLeftPane';
import { HomeRightPane } from './HomeRightPane';

interface IHomeViewProps extends IContainableProps {}

interface IHomeViewState extends IAbstractViewComponentState {}

export class HomeView extends AbstractViewComponent<IHomeViewProps, IHomeViewState> {
  public constructor(props: IHomeViewProps) {
    super(props);
  }

  public render() {
    return (
      <View className='home'>
        <Content padding={false} itemAlignment='center' layout='horizontal'>
          <HomeLeftPane key='home-left-pane' fill />
          <HomeCenterPane key='home-center-pane' fill />
          <HomeRightPane key='home-right-pane' fill />
        </Content>
      </View>
    );
  }
}
