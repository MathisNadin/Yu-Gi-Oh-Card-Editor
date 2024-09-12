import { JSXElementChildren } from '../react';
import { IContainerProps, Container, IContainerState } from '../container';
import { Typography } from '../typography';
import { Icon, TIconId } from '../icon';
import { TForegroundColor } from '../themeSettings';

export interface IChipProps extends IContainerProps {
  label: string;
  color?: TForegroundColor;
  selected: boolean;
  icon?: TIconId;
  actionIcon?: TIconId;
  onActionTap?: (event?: React.MouseEvent) => void | Promise<void>;
}

interface IChipState extends IContainerState {}

export class Chip extends Container<IChipProps, IChipState> {
  public static get defaultProps(): Partial<IChipProps> {
    return {
      ...super.defaultProps,
      color: 'primary',
      disabled: false,
      selected: false,
      gutter: false,
      bg: '3',
      itemAlignment: 'center',
      verticalItemAlignment: 'middle',
    };
  }

  public constructor(props: IChipProps) {
    super(props);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-chip'] = true;
    classes['no-left-icon'] = !this.props.icon;
    classes['no-right-icon'] = !this.props.actionIcon;
    classes['mn-selected'] = this.props.selected;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override get children(): JSXElementChildren {
    return [
      !!this.props.icon && <Icon key='icon-left' className='icon-left' icon={this.props.icon} />,
      !!this.props.label && (
        <Typography noWrap key='label' variant='document' contentType='text' content={this.props.label} />
      ),
      !!this.props.actionIcon && (
        <Icon
          key='icon-right'
          className='icon-right'
          icon={this.props.actionIcon}
          onTap={(e) => this.props.onActionTap && this.props.onActionTap(e)}
        />
      ),
    ];
  }
}
