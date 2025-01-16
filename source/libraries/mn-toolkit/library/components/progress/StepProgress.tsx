import { classNames } from 'mn-tools';
import { TForegroundColor } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
import { Container, IContainerProps, IContainerState, VerticalStack } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';

interface IStep<ID> {
  id: ID;
  label: string;
  description: string;
}

interface IStepProgressProps<ID> extends IContainerProps {
  items: IStep<ID>[];
  defaultValue: ID;
  active: ID;
  color?: TForegroundColor;
  onChange?: (value: ID) => void | Promise<void>;
}

interface IStepProgressState<ID> extends IContainerState {
  progress: ID;
}

export class StepProgress<ID = string> extends Container<IStepProgressProps<ID>, IStepProgressState<ID>> {
  public static override get defaultProps(): IStepProgressProps<string> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      active: undefined!,
      items: [],
      defaultValue: undefined!,
    };
  }

  public constructor(props: IStepProgressProps<ID>) {
    super(props);
    this.state = { ...this.state, progress: props.defaultValue };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IStepProgressProps<ID>>,
    prevState: Readonly<IStepProgressState<ID>>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue === this.state.progress) return;
    this.setState({ progress: this.props.defaultValue });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-step-progress'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override get children() {
    const progress = this.props.items.findIndex((x) => x.id === this.state.progress);
    return this.props.items.map((step, iStep) => {
      return (
        <VerticalStack
          fill
          key={`mn-step-progress-${iStep}`}
          onTap={!this.props.onChange ? undefined : () => this.props.onChange!(step.id)}
          className={classNames('step', {
            completed: iStep < progress,
            active: step.id === this.props.active,
            disabled: iStep > progress,
          })}
        >
          <div className='step-circle' data-text={iStep + 1}>
            <Icon className='pointer' icon='toolkit-pin' />
          </div>

          <VerticalStack className='step-text'>
            <Typography color='1' variant='document' content={step.label} />
            <Typography color='2' italic variant='help' content={step.description} />
          </VerticalStack>
        </VerticalStack>
      );
    });
  }
}
