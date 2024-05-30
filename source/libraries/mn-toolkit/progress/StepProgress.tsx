import { classNames } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { TForegroundColor } from '../themeSettings';
import { HorizontalStack, VerticalStack } from 'mn-toolkit/container';

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
    this.state = { ...this.state, progress: props.defaultValue };
  }

  public componentDidUpdate() {
    if (this.props.defaultValue === this.state.progress) return;
    this.setState({ progress: this.props.defaultValue });
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-step-progress'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public render() {
    const progress = this.props.items.findIndex((x) => x.id === this.state.progress);
    return (
      <HorizontalStack id={this.props.nodeId} className={classNames(this.renderClasses())}>
        {this.props.items.map((step, iStep) => {
          return (
            <VerticalStack
              fill
              key={`mn-step-progress-${iStep}`}
              onTap={() => this.props.onChange(step.id)}
              className={classNames('step', {
                completed: iStep < progress,
                active: step.id === this.props.active,
                disabled: iStep > progress,
              })}
            >
              <div className='step-circle' data-text={iStep + 1}>
                <Icon className='pointer' iconId='toolkit-pin' />
              </div>

              <VerticalStack className='step-text'>
                <Typography color='1' variant='document' content={step.label} />
                <Typography color='2' italic variant='help' content={step.description} />
              </VerticalStack>
            </VerticalStack>
          );
        })}
      </HorizontalStack>
    );
  }
}
