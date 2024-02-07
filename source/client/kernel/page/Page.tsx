import { Spinner, RouterViewPort } from "libraries/mn-toolkit";
import { Component } from "react";

interface IPageProps { }

interface IPageState { }

export class Page extends Component<IPageProps, IPageState> {

  public constructor(props: IPageProps) {
    super(props);

    app.$router.addListener({
      routerStateChanged: () => this.forceUpdate(),
    });
  }

  public render() {
    if (!app.$router.ready) return <Spinner />;
    return <RouterViewPort />;
  }
}
