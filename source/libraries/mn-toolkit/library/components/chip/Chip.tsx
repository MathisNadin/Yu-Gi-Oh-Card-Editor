import { TJSXElementChildren, TForegroundColor } from '../../system';
import { IContainerProps, Container, IContainerState } from '../container';
import { Icon, TIconId } from '../icon';
import { Typography } from '../typography';

export interface IChipProps extends IContainerProps {
  label: string;
  color?: TForegroundColor;
  selected: boolean;
  icon?: TIconId;
  actionIcon?: TIconId;
  actionHint?: string;
  actionName?: string;
  onActionTap?: (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void | Promise<void>;
}

interface IChipState extends IContainerState {}

export class Chip extends Container<IChipProps, IChipState> {
  public static override get defaultProps(): Omit<IChipProps, 'label'> {
    return {
      ...super.defaultProps,
      color: 'primary',
      disabled: false,
      selected: false,
      gutter: 'small',
      paddingX: 'default',
      paddingY: 'small',
      bg: '4',
      itemAlignment: 'center',
      verticalItemAlignment: 'middle',
    };
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

  public override get children(): TJSXElementChildren {
    return [
      !!this.props.icon && <Icon key='icon-left' className='icon-left' size='small' icon={this.props.icon} />,
      !!this.props.label && (
        <Typography
          key='label'
          className='center-label'
          fontSize='small'
          variant='document'
          contentType='text'
          content={this.props.label}
        />
      ),
      !!this.props.actionIcon && (
        <Icon
          key='icon-right'
          className='icon-right'
          size='small'
          icon={this.props.actionIcon}
          hint={this.props.actionHint}
          name={this.props.actionName}
          onTap={this.props.onActionTap ? (e) => this.props.onActionTap!(e) : undefined}
        />
      ),
    ];
  }
}
