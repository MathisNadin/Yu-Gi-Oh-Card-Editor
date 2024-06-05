import { classNames } from 'mn-tools';
import { IContainableProps, IContainableState, Containable } from '../containable';
import { TForegroundColor } from '../themeSettings';

interface IButtonOutlineProps extends IContainableProps {
  label: string;
  color?: TForegroundColor;
  block?: boolean;
}

interface IButtonOutlineState extends IContainableState {}

export class ButtonOutline extends Containable<IButtonOutlineProps, IButtonOutlineState> {
  public static get defaultProps(): Partial<IButtonOutlineProps> {
    return {
      ...super.defaultProps,
      color: 'primary',
      block: false,
      disabled: false,
    };
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-button-outline'] = true;
    if (this.props.block) classes['mn-button-block'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public render() {
    return (
      <div
        id={this.props.nodeId}
        title={this.props.hint}
        className={classNames(this.renderClasses())}
        onClick={
          !this.props.onTap
            ? undefined
            : (e) => {
                app.$errorManager.handlePromise(this.props.onTap!(e));
              }
        }
      >
        {!!this.props.label && <span className='label'>{this.props.label}</span>}
      </div>
    );
  }
}
