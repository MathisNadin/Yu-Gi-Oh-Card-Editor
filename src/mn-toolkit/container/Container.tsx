/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/sort-comp */
/* eslint-disable react/static-property-placement */
/* eslint-disable no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable no-useless-constructor */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Component, MouseEvent, PropsWithChildren, ReactElement, cloneElement } from 'react';
import './styles.css';
import { classNames } from 'mn-toolkit/tools';
import { handlePromise } from 'mn-toolkit/error-manager/ErrorManager';

export interface IContainerProps extends PropsWithChildren {
  className: string;
  layout?: 'vertical' | 'horizontal';
  onClick?: (e: MouseEvent) => void | Promise<void>;
}

export interface IContainerState {
  loaded: boolean;
}

export class Container extends Component<IContainerProps, IContainerState> {

  public constructor(props: IContainerProps) {
    super(props);
  }

  public static defaultProps: Partial<IContainerProps> = {
    className: '',
  }

  private onClick(e: MouseEvent) {
    if (this.props.onClick) {
      e.preventDefault();
      handlePromise(this.props.onClick(e));
    }
  }

  public renderClasses(mainClassName: string) {
    return classNames(
      'mn-container',
      mainClassName,
      this.props.className,
      this.props.layout ? `${this.props.layout}-stack` : 'horizontal-stack',
    );
  }

  public renderAttributes(fc: ReactElement, mainClassName: string) {
    const newProps = {
      ...fc.props,
      className: this.renderClasses(mainClassName),
      onClick: (e: MouseEvent) => this.onClick(e),
    };
    return cloneElement(fc, newProps, fc.props.children);
  }

  public render() {
    return this.renderAttributes(<div>
      {this.props.children}
    </div>, 'plain-container');
  }
};
