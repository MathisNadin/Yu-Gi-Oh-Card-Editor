import { isDefined, isEmpty } from 'mn-tools';
import { TForegroundColor } from '../../system';
import { IContainableProps, Containable, IContainableState } from '../containable';

interface IProgressProps extends IContainableProps {
  progress: number;
  total: number;
  message?: string;
  showPercent?: boolean;
  color?: TForegroundColor;
  thickness?: 'xs' | 's' | 'm' | 'l' | 'xl';
  indeterminate?: boolean;
}

interface IProgressState extends IContainableState {
  tempProgress?: number;
}

export class Progress extends Containable<IProgressProps, IProgressState> {
  public static override get defaultProps(): Omit<IProgressProps, 'progress' | 'total'> {
    return {
      ...super.defaultProps,
      showPercent: false,
      message: '',
      color: 'primary',
      thickness: 's',
      indeterminate: false,
    };
  }

  public constructor(props: IProgressProps) {
    super(props);
    this.state = { ...this.state, tempProgress: 0 };
  }

  public override componentDidMount() {
    super.componentDidMount();
    setTimeout(() => this?.setState({ tempProgress: undefined }), 200);
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

  private get percents() {
    const progress = isDefined(this.state.tempProgress) ? this.state.tempProgress : this.props.progress;
    return Math.round((100 * progress) / (this.props.total || 1));
  }

  public override get children() {
    const percents = this.percents;
    return [
      <div key='progress' className='progress'>
        <span className='bar' style={{ width: `${this.props.indeterminate ? 20 : percents}%` }}></span>
      </div>,

      !isEmpty(this.props.message) && (
        <div key='message' className='message'>
          {this.props.message}
          {this.props.showPercent && <span className='percent'>{percents}</span>}
        </div>
      ),
    ];
  }
}
