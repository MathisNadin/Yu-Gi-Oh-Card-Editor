import { Container, IContainerProps, IContainerState } from '../container';
import { ReactElement } from 'react';

interface IToolbarProps extends IContainerProps {
  tools?: ReactElement[];
  bordered: boolean;
}

interface IToolbarState extends IContainerState {}

export class Toolbar extends Container<IToolbarProps, IToolbarState> {
  public static get defaultProps(): Partial<IToolbarProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      tools: [],
    };
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-toolbar'] = true;
    classes['mn-bordered'] = this.props.bordered;
    return classes;
  }

  public render() {
    return (
      <div {...this.renderAttributes()}>
        {this.props.tools}
        {this.inside}
      </div>
    );
  }
}
