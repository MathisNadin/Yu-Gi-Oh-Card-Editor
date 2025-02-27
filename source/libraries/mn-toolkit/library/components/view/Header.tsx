import { IXhrProgress } from '../../system';
import { Container, HorizontalStack, IContainerProps, IContainerState } from '../container';
import { Icon } from '../icon';
import { Progress } from '../progress';
import { Breadcrumb } from './Breadcrumb';
import { IHeaderCrumb, IHeaderListener } from '.';

export interface IHeaderProps extends IContainerProps {
  crumbs?: IHeaderCrumb[];
  onlyShowLastCrumb?: boolean;
  title?: string;
}

export interface IHeaderState extends IContainerState {}

export class Header<P extends IHeaderProps = IHeaderProps, S extends IContainerState = IContainerState>
  extends Container<P, S>
  implements Partial<IHeaderListener>
{
  private downloadTotal?: number;
  private downloadProgress?: number;

  public static override get defaultProps(): IHeaderProps {
    return {
      ...super.defaultProps,
      fill: false,
      gutter: true,
      crumbs: [],
      title: undefined,
    };
  }

  public constructor(props: P) {
    super(props);
  }

  public override componentDidMount() {
    super.componentDidMount();
    app.$xhr.addListener(this);
    app.$header.addListener(this);
    app.$header.update();
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$xhr.removeListener(this);
    app.$header.removeListener(this);
  }

  public headerUpdated() {
    this.forceUpdate();
  }

  private hasPageActions() {
    return !!app.$header.pageActions.length;
  }

  public xhrStop(_requestId: string): void {
    if (this.downloadTotal) {
      this.downloadProgress = this.downloadTotal;
      this.forceUpdate();
      setTimeout(() => {
        this.downloadTotal = 0;
        this.forceUpdate();
      });
    }
  }

  public xhrProgress(_requestId: string, transfert: IXhrProgress) {
    this.downloadProgress = transfert.progress;
    this.downloadTotal = transfert.total;
    this.forceUpdate();
  }

  public doShowPageActions(event: React.MouseEvent) {
    app.$popover.actions(event, {
      width: 320,
      actions: app.$header.pageActions,
    });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-header'] = true;
    return classes;
  }

  public override get children() {
    const crumbs = this.props.crumbs ? [...this.props.crumbs] : [];
    if (this.props.title) crumbs.push({ title: this.props.title });
    return (
      <div className='mn-header-content'>
        <div className='title-bar'>
          {app.$header.parts.left.map((part) => part.component)}

          <HorizontalStack fill className='center-part' verticalItemAlignment='middle'>
            <Breadcrumb key='breadcrumb' crumbs={crumbs} onlyShowLastCrumb={this.props.onlyShowLastCrumb} />
            {app.$header.parts.center.map((part) => part.component)}
          </HorizontalStack>

          {app.$header.parts.right.map((part) => part.component)}

          {this.hasPageActions() && <Icon icon='toolkit-menu-kebab' onTap={(e) => this.doShowPageActions(e)} />}
        </div>

        {!!this.downloadTotal && <Progress total={this.downloadTotal} progress={this.downloadProgress} />}

        {this.props.children}
      </div>
    );
  }
}
