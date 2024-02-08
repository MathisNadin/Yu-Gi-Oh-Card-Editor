import { classNames } from 'libraries/mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { TForegroundColor } from '../themeSettings';

interface IStep<ID> {
  id: ID;
  label: string;
  description: string;
}

interface IProps<ID> extends IContainableProps {
  items: IStep<ID>[];
  defaultValue: ID;
  active: ID;
  color?: TForegroundColor;
  onChange: (value: ID) => void;
}

interface IState<ID> extends IContainableState {
  progress: ID;
}

export class StepProgress<ID = string> extends Containable<IProps<ID>, IState<ID>> {
  public static get defaultProps(): Partial<IProps<string>> {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: IProps<ID>) {
    super(props);
    this.setState({ progress: props.defaultValue });
  }

  public componentDidUpdate() {
    if (this.props.defaultValue !== this.state.progress) this.setState({ progress: this.props.defaultValue });
  }

  public render() {
    let progress = this.props.items.findIndex((x) => x.id === this.state.progress);
    return (
      <div
        id={this.props.nodeId}
        title={this.props.hint}
        className={classNames(
          this.renderClasses('mn-step-progress'),
          `mn-color-${this.props.color}`,
          this.props.className
        )}
      >
        {(this.props.items as IStep<number>[]).map((step, iStep) => {
          return (
            // eslint-disable-next-line react/jsx-key
            <div
              onClick={() => (this.props as unknown as IProps<number>).onChange(step.id)}
              className={classNames('step', {
                completed: iStep < progress,
                active: step.id === this.props.active,
                disabled: iStep > progress,
              })}
            >
              <div className='step-circle' data-text={iStep + 1}>
                <Icon className='pointer' iconId='toolkit-pin' />
              </div>
              <div className='step-text'>
                <Typography variant='label' content={step.label} />
                <Typography variant='caption' content={step.description} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
