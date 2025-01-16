import { ReactElement, ReactNode } from 'react';
import { TJSXElementChildren } from '../../system';
import { IContainerProps, IContainerState, Container } from './Container';

export interface IGridProps extends IContainerProps {}
export interface IGridState extends IContainerState {}

export class Grid extends Container<IGridProps, IGridState> {
  public static override get defaultProps(): IGridProps {
    return {
      ...super.defaultProps,
      layout: 'grid',
      gutter: true,
      wrap: true,
    };
  }

  public get children(): TJSXElementChildren {
    return (this.props.children as unknown as ReactNode[])
      .filter((x) => !!x)
      .map((x, i) => (
        <div key={`mn-grid-item-${i}`} className={this.getGridItemClasses(x as ReactElement)}>
          {x}
        </div>
      ));
  }

  private getGridItemClasses(x: ReactElement): string {
    const classes = ['mn-grid-item'];
    if (!!x.props) {
      if (!!x.props.s) classes.push(`mn-containable-item-width-s-${x.props.s}`);
      if (!!x.props.m) classes.push(`mn-containable-item-width-m-${x.props.m}`);
      if (!!x.props.l) classes.push(`mn-containable-item-width-l-${x.props.l}`);
      if (!!x.props.xl) classes.push(`mn-containable-item-width-xl-${x.props.xl}`);
      if (!!x.props.xxl) classes.push(`mn-containable-item-width-xxl-${x.props.xxl}`);
    }
    return classes.join(' ');
  }
}
