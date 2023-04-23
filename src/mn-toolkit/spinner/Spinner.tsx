/* eslint-disable import/prefer-default-export */
/* eslint-disable prettier/prettier */

import './styles.css';
import { Containable, IContainableProps, IContainableState } from "mn-toolkit/containable/Containable";

interface ISpinnerProps extends IContainableProps {
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
    <div className='spinner' style={{ width: 50, height: 50 }}>
      <div className='spinner-circle' />
    </div>, 'mn-spinner');
  }

}
