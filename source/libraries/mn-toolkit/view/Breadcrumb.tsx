import { IToolkitComponentProps, IToolkitComponentState, ToolkitComponent } from '../containable';
import { IState } from '../router';
import { HorizontalStack } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { IHeaderCrumb } from '.';

interface IBreadcrumbProps extends IToolkitComponentProps {
  crumbs: IHeaderCrumb[];
  onlyShowLastCrumb?: boolean;
}

interface IBreadcrumbState extends IToolkitComponentState {
  state: IState;
}

export class Breadcrumb extends ToolkitComponent<IBreadcrumbProps, IBreadcrumbState> {
  public static get defaultProps(): Partial<IBreadcrumbProps> {
    return {
      crumbs: [],
      onlyShowLastCrumb: false,
    };
  }

  public override render() {
    const crumbs = this.props.crumbs.map((x) => ({ ...x }));
    app.$header.alterBreadCrumb(crumbs);

    if (this.props.onlyShowLastCrumb || app.$device.isSmallScreen) {
      return (
        <HorizontalStack key='breadcrumbs' className='mn-breadcrumb' verticalItemAlignment='middle'>
          {crumbs.length > 1 && (
            <Icon
              key='back'
              icon='toolkit-angle-left'
              onTap={!crumbs[crumbs.length - 2]?.onTap ? undefined : () => crumbs[crumbs.length - 2].onTap!()}
            />
          )}
          <Typography
            key='bread'
            className='bread'
            variant='document'
            contentType='markdown'
            content={crumbs[crumbs.length - 1]?.title}
          />
        </HorizontalStack>
      );
    }

    return (
      <HorizontalStack className='mn-breadcrumb' verticalItemAlignment='middle'>
        {crumbs.map((crumb, i) => {
          if (!!crumb.onTap) {
            return [
              <Typography
                key={`${i}-crumb-clickable-${crumb.title}`}
                className='crumb'
                variant='document'
                contentType='markdown'
                content={crumb.title}
                onTap={!crumb.onTap ? undefined : () => app.$errorManager.handlePromise(crumb.onTap!())}
              />,
              i < crumbs.length - 1 && <Icon key='separator' className='separator' icon='toolkit-angle-right' />,
            ];
          } else {
            return (
              <Typography
                key={`${i}-crumb-${crumb.title}`}
                className='bread'
                variant='document'
                contentType='markdown'
                content={crumb.title}
              />
            );
          }
        })}

        {this.children}
      </HorizontalStack>
    );
  }
}
