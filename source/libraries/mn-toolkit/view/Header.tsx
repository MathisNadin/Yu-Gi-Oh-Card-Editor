import { Component, PropsWithChildren } from "react";
import { IHeaderCrumb, IHeaderListener } from ".";
import { ButtonIcon } from "../button";
import { Container } from "../container";
import { Progress } from "../progress";
import { clone } from "libraries/mn-tools";
import { Breadcrumb } from "./Breadcrumb";
import { IXhrProgress } from "../xhr";

interface IHeaderProps extends PropsWithChildren {
  crumbs?: IHeaderCrumb[];
  title?: string;
}

interface IHeaderState { }

export class Header extends Component<IHeaderProps, IHeaderState> implements Partial<IHeaderListener> {
  private downloadTotal!: number;
  private downloadProgress!: number;

  public static get defaultProps(): Partial<IHeaderProps> {
    return {
      crumbs: [],
      title: undefined,
    };
  }

  public constructor(props: IHeaderProps) {
    super(props);
  }

  public componentDidMount() {
    app.$xhr.addListener(this);
    app.$header.addListener(this);
    app.$header.update();
  }

  public componentWillUnmount() {
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
    app.$popover.show({
      event,
      width: 320,
      actions: app.$header.pageActions
    });
  }

  public render() {
    const crumbs = this.props.crumbs ? clone(this.props.crumbs) : [];
    if (this.props.title) crumbs.push({ title: this.props.title });
    return <Container mainClassName='mn-header' fill={false} padding gutter>
      <div className='mn-header-content'>
        <div className='title-bar'>
          {app.$header.parts['left'].map(part => part.component)}

          <div className="center-part">
            <Breadcrumb crumbs={crumbs} />
            {app.$header.parts['center'].map(part => part.component)}
          </div>

          {app.$header.parts['right'].map(part => part.component)}

          {this.hasPageActions() && <ButtonIcon
            icon="toolkit-menu-kebab"
            onTap={e => this.doShowPageActions(e)}
          />}
        </div>

        {!!this.downloadTotal && <Progress
          total={this.downloadTotal}
          progress={this.downloadProgress}
        />}

        {this.props.children}
      </div>
    </Container>;
  }
}
