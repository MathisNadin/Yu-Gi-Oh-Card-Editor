import { TForegroundColor } from '../../system';
import { IContainableProps, Containable, IContainableState, TDidUpdateSnapshot } from '../containable';
import { TSliderValueDisplayMode } from './Slider';

type TMouseEvents = MouseEvent | React.MouseEvent<HTMLButtonElement, MouseEvent>;

type TTouchEvents = TouchEvent | React.TouchEvent<HTMLButtonElement>;

export interface IRangeSliderValues {
  lower: number;
  upper: number;
}

export interface IRangeSliderProps extends IContainableProps {
  color?: TForegroundColor;
  defaultValue?: IRangeSliderValues;
  valueDisplayMode: TSliderValueDisplayMode;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  marks?: number[];
  onChange?: (values: IRangeSliderValues) => void | Promise<void>;
}

interface IRangeSliderState extends IContainableState {
  values: IRangeSliderValues;
  isHovered: boolean;
  isDragging: boolean;
}

export class RangeSlider extends Containable<IRangeSliderProps, IRangeSliderState> {
  public static override get defaultProps(): IRangeSliderProps {
    return {
      ...super.defaultProps,
      color: 'primary',
      min: 1,
      max: 10,
      step: 1,
      valueDisplayMode: 'always',
      marks: [],
    };
  }

  public constructor(props: IRangeSliderProps) {
    super(props);
    this.state = {
      ...this.state,
      values: props.defaultValue || { lower: props.min, upper: props.max },
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IRangeSliderProps>,
    prevState: Readonly<IRangeSliderState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (!this.props.defaultValue || this.props.defaultValue === prevProps.defaultValue) return;
    this.setState({ values: this.props.defaultValue || { lower: this.props.min, upper: this.props.max } });
  }

  private setPositionToValue(clientX: number): number {
    if (!this.base.current) return 0; // Si le composant n'est pas monté, sortez.
    const { min, max } = this.props;
    const sliderRect = this.base.current.getBoundingClientRect();
    const relativePosition = (clientX - sliderRect.left) / sliderRect.width;
    const valueRange = max - min;
    const value = relativePosition * valueRange + min;
    return Math.min(Math.max(value, min), max);
  }

  private updateValue = async (clientX: number, isLowerThumb: boolean) => {
    const { step, onChange } = this.props;
    let value = this.setPositionToValue(clientX);
    value = Math.round(value / step) * step;
    const values = { ...this.state.values };
    if (isLowerThumb) {
      if (value >= this.state.values.upper) {
        value = this.state.values.upper - step;
      }
      values.lower = value;
    } else {
      if (value <= this.state.values.lower) {
        value = this.state.values.lower + step;
      }
      values.upper = value;
    }
    await this.setStateAsync({ values });
    if (onChange) onChange(this.state.values);
  };

  private handleMouseDown = (isLowerThumb: boolean) => async (e: TMouseEvents | TTouchEvents) => {
    if (this.props.disabled) return;
    await this.setStateAsync({ isDragging: true });

    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0]!.clientX;
    } else {
      clientX = e.clientX;
    }
    await this.updateValue(clientX, isLowerThumb);

    const moveHandler = async (moveEvent: TMouseEvents | TTouchEvents) => {
      let clientX: number;
      if ('touches' in moveEvent) {
        clientX = moveEvent.touches[0]!.clientX;
      } else {
        clientX = moveEvent.clientX;
      }
      await this.updateValue(clientX, isLowerThumb);
    };

    const upHandler = async () => {
      await this.setStateAsync({ isDragging: false });
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('touchend', upHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchmove', moveHandler);
    window.addEventListener('touchend', upHandler);
  };

  private calculateMarkPosition(mark: number) {
    const { min, max } = this.props;
    return ((mark - min) / (max - min)) * 100;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-range-slider'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override get children() {
    const { min, max, marks, valueDisplayMode } = this.props;
    const { values, isHovered, isDragging } = this.state;

    const thumbSize = 20;
    const lowerPercentage = ((values.lower - min) / (max - min)) * 100;
    const upperPercentage = ((values.upper - min) / (max - min)) * 100;
    const showValues = valueDisplayMode === 'always' || (valueDisplayMode === 'auto' && (isHovered || isDragging));

    return [
      <div key='slider-track' className='slider-track' />,
      <div
        key='slider-filled'
        className='slider-filled'
        style={{ left: `${lowerPercentage}%`, width: `${upperPercentage - lowerPercentage}%` }}
      />,

      <button
        key='slider-thumb lower'
        className='slider-thumb lower'
        style={{ height: thumbSize, width: thumbSize, left: `calc(${lowerPercentage}% - ${thumbSize / 2}px)` }}
        onMouseDown={this.handleMouseDown(true)}
        onTouchStart={this.handleMouseDown(true)}
        onMouseOver={() => this.setState({ isHovered: true })}
        onFocus={() => this.setState({ isHovered: true })}
        onMouseOut={() => this.setState({ isHovered: false })}
        onBlur={() => this.setState({ isHovered: false })}
      >
        {showValues && <span className='slider-value lower'>{values.lower}</span>}
      </button>,

      <button
        key='slider-thumb upper'
        className='slider-thumb upper'
        style={{ height: thumbSize, width: thumbSize, left: `calc(${upperPercentage}% - ${thumbSize / 2}px)` }}
        onMouseDown={this.handleMouseDown(false)}
        onTouchStart={this.handleMouseDown(false)}
        onMouseOver={() => this.setState({ isHovered: true })}
        onFocus={() => this.setState({ isHovered: true })}
        onMouseOut={() => this.setState({ isHovered: false })}
        onBlur={() => this.setState({ isHovered: false })}
      >
        {showValues && <span className='slider-value upper'>{values.upper}</span>}
      </button>,

      !!marks?.length &&
        marks
          .filter((mark) => mark >= min && mark <= max)
          .map((mark, i) => (
            <div
              key={`slider-mark-${i}`}
              className='slider-mark'
              style={{ left: `${this.calculateMarkPosition(mark)}%` }}
            >
              {mark}
            </div>
          )),
    ];
  }
}
