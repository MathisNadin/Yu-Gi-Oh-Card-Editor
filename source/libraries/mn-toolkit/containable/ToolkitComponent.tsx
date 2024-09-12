import { Component, PropsWithChildren } from 'react';
import { JSXElementChild, JSXElementChildren } from '../react';

type TDidUpdateSnapshotType = string | number | boolean | object | null | undefined;
export type TDidUpdateSnapshot = TDidUpdateSnapshotType | TDidUpdateSnapshotType[];

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

  public async setStateAsync<K extends keyof STATE>(newState: Pick<STATE, K> | STATE | null) {
    return new Promise<void>((resolve) => this.setState(newState, resolve));
  }

  public override componentDidMount() {}

  public override componentDidUpdate(
    _prevProps: Readonly<PROPS>,
    _prevState: Readonly<STATE>,
    _snapshot?: TDidUpdateSnapshot
  ) {}

  public override componentWillUnmount() {}

  public render(): JSXElementChild {
    return <div>{this.children}</div>;
  }

  public get children(): JSXElementChildren {
    return this.props.children;
  }
}
