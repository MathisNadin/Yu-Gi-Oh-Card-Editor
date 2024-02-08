import { Component } from 'react';

interface IHeaderSeparatorProps {}

interface IHeaderSeparatorState {}

export class HeaderSeparator extends Component<IHeaderSeparatorProps, IHeaderSeparatorState> {
  public static get defaultProps(): Partial<IHeaderSeparatorProps> {
    return {
      $name: 'HeaderSeparator',
    };
  }

  public constructor(props: IHeaderSeparatorProps) {
    super(props);
  }

  public render() {
    return <div className='mn-header-separator'></div>;
  }
}
