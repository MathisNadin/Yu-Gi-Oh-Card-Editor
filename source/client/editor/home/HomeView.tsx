import { HomeCenterPane } from 'client/editor/homeCenterPane';
import { HomeLeftPane } from 'client/editor/homeLeftPane';
import { HomeRightPane } from 'client/editor/homeRightPane';
import { IContainableProps, IAbstractViewComponentState, AbstractViewComponent, View, Content } from 'libraries/mn-toolkit';

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
          <HomeLeftPane />
          <HomeCenterPane />
          <HomeRightPane />
        </Content>
      </View>
    );
  }
}
