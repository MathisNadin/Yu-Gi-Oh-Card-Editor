import { isEmpty } from 'mn-tools';
import { TForegroundColor } from '../../system';
import { IContainableProps, Containable, IContainableState, TDidUpdateSnapshot } from '../containable';

interface IProgressProps extends IContainableProps {
  progress?: number;
  total?: number;
  message?: string;
  showPercent?: boolean;
  color?: TForegroundColor;
  thickness?: 'xs' | 's' | 'm' | 'l' | 'xl';
  indeterminate?: boolean;
}

interface IProgressState extends IContainableState {
  progress: number;
  message: string;
}

export class Progress extends Containable<IProgressProps, IProgressState> {
  public static override get defaultProps(): IProgressProps {
    return {
      ...super.defaultProps,
      total: 100,
      progress: 0,
      showPercent: false,
      message: '',
      color: 'primary',
      thickness: 's',
      indeterminate: false,
    };
  }

  public constructor(props: IProgressProps) {
    super(props);
    this.state = { ...this.state, progress: 0, message: props.message! };
    setTimeout(() => {
      this.state = { ...this.state, progress: props.progress! };
    }, 200);
  }

  public override componentDidUpdate(
    prevProps: Readonly<IProgressProps>,
    prevState: Readonly<IProgressState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.progress !== this.state.progress || this.props.message !== this.state.message) {
      this.setState({
        progress: this.props.progress!,
        message: this.props.message!,
      });
    }
  }

  private get percents() {
    return Math.round((100 * this.state.progress) / (this.props.total || 1));
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-progress'] = true;
    classes['indeterminate'] = !!this.props.indeterminate;
    if (this.props.thickness) classes[`mn-thickness-${this.props.thickness}`] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    if (this.percents > 100) classes['overload'] = true;
    return classes;
  }

  public override get children() {
    const percents = this.percents;
    return [
      <div key='progress' className='progress'>
        <span className='bar' style={{ width: `${this.props.indeterminate ? 20 : percents}%` }}></span>
      </div>,

      !isEmpty(this.state.message) && (
        <div key='message' className='message'>
          {this.state.message}
          {this.props.showPercent && <span className='percent'>{percents}</span>}
        </div>
      ),
    ];
  }
}
