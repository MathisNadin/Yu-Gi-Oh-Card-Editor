import { TForegroundColor } from '../../system';
import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';

type TMouseEvents = MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>;

type TTouchEvents = TouchEvent | React.TouchEvent<HTMLDivElement>;

export type TSliderValueDisplayMode = 'hidden' | 'auto' | 'always';

export interface ISliderProps extends IContainableProps {
  color?: TForegroundColor;
  defaultValue?: number;
  valueDisplayMode: TSliderValueDisplayMode;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  marks?: number[];
  onChange?: (value: number) => void | Promise<void>;
}

interface ISliderState extends IContainableState {
  value: number;
  isHovered: boolean;
  isDragging: boolean;
  stepDecimals: number;
}

export class Slider extends Containable<ISliderProps, ISliderState> {
  public static override get defaultProps(): ISliderProps {
    return {
      ...super.defaultProps,
      color: 'primary',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5,
      valueDisplayMode: 'always',
      marks: [],
    };
  }

  public constructor(props: ISliderProps) {
    super(props);
    this.state = {
      ...this.state,
      value: props.defaultValue ?? 0,
      isHovered: false,
      isDragging: false,
      stepDecimals: (props.step.toString().split('.')[1] || '').length,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ISliderProps>,
    prevState: Readonly<ISliderState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (
      (!this.props.onChange || prevProps.defaultValue === this.props.defaultValue) &&
      prevProps.step === this.props.step
    ) {
      return;
    }

    this.setState({
      value: this.props.defaultValue ?? 0,
      stepDecimals: (this.props.step.toString().split('.')[1] || '').length,
    });
  }

  public handleMouseDown = async (_e: TMouseEvents | TTouchEvents) => {
    if (this.props.disabled) return;
    await this.setStateAsync({ isDragging: true });
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('touchmove', this.handleMouseMove);
    window.addEventListener('touchend', this.handleMouseUp);
  };

  public handleMouseMove = async (e: TMouseEvents | TTouchEvents) => {
    e.preventDefault();
    await this.updateValue(e);
  };

  public handleMouseUp = async (_e: TMouseEvents | TTouchEvents) => {
    await this.setStateAsync({ isDragging: false });
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('touchmove', this.handleMouseMove);
    window.removeEventListener('touchend', this.handleMouseUp);
  };

  private async updateValue(e: TMouseEvents | TTouchEvents) {
    if (!this.base.current) return; // Si le composant n'est pas monté, sortez.

    const { min, max, step, onChange } = this.props;
    let clientX = 0;

    // Différencier entre les événements de souris et de toucher pour obtenir la position X
    if ('touches' in e) {
      clientX = e.touches[0]!.clientX;
    } else {
      clientX = e.clientX;
    }

    const sliderRect = this.base.current.getBoundingClientRect(); // this.base fait référence à l'élément racine du composant
    const sliderStart = sliderRect.left;
    const sliderWidth = sliderRect.width;

    // Calculer la position relative du clic/toucher dans le slider
    let relativePosition = (clientX - sliderStart) / sliderWidth;
    relativePosition = Math.max(0, Math.min(1, relativePosition)); // Limiter entre 0 et 1

    // Calculer la valeur proportionnelle
    let newValue = min + (max - min) * relativePosition;
    newValue = Math.round(newValue / step) * step; // Ajuster à l'étape la plus proche
    newValue = Math.max(min, Math.min(max, newValue)); // S'assurer que la valeur reste entre min et max

    // Appliquer la limite des décimales au newValue
    newValue = parseFloat(newValue.toFixed(this.state.stepDecimals));

    await this.setStateAsync({ value: newValue });
    if (onChange) await onChange(newValue);
  }

  private calculateMarkPosition(mark: number) {
    const { min, max } = this.props;
    return ((mark - min) / (max - min)) * 100;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      app.$errorManager.handlePromise(this.handleMouseDown(e));
      if (this.props.onMouseDown) app.$errorManager.handlePromise(this.props.onMouseDown(e));
    };
    attributes.onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      app.$errorManager.handlePromise(this.handleMouseDown(e));
      if (this.props.onTouchStart) app.$errorManager.handlePromise(this.props.onTouchStart(e));
    };
    return attributes;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-slider'] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override get children() {
    const { min, max, valueDisplayMode, marks } = this.props;
    const { value, isHovered, isDragging } = this.state;

    const thumbSize = 20;
    const filled = `${((value - min) / (max - min)) * 100}%`;
    const showValue = valueDisplayMode === 'always' || (valueDisplayMode === 'auto' && (isHovered || isDragging));

    return [
      <div key='slider-track' className='slider-track' />,
      <div key='slider-filled' className='slider-filled' style={{ width: filled }} />,

      <button
        key='slider-thumb'
        className='slider-thumb'
        style={{ height: thumbSize, width: thumbSize, left: `calc(${filled} - ${thumbSize / 2}px)` }}
        onMouseOver={() => this.setState({ isHovered: true })}
        onFocus={() => this.setState({ isHovered: true })}
        onMouseOut={() => this.setState({ isHovered: false })}
        onBlur={() => this.setState({ isHovered: false })}
      >
        {showValue && <span className='slider-value'>{value}</span>}
      </button>,

      !!marks?.length &&
        marks
          .filter((mark) => mark >= min && mark <= max)
          .map((mark) => (
            <div
              key={`slider-mark-${mark}`}
              className='slider-mark'
              style={{ left: `${this.calculateMarkPosition(mark)}%` }}
            >
              {mark}
            </div>
          )),
    ];
  }
}
