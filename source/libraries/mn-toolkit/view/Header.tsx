import { IToolkitComponentProps, IToolkitComponentState, ToolkitComponent } from '../containable';
import { Container } from '../container';
import { Icon } from '../icon';
import { Progress } from '../progress';
import { IXhrProgress } from '../xhr';
import { Breadcrumb } from './Breadcrumb';
import { IHeaderCrumb, IHeaderListener } from '.';

interface IHeaderProps extends IToolkitComponentProps {
  crumbs?: IHeaderCrumb[];
  onlyShowLastCrumb?: boolean;
  title?: string;
}

interface IHeaderState extends IToolkitComponentState {}

export class Header extends ToolkitComponent<IHeaderProps, IHeaderState> implements Partial<IHeaderListener> {
  private downloadTotal?: number;
  private downloadProgress?: number;

  public static get defaultProps(): Partial<IHeaderProps> {
    return {
      crumbs: [],
      title: undefined,
    };
  }

  public constructor(props: IHeaderProps) {
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

  public override render() {
    const crumbs = this.props.crumbs ? [...this.props.crumbs] : [];
    if (this.props.title) crumbs.push({ title: this.props.title });
    return (
      <Container className='mn-header' fill={false} gutter>
        <div className='mn-header-content'>
          <div className='title-bar'>
            {app.$header.parts.left.map((part) => part.component)}

            <div className='center-part'>
              <Breadcrumb crumbs={crumbs} onlyShowLastCrumb={this.props.onlyShowLastCrumb} />
              {app.$header.parts.center.map((part) => part.component)}
            </div>

            {app.$header.parts.right.map((part) => part.component)}

            {this.hasPageActions() && <Icon icon='toolkit-menu-kebab' onTap={(e) => this.doShowPageActions(e)} />}
          </div>

          {!!this.downloadTotal && <Progress total={this.downloadTotal} progress={this.downloadProgress} />}

          {this.children}
        </div>
      </Container>
    );
  }
}
