import { TJSXElementChild } from '../../system';
import { IContainerProps, IContainerState, Container } from '../container';

export interface IAbstractViewProps extends IContainerProps {}

export interface IAbstractViewState extends IContainerState {
  loaded: boolean;
}

export abstract class AbstractView<
  P extends IAbstractViewProps = IAbstractViewProps,
  S extends IAbstractViewState = IAbstractViewState,
> extends Container<P, S> {
  protected viewName: string;

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
      this.state = { ...(state as S), loaded: false };
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
