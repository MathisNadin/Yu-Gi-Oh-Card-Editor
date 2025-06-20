import { TJSXElementChildren } from '../../system';
import { IContainerProps, Container, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { TimeInput } from './inputs';

export interface ITimePickerProps extends IContainerProps {
  popupTitle?: string;
  canReset: boolean;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void | Promise<void>;
}

interface ITimePickerState extends IContainerState {
  focus: boolean;
}

export class TimePicker extends Container<ITimePickerProps, ITimePickerState> {
  public static override get defaultProps(): Omit<ITimePickerProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      gutter: true,
      verticalItemAlignment: 'middle',
      canReset: true,
    };
  }

  public constructor(props: ITimePickerProps) {
    super(props);
    this.state = {
      ...this.state,
      focus: false,
    };
  }

  private async showTimePicker(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    const time = await app.$dateTimePicker.pickTime(event, {
      defaultValue: this.props.value || new Date(),
      title: this.props.popupTitle,
    });
    if (time) await this.props.onChange(time);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-time-picker'] = true;
    classes['mn-focus'] = this.state.focus;
    return classes;
  }

  private async onFocus(event: React.FocusEvent<HTMLDivElement>) {
    await this.setStateAsync({ focus: true });
    if (this.props.onFocus) await this.props.onFocus(event);
  }

  private async onBlur(event: React.FocusEvent<HTMLDivElement>) {
    await this.setStateAsync({ focus: false });
    if (this.props.onBlur) await this.props.onBlur(event);
  }

  public override get children(): TJSXElementChildren {
    return [
      <HorizontalStack
        key='input'
        fill={this.props.fill}
        onTap={!app.$device.isTouch ? undefined : (e) => this.showTimePicker(e)}
        onFocus={(e) => this.onFocus(e)}
        onBlur={(e) => this.onBlur(e)}
      >
        <TimeInput
          disabled={app.$device.isTouch}
          fill={this.props.fill}
          canReset={this.props.canReset}
          value={this.props.value}
          onChange={(time) => this.props.onChange(time)}
        />
      </HorizontalStack>,
      !app.$device.isTouch && (
        <Icon key='icon-calendar' icon='toolkit-time' name="Choisir l'heure" onTap={(e) => this.showTimePicker(e)} />
      ),
      app.$device.isTouch && this.props.canReset && (
        <Icon
          key='icon-delete'
          icon='toolkit-close'
          color='negative'
          name='Réinitialiser'
          onTap={() => this.props.onChange(undefined)}
        />
      ),
    ];
  }
}
