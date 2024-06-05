import { Component, PropsWithChildren } from 'react';
import { markdownToHtml } from 'mn-tools';
import { IHeaderCrumb } from '.';
import { ButtonIcon } from '../button';
import { IState } from '../router';
import { Icon } from '../icon';

interface IBreadcrumbProps extends PropsWithChildren {
  crumbs: IHeaderCrumb[];
}

interface IBreadcrumbState {
  state: IState;
}

export class Breadcrumb extends Component<IBreadcrumbProps, IBreadcrumbState> {
  public static get defaultProps(): Partial<IBreadcrumbProps> {
    return {
      crumbs: [],
    };
  }

  public constructor(props: IBreadcrumbProps) {
    super(props);
  }

  public render() {
    const crumbs = this.props.crumbs.map((x) => ({ ...x }));
    app.$header.alterBreadCrumb(crumbs);
    if (app.$device.isSmallScreen) {
      return (
        <div className='mn-breadcrumb'>
          <ButtonIcon icon='toolkit-angle-left' />
          <span
            className='bread'
            dangerouslySetInnerHTML={{ __html: markdownToHtml(crumbs[crumbs.length - 1]?.title, true) }}
          />
        </div>
      );
    }

    return (
      <div className='mn-breadcrumb'>
        {crumbs.map((crumb, i) => {
          if (!!crumb.onTap) {
            return [
              <span
                key={`mn-breadcrumb-${i}`}
                onClick={() => {
                  if (crumb.onTap) app.$errorManager.handlePromise(crumb.onTap());
                }}
                className='crumb'
                dangerouslySetInnerHTML={{ __html: markdownToHtml(crumb.title, true) }}
              />,
              i < crumbs.length - 1 && (
                <Icon key={`mn-breadcrumb-separator-${i}`} className='separator' iconId='toolkit-angle-right' />
              ),
            ];
          } else {
            return (
              <span
                key={`mn-breadcrumb-${i}`}
                className='bread'
                dangerouslySetInnerHTML={{ __html: markdownToHtml(crumb.title, true) }}
              />
            );
          }
        })}
        {this.props.children}
      </div>
    );
  }
}
