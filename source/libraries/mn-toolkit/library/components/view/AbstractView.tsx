import { THeadTag } from 'api/main';
import { TJSXElementChild, TRouterParams, TRouterState } from '../../system';
import { IContainerProps, IContainerState, Container } from '../container';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IAbstractViewRouterProps<D extends object = any> {
  initialServerData?: D;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IAbstractViewProps<D extends object = any> extends IAbstractViewRouterProps<D>, IContainerProps {}

export interface IAbstractViewState extends IContainerState {
  loaded: boolean;
}

export abstract class AbstractView<P extends IAbstractViewProps, S extends IAbstractViewState> extends Container<P, S> {
  protected viewName: string;

  public static async getInitialServerData?(params: TRouterParams<TRouterState>): Promise<Partial<object | undefined>>;
  public static getMetaTags?(params: TRouterParams<TRouterState>): THeadTag[];

  protected onViewEnter?(): Promise<void>;
  protected onViewLeave?(): Promise<void>;

  protected renderHeader?(): TJSXElementChild;
  protected abstract renderContent(): TJSXElementChild;
  protected renderFooter?(): TJSXElementChild;

  public static override get defaultProps(): IAbstractViewProps {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
    };
  }

  protected get isLoaded() {
    return this.state.loaded;
  }

  public constructor(props: P, viewName: string, state?: Partial<S>) {
    super(props);

    this.viewName = viewName;

    if (state) {
      this.state = { ...(state as S), loaded: state.loaded || false };
    } else {
      this.state = { ...this.state, loaded: false };
    }
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (this.onViewEnter) {
      this.onViewEnter()
        .then(() => {
          this.setState({ loaded: true });
        })
        .catch((e: Error) => app.$errorManager.trigger(e));
    }
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    if (this.onViewLeave) app.$errorManager.handlePromise(this.onViewLeave());
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-view'] = true;
    if (this.viewName) classes[`${this.viewName}-view`] = true;
    return classes;
  }

  public override get inside() {
    return (
      <div className='mn-container-inside'>
        {!!this.renderHeader && this.renderHeader()}
        {this.renderContent()}
        {!!this.renderFooter && this.renderFooter()}
      </div>
    );
  }
}
