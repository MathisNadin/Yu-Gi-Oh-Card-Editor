import { Menu } from "electron";
import { IHeaderComponent, VerticalStack, Icon, Spinner, RouterViewPort, HorizontalStack } from "libraries/mn-toolkit";
import { Component } from "react";

interface IPageProps { }

interface IPageState { }

export class Page extends Component<IPageProps, IPageState> {

  public constructor(props: IPageProps) {
    super(props);

    app.$router.addListener({
      routerStateChanged: () => this.forceUpdate(),
    });

    app.$core.addListener({
      screenModeUpdated: () => this.forceUpdate(),
    });
  }


  public render() {
    if (!app.$router.ready) return <Spinner />;
    return <RouterViewPort />;
  }
}
