import { IContainerProps, IContainerState, Container } from './Container';

export interface IMasonryProps extends IContainerProps<HTMLDivElement, 'masonry'> {}

export interface IMasonryState extends IContainerState {}

export class Masonry<
  P extends IMasonryProps = IMasonryProps,
  S extends IMasonryState = IMasonryState,
> extends Container<P, S> {
  public static override get defaultProps(): IMasonryProps {
    return {
      ...super.defaultProps,
      layout: 'masonry',
      gutter: true,
      masonryTemplateColumns: 'auto',
      masonryTemplateRows: 'auto',
      masonryTemplateAreas: 'none',
      gridColumns: undefined,
      gridRows: undefined,
    };
  }
}
