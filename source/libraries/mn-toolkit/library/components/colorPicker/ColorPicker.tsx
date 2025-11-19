import { classNames } from 'mn-tools';
import { TJSXElementChild, TJSXElementChildren } from '../../system';
import { Grid, IGridProps, IGridState, HorizontalStack } from '../container';
import { IGridSpanParams } from '../containable';
import { Icon } from '../icon';

interface IColorPickerProps extends IGridProps {
  iconColSpans: IGridSpanParams;
  iconRowSpans?: IGridSpanParams;
  colors: string[];
  selectedColor: string | undefined;
  onSelectColor: (color: string | undefined) => void | Promise<void>;
}

interface IColorPickerState extends IGridState {}

export class ColorPicker extends Grid<IColorPickerProps, IColorPickerState> {
  public static override get defaultProps(): Omit<IColorPickerProps, 'selectedColor' | 'onSelectColor'> {
    return {
      ...super.defaultProps,
      gutter: false,
      padding: true,
      gridColumns: 8,
      gridRows: 1,
      iconColSpans: {
        small: 4,
        medium: 2,
        large: 1,
      },
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

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-color-picker'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const children: TJSXElementChild[] = [
      ...this.props.colors.map((c) => this.renderColorSwatch(c)),
      <Icon
        key='unformat'
        colSpans={this.props.iconColSpans}
        rowSpans={this.props.iconRowSpans}
        margin='tiny'
        icon='toolkit-format-unformat'
        name='Retirer la couleur'
        onTap={() => this.props.onSelectColor(undefined)}
      />,
    ];
    return children.map((element, idx) => this.renderGridItem(element, idx));
  }

  private renderColorSwatch(color: string) {
    return (
      <HorizontalStack
        key={color}
        colSpans={this.props.iconColSpans}
        rowSpans={this.props.iconRowSpans}
        className={classNames('mn-color-swatch', { selected: this.props.selectedColor === color })}
        style={{ backgroundColor: color }}
        margin='tiny'
        onTap={() => this.props.onSelectColor(color)}
      />
    );
  }
}
