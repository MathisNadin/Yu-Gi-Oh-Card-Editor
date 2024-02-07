import { Container, IContainerProps, IContainerState } from '../container';

interface IFooterProps extends IContainerProps {
}

interface IFooterState  extends IContainerState {
}

export class Footer extends Container<IFooterProps, IFooterState> {

  public static get defaultProps() : Partial<IFooterProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      padding: true,
      mainClassName: 'mn-footer',
      verticalItemAlignment: 'middle',
      itemAlignment: 'right',
      bg: '2'
    };
  }

  public constructor(props: IFooterProps) {
    super(props);
  }

}
