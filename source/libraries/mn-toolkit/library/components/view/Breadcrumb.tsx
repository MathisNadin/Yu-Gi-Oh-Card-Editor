import { IState, TJSXElementChildren } from '../../system';
import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { IHeaderCrumb } from '.';

interface IBreadcrumbProps extends IContainerProps {
  crumbs: IHeaderCrumb[];
  onlyShowLastCrumb?: boolean;
}

interface IBreadcrumbState extends IContainerState {
  state: IState;
}

export class Breadcrumb extends Container<IBreadcrumbProps, IBreadcrumbState> {
  public static override get defaultProps(): IBreadcrumbProps {
    return {
      ...super.defaultProps,
      verticalItemAlignment: 'middle',
      crumbs: [],
      onlyShowLastCrumb: false,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-breadcrumb'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const crumbs = this.props.crumbs.map((x) => ({ ...x }));
    app.$header.alterBreadCrumb(crumbs);

    if (this.props.onlyShowLastCrumb || app.$device.isSmallScreen) {
      return [
        crumbs.length > 1 && (
          <Icon
            key='back'
            icon='toolkit-angle-left'
            onTap={!crumbs[crumbs.length - 2]?.onTap ? undefined : () => crumbs[crumbs.length - 2].onTap!()}
          />
        ),
        <Typography
          key='bread'
          className='bread'
          variant='document'
          contentType='markdown'
          content={crumbs[crumbs.length - 1]?.title}
        />,
      ];
    }

    return [
      crumbs.map((crumb, i) => {
        if (!!crumb.onTap) {
          return [
            <Typography
              key={`${i}-crumb-clickable-${crumb.title}`}
              className='crumb'
              variant='document'
              contentType='markdown'
              content={crumb.title}
              onTap={() => app.$errorManager.handlePromise(crumb.onTap!())}
            />,
            i < crumbs.length - 1 && <Icon key='separator' className='separator' icon='toolkit-angle-right' />,
          ];
        }
        return (
          <Typography
            key={`${i}-crumb-${crumb.title}`}
            className='bread'
            variant='document'
            contentType='markdown'
            content={crumb.title}
          />
        );
      }),

      this.props.children,
    ];
  }
}
