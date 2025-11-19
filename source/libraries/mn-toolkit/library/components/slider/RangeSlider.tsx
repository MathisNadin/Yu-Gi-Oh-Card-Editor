import { SLIDER_THUMB_SIZE } from '.';
import { TForegroundColor } from '../../system';
import { IContainableProps, Containable, IContainableState } from '../containable';
import { TSliderValueDisplayMode } from './Slider';

type TMouseEvents = MouseEvent | React.MouseEvent<HTMLButtonElement, MouseEvent>;

type TTouchEvents = TouchEvent | React.TouchEvent<HTMLButtonElement>;

export interface IRangeSliderValues {
  lower: number;
  upper: number;
}

export interface IRangeSliderProps extends IContainableProps {
  color?: TForegroundColor;
  valueDisplayMode: TSliderValueDisplayMode;
  min: number;
  max: number;
  step: number;
  marks?: number[];
  value: IRangeSliderValues;
  onChange: (values: IRangeSliderValues) => void | Promise<void>;
}

interface IRangeSliderState extends IContainableState {
  isHovered: boolean;
  isDragging: boolean;
}

export class RangeSlider extends Containable<IRangeSliderProps, IRangeSliderState> {
  public static override get defaultProps(): Omit<IRangeSliderProps, 'min' | 'max' | 'step' | 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      margin: true,
      color: 'primary',
      valueDisplayMode: 'always',
    };
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
    const { step, onChange, value, min, max } = this.props;
    let v = this.setPositionToValue(clientX);
    v = Math.round(v / step) * step;

    let newValues: IRangeSliderValues;
    if (isLowerThumb) {
      let lower = Math.min(v, value.upper - step);
      lower = Math.max(lower, min);
      newValues = { lower, upper: value.upper };
    } else {
      let upper = Math.max(v, value.lower + step);
      upper = Math.min(upper, max);
      newValues = { lower: value.lower, upper };
    }

    await onChange(newValues);
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

    const moveHandler = (moveEvent: TMouseEvents | TTouchEvents) => {
      let clientX: number;
      if ('touches' in moveEvent) {
        clientX = moveEvent.touches[0]!.clientX;
      } else {
        clientX = moveEvent.clientX;
      }
      app.$errorManager.handlePromise(this.updateValue(clientX, isLowerThumb));
    };

    const upHandler = () => {
      this.setState({ isDragging: false });
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
    const { value, min, max, marks, valueDisplayMode } = this.props;
    const { isHovered, isDragging } = this.state;

    const lowerPercentage = ((value.lower - min) / (max - min)) * 100;
    const upperPercentage = ((value.upper - min) / (max - min)) * 100;
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
        name='slider-thumb lower'
        style={{
          height: SLIDER_THUMB_SIZE,
          width: SLIDER_THUMB_SIZE,
          left: `calc(${lowerPercentage}% - ${SLIDER_THUMB_SIZE / 2}px)`,
        }}
        onMouseDown={() => app.$errorManager.handlePromise(this.handleMouseDown(true))}
        onTouchStart={() => app.$errorManager.handlePromise(this.handleMouseDown(true))}
        onMouseOver={() => this.setState({ isHovered: true })}
        onFocus={() => this.setState({ isHovered: true })}
        onMouseOut={() => this.setState({ isHovered: false })}
        onBlur={() => this.setState({ isHovered: false })}
      >
        {showValues && <span className='slider-value lower'>{value.lower}</span>}
      </button>,

      <button
        key='slider-thumb upper'
        className='slider-thumb upper'
        name='slider-thumb upper'
        style={{
          height: SLIDER_THUMB_SIZE,
          width: SLIDER_THUMB_SIZE,
          left: `calc(${upperPercentage}% - ${SLIDER_THUMB_SIZE / 2}px)`,
        }}
        onMouseDown={() => app.$errorManager.handlePromise(this.handleMouseDown(false))}
        onTouchStart={() => app.$errorManager.handlePromise(this.handleMouseDown(false))}
        onMouseOver={() => this.setState({ isHovered: true })}
        onFocus={() => this.setState({ isHovered: true })}
        onMouseOut={() => this.setState({ isHovered: false })}
        onBlur={() => this.setState({ isHovered: false })}
      >
        {showValues && <span className='slider-value upper'>{value.upper}</span>}
      </button>,

      !!marks?.length &&
        marks
          .filter((mark) => mark >= min && mark <= max)
          .map((mark, i) => (
            <div
              key={`slider-mark-${i}`}
              className='slider-mark'
              style={{ left: `calc(${this.calculateMarkPosition(mark)}% + 2px)` }} // Plus thumb border size
            >
              {mark}
            </div>
          )),
    ];
  }
}
