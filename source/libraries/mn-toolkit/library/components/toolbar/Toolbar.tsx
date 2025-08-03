import { Container, IContainerProps, IContainerState } from '../container';
import { ReactElement } from 'react';

interface IToolbarProps extends IContainerProps {
  tools: ReactElement[];
  bordered: boolean;
}

interface IToolbarState extends IContainerState {}

export class Toolbar extends Container<IToolbarProps, IToolbarState> {
  public static override get defaultProps(): Omit<IToolbarProps, 'tools'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: 'small',
      bordered: false,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-toolbar'] = true;
    classes['mn-bordered'] = this.props.bordered;
    return classes;
  }

  public override render() {
    return (
      <div ref={this.base} {...this.renderAttributes()}>
        {this.props.tools}
        {this.inside}
      </div>
    );
  }
}
