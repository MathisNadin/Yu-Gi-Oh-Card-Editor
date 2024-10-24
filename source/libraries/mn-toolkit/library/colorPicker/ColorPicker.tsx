import { classNames } from 'mn-tools';
import { Container, IContainerProps, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';

interface IColorPickerProps extends IContainerProps {
  colors?: string[];
  onSelectColor?: (color?: string) => void | Promise<void>;
}

interface IColorPickerState extends IContainerState {
  selectedColor: string;
}

export class ColorPicker extends Container<IColorPickerProps, IColorPickerState> {
  public static get defaultProps(): Partial<IColorPickerProps> {
    return {
      ...super.defaultProps,
      wrap: true,
      padding: true,
      colors: [
        '#000000', // Noir
        '#808080', // Gris
        '#C0C0C0', // Argent
        '#FFFFFF', // Blanc
        '#800000', // Marron
        '#FF0000', // Rouge
        '#FFA500', // Orange
        '#FFFF00', // Jaune
        '#00FF00', // Vert
        '#008000', // Vert foncé
        '#00FFFF', // Cyan
        '#0000FF', // Bleu
        '#000080', // Bleu marine
        '#FF00FF', // Magenta
        '#800080', // Violet
      ],
    };
  }

  private async onSelectColor(selectedColor?: string) {
    await this.setStateAsync({ selectedColor: selectedColor! });
    if (this.props.onSelectColor) await this.props.onSelectColor(selectedColor);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-color-picker'] = true;
    return classes;
  }

  public override get children() {
    return [
      ...this.props.colors!.map((c) => this.renderColorSwatch(c)),
      <Icon key='unformat' icon='toolkit-format-unformat' onTap={() => this.onSelectColor()} />,
    ];
  }

  private renderColorSwatch(color: string) {
    return (
      <HorizontalStack
        s='6'
        m='4'
        l='3'
        key={color}
        className={classNames('mn-color-swatch', { selected: this.state.selectedColor === color })}
        style={{ backgroundColor: color }}
        onTap={() => this.onSelectColor(color)}
      />
    );
  }
}
