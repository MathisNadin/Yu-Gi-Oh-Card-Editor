import './styles.css';
import { classNames } from 'libraries/mn-tools';
import { Containable, IContainableProps, IContainableState } from "libraries/mn-toolkit/containable/Containable";

interface ISpinnerProps extends IContainableProps {
  /** Message in front of the spinner. */
  message?: string;
  /** Set the full screen. */
  fullscreen?: boolean;
  /** Set the overlay. */
  overlay?: boolean;
}

interface ISpinnerState extends IContainableState {
}

/** Create a spinner.
 *
 * Constructor need ISpinnerProps.
 * - ?message
 * - ?fullscreen
 * - ?overlay
 */
export class Spinner extends Containable<ISpinnerProps, ISpinnerState> {

  public constructor(props: ISpinnerProps) {
    super(props);

    this.state = {
      loaded: true,
    };
  }

  public render() {
    return this.renderAttributes(
    <div className={classNames({'mn-fullscreen': this.props.fullscreen, 'mn-spinner-overlay': this.props.overlay}, 'mn-spinner', this.props.className)} style={{ width: 50, height: 50 }}>
      <div className='spinner-circle' />
    </div>, 'mn-spinner');
  }

}
