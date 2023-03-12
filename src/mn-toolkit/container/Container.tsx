/* eslint-disable no-useless-constructor */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Component, MouseEvent, PropsWithChildren } from 'react';

interface IContainerProps extends PropsWithChildren {
  className: string;
  onClick: (e: MouseEvent) => void;
}

interface IContainerState {
  loaded: boolean;
}

export class Container extends Component<IContainerProps, IContainerState> {

  public constructor(props: IContainerProps) {
    super(props);
  }

  private onClick(e: MouseEvent) {
    if (this.props.onClick) {
      e.preventDefault();
      this.props.onClick(e);
    }
  }

  public render() {
    return <div className={this.props.className} onClick={e => this.onClick(e)} >
      {this.props.children}
    </div>;
  }
};
