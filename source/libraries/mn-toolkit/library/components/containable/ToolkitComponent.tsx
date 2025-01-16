import { Component, createRef, PropsWithChildren, RefObject } from 'react';
import { TJSXElementChild, TJSXElementChildren } from '../../system';

type TDidUpdateSnapshotType = string | number | boolean | object | null | undefined;
export type TDidUpdateSnapshot = TDidUpdateSnapshotType | TDidUpdateSnapshotType[];

export interface IToolkitComponentProps extends PropsWithChildren {}

export interface IToolkitComponentState {}

export class ToolkitComponent<
  PROPS extends IToolkitComponentProps,
  STATE extends IToolkitComponentState,
  BASE_ELEMENT extends HTMLElement = HTMLDivElement,
> extends Component<PROPS, STATE> {
  public base = createRef<BASE_ELEMENT>();

  public static get defaultProps(): IToolkitComponentProps {
    return {};
  }

  public constructor(props: PROPS) {
    super(props);
    this.state = {} as STATE;
  }

  public async forceUpdateAsync() {
    return await new Promise<void>((resolve) => this.forceUpdate(resolve));
  }

  public async setStateAsync<K extends keyof STATE>(
    state:
      | ((prevState: Readonly<STATE>, props: Readonly<PROPS>) => Pick<STATE, K> | STATE | null)
      | (Pick<STATE, K> | STATE | null)
  ) {
    return await new Promise<void>((resolve) => this.setState(state, resolve));
  }

  public override componentDidMount() {
    if (super.componentDidMount) super.componentDidMount();
  }

  public override componentDidUpdate(
    prevProps: Readonly<PROPS>,
    prevState: Readonly<STATE>,
    snapshot?: TDidUpdateSnapshot
  ) {
    if (super.componentDidUpdate) super.componentDidUpdate(prevProps, prevState, snapshot);
  }

  public override componentWillUnmount() {
    if (super.componentWillUnmount) super.componentWillUnmount();
  }

  public override render(): TJSXElementChild {
    return <div ref={this.base as unknown as RefObject<HTMLDivElement>}>{this.children}</div>;
  }

  public get children(): TJSXElementChildren {
    return this.props.children;
  }
}
