import { classNames } from 'mn-tools';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { HorizontalStack } from '../container';
import { Icon } from '../icon';
import { TForegroundColor } from '../themeSettings';

interface IColorPickerProps extends IContainableProps {
  colors?: TForegroundColor[];
  onSelectColor?: (color: TForegroundColor) => void;
}

interface IColorPickerState extends IContainableState {
  selectedColor: TForegroundColor;
}

export class ColorPicker extends Containable<IColorPickerProps, IColorPickerState> {
  public static get defaultProps(): Partial<IColorPickerProps> {
    return {
      ...super.defaultProps,
      colors: [
        'primary',
        'secondary',
        'tertiary',
        'positive',
        'negative',
        'neutral',
        'warning',
        'info',
        /* '1',
        '2',
        '3',
        '4' */
      ],
    };
  }

  public constructor(props: IColorPickerProps) {
    super(props);
  }

  private onSelectColor(selectedColor: TForegroundColor) {
    this.setState({ selectedColor });
    if (this.props.onSelectColor) this.props.onSelectColor(selectedColor);
  }

  public render() {
    return (
      <HorizontalStack className='mn-color-picker' wrap padding>
        {this.props.colors!.map((c) => {
          return this.renderColorSwatch(c);
        })}
        <Icon
          size={20}
          iconId='toolkit-format-unformat'
          className='mn-color-picker-remove-button'
          onTap={() => this.onSelectColor(undefined!)}
        />
      </HorizontalStack>
    );
  }

  private renderColorSwatch(color: TForegroundColor) {
    return (
      <HorizontalStack
        s='6'
        m='4'
        l='3'
        className={classNames('mn-color-swatch', `mn-bg-${color}`)}
        onTap={() => this.onSelectColor(color)}
      />
    );
  }
}
