/* eslint-disable prefer-const */
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
import './styles.css';
import { Containable, IContainableProps, IContainableState } from 'mn-toolkit/containable/Containable';

export interface IContainerProps extends IContainableProps {
  layout?: 'vertical' | 'horizontal';
  gutter?: boolean;
  margin?: boolean;
  scroll?: boolean;
  scrollX?: boolean;
}

export interface IContainerState extends IContainableState {
}

export class Container<PROPS extends IContainerProps, STATE extends IContainerState> extends Containable<PROPS, STATE> {

  public static get defaultProps(): Partial<IContainerProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  public renderClasses(name?: string) {
    let classes = super.renderClasses(name);
    classes['mn-container'] = true;
    if (this.props.layout) classes[`${this.props.layout}-stack`] = true;
    if (this.props.gutter) classes['mn-gutter'] = true;
    if (this.props.margin) classes['mn-margin'] = true;
    if (this.props.scroll) classes['mn-scroll'] = true;
    if (this.props.scrollX) classes['mn-scrollX'] = true;
    return classes;
  }
};
