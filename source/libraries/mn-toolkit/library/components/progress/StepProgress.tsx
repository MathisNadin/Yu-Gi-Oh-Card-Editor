import { classNames } from 'mn-tools';
import { TForegroundColor } from '../../system';
import { Container, IContainerProps, IContainerState, VerticalStack } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';

interface IStep<ID> {
  id: ID;
  label: string;
  description: string;
}

interface IStepProgressProps<ID> extends IContainerProps {
  color?: TForegroundColor;
  items: IStep<ID>[];
  progress: ID;
  currentStep: ID;
  onChange: (currentStep: ID) => void | Promise<void>;
}

interface IStepProgressState extends IContainerState {}

export class StepProgress<ID = string> extends Container<IStepProgressProps<ID>, IStepProgressState> {
  public static override get defaultProps(): Omit<
    IStepProgressProps<string>,
    'items' | 'progress' | 'currentStep' | 'onChange'
  > {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-step-progress'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override get children() {
    const progressIndex = this.props.items.findIndex((x) => x.id === this.props.progress);
    return this.props.items.map((step, iStep) => {
      return (
        <VerticalStack
          fill
          key={`mn-step-progress-${iStep}`}
          onTap={() => this.props.onChange(step.id)}
          className={classNames('step', {
            completed: iStep < progressIndex,
            active: step.id === this.props.currentStep,
            disabled: iStep > progressIndex,
          })}
        >
          <div className='step-circle' data-text={iStep + 1}>
            <Icon className='pointer' icon='toolkit-pin' />
          </div>

          <VerticalStack className='step-text' margin='small'>
            <Typography color='1' variant='document' content={step.label} />
            <Typography color='2' italic variant='help' content={step.description} />
          </VerticalStack>
        </VerticalStack>
      );
    });
  }
}
