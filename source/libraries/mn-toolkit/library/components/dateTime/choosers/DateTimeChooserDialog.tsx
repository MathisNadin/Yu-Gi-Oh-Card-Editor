import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from '../../popup';
import { DateTimeChooser } from './DateTimeChooser';

export interface IDateTimeChooserDialogProps extends IAbstractPopupProps<Date> {
  defaultValue: Date;
  yearRange?: [number, number];
}

interface IDateTimeChooserDialogState extends IAbstractPopupState {
  dateTime: Date;
}

export class DateTimeChooserDialog extends AbstractPopup<
  Date,
  IDateTimeChooserDialogProps,
  IDateTimeChooserDialogState
> {
  public static async show(options: IDateTimeChooserDialogProps) {
    options.title = options.title || 'Choisissez une date et une heure';
    options.width = options.width || '90%';
    return await app.$popup.show<Date, IDateTimeChooserDialogProps>({
      type: 'date-time-chooser',
      Component: DateTimeChooserDialog,
      componentProps: options,
    });
  }

  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      name: "Valider la date et l'heure choisies",
      label: 'Valider',
      color: 'primary',
      onTap: () => this.close(this.state.dateTime),
    });
    await this.setStateAsync({
      buttons,
      dateTime: this.props.defaultValue ? new Date(this.props.defaultValue) : new Date(),
    });
  }

  protected override renderContent() {
    return [
      <DateTimeChooser
        key='date-time-chooser'
        mode='tabs'
        yearRange={this.props.yearRange}
        value={this.state.dateTime}
        onChange={(dateTime) => this.setState({ dateTime })}
      />,
    ];
  }
}
