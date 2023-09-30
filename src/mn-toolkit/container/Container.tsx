import './styles.css';
import { Containable, IContainableProps, IContainableState } from 'mn-toolkit/containable/Containable';

export type TContainerLayout = 'vertical' | 'horizontal';

export interface EventTargetWithValue extends EventTarget {
  value: string;
}

export interface IContainerProps extends IContainableProps {
  layout?: TContainerLayout;
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
