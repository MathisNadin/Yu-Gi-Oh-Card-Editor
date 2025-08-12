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
  public static override get defaultProps(): Omit<IBreadcrumbProps, 'crumbs'> {
    return {
      ...super.defaultProps,
      verticalItemAlignment: 'middle',
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
    app.$header.dispatch('breadcrumbAlter', crumbs);

    if (this.props.onlyShowLastCrumb || app.$device.isSmallScreen) {
      return [
        crumbs.length > 1 && (
          <Icon
            key='back'
            icon='toolkit-angle-left'
            name='Revenir en arrière'
            onTap={
              crumbs[crumbs.length - 2]?.href?.state
                ? () => app.$router.go(crumbs[crumbs.length - 2]!.href!.state, crumbs[crumbs.length - 2]!.href!.params)
                : undefined
            }
          />
        ),
        <Typography
          key='bread'
          className='bread'
          bold
          variant='document'
          contentType='markdown'
          content={crumbs[crumbs.length - 1]?.title}
        />,
      ];
    }

    return [
      crumbs.map((crumb, i) => {
        if (!!crumb.href) {
          return [
            <Typography
              key={i}
              className='crumb'
              variant='document'
              contentType='markdown'
              content={crumb.title}
              href={crumb.href}
            />,
            i < crumbs.length - 1 && (
              <Icon key='separator' className='separator' icon='toolkit-angle-right' marginX='tiny' />
            ),
          ];
        }
        return (
          <Typography key={i} className='bread' bold variant='document' contentType='markdown' content={crumb.title} />
        );
      }),

      this.props.children,
    ];
  }
}
