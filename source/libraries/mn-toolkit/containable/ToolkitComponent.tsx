import { Component, PropsWithChildren } from 'react';
import { JSXElementChild, JSXElementChildren } from '../react';

export interface IToolkitComponentProps extends PropsWithChildren {}

export interface IToolkitComponentState {}

export class ToolkitComponent<
  PROPS extends IToolkitComponentProps,
  STATE extends IToolkitComponentState,
> extends Component<PROPS, STATE> {
  public constructor(props: PROPS) {
    super(props);
    this.state = {} as STATE;
  }

  public async forceUpdateAsync() {
    return new Promise<void>((resolve) => this.forceUpdate(resolve));
  }

  public async setStateAsync(newState: Partial<STATE>) {
    return new Promise<void>((resolve) => this.setState(newState as STATE, resolve));
  }

  public render(): JSXElementChild {
    return <div>{this.children}</div>;
  }

  public get children(): JSXElementChildren {
    return this.props.children;
  }
}
