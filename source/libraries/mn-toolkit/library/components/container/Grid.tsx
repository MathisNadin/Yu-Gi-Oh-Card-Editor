import { IContainerProps, IContainerState, Container } from './Container';

export interface IGridProps extends IContainerProps<HTMLDivElement, 'grid'> {}

export interface IGridState extends IContainerState {}

export class Grid<P extends IGridProps = IGridProps, S extends IGridState = IGridState> extends Container<P, S> {
  public static override get defaultProps(): IGridProps {
    return {
      ...super.defaultProps,
      layout: 'grid',
      gutter: true,
      gridColumns: 12,
      gridRows: 1,
    };
  }
}
