import { IContainableProps, Containable, IContainableState } from '../containable';
import { TForegroundColor } from '../themeSettings';
import { classNames, isEmpty } from 'libraries/mn-tools';

interface IProgressProps extends IContainableProps {
  /** Set the value of the progress. */
  progress?: number;
  /** Set the total of the progress. */
  total?: number;
  /** Message in front of the progress. */
  message?: string;
  /** Set the visibility of the percent. */
  showPercent?: boolean;
  color?: TForegroundColor;
  /** Set the thickness of the progress. */
  thickness?: 'xs' | 's' | 'm' | 'l' | 'xl';
}

interface IProgressState extends IContainableState {
  progress: number;
  message: string;
}

export class Progress extends Containable<IProgressProps, IProgressState> {
  public static get defaultProps(): Partial<IProgressProps> {
    return {
      ...super.defaultProps,
      total: 100,
      progress: 0,
      showPercent: false,
      message: '',
      color: 'primary',
      thickness: 's',
    };
  }
  public constructor(props: IProgressProps) {
    super(props);
    this.setState({
      progress: 0,
      message: props.message as string,
    });
    setTimeout(() => {
      this.setState({
        progress: props.progress as number,
      });
    }, 200);
  }

  public componentWillReceiveProps(nextProps: IProgressProps) {
    this.setState({
      progress: nextProps.progress as number,
      message: nextProps.message as string,
    });
  }

  private getPercents() {
    return Math.round((100 * this.state.progress) / (this.props.total as number));
  }

  public render() {
    let percent = (100 * this.state.progress) / (this.props.total as number);
    let overload = percent > 100;
    return (
      <div
        id={this.props.nodeId}
        title={this.props.hint}
        className={classNames(
          this.renderClasses('mn-progress'),
          { overload },
          `mn-thickness-${this.props.thickness}`,
          `mn-color-${this.props.color}`
        )}
      >
        <div className='progress'>
          <span className='bar' style={{ width: `${percent}%` }}></span>
        </div>
        {!isEmpty(this.state.message) && (
          <div className='message rich-text'>
            {this.state.message}
            {this.props.showPercent ? <span className='percent'>{this.getPercents()}</span> : null}
          </div>
        )}
      </div>
    );
  }
}
